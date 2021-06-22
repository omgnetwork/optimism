import _ from 'lodash'
import abiDecoder from 'abi-decoder'
import web3 from 'web3'
import { TransactionReceipt, WebSocketProvider } from '@ethersproject/providers'
import dotenv from 'dotenv'
dotenv.config()
import logger from './logger'

// logger.info({ key: 'config', data: config.parsed })
// console.log(parseInt('0x51cff8d9', 16))
// const LitContractABI = [{ 'anonymous': false, 'inputs': [{ 'indexed': false, 'internalType': 'uint256', 'name': 'recipientMinBalance', 'type': 'uint256' }, { 'indexed': false, 'internalType': 'uint256', 'name': 'recipientDesiredBalance', 'type': 'uint256' }], 'name': 'Configure', 'type': 'event' },{ 'anonymous': false, 'inputs': [{ 'indexed': true, 'internalType': 'address', 'name': 'caller', 'type': 'address' },{ 'indexed': false, 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256' }], 'name': 'Deposit', 'type': 'event' },{ 'anonymous': false, 'inputs': [{ 'indexed': true, 'internalType': 'address', 'name': 'previousOwner', 'type': 'address' },{ 'indexed': true, 'internalType': 'address', 'name': 'newOwner', 'type': 'address' }], 'name': 'OwnershipTransferred', 'type': 'event' },{ 'anonymous': false, 'inputs': [{ 'indexed': true, 'internalType': 'address', 'name': 'account', 'type': 'address' },{ 'indexed': false, 'internalType': 'bool', 'name': 'whitelisted', 'type': 'bool' }], 'name': 'Whitelist', 'type': 'event' },{ 'anonymous': false, 'inputs': [{ 'indexed': true, 'internalType': 'address', 'name': 'caller', 'type': 'address' },{ 'indexed': true, 'internalType': 'address', 'name': 'to', 'type': 'address' },{ 'indexed': false, 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256' }], 'name': 'Withdraw', 'type': 'event' },{ 'inputs': [{ 'internalType': 'uint256', 'name': 'minBalance', 'type': 'uint256' },{ 'internalType': 'uint256', 'name': 'desiredBalance', 'type': 'uint256' }], 'name': 'configure', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' },{ 'inputs': [], 'name': 'deposit', 'outputs': [], 'stateMutability': 'payable', 'type': 'function' },{ 'inputs': [], 'name': 'owner', 'outputs': [{ 'internalType': 'address', 'name': '', 'type': 'address' }], 'stateMutability': 'view', 'type': 'function' },{ 'inputs': [], 'name': 'recipientDesiredBalance', 'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }], 'stateMutability': 'view', 'type': 'function' },{ 'inputs': [], 'name': 'recipientMinBalance', 'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }], 'stateMutability': 'view', 'type': 'function' },{ 'inputs': [], 'name': 'renounceOwnership', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' },{ 'inputs': [{ 'internalType': 'address', 'name': 'account', 'type': 'address' },{ 'internalType': 'bool', 'name': 'whitelisted', 'type': 'bool' }], 'name': 'setWhitelist', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' },{ 'inputs': [{ 'internalType': 'address', 'name': 'newOwner', 'type': 'address' }], 'name': 'transferOwnership', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' },{ 'inputs': [{ 'internalType': 'address', 'name': '', 'type': 'address' }], 'name': 'whitelist', 'outputs': [{ 'internalType': 'bool', 'name': '', 'type': 'bool' }], 'stateMutability': 'view', 'type': 'function' },{ 'inputs': [{ 'internalType': 'address payable', 'name': 'to', 'type': 'address' }], 'name': 'withdraw', 'outputs': [{ 'internalType': 'uint256', 'name': '', 'type': 'uint256' }], 'stateMutability': 'nonpayable', 'type': 'function' },{ 'inputs': [{ 'internalType': 'address payable', 'name': 'to', 'type': 'address' },{ 'internalType': 'uint256', 'name': 'amount', 'type': 'uint256' }], 'name': 'withdrawAll', 'outputs': [], 'stateMutability': 'nonpayable', 'type': 'function' },{ 'stateMutability': 'payable', 'type': 'receive' }]
// abiDecoder.addABI(LitContractABI)
// const testData = '0x095ea7b3000000000000000000000000d9e1ce17f2641f24ae83637ab66a2cca9c378b9fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
// const decodedData = abiDecoder.decodeMethod(testData)
// console.log(decodedData)

