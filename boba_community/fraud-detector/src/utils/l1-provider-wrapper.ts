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

    console.log("Starting scan at ethereum block number:", startingBlockNumber)
    console.log("Current ethereum block number:", latestL1BlockNumber)

    const initial_range = latestL1BlockNumber - startingBlockNumber
    //console.log("Blocks to inspect:", initial_range)

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

      console.log("Found Events:", events.length)

      //almost caught up...
      if (startingBlockNumber + 2000 >= latestL1BlockNumber) {
        cache.startingBlockNumber = latestL1BlockNumber
        cache.events = cache.events.concat(events)
        console.log("Adding new events:", events.length)
        break
      }

      startingBlockNumber += 2000
      latestL1BlockNumber = await this.provider.getBlockNumber()

      const percent_completed = (latestL1BlockNumber - startingBlockNumber) / initial_range

      console.log("CACHING", (100.00 - (percent_completed * 100.00)).toFixed(2), "% completed")
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
    
    if (!stateRootBatchHeader) {
      return
    }

    const batchStateRoots = await this.getBatchStateRoots(index)

    return batchStateRoots[
      index - stateRootBatchHeader.prevTotalElements.toNumber()
    ]
  }

  private async getStateBatchAppendedEventForIndex(L2_block: number): Promise<Event> {
    
    //this will also update the cache, in case there are new blocks
    const events = await this.findAllEvents(
      this.OVM_StateCommitmentChain,
      this.OVM_StateCommitmentChain.filters.StateBatchAppended()
    )

    if (events.length === 0) {
      console.log('getStateBatchAppendedEventForIndex - L1 OVM_StateCommitmentChain is empty - returning')
      return
    }
    
    //We have StateBatchAppended events
    const matching = events.filter((event) => {
      //for each of the events, determine if it's relevant for this L2 Block
      const prevTotalElements = event.args._prevTotalElements.toNumber()
      const batchSize = event.args._batchSize.toNumber()
      //console.log("Range: min <= index < prevTotalElements + batchSize:", prevTotalElements, L2_Block, prevTotalElements + batchSize)  
      //pick out the relevant ones
      return (
          L2_block >= prevTotalElements && 
          L2_block < prevTotalElements + batchSize
      )
    })

    if (matching.length === 0) {
      console.log('getStateBatchAppendedEventForIndex - no matching events for L2 Block:',L2_block)
      return
    }

    //The main return datastructure
    const results: ethers.Event[] = []

    results.push(matching[0]) 
    //The [0] accomodates very rare duplicated writes into the SCC 

    return results[0]
   
  }

}
