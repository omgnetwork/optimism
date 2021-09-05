import mysql from 'mysql'
import util from 'util'
import * as configs from '../configs'
import logger from '../logger'

const tableNames = {
  transaction: 'transaction',
  blockHistory: 'blockHistory',
}

interface BlockInfo {
  blockNumber: number,
  blockHash: string,
}

export interface Transaction {
  sourceHash: string
  targetHash: string
  sourceBlockHash: string
  targetBlockHash: string
  sourceBlockNumber: number
  targetBlockNumber: number
  address: string
  token: string
  sentAmount: string
  receivedAmount: string
  sourceGasUsed: string
  targetGasUsed: string
  sourceGasLimit: string
  targetGasLimit: string
  sourceTransactionFee: string
  targetTransactionFee: string
  direction: string
  method: string
  timestamp: number
}

class Database {
  connection: mysql.Connection
  query: (query: string) => Promise<mysql.Query>

  constructor() {
    this.connection = mysql.createConnection({
      host: configs.mysqlHostUrl,
      port: configs.mysqlPort,
      user: configs.mysqlUsername,
      password: configs.mysqlPassword,
    })
    this.query = util.promisify(this.connection.query).bind(this.connection)
  }

  async initDatabase() {
    logger.info('Initializing the database...')
    await this.query(`CREATE DATABASE IF NOT EXISTS ${configs.mysqlDatabaseName}`)
    await this.query(`USE ${configs.mysqlDatabaseName}`)
    await this.query(`CREATE TABLE IF NOT EXISTS ${tableNames.transaction}
      (
        sourceHash VARCHAR(100) NOT NULL,
        targetHash VARCHAR(100) NOT NULL,
        sourceBlockHash VARCHAR(100) NOT NULL,
        targetBlockHash VARCHAR(100) NOT NULL,
        sourceBlockNumber INT NOT NULL,
        targetBlockNumber INT NOT NULL,
        address VARCHAR(50) NOT NULL,
        token VARCHAR(10) NOT NULL,
        sentAmount VARCHAR(255) NOT NULL,
        receivedAmount VARCHAR(255) NOT NULL,
        sourceGasUsed VARCHAR(255) NOT NULL,
        targetGasUsed VARCHAR(255) NOT NULL,
        sourceGasLimit VARCHAR(255) NOT NULL,
        targetGasLimit VARCHAR(255) NOT NULL,
        sourceTransactionFee VARCHAR(255) NOT NULL,
        targetTransactionFee VARCHAR(255) NOT NULL,
        direction VARCHAR(10) NOT NULL,
        method VARCHAR(10) NOT NULL,
        timestamp INT NOT NULL,
        PRIMARY KEY ( sourceHash )
      )`,
    )
    await this.query(`CREATE TABLE IF NOT EXISTS ${tableNames.blockHistory}
      (
        sourceBlockHash VARCHAR(100) NOT NULL,
        targetBlockHash VARCHAR(100) NOT NULL,
        sourceBlockNumber INT NOT NULL,
        targetBlockNumber INT NOT NULL,
        direction VARCHAR(10) NOT NULL,
        PRIMARY KEY ( sourceBlockHash )
      )`,
    )
  }

  async getLastBlock(): Promise<number> {
    await this.query(`USE ${configs.mysqlDatabaseName}`)
    const lastBlockQuery = await this.query(`SELECT MIN(sourceBlockNumber) from ${tableNames.blockHistory}`)
    const lastBlock = lastBlockQuery[0]['MIN(sourceBlockNumber)'] || undefined
    return lastBlock
  }

  async updateLastBlock(sourceBlock: BlockInfo, targetBlock: BlockInfo, direction: string) {
    await this.query(`USE ${configs.mysqlDatabaseName}`)
    return this.query(`INSERT INTO ${tableNames.blockHistory}
      SET sourceBlockHash='${sourceBlock.blockHash}',
      targetBlockHash='${targetBlock.blockHash}',
      sourceBlockNumber='${sourceBlock.blockNumber}',
      targetBlockNumber='${targetBlock.blockNumber}',
      direction='${direction}',
    `)
  }

  async insertTransactionData(transactionData: Transaction) {
    await this.query(`USE ${configs.mysqlDatabaseName}`)
    return this.query(`INSERT IGNORE INTO ${tableNames.transaction}
      SET sourceHash='${transactionData.sourceHash}',
      targetHash='${transactionData.targetHash}',
      sourceBlockHash='${transactionData.sourceBlockHash}',
      targetBlockHash='${transactionData.targetBlockHash}',
      sourceBlockNumber=${transactionData.sourceBlockNumber},
      targetBlockNumber=${transactionData.targetBlockNumber},
      address='${transactionData.address}',
      token='${transactionData.token}',
      sentAmount='${transactionData.sentAmount}',
      receivedAmount='${transactionData.receivedAmount}',
      sourceGasUsed='${transactionData.sourceGasUsed}',
      targetGasUsed='${transactionData.targetGasUsed}',
      sourceGasLimit='${transactionData.sourceGasLimit}',
      targetGasLimit='${transactionData.targetGasLimit}',
      sourceTransactionFee='${transactionData.sourceTransactionFee}',
      targetTransactionFee='${transactionData.targetTransactionFee}',
      direction='${transactionData.direction}',
      method='${transactionData.method}',
      timestamp=${transactionData.timestamp}
    `)
  }
}

export default new Database()