const fetchData = (l1BlockNumber, l2BlockNumber) => {
  const promiseData = [
    l1Socket.getBalance(process.env.L1_LIQUIDITY_POOL_ADDRESS),
    l2Socket.getBalance(process.env.L2_LIQUIDITY_POOL_ADDRESS),
    l1Socket.getGasPrice(),
    l2Socket.getGasPrice(),
    l1BlockNumber,
    l2BlockNumber
  ]

  return Promise.all(promiseData)
    .then((values) => {
      return {
        l1LiquidityPoolBalance: values[0].toString(),
        l2LiquidityPoolBalance: values[1].toString(),
        l1GasPrice: values[2].toString(),
        l2GasPrice: values[3].toString(),
        l1BlockNumber: values[4],
        l2BlockNumber: values[5],
      }
    })
}

const logTransaction = (socket: WebSocketProvider, receipt: TransactionReceipt, poolAddress: string, timestamp: number) => {
  // check from/to address is pool address
  if (receipt.from !== poolAddress || receipt.to === poolAddress) {
    logger.info({
      poolAddress,
      timestamp,
      key: 'transaction',
      networkName: socket.network.name,
      data: _.omit(receipt, ['logs']),
    })
    receipt.logs.forEach((log) => {
      logger.info({
        poolAddress,
        timestamp,
        key: 'event',
        networkName: socket.network.name,
        data: log
      })
    })
  }
}

const logData = (socket: WebSocketProvider, blockNumber: string, poolAddress: string, timestamp: number) => {
  const metadata = {
    blockNumber,
    poolAddress,
    networkName: socket.network.name,
  }
  const logError = (key) => {
    return (err: Error) => {
      logger.error({
        key,
        timestamp,
        data: {
          ...metadata,
          error: err.message,
        },
      })
    }
  }

  socket.getBlock(blockNumber)
  .then((block) => {
    timestamp = block.timestamp
    block.transactions.forEach((trans) => {
      l1Socket.getTransactionReceipt(trans)
      .then((receipt: TransactionReceipt) => {
        logTransaction(socket, receipt, poolAddress, timestamp)
      })
      .catch(logError('transaction'))
    })
  })
  .catch(logError('block'))
}

const l1Socket = new WebSocketProvider(process.env.L1_NODE_WEB3_WS)
l1Socket._subscribe('block', ['newHeads'], async (result: any) => {
  const timestamp = parseInt(result.timestamp, 16)
  const l1BlockNumber = parseInt(result.number, 16)

  // log transactions and events
  logData(l1Socket, result.number, process.env.L1_LIQUIDITY_POOL_ADDRESS, timestamp)

  // log balances
  fetchData(l1BlockNumber, l2Socket.getBlockNumber()).then((data) => {
    logger.info({ key: 'balance', timestamp, data })
  }).catch((err) => {
    logger.error({
      key: 'balance',
      timestamp,
      data: {
        error: err.message,
      },
    })
  })
}).catch()

const l2Socket = new WebSocketProvider(process.env.L1_NODE_WEB3_WS)
l2Socket._subscribe('block', ['newHeads'], async (result: any) => {
  const timestamp = parseInt(result.timestamp, 16)
  const l2BlockNumber = parseInt(result.number, 16)

  // log transactions and events
  logData(l2Socket, result.number, process.env.L2_LIQUIDITY_POOL_ADDRESS, timestamp)

  // log balances
  fetchData(l1Socket.getBlockNumber(), l2BlockNumber).then((data) => {
    logger.info({ key: 'balance', timestamp: parseInt(result.timestamp, 16), data })
  }).catch((err) => {
    logger.error({
      key: 'balance',
      timestamp,
      data: {
        error: err.message,
      },
    })
  })
}).catch()

// l1Socket.getTransactionReceipt('0x4ba7c3ea403461b159df4ca0c6e38ece3b7c82fe35aa8d4669c2c00572a278e6')
// l1Socket.getTransactionReceipt('0x041e9d9c19c3a11ef4a37f95a3661195f95b67619f5a04faa9fe534e8a9f937a')
// .then((receipt) => {
  // logger.debug(receipt.logs)
  // logger.debug(abiDecoder.decodeLogs(receipt.logs))
// })
// .catch()
