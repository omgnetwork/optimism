import { Signer, utils, ethers, PopulatedTransaction } from 'ethers'
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'
import * as ynatm from '@eth-optimism/ynatm'

export interface ResubmissionConfig {
  resubmissionTimeout: number
  minGasPriceInGwei: number
  maxGasPriceInGwei: number
  gasRetryIncrement: number
}

export type SubmitTransactionFn = (
  tx: PopulatedTransaction
) => Promise<TransactionReceipt>

export interface TxSubmissionHooks {
  beforeSendTransaction: (tx: PopulatedTransaction) => void
  onTransactionResponse: (txResponse: TransactionResponse) => void
}

const getGasPriceInGwei = async (signer: Signer): Promise<number> => {
  return parseInt(
    ethers.utils.formatUnits(await signer.getGasPrice(), 'gwei'),
    10
  )
}

export const submitTransactionWithYNATM = async (
  ll: any,
  tx: PopulatedTransaction,
  signer: Signer,
  config: ResubmissionConfig,
  numConfirmations: number,
  hooks: TxSubmissionHooks
): Promise<TransactionReceipt> => {
  const sendTxAndWaitForReceipt = async (
    gasPrice
  ): Promise<TransactionReceipt> => {
    const fullTx = {
      ...tx,
      gasPrice,
    }
ll.info("MMDBG before hooks", { gasPrice , fullTx })    
    hooks.beforeSendTransaction(fullTx)
ll.info("MMDBG before signer.sendTx", { gasPrice , fullTx })    
    const txResponse = await signer.sendTransaction(fullTx)
ll.info("MMDBG txResponse", { nonce:txResponse.nonce, hash:txResponse.hash, confirmations:txResponse.confirmations })    
    hooks.onTransactionResponse(txResponse)

ll.info("MMDBG wFT args", { hh:txResponse.hash, numConfirmations })    
    const ret = signer.provider.waitForTransaction(txResponse.hash, numConfirmations)
ll.info("MMDBG wFT ret", { ret })    
    
    return ret
  }
  
ll.info("MMDBG before getGasPrice")  
  const minGasPrice = await getGasPriceInGwei(signer)
ll.info("MMDBG before ynatm.send", {minGasPrice: ynatm.toGwei(minGasPrice),
maxGasPrice: ynatm.toGwei(config.maxGasPriceInGwei),delay: config.resubmissionTimeout, incr:config.gasRetryIncrement})  
  const receipt = await ynatm.send({
    sendTransactionFunction: sendTxAndWaitForReceipt,
    minGasPrice: ynatm.toGwei(minGasPrice),
    maxGasPrice: ynatm.toGwei(config.maxGasPriceInGwei),
    gasPriceScalingFunction: ynatm.LINEAR(config.gasRetryIncrement),
    delay: config.resubmissionTimeout,
  })
ll.info("MMDBG after ynatm.send")  
  return receipt
}

export interface TransactionSubmitter {
  submitTransaction(
    ll: any,
    tx: PopulatedTransaction,
    hooks?: TxSubmissionHooks
  ): Promise<TransactionReceipt>
}

export class YnatmTransactionSubmitter implements TransactionSubmitter {
  constructor(
    readonly signer: Signer,
    readonly ynatmConfig: ResubmissionConfig,
    readonly numConfirmations: number
  ) {}

  public async submitTransaction(
    ll: any,
    tx: PopulatedTransaction,
    hooks?: TxSubmissionHooks
  ): Promise<TransactionReceipt> {
    if (!hooks) {
      hooks = {
        beforeSendTransaction: () => undefined,
        onTransactionResponse: () => undefined,
      }
    }
ll.info("MMDBG in submitTransaction wrapper")
    return submitTransactionWithYNATM(
      ll,
      tx,
      this.signer,
      this.ynatmConfig,
      this.numConfirmations,
      hooks
    )
  }
}
