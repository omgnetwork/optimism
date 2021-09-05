import {
  JsonRpcProvider,
} from '@ethersproject/providers'
import * as configs from './configs'
import database from './libs/database'
import logger from './logger'
import util from 'util'
import { OMGXTransactions } from './libs/transactions'

const l1Provider = new JsonRpcProvider(configs.l1Web3Url)
const l2Provider = new JsonRpcProvider(configs.l2Web3Url)

const transactions = new OMGXTransactions(
  configs.walletPKey,
  l1Provider,
  l2Provider,
  configs.l1PoolAddress,
  configs.l2PoolAddress,
  configs.l1StandardAddress,
  configs.l2StandardAddress,
  configs.l1MessengerAddress,
  configs.l2MessengerAddress,
  configs.l1FastMessengerAddress,
)

const sleep = util.promisify(setTimeout)

const testConnection = async () => {
  logger.info('Trying to connect to the L1 network...')
  for (let i = 0; i < 10; i++) {
    try {
      await l1Provider.detectNetwork()
      logger.info('Successfully connected to the L1 network.')
      break
    } catch (err) {
      if (i < 9) {
        logger.info('Unable to connect to L1 network', {
          retryAttemptsRemaining: 10 - i,
        })
        await sleep(1000)
      } else {
        throw new Error(`Unable to connect to the L1 network, check that your L1 endpoint is correct.`)
      }
    }
  }
  logger.info('Trying to connect to the L2 network...')
  for (let i = 0; i < 10; i++) {
    try {
      await l2Provider.detectNetwork()
      logger.info('Successfully connected to the L2 network.')
      break
    } catch (err) {
      if (i < 9) {
        logger.info('Unable to connect to L2 network', {
          retryAttemptsRemaining: 10 - i,
        })
        await sleep(1000)
      } else {
        throw new Error(`Unable to connect to the L2 network, check that your L2 endpoint is correct.`)
      }
    }
  }
}

const loop = async (func: () => Promise<void>) => {
  while (true) {
    try {
      await func()
    } catch (error) {
      logger.error('Unhandled exception during monitor omgx transaction', {
        message: error.toString(),
        stack: error.stack,
        code: error.code,
      })
      break
    }
  }
}

