import { ethers, Event, Contract, BigNumber, providers } from 'ethers'

import {
  StateRootBatchHeader,
} from '../types'

export class L1ProviderWrapper {

  private eventCache: {
    [topic: string]: {
      startingBlockNumber: number
      events: ethers.Event[]
    }
  } = {}

  constructor(
    public provider: providers.JsonRpcProvider,
    public OVM_StateCommitmentChain: Contract,
    public l1StartOffset: number,
    public l1BlockFinality: number
  ) {}

  public async findAllEvents(
    contract: Contract,
    filter: ethers.EventFilter,
    fromBlock?: number
  ): Promise<ethers.Event[]> {
    
    //start with the cache, or if there is no cache, start from scratch
    const cache = this.eventCache[filter.topics[0] as string] || {
      startingBlockNumber: fromBlock || this.l1StartOffset,
      events: [],
    }

    let events: ethers.Event[] = []
    let startingBlockNumber = cache.startingBlockNumber
    let latestL1BlockNumber = await this.provider.getBlockNumber()

    const initial_range = latestL1BlockNumber - startingBlockNumber

    while (startingBlockNumber < latestL1BlockNumber) {

      events = events.concat(
        await contract.queryFilter(
          filter,
          startingBlockNumber,
          Math.min(
            startingBlockNumber + 2000,
            latestL1BlockNumber - this.l1BlockFinality
          )
        )
      )

      //almost caught up...
      if (startingBlockNumber + 2000 >= latestL1BlockNumber) {
        cache.startingBlockNumber = latestL1BlockNumber
        cache.events = cache.events.concat(events)
        break
      }

      startingBlockNumber += 2000
      latestL1BlockNumber = await this.provider.getBlockNumber()

      const percent_completed = (latestL1BlockNumber - startingBlockNumber) / initial_range

      console.log("CACHING", contract, (100.00 - (percent_completed * 100.00)).toFixed(2), "% completed")
    }

    //adding to the master event cache...
    this.eventCache[filter.topics[0] as string] = cache

    return cache.events
  }

  public async getStateBatch(
    index: number
  ): Promise<
    | {
        header: StateRootBatchHeader
        stateRoots: string[]
      }
    | undefined
  > {
    
    //the batch event for this state root
    const event = await this.getStateBatchAppendedEventForIndex(index)

    if (event === undefined) {
      return undefined
    }

    const transaction = await this.provider.getTransaction(
      event.transactionHash
    )

    const [
      stateRoots,
    ] = this.OVM_StateCommitmentChain.interface.decodeFunctionData(
      'appendStateBatch',
      transaction.data
    )

    return {
      header: {
        batchIndex: event.args._batchIndex,
        batchRoot: event.args._batchRoot,
        batchSize: event.args._batchSize,
        prevTotalElements: event.args._prevTotalElements,
        extraData: event.args._extraData,
      },
      stateRoots,
    }

  }

  public async getStateRootBatchHeader(
    index: number
  ): Promise<StateRootBatchHeader> {
    
    const event = await this.getStateBatchAppendedEventForIndex(index)

    if (!event) {
      return
    }

    return {
      batchIndex: event.args._batchIndex,
      batchRoot: event.args._batchRoot,
      batchSize: event.args._batchSize,
      prevTotalElements: event.args._prevTotalElements,
      extraData: event.args._extraData,
    }
  }

  public async getBatchStateRoots(
    index: number
  ): Promise<string[]> {
    
    const event = await this.getStateBatchAppendedEventForIndex(index)

    if (!event) {
      return
    }

    const transaction = await this.provider.getTransaction(
      event.transactionHash
    )

    const [
      stateRoots,
    ] = this.OVM_StateCommitmentChain.interface.decodeFunctionData(
      'appendStateBatch',
      transaction.data
    )

    return stateRoots
  }

  public async getStateRoot(index: number): Promise<string> {
    
    const stateRootBatchHeader = await this.getStateRootBatchHeader(index)
    
    if (stateRootBatchHeader === undefined) {
      return
    }

    const batchStateRoots = await this.getBatchStateRoots(index)

    return batchStateRoots[
      index - stateRootBatchHeader.prevTotalElements.toNumber()
    ]
  }

  private async getStateBatchAppendedEventForIndex(index: number): Promise<Event> {
    
    //console.log("L1PW getStateBatchAppendedEventForIndex for index:", index)

    const events = await this.findAllEvents(
      this.OVM_StateCommitmentChain,
      this.OVM_StateCommitmentChain.filters.StateBatchAppended()
    )

    if (events.length === 0) {
      console.log('L1PW OVM_StateCommitmentChain is empty - returning')
      return
    }
    
    //console.log("All events: ",events)

    //Great - we have some StateBatchAppended events
    const matching = events.filter((event) => {
      //for each of the events, determine if it's relevant for this index
      const prevTotalElements = event.args._prevTotalElements.toNumber()
      const batchSize = event.args._batchSize.toNumber()
      //console.log("Range: min <= index < prevTotalElements + batchSize:", prevTotalElements, index, prevTotalElements + batchSize)  
      //pick out the relevant ones
      return (
          index >= prevTotalElements && 
          index < prevTotalElements + batchSize
      )
    })

    //console.log("All events that match: ",matching)
    
    // at this point, we have the events matching OVM_StateCommitmentChain.filters.StateBatchAppended()
    // were some of those deleted? let's check
    const deletions = await this.findAllEvents(
      this.OVM_StateCommitmentChain,
      this.OVM_StateCommitmentChain.filters.StateBatchDeleted()
    )
    
    //this is going to be the main return datastructure
    const results: ethers.Event[] = []

    for (const event of matching) {
      const wasDeleted = deletions.some((deletion) => {
        return (
          deletion.blockNumber > event.blockNumber &&
          deletion.args._batchIndex.toNumber() ===
            event.args._batchIndex.toNumber()
        )
      })
      
      //we want all the events, EXCEPT, those which were ultimately deleted
      if (!wasDeleted) {
        results.push(event)
      }
    }

    if (results.length === 0) {
      //there were events, BUT, there were all deleted, and so, results.length === 0
      return
    } else if (results.length === 1) {
      //this is the standard, expected return
      //found the batch header for the state root, all good
      return results[0]
    } else if (results.length > 2) {
      throw new Error(
        `Found more than one batch header for the same state root, this shouldn't happen.`
      )
    }

  }

}
