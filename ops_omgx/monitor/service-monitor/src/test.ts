import * as configs from './configs'
import database from './libs/database'
import logger from './logger'
import Web3 from 'web3'
import {
  ethers,
  constants,
  Contract,
  providers,
  Transaction,
  utils,
  Wallet,
} from 'ethers'
import util from 'util'
import { Watcher } from '@eth-optimism/core-utils'
import {
  getContractFactory,
  getContractInterface,
  predeploys,
} from '@eth-optimism/contracts'
import {
  JsonRpcProvider,
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers'

const ADDRESS_MANAGER = '0x4e57A993D14FF6f2BCA23d9B174faA9c7AdC4A5A'
const PRIVATE_KEY1 = 'ce3589f0a0c812889cd99c219c9366f1c49cb813904efe9b29f2046daedf2ce6'
const PRIVATE_KEY2 = '01d2b17d3c081725b5bcb2afd11ad0d4a459624c6f87c336aeedd3e7a97dc87c'
const _startingBlock = 12900
const l1Provider = new providers.JsonRpcProvider(configs.l1Web3Url)
const l2Provider = new providers.JsonRpcProvider(configs.l2Web3Url)
const sleep = util.promisify(setTimeout)
const l1Wallet = new Wallet(PRIVATE_KEY1, l1Provider)
const l2Wallet = new Wallet(PRIVATE_KEY2, l1Provider)

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

enum Direction {
  L1ToL2,
  L2ToL1,
}

interface CrossDomainMessagePair {
  tx: Transaction
  receipt: TransactionReceipt
  remoteTx: Transaction
  remoteReceipt: TransactionReceipt
}

const getL1Bridge = async (wallet: Wallet, AddressManager: Contract) => {
  const l1BridgeInterface = getContractInterface('OVM_L1StandardBridge')
  const ProxyBridgeAddress = await AddressManager.getAddress(
    'Proxy__OVM_L1StandardBridge',
  )

  if (
    !utils.isAddress(ProxyBridgeAddress) ||
    ProxyBridgeAddress === constants.AddressZero
  ) {
    throw new Error('Proxy__OVM_L1StandardBridge not found')
  }

  const ovmL1StandardBridge = new Contract(
    ProxyBridgeAddress,
    l1BridgeInterface,
    wallet,
  )
  return ovmL1StandardBridge
}

const initWatcher = async (
  _l1Provider: JsonRpcProvider,
  _l2Provider: JsonRpcProvider,
  AddressManager: Contract,
) => {
  const l1MessengerAddress = await AddressManager.getAddress(
    'Proxy__OVM_L1CrossDomainMessenger',
  )
  const l2MessengerAddress = await AddressManager.getAddress(
    'OVM_L2CrossDomainMessenger',
  )
  return new Watcher({
    l1: {
      provider: _l1Provider,
      messengerAddress: l1MessengerAddress,
    },
    l2: {
      provider: _l2Provider,
      messengerAddress: l2MessengerAddress,
    },
  })
}

const getAddressManager = (provider: any) => {
  return getContractFactory('Lib_AddressManager')
    .connect(provider)
    .attach(ADDRESS_MANAGER)
}

const waitForXDomainTransaction = async (
  watcher: Watcher,
  tx: Promise<TransactionResponse> | TransactionResponse,
  direction: Direction,
): Promise<CrossDomainMessagePair> => {
  const { src, dest } =
    direction === Direction.L1ToL2
      ? { src: watcher.l1, dest: watcher.l2 }
      : { src: watcher.l2, dest: watcher.l1 }

  // await it if needed
  tx = await tx
  // get the receipt and the full transaction
  const receipt = await tx.wait()
  const fullTx = await src.provider.getTransaction(tx.hash)

  // get the message hash which was created on the SentMessage
  const [xDomainMsgHash] = await watcher.getMessageHashesFromTx(src, tx.hash)
  logger.info(xDomainMsgHash)
  // Get the transaction and receipt on the remote layer
  const remoteReceipt = await watcher.getTransactionReceipt(
    dest,
    xDomainMsgHash,
  )
  const remoteTx = await dest.provider.getTransaction(
    remoteReceipt.transactionHash,
  )

  return {
    tx: fullTx,
    receipt,
    remoteTx,
    remoteReceipt,
  }
}

const getChainData = async (startingBlock, endingBlock) => {
  const promisesBlock = []
  const promisesReceipt = []
  for (let i = startingBlock; i <= endingBlock; i++) {
    promisesBlock.push(l1Provider.getBlockWithTransactions(i))
    logger.info(`Pushing block`)
  }
  const blocksData = await Promise.all(promisesBlock)
  for (const blockData of blocksData) {
    if (blockData.transactions.length) {
      blockData.transactions.forEach(i => {
        promisesReceipt.push(l1Provider.getTransactionReceipt(i.hash))
      })
    }
    // sleep(2000)
  }
  const receiptsData = await Promise.all(promisesReceipt)

  return { blocksData, receiptsData }
}

(async () => {
  database.initMySQL()
  .then(async () => {
    logger.info('Done init')
    logger.info(await database.query(`SELECT MAX(salary) from Employee`))
  })
  .catch(logger.error)

  // const web3 = new Web3(configs.l1Web3Url)
  // const endingBlock = await web3.eth.getBlockNumber()
  // const { blocksData, receiptsData } = await getChainData(_startingBlock, endingBlock)

  // const addressManager = getAddressManager(l1Wallet)
  // const watcher = await initWatcher(l1Provider, l2Provider, addressManager)
  // const l1Bridge: Contract = await getL1Bridge(l1Wallet, addressManager)
  // const l2Bridge: Contract = await getL1Bridge(l2Wallet, addressManager)
  // const result = await waitForXDomainTransaction(
  //   watcher,
  //   l2Bridge.depositETH(1300000, '0xFFFF', {
  //     value: 1000000000,
  //     gasLimit: 330000,
  //   }),
  //   Direction.L1ToL2,
  // )
  // logger.info(result)

  // logger.info(await web3.eth.getBlock(null))
  logger.info(await l1Provider.getTransaction('0x1e6e600c81a1e701b7f7b758435c37695fa362b4bcd1c6100fe2bf644d4f27d9'))
})()
.catch((error) => {
  logger.error('Unhandled exception during monitor omgx transaction', {
    message: error.toString(),
    stack: error.stack,
    code: error.code,
  })
  process.exit(1)
})