const main = async () => {
  // ERC20 fast withdraw
  // return l2Provider.getTransactionReceipt('0xef92e59b7333b1bbddbe9ef4f6f89c1f52fb60168210e3802e7f58902c8a3815')
  // .then((l2Receipt) => {
  //   logger.debug('l2Receipt', l2Receipt.logs)
  //   return transactions.getTargetReceipt(transactions.l2Layer, transactions.l1FastLayer, l2Receipt, transactions.L1_STARTING_BLOCK)
  // })
  // .then(async (l1Receipt) => {
  //   logger.debug('l1Receipt', l1Receipt)
  //   logger.debug('l1Receipt logs', l1Receipt.logs)
  //   const params = transactions.parseClientPayL1(l1Receipt)
  //   logger.debug('params', { rawParams: params })
  //   logger.debug('token name', { name: await transactions.getERC20TokenSymbol(params.tokenAddress) })
  // })

  // ETH fast withdraw
  // return l2Provider.getTransactionReceipt('0xf027df045fab084ce759fe8b17b363c960207e4287e653d94b7b5671767032a7')
  // .then((l2Receipt) => {
  //   logger.debug('l2Receipt', l2Receipt.logs)
  //   return transactions.getTargetReceipt(transactions.l2Layer, transactions.l1FastLayer, l2Receipt, transactions.L1_STARTING_BLOCK)
  // })
  // .then((l1Receipt) => {
  //   logger.debug('l1Receipt', l1Receipt)
  //   logger.debug('l1Receipt logs', l1Receipt.logs)
  //   logger.debug('params', { rawParams: transactions.parseClientPayL1(l1Receipt) })
  // })

  // ETH standard deposit
  // return l1Provider.getTransactionReceipt('0x245294edd49e6d90b9956e11b154a9616a8ce3e50b174ce2d176f3bcb94c41be')
  // .then((l1Receipt) => {
  //   logger.debug('l1Receipt', l1Receipt.logs)
  //   return transactions.getTargetReceipt(transactions.l1Layer, transactions.l2Layer, l1Receipt)
  // })
  // .then((l2Receipt) => {
  //   logger.debug('l2Receipt', l2Receipt)
  // })

  // ETH fast deposit
  // return l1Provider.getTransactionReceipt('0x0645bbd566ca06ad262267f0ab81f0a4b3c0ffb09a008159632342ef178a93c9')
  // .then((l1Receipt) => {
  //   logger.debug('l1Receipt', l1Receipt.logs)
  //   return transactions.getTargetReceipt(transactions.l1Layer, transactions.l2Layer, l1Receipt)
  // })
  // .then((l2Receipt) => {
  //   logger.debug('l2Receipt', l2Receipt)
  // })

  if (curLastBlock === undefined) {
    curLastBlock = await l1Provider.getBlockNumber()
  }
  const startingBlock = Math.max(curLastBlock - configs.blockFetchRange, L1_LAST_BLOCK_TO_SCAN)
  logger.debug('curLastBlock: ' + curLastBlock)
  logger.debug('startingBlock: ' + startingBlock)
  await transactions.scanDepositData(startingBlock, curLastBlock)
  if (startingBlock <= L1_LAST_BLOCK_TO_SCAN) {
    throw Error('Reached the last block')
  }
  curLastBlock = startingBlock - 1

  // if (curLastBlock === undefined) {
  //   curLastBlock = await l2Provider.getBlockNumber()
  // }
  // const startingBlock = Math.max(curLastBlock - configs.blockFetchRange, L2_LAST_BLOCK_TO_SCAN)
  // logger.debug('curLastBlock: ' + curLastBlock)
  // logger.debug('startingBlock: ' + startingBlock)
  // await transactions.scanWithdrawData(startingBlock, curLastBlock)
  // if (startingBlock <= L2_LAST_BLOCK_TO_SCAN) {
  //   throw Error('Reached the last block')
  // }
  // curLastBlock = startingBlock - 1

  // let startingBlock = await database.getLastBlock()
  // if (startingBlock === undefined) {
  //   startingBlock = chainLatestBlock - configs.blockFetchRange
  // }
  // if (startingBlock < chainLatestBlock) {
  //   const endingBlock = Math.min(startingBlock + configs.blockFetchRange, chainLatestBlock)
  //   logger.info(`Start fetching transactions from ${startingBlock} to ${endingBlock}...`)
  //   await transactions.scanDepositData(startingBlock, endingBlock)
  //   // await database.updateLastBlock(endingBlock)
  // }
  await sleep(5000)
}

let curLastBlock: number = 8981512
const L1_LAST_BLOCK_TO_SCAN = 8845207
const L2_LAST_BLOCK_TO_SCAN = 0
// l2Provider.getTransaction('0x2dae16d02c836e9643562983474d34bfab41bcc958308ad952fcc8cb932c8d76')
// .then((tx) => {
//   logger.debug('transaction', tx)
//   return l2Provider.getTransactionReceipt('0x2dae16d02c836e9643562983474d34bfab41bcc958308ad952fcc8cb932c8d76')
// })
// .then((receipt) => {
//   logger.debug('receipt', receipt)
// })
// .catch(logger.error)

testConnection()
.then(database.initDatabase.bind(database))
// .then(() => transactions.scanDepositData(9204400, 9204500))
// .then(() => transactions.scanDepositData(9206600 , 9206700))
// .then(() => transactions.scanWithdrawData(16400 , 16500))
.then(() => loop(main))
// .then(main)
.then(() => logger.debug('done processing'))
.catch((error) => {
  logger.error('Unhandled exception during monitor omgx transaction', {
    message: error.toString(),
    stack: error.stack,
    code: error.code,
  })
  process.exit(1)
})
