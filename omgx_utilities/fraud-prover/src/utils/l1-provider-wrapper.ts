import { ethers, Event, Contract, BigNumber, providers } from 'ethers'
import { MerkleTree } from 'merkletreejs'

import {
  StateRootBatchHeader,
  StateRootBatchProof,
  TransactionBatchHeader,
  TransactionBatchProof,
  TransactionChainElement,
  OvmTransaction,
} from '../types'

import {
  fromHexString,
  remove0x,
  toHexString,
  toRpcHexString,
} from '@eth-optimism/core-utils'

const NUM_L2_GENESIS_BLOCKS = 1;

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
    public OVM_CanonicalTransactionChain: Contract,
    public OVM_ExecutionManager: Contract,
    public l1StartOffset: number,
    public l1BlockFinality: number
  ) {}

  public async findAllEvents(
    contract: Contract,
    filter: ethers.EventFilter,
    fromBlock?: number
  ): Promise<ethers.Event[]> {
    
    const cache = this.eventCache[filter.topics[0] as string] || {
      startingBlockNumber: fromBlock || this.l1StartOffset,
      events: [],
    }

    let events: ethers.Event[] = []
    let startingBlockNumber = cache.startingBlockNumber
    let latestL1BlockNumber = await this.provider.getBlockNumber()

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

      if (startingBlockNumber + 2000 > latestL1BlockNumber) {
        cache.startingBlockNumber = latestL1BlockNumber
        cache.events = cache.events.concat(events)
        break
      }

      startingBlockNumber += 2000
      latestL1BlockNumber = await this.provider.getBlockNumber()
    }

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
    
    //console.log("L1PW _getStateBatchHeader for height:", height)
    
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

  /**
   * Generates a Merkle proof (using the particular scheme we use within Lib_MerkleTree).
   *
   * @param leaves Leaves of the merkle tree.
   * @param index Index to generate a proof for.
   * @returns Merkle proof sibling leaves, as hex strings.
   */
   getMerkleTreeProof = (leaves: string[], index: number): string[] => {
    // Our specific Merkle tree implementation requires that the number of leaves is a power of 2.
    // If the number of given leaves is less than a power of 2, we need to round up to the next
    // available power of 2. We fill the remaining space with the hash of bytes32(0).
    const correctedTreeSize = Math.pow(2, Math.ceil(Math.log2(leaves.length)))
    const parsedLeaves = []
    for (let i = 0; i < correctedTreeSize; i++) {
      if (i < leaves.length) {
        parsedLeaves.push(leaves[i])
      } else {
        parsedLeaves.push(ethers.utils.keccak256('0x' + '00'.repeat(32)))
      }
    }

    // merkletreejs prefers things to be Buffers.
    const bufLeaves = parsedLeaves.map(fromHexString)
    const tree = new MerkleTree(
      bufLeaves,
      (el: Buffer | string): Buffer => {
        return fromHexString(ethers.utils.keccak256(el))
      }
    )

    const proof = tree.getProof(bufLeaves[index], index).map((element: any) => {
      return element.data//toHexString(element.data)
    })

    return proof
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

  public async getStateRootBatchProof(
    index: number
  ): Promise<StateRootBatchProof> {

    const batchHeader = await this.getStateRootBatchHeader(index)
    const stateRoots = await this.getBatchStateRoots(index)

    const batchIndex = index - batchHeader.prevTotalElements.toNumber()
    const treeProof = this.getMerkleTreeProof(stateRoots,batchIndex)

    return {
      stateRoot: stateRoots[batchIndex],
      stateRootBatchHeader: batchHeader,
      stateRootProof: {
        index: batchIndex,
        siblings: treeProof,
      },
    }
  }

  public async getTransactionBatchHeader(
    index: number
  ): Promise<TransactionBatchHeader> {
    
    const event = await this._getTransactionBatchEvent(index)

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

  public async getBatchTransactions(index: number): Promise<
    {
      transaction: OvmTransaction
      transactionChainElement: TransactionChainElement
    }[]
  > {
    const event = await this._getTransactionBatchEvent(index)

    if (!event) {
      return
    }

    const emGasLimit =
      await this.OVM_ExecutionManager.getMaxTransactionGasLimit()

    const transaction = await this.provider.getTransaction(
      event.transactionHash
    )

    if ((event as any).isSequencerBatch) {
      
      const transactions = []

      const txdata = fromHexString(transaction.data)
      const shouldStartAtBatch = BigNumber.from(txdata.slice(4, 9))
      const totalElementsToAppend = BigNumber.from(txdata.slice(9, 12))
      const numContexts = BigNumber.from(txdata.slice(12, 15))

      let nextTxPointer = 15 + 16 * numContexts.toNumber()

      for (let i = 0; i < numContexts.toNumber(); i++) {
        const contextPointer = 15 + 16 * i

        const context = {
          numSequencedTransactions: BigNumber.from(
            txdata.slice(contextPointer, contextPointer + 3)
          ),
          numSubsequentQueueTransactions: BigNumber.from(
            txdata.slice(contextPointer + 3, contextPointer + 6)
          ),
          ctxTimestamp: BigNumber.from(
            txdata.slice(contextPointer + 6, contextPointer + 11)
          ),
          ctxBlockNumber: BigNumber.from(
            txdata.slice(contextPointer + 11, contextPointer + 16)
          ),
        }

        for (let j = 0; j < context.numSequencedTransactions.toNumber(); j++) {
          
          const txDataLength = BigNumber.from(
            txdata.slice(nextTxPointer, nextTxPointer + 3)
          )

          const txData = txdata.slice(
            nextTxPointer + 3,
            nextTxPointer + 3 + txDataLength.toNumber()
          )

          transactions.push({
            transaction: {
              blockNumber: context.ctxBlockNumber.toNumber(),
              timestamp: context.ctxTimestamp.toNumber(),
              gasLimit: emGasLimit,
              entrypoint: '0x4200000000000000000000000000000000000005',
              l1TxOrigin: '0x' + '00'.repeat(20),
              l1QueueOrigin: 0,
              data: toHexString(txData),
            },
            transactionChainElement: {
              isSequenced: true,
              queueIndex: 0,
              timestamp: context.ctxTimestamp.toNumber(),
              blockNumber: context.ctxBlockNumber.toNumber(),
              txData: toHexString(txData),
            },
          })

          nextTxPointer += 3 + txDataLength.toNumber()
        }
      }

      return transactions
    } else {
      return []
    }
  }

  public async getTransactionBatchProof(
    index: number
  ): Promise<TransactionBatchProof> {

    const batchHeader = await this.getTransactionBatchHeader(index)
    const transactions = await this.getBatchTransactions(index)

    const elements = []
    for (let i = 0;i < transactions.length;i++)
    {
      const tx = transactions[i]
        elements.push(
          `0x01${BigNumber.from(tx.transaction.timestamp)
            .toHexString()
            .slice(2)
            .padStart(64, '0')}${BigNumber.from(tx.transaction.blockNumber)
            .toHexString()
            .slice(2)
            .padStart(64, '0')}${tx.transaction.data.slice(2)}`
        )
    }

    const batchIndex = index - batchHeader.prevTotalElements.toNumber()
    const treeProof = this.getMerkleTreeProof(elements,batchIndex)

    return {
      transaction: transactions[batchIndex].transaction,
      transactionChainElement: transactions[batchIndex].transactionChainElement,
      transactionBatchHeader: batchHeader,
      transactionProof: {
        index: batchIndex,
        siblings: treeProof,
      },
    }
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

    //Great - we have some StateBatchAppended events
    const matching = events.filter((event) => {
      //for each of the events, determine if it's relevant for this index
      const prevTotalElements = event.args._prevTotalElements.toNumber()
      const batchSize = event.args._batchSize.toNumber()
      //console.log("Range: min, max, index:", prevTotalElements, prevTotalElements + batchSize, index)  
      //pick out the relevant ones
      return (
          index >= prevTotalElements && 
          index < prevTotalElements + batchSize
      )
    })

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

  private async _getTransactionBatchEvent(
    index: number
  ): Promise<Event & { isSequencerBatch: boolean }> {
    const events = await this.findAllEvents(
      this.OVM_CanonicalTransactionChain,
      this.OVM_CanonicalTransactionChain.filters.TransactionBatchAppended()
    )

    if (events.length === 0) {
      return
    }

    // tslint:disable-next-line
    const event = events.find((event) => {
      return (
        event.args._prevTotalElements.toNumber() <= index &&
        event.args._prevTotalElements.toNumber() +
          event.args._batchSize.toNumber() >
          index
      )
    })

    if (!event) {
      return
    }

    const batchSubmissionEvents = await this.findAllEvents(
      this.OVM_CanonicalTransactionChain,
      this.OVM_CanonicalTransactionChain.filters.SequencerBatchAppended()
    )

    if (batchSubmissionEvents.length === 0) {
      ;(event as any).isSequencerBatch = false
    } else {
      // tslint:disable-next-line
      const batchSubmissionEvent = batchSubmissionEvents.find((event) => {
        return (
          event.args._startingQueueIndex.toNumber() <= index &&
          event.args._startingQueueIndex.toNumber() +
            event.args._totalElements.toNumber() >
            index
        )
      })

      if (batchSubmissionEvent) {
        ;(event as any).isSequencerBatch = true
      } else {
        ;(event as any).isSequencerBatch = false
      }
    }

    return event as any
  }
}
