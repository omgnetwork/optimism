import { Signer, utils, ethers, PopulatedTransaction, BigNumber } from 'ethers'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'
import * as ynatm from '@eth-optimism/ynatm'
import { BatchSigner } from '../batch-submitter/batch-submitter'
import { StaticJsonRpcProvider } from '@ethersproject/providers'
export interface ResubmissionConfig {
  resubmissionTimeout: number
  minGasPriceInGwei: number
  maxGasPriceInGwei: number
  gasRetryIncrement: number
}

export interface AppendQueueBatch {
  appendQueueBatch: Function
  numQueuedTransactions: BigNumber
  type: 'AppendQueueBatch'
}

export interface AppendStateBatch {
  appendStateBatch: Function
  batch: any[]
  offsetStartsAtIndex: number
  type: 'AppendStateBatch'
}

export interface AppendSequencerBatch {
  appendSequencerBatch: Function
  batchParams: any
  type: 'AppendSequencerBatch'
}

export interface TxSubmissionHooks {
  beforeSendTransaction: (tx: PopulatedTransaction) => void
  onTransactionResponse: (txResponse: TransactionResponse) => void
}

const getGasPriceInGwei = async (
  provider: StaticJsonRpcProvider
): Promise<number> => {
  return parseInt(
    ethers.utils.formatUnits(await provider.getGasPrice(), 'gwei'),
    10
  )
}

export const submitTransactionWithYNATM = async (
  call: AppendQueueBatch | AppendStateBatch | AppendSequencerBatch,
  batchSigner: BatchSigner,
  provider: StaticJsonRpcProvider,
  config: ResubmissionConfig,
  numConfirmations: number,
  hooks: TxSubmissionHooks
): Promise<TransactionReceipt> => {
  const sendTxAndWaitForReceipt = async (
    gasPrice
  ): Promise<TransactionReceipt> => {
    let tx
    //if (batchSigner.address === undefined) {
    if (call.type === 'AppendQueueBatch') {
      tx = await call.appendQueueBatch(tx.appendQueueBatch)
      console.log('AppendQueueBatch')
      console.log(tx)
    } else if (call.type === 'AppendStateBatch') {
      tx = await call.appendStateBatch(call.batch, call.offsetStartsAtIndex)
      console.log('AppendStateBatch')
      console.log(tx)
    } else if (call.type === 'AppendSequencerBatch') {
      tx = await call.appendSequencerBatch(call.batchParams)
      console.log('AppendSequencerBatch')
      console.log(tx)
    }
    const fullTx = {
      ...tx,
      gasPrice,
    }
    console.log('fullTx')
    console.log(fullTx)
    hooks.beforeSendTransaction(fullTx)
    const txResponse = await batchSigner.signer.sendTransaction(fullTx)
    console.log('txresponse')
    console.log(txResponse)
    hooks.onTransactionResponse(txResponse)
    return provider.waitForTransaction(txResponse.hash, numConfirmations)
    // } else {
    // }
}

  const minGasPrice = await getGasPriceInGwei(provider)
  const receipt = await ynatm.send({
    sendTransactionFunction: sendTxAndWaitForReceipt,
    minGasPrice: ynatm.toGwei(minGasPrice),
    maxGasPrice: ynatm.toGwei(config.maxGasPriceInGwei),
    gasPriceScalingFunction: ynatm.LINEAR(config.gasRetryIncrement),
    delay: config.resubmissionTimeout,
  })
  return receipt
}

export interface TransactionSubmitter {
  submitTransaction(
    tx: AppendQueueBatch | AppendStateBatch | AppendSequencerBatch,
    hooks?: TxSubmissionHooks
  ): Promise<TransactionReceipt>
}

export class YnatmTransactionSubmitter implements TransactionSubmitter {
  constructor(
    readonly batchSigner: BatchSigner,
    readonly provider: StaticJsonRpcProvider,
    readonly ynatmConfig: ResubmissionConfig,
    readonly numConfirmations: number
  ) {}

  public async submitTransaction(
    tx: AppendQueueBatch | AppendStateBatch | AppendSequencerBatch,
    hooks?: TxSubmissionHooks
  ): Promise<TransactionReceipt> {
    if (!hooks) {
      hooks = {
        beforeSendTransaction: () => undefined,
        onTransactionResponse: () => undefined,
      }
    }
    return submitTransactionWithYNATM(
      tx,
      this.batchSigner,
      this.provider,
      this.ynatmConfig,
      this.numConfirmations,
      hooks
    )
  }
}
