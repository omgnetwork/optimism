import { TransactionReceipt } from '@ethersproject/abstract-provider'
import fetch from 'node-fetch'
import {
  AppendQueueBatch,
  AppendSequencerBatch,
  AppendStateBatch,
  TxSubmissionHooks,
} from '.'
import { BatchSigner } from '..'

export const submitToVault = async (
  call: AppendQueueBatch | AppendStateBatch | AppendSequencerBatch,
  batchSigner: BatchSigner,
  hooks: TxSubmissionHooks,
  gasPrice: number
): Promise<TransactionReceipt> => {
  if (call.type === 'AppendQueueBatch') {
    // const response = await fetch(batchSigner.vault_addr, {method: 'POST', body: 'a=1'});
    // const data = await response.json();
  } else if (call.type === 'AppendStateBatch') {
    //tx = await call.appendStateBatch(call.batch, call.offsetStartsAtIndex)
  } else if (call.type === 'AppendSequencerBatch') {
    const url =
      batchSigner.vault_addr +
      '/immutability-eth-plugin/wallets/sequencer/accounts/' +
      batchSigner.address +
      '/ovm/appendSequencerBatch'
    const requestInit = {
      method: 'PUT',
      headers: {
        'X-Vault-Request': 'true',
        'X-Vault-Token': batchSigner.token,
      },
      body: JSON.stringify({
        should_start_at_element: call.batchParams.shouldStartAtElement,
        total_elements_to_append: call.batchParams.totalElementsToAppend,
        contexts: call.batchParams.contexts,
        transactions: call.batchParams.transactions,
      }),
    }
    console.log(requestInit)
    console.log(url)
    // const fullTx = {
    //   to: url,
    //   data: requestInit,
    //   gasPrice,
    // }
    // hooks.beforeSendTransaction( fullTx )

    console.log('fetch:')
    const response = await fetch(url, requestInit)
    console.log('response:')
    console.log(response)
    const data = await response.json()
    console.log('data:')
    console.log(data)
    return toTransactionReceipt(data)
  }
}

export const toTransactionReceipt = async (
  data: any
): Promise<TransactionReceipt> => {
  console.log('data')
  console.log(data)
  return undefined
}
// export interface TransactionReceipt {
//     to: string;
//     from: string;
//     contractAddress: string,
//     transactionIndex: number,
//     root?: string,
//     gasUsed: BigNumber,
//     logsBloom: string,
//     blockHash: string,
//     transactionHash: string,
//     logs: Array<Log>,
//     blockNumber: number,
//     confirmations: number,
//     cumulativeGasUsed: BigNumber,
//     effectiveGasPrice: BigNumber,
//     byzantium: boolean,
//     type: number;
//     status?: number
// };
