import { ethers, Event, Contract, BigNumber, providers } from 'ethers'

import {
  L2block
} from '../types'

export class L1ProviderWrapper {

  private eventCache: {
    [topic: string]: {
      starting_L1_BlockNumber: number
      L2blocks: L2block[]
    }
  } = {}

    // return {
    //   header: {
    //     batchIndex: event.args._batchIndex,
    //     batchRoot: event.args._batchRoot,
    //     batchSize: event.args._batchSize,
    //     prevTotalElements: event.args._prevTotalElements,
    //     extraData: event.args._extraData,
    //   },
    //   stateRoots,
    // }

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
  ): Promise<L2block[]> {
    
    //start with the cache, or if there is no cache, start from scratch
    const cache = this.eventCache[filter.topics[0] as string] || {
      starting_L1_BlockNumber: fromBlock || this.l1StartOffset,
      L2blocks: [],
    }

    let L2blocks: L2block[] = []
    
    let starting_L1_BlockNumber = cache.starting_L1_BlockNumber
    //let latest_L1_BlockNumber = 13011896 + 40000//await this.provider.getBlockNumber()
    let latest_L1_BlockNumber = await this.provider.getBlockNumber()

    console.log("Starting scan at Ethereum block number:", starting_L1_BlockNumber)
    console.log("Current Ethereum block height:", latest_L1_BlockNumber)

    const new_L1_blocks = latest_L1_BlockNumber - starting_L1_BlockNumber
    //console.log("Blocks to inspect:", initial_range)

    while (starting_L1_BlockNumber < latest_L1_BlockNumber) {

      const batches_in_query_interval = await contract.queryFilter(
        filter,
        starting_L1_BlockNumber,
        Math.min(
          starting_L1_BlockNumber + 2000,
          latest_L1_BlockNumber - this.l1BlockFinality
        )
      )

      let L2blocks_indexed = []

      //batches_in_query_interval.forEach
      await Promise.all(batches_in_query_interval.map(async batch => {
          
        //many of these batches have length 1, but some are longer
        //our goal is to unpack and reindex them, and add the state roots for each L2 TX aka block
        //console.log("this event index",event.args._batchIndex.toString()),
        //console.log(event.args._batchSize.toString())
        
        const batchSize = batch.args._batchSize.toNumber()
        const prevTotalElements = batch.args._prevTotalElements.toNumber()
        const batchIndex = batch.args._batchIndex.toNumber()
        const batchRoot = batch.args._batchRoot.toString()
        const L1block = batch.blockNumber
        
        //Now get the roots for this batch
        const transaction = await this.provider.getTransaction(batch.transactionHash)

        const [ stateRoots, ] = this.OVM_StateCommitmentChain.interface.decodeFunctionData(
          'appendStateBatch',
          transaction.data
        )

        for (let idx = 0; idx < batchSize; idx++) {

          const L2block = {
            L2block: prevTotalElements + idx,
            L1block,
            batchRoot,
            batchSize,
            batchIndex,
            prevTotalElements,
            extraData: batch.args._extraData,
            stateRoot: stateRoots[idx]
          }
          //console.log("Adding L2 Block:", block)
          L2blocks_indexed = L2blocks_indexed.concat(L2block)
          //console.log("Indexed:",L2blocks_indexed)
        }

      }))

      //console.log("Indexed:",L2blocks_indexed)

      L2blocks = L2blocks.concat(L2blocks_indexed)

      //console.log("Events:",L2blocks)

      //almost caught up...
      if (starting_L1_BlockNumber + 2000 >= latest_L1_BlockNumber) {
        cache.starting_L1_BlockNumber = latest_L1_BlockNumber
        cache.L2blocks = cache.L2blocks.concat(L2blocks)
        console.log("Adding new L2blocks:", L2blocks.length)
        break
      }

      starting_L1_BlockNumber += 2000
      latest_L1_BlockNumber = await this.provider.getBlockNumber()

      const percent_completed = (latest_L1_BlockNumber - starting_L1_BlockNumber) / new_L1_blocks

      console.log("CACHING", (100.00 - (percent_completed * 100.00)).toFixed(2), "% completed")
    }

    //adding to the master event cache...
    this.eventCache[filter.topics[0] as string] = cache

    //console.log("Cache:",this.eventCache[filter.topics[0] as string])

    return cache.L2blocks
  }

  public async getOperatorL2block(L2blockNumber: number): Promise<L2block> {
    
    //this will also update the cache, in case there are new blocks
    const L2blocks = await this.findAllEvents(
      this.OVM_StateCommitmentChain,
      this.OVM_StateCommitmentChain.filters.StateBatchAppended()
    )

    if (L2blocks.length === 0) {
      console.log('getStateBatchAppendedEventForIndex - L1 OVM_StateCommitmentChain is empty - returning')
      return
    }
    
    const matching = L2blocks.filter((block) => {
      return (L2blockNumber === block.L2block)
    })

    if (matching.length === 0) {
      console.log('getStateBatchAppendedEventForIndex - no matching events for L2 Block:',L2blockNumber)
      return
    }

    //The main return datastructure
    const L2block: L2block[] = []

    L2block.push(matching[0]) //The [0] accomodates very rare duplicated writes into the SCC 
    
    return L2block[0]
   
  }

}
