import { BigNumber, Contract, ethers, providers, Wallet } from 'ethers'
import {
  JsonRpcProvider,
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers'
import {
  BlockWithTransactions,
} from '@ethersproject/abstract-provider'
import { Layer } from '@eth-optimism/core-utils'
import _ from 'lodash'
import database, { Transaction } from '../libs/database'
import logger from '../logger'
import ERC20_ABI from '../../artifacts/contracts/L1ERC20.sol/L1ERC20.json'

enum Method {
  Standard = 'standard',
  Fast = 'fast',
}

enum Direction {
  Deposit = 'deposit',
  Withdraw = 'withdraw',
}

enum FunctionSignatures {
  // 'depositETH': '0xb1a1a882',
  StandardDepositETH = '0xb1a1a882',
  FastDepositETH = '0xf64b5f44',
  FastWithdrawETH = '0x1d00a771',
  // 'clientDepositL1': '0xf64b5f44',
}

interface ClientPayL1 {
  sender: string
  amount: BigNumber
  userRewardFee: BigNumber
  ownerRewardFee: BigNumber
  totalFee: BigNumber
  tokenAddress: string
}

export class OMGXTransactions {
  l1PoolAddress: string
  l2PoolAddress: string
  l1StandardAddress: string
  l2StandardAddress: string
  l1MessengerAddress: string
  l2MessengerAddress: string
  l1FastMessengerAddress: string
  l1Provider: JsonRpcProvider
  l2Provider: JsonRpcProvider
  l1Layer: Layer
  l2Layer: Layer
  l1FastLayer: Layer
  l1Wallet: Wallet
  l2Wallet: Wallet
  public NUM_BLOCKS_TO_FETCH: number = 20000
  public L1_STARTING_BLOCK: number = 8845207
  public L2_STARTING_BLOCK: number = 0

  constructor(
    walletKey: string,
    l1Provider: JsonRpcProvider,
    l2Provider: JsonRpcProvider,
    l1PoolAddress: string,
    l2PoolAddress: string,
    l1StandardAddress: string,
    l2StandardAddress: string,
    l1MessengerAddress: string,
    l2MessengerAddress: string,
    l1FastMessengerAddress: string,
  ) {
    this.l1Wallet = new Wallet(walletKey, l1Provider)
    this.l2Wallet = this.l1Wallet.connect(l2Provider)
    this.l1Provider = l1Provider
    this.l2Provider = l2Provider
    this.l1PoolAddress = l1PoolAddress
    this.l2PoolAddress = l2PoolAddress
    this.l1StandardAddress = l1StandardAddress
    this.l2StandardAddress = l2StandardAddress
    this.l1MessengerAddress = l1MessengerAddress
    this.l2MessengerAddress = l2MessengerAddress
    this.l1FastMessengerAddress = l1FastMessengerAddress
    this.l1Layer = {
      provider: l1Provider,
      messengerAddress: this.l1MessengerAddress,
    }
    this.l1FastLayer = {
      provider: l1Provider,
      messengerAddress: this.l1FastMessengerAddress,
    }
    this.l2Layer = {
      provider: l2Provider,
      messengerAddress: this.l2MessengerAddress,
    }
  }

  getDepositMethod = (tx: TransactionResponse): Method => {
    let method: Method
    const encodedFunc = tx.data.slice(0, 10)
    if (tx.to && tx.to.toLowerCase() === this.l1StandardAddress.toLowerCase() &&
    encodedFunc === FunctionSignatures.StandardDepositETH) {
      method = Method.Standard
    } else if (tx.to && tx.to.toLowerCase() === this.l1PoolAddress.toLowerCase() &&
    encodedFunc === FunctionSignatures.FastDepositETH) {
      method = Method.Fast
    }
    return method
  }

  getWithdrawMethod = (tx: TransactionResponse): Method => {
    let method: Method
    const encodedFunc = tx.data.slice(0, 10)
    if (tx.to && tx.to.toLowerCase() === this.l2PoolAddress.toLowerCase() &&
    encodedFunc === FunctionSignatures.FastWithdrawETH) {
      method = Method.Fast
    }
    return method
  }

  saveTransactionToDB = async (
    tx: TransactionResponse,
    receipt: TransactionReceipt,
    targetTx: TransactionResponse,
    targetReceipt: TransactionReceipt,
    direction: Direction,
    method: Method,
    token: string,
    params?: any,
  ) => {
    const transaction: Transaction = {
      token,
      method,
      direction,
      timestamp: tx.timestamp,
      sourceHash: receipt.transactionHash,
      targetHash: targetReceipt.transactionHash,
      sourceBlockHash: receipt.blockHash,
      targetBlockHash: targetReceipt.blockHash,
      sourceBlockNumber: receipt.blockNumber,
      targetBlockNumber: targetReceipt.blockNumber,
      address: receipt.from,
      sentAmount: params ? params.sent.toString() : tx.value.toString(),
      receivedAmount: params ? params.received.toString() : tx.value.toString(),
      sourceGasUsed: receipt.gasUsed.toString(),
      targetGasUsed: targetReceipt.gasUsed.toString(),
      sourceGasLimit: tx.gasLimit.toString(),
      targetGasLimit: targetTx.gasLimit.toString(),
      sourceTransactionFee: receipt.gasUsed.mul(tx.gasPrice).toString(),
      targetTransactionFee: targetTx.gasLimit.mul(targetTx.gasPrice).toString(),
    }
    await database.insertTransactionData(transaction)
  }

  scanWithdrawData = async (
    startingBlock: number,
    endingBlock: number,
  ) => {
    const promisesBlock = []
    const promisesReceipt = []
    const transactions = {}

    for (let i = startingBlock; i <= endingBlock; i++) {
      promisesBlock.push(this.l2Provider.getBlockWithTransactions(i))
    }
    const blocksData: BlockWithTransactions[] = await Promise.all(promisesBlock)
    logger.debug('blockData count: ' + blocksData.length)
    for (const blockData of blocksData) {
      blockData.transactions.forEach(async (tx: TransactionResponse) => {
        const method = this.getWithdrawMethod(tx)
        if (method && tx.value.eq(0)) {
          tx.data = method
          tx.timestamp = blockData.timestamp
          transactions[tx.hash] = tx
          promisesReceipt.push(this.l2Provider.getTransactionReceipt(tx.hash))
        }
      })
    }

    logger.debug('receiptsData: ' + promisesReceipt.length)
    const receiptsData = await Promise.all(promisesReceipt)
    for (const receipt of receiptsData) {
      if (!receipt || !receipt.status) {
        return
      }
      switch (transactions[receipt.transactionHash].data) {
        case Method.Fast:
          await this.processFastWithdraw(transactions[receipt.transactionHash], receipt, Method.Fast)
          break
      }
    }
  }

  scanDepositData = async (
    startingBlock: number,
    endingBlock: number,
  ) => {
    const promisesBlock = []
    const promisesReceipt = []
    const transactions = {}

    for (let i = startingBlock; i <= endingBlock; i++) {
      promisesBlock.push(this.l1Provider.getBlockWithTransactions(i))
    }
    const blocksData: BlockWithTransactions[] = await Promise.all(promisesBlock)
    for (const blockData of blocksData) {
      blockData.transactions.forEach(async (tx: TransactionResponse) => {
        const method = this.getDepositMethod(tx)
        if (method) {
          tx.data = method
          tx.timestamp = blockData.timestamp
          transactions[tx.hash] = tx
          promisesReceipt.push(this.l1Provider.getTransactionReceipt(tx.hash))
        }
      })
    }

    const receiptsData = await Promise.all(promisesReceipt)
    for (const receipt of receiptsData) {
      if (!receipt || !receipt.status) {
        return
      }
      switch (transactions[receipt.transactionHash].data) {
        case Method.Fast:
          await this.processDeposit(transactions[receipt.transactionHash], receipt, Method.Fast)
          break
        case Method.Standard:
          await this.processDeposit(transactions[receipt.transactionHash], receipt, Method.Standard)
          break
      }
    }
  }

  getMessageHash = (
    messengerAddress: string,
    logs: providers.Log[],
  ) => {
    // get the message hash which was created on the SentMessage
    const msgHashes = []
    for (const log of logs) {
      if (
        log.address === messengerAddress &&
        log.topics[0] === ethers.utils.id('SentMessage(bytes)')
      ) {
        const [message] = ethers.utils.defaultAbiCoder.decode(
          ['bytes'],
          log.data,
        )
        msgHashes.push(ethers.utils.solidityKeccak256(['bytes'], [message]))
      }
    }
    const [xDomainMsgHash] = msgHashes
    return xDomainMsgHash
  }

  getTargetReceipt = async (
    srcLayer: Layer,
    targetLayer: Layer,
    receipt: TransactionReceipt,
    startingBlock: number,
  ) => {
    const xDomainMsgHash = this.getMessageHash(srcLayer.messengerAddress, receipt.logs)
    const filter = {
      address: targetLayer.messengerAddress,
      topics: [ethers.utils.id(`RelayedMessage(bytes32)`)],
      fromBlock: startingBlock,
    }
    const logs = await targetLayer.provider.getLogs(filter)
    const matches = logs.filter((log: any) => log.data === xDomainMsgHash)
    return (matches.length) ? targetLayer.provider.getTransactionReceipt(matches[0].transactionHash) : undefined
  }

  parseClientPayL1 = (receipt: TransactionReceipt): ClientPayL1 => {
    let logData: string
    for (const log of receipt.logs) {
      if (log.address === this.l1PoolAddress &&
        log.topics[0] === ethers.utils.id('ClientPayL1(address,uint256,uint256,uint256,uint256,address)') &&
        log.data.length === 386) {
        logData = log.data.slice(2)
        break
      }
    }
    if (!logData) {
      return
    }

    const rawParams: string[] = _.chunk(logData, 64).map((val) => val.join(''))
    return {
      sender: '0x' + _.trimStart(rawParams[0], '0'),
      amount: BigNumber.from('0x' + rawParams[1]),
      userRewardFee: BigNumber.from('0x' + rawParams[2]),
      ownerRewardFee: BigNumber.from('0x' + rawParams[3]),
      totalFee: BigNumber.from('0x' + rawParams[4]),
      tokenAddress: '0x' + _.trimStart(rawParams[5], '0'),
    }
  }

  getERC20TokenSymbol = async (address: string) => {
    const contractERC20 = new Contract(
      address,
      ERC20_ABI.abi,
      this.l1Wallet,
    )
    return contractERC20.symbol()
  }

  processFastWithdraw = async (tx: TransactionResponse, receipt: TransactionReceipt, method: Method) => {
    const targetReceipt = await this.getTargetReceipt(
      this.l2Layer,
      this.l1FastLayer,
      receipt,
      this.L1_STARTING_BLOCK,
    )
    if (!targetReceipt || !targetReceipt.status) {
      return
    }

    const targetTx = await this.l1Provider.getTransaction(targetReceipt.transactionHash)

    const clientPayL1Params = this.parseClientPayL1(targetReceipt)
    if (!clientPayL1Params) {
      return
    }

    let tokenSymbol: string = 'ETH'
    if (clientPayL1Params.tokenAddress.length > 2) {
      try {
        tokenSymbol = await this.getERC20TokenSymbol(clientPayL1Params.tokenAddress)
      } catch {
        tokenSymbol = 'Unknown'
      }
    }
    const amount = {
      sent: clientPayL1Params.amount.add(clientPayL1Params.totalFee),
      received: clientPayL1Params.amount,
    }
    logger.debug(`found a transactions`)
    await this.saveTransactionToDB(
      tx,
      receipt,
      targetTx,
      targetReceipt,
      Direction.Withdraw,
      method,
      tokenSymbol,
      amount,
    )
  }

  processDeposit = async (tx: TransactionResponse, receipt: TransactionReceipt, method: Method) => {
    const targetReceipt = await this.getTargetReceipt(
      this.l1Layer,
      this.l2Layer,
      receipt,
      this.L2_STARTING_BLOCK,
    )
    if (!targetReceipt || !targetReceipt.status) {
      return
    }

    const targetTx = await this.l2Provider.getTransaction(targetReceipt.transactionHash)

    logger.debug(`found a transactions`)
    await this.saveTransactionToDB(tx, receipt, targetTx, targetReceipt, Direction.Deposit, method, 'ETH')
  }
}
