#!/usr/bin/env node

const mysql = require('mysql');
const util = require('util');

const OptimismEnv = require('./utilities/optimismEnv');

class DatabaseService extends OptimismEnv{
  constructor() {
    super(...arguments);
    this.con = null;
    this.query = null;
  }

  async initDatabaseService() {
    this.con = mysql.createConnection({
      host: this.MySQLHostURL,
      port: this.MySQLPort,
      user: this.MySQLUsername,
      password: this.MySQLPassword,
    });
    this.query = util.promisify(this.con.query).bind(this.con);
  }

  async initMySQL() {
    this.logger.info('Initializing the database...');
    await this.query(`CREATE DATABASE IF NOT EXISTS ${this.MySQLDatabaseName}`);
    await this.query(`USE ${this.MySQLDatabaseName}`);
    await this.query(`CREATE TABLE IF NOT EXISTS block
      (
        hash VARCHAR(255) NOT NULL,
        parentHash VARCHAR(255) NOT NULL,
        blockNumber INT NOT NULL,
        timestamp INT,
        nonce VARCHAR(255),
        gasLimit INT,
        gasUsed INT,
        PRIMARY KEY ( blockNumber )
      )`
    );
    await this.query(`CREATE TABLE IF NOT EXISTS transaction
      (
        hash VARCHAR(255) NOT NULL,
        blockHash VARCHAR(255) NOT NULL,
        blockNumber INT NOT NULL,
        \`from\` VARCHAR(255),
        \`to\` VARCHAR(255),
        value VARCHAR(255),
        nonce VARCHAR(255),
        gasLimit INT,
        gasPrice INT,
        timestamp INT,
        PRIMARY KEY ( blockNumber )
      )`
    );
    await this.query(`CREATE TABLE IF NOT EXISTS receipt
      (
        hash VARCHAR(255) NOT NULL,
        blockHash VARCHAR(255) NOT NULL,
        blockNumber INT NOT NULL,
        \`from\` VARCHAR(255),
        \`to\` VARCHAR(255),
        gasUsed INT,
        cumulativeGasUsed INT,
        crossDomainMessage BOOL,
        crossDomainMessageFinalize BOOL,
        crossDomainMessageSendTime INT,
        crossDomainMessageEstimateFinalizedTime INT,
        timestamp INT,
        crossDomainMessageFinalizedTime INT,
        fastRelay BOOL,
        contractAddress VARCHAR(255),
        l1Hash VARCHAR(255),
        l1BlockNumber INT,
        l1BlockHash VARCHAR(255),
        l1From VARCHAR(255),
        l1To VARCHAR(255),
        PRIMARY KEY ( blockNumber )
      )`
    );
    await this.query(`CREATE TABLE IF NOT EXISTS stateRoot
      (
        hash VARCHAR(255) NOT NULL,
        blockHash VARCHAR(255) NOT NULL,
        blockNumber INT NOT NULL,
        stateRootHash VARCHAR(255),
        stateRootBlockNumber INT,
        stateRootBlockHash VARCHAR(255),
        stateRootBlockTimestamp INT,
        PRIMARY KEY ( blockNumber )
      )`
    );
    await this.query(`CREATE TABLE IF NOT EXISTS exitL2
      (
        hash VARCHAR(255) NOT NULL,
        blockHash VARCHAR(255) NOT NULL,
        blockNumber INT NOT NULL,
        exitSender VARCHAR(255),
        exitTo VARCHAR(255),
        exitToken VARCHAR(255),
        exitAmount VARCHAR(255),
        exitReceive VARCHAR(255),
        exitFeeRate VARCHAR(255),
        fastRelay BOOL,
        status VARCHAR(255),
        PRIMARY KEY ( blockNumber )
      )`
    );
    await this.query(`CREATE TABLE IF NOT EXISTS l1Bridge
      (
        hash VARCHAR(255) NOT NULL,
        blockHash VARCHAR(255) NOT NULL,
        blockNumber INT NOT NULL,
        \`from\` VARCHAR(255),
        \`to\` VARCHAR(255),
        contractAddress VARCHAR(255),
        contractName VARCHAR(255),
        activity VARCHAR(255),
        crossDomainMessage BOOL,
        crossDomainMessageFinalize BOOL,
        crossDomainMessageSendTime INT,
        crossDomainMessageEstimateFinalizedTime INT,
        crossDomainMessageFinalizedTime INT,
        timestamp INT,
        l2Hash VARCHAR(255),
        l2BlockNumber INT,
        l2BlockHash VARCHAR(255),
        l2From VARCHAR(255),
        l2To VARCHAR(255),
        fastDeposit BOOL,
        PRIMARY KEY ( hash, blockNumber )
      )`
    );
    await this.query(`CREATE TABLE IF NOT EXISTS depositL2
      (
        hash VARCHAR(255) NOT NULL,
        blockHash VARCHAR(255) NOT NULL,
        blockNumber INT NOT NULL,
        depositSender VARCHAR(255),
        depositTo VARCHAR(255),
        depositToken VARCHAR(255),
        depositAmount VARCHAR(255),
        depositReceive VARCHAR(255),
        depositFeeRate VARCHAR(255),
        fastDeposit BOOL,
        status VARCHAR(255),
        PRIMARY KEY ( hash, blockNumber )
      )`
    );
    this.logger.info('Initialized the database.');
  }

  async insertBlockData(blockData) {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    await this.query(`INSERT IGNORE INTO block
      SET hash='${blockData.hash.toString()}',
      parentHash='${blockData.parentHash.toString()}',
      blockNumber='${blockData.number.toString()}',
      timestamp='${blockData.timestamp.toString()}',
      nonce='${blockData.nonce.toString()}',
      gasLimit='${blockData.gasLimit.toString()}',
      gasUsed='${blockData.gasUsed.toString()}'
    `);
  }

  async insertTransactionData(transactionData) {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    await this.query(`INSERT IGNORE INTO transaction
      SET hash='${transactionData.hash.toString()}',
      blockHash='${transactionData.blockHash.toString()}',
      blockNumber='${transactionData.blockNumber.toString()}',
      \`from\`=${transactionData.from ? "'" + transactionData.from + "'" : null},
      \`to\`=${transactionData.to ? "'" + transactionData.to + "'" : null},
      value='${transactionData.value.toString()}',
      nonce='${transactionData.nonce.toString()}',
      gasLimit='${transactionData.gasLimit.toString()}',
      gasPrice='${transactionData.gasPrice.toString()}',
      timestamp='${transactionData.timestamp.toString()}'
    `);
  }

  async insertReceiptData(receiptData) {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    await this.query(`INSERT IGNORE INTO receipt
      SET hash='${receiptData.transactionHash.toString()}',
      blockHash='${receiptData.blockHash.toString()}',
      blockNumber='${receiptData.blockNumber.toString()}',
      \`from\`=${receiptData.from ? "'" + receiptData.from + "'" : null},
      \`to\`=${receiptData.to ? "'" + receiptData.to + "'" : null},
      gasUsed='${receiptData.gasUsed.toString()}',
      cumulativeGasUsed='${receiptData.cumulativeGasUsed.toString()}',
      crossDomainMessage=${receiptData.crossDomainMessage},
      crossDomainMessageFinalize=${receiptData.crossDomainMessageFinalize},
      crossDomainMessageSendTime=${receiptData.crossDomainMessageSendTime ? receiptData.crossDomainMessageSendTime: null},
      crossDomainMessageEstimateFinalizedTime=${receiptData.crossDomainMessage ? receiptData.crossDomainMessageEstimateFinalizedTime : null},
      crossDomainMessageFinalizedTime = ${receiptData.crossDomainMessageFinalizedTime ? receiptData.crossDomainMessageFinalizedTime : null},
      fastRelay=${receiptData.fastRelay ? receiptData.fastRelay : null},
      contractAddress=${receiptData.contractAddress ? "'" + receiptData.contractAddress + "'" : null},
      timestamp=${receiptData.timestamp ? receiptData.timestamp.toString() : null},
      l1Hash=${receiptData.l1Hash ? `'${receiptData.l1Hash.toString()}'` : null},
      l1BlockNumber=${receiptData.l1BlockNumber ? Number(receiptData.l1BlockNumber) : null},
      l1BlockHash=${receiptData.l1BlockHash ? `'${receiptData.l1BlockHash.toString()}'` : null},
      l1From=${receiptData.l1From ? `'${receiptData.l1From.toString()}'` : null},
      l1To=${receiptData.l1To ? `'${receiptData.l1To.toString()}'` : null}
    `);
  }

  async getL2CrossDomainData() {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    return await this.query(`SELECT * FROM receipt
      WHERE crossDomainMessage=${true}
      AND crossDomainMessageFinalize=${false}
      AND UNIX_TIMESTAMP() > crossDomainMessageEstimateFinalizedTime
    `);
  }

  async getL1CrossDomainData() {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    return await this.query(`SELECT * FROM depositL2
      LEFT JOIN l1Bridge
      on depositL2.hash = l1Bridge.hash
      WHERE crossDomainMessage=${true}
      AND depositL2.status='pending'
      AND UNIX_TIMESTAMP() > crossDomainMessageEstimateFinalizedTime
    `);
  }

  async updateCrossDomainData(receiptData) {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    return await this.query(`UPDATE receipt
      SET crossDomainMessageFinalize=${receiptData.crossDomainMessageFinalize},
      crossDomainMessageFinalizedTime=${receiptData.crossDomainMessageFinalizedTime},
      fastRelay = ${receiptData.fastRelay},
      l1Hash=${receiptData.l1Hash ? `'${receiptData.l1Hash.toString()}'` : null},
      l1BlockNumber=${receiptData.l1BlockNumber ? Number(receiptData.l1BlockNumber) : null},
      l1BlockHash=${receiptData.l1BlockHash ? `'${receiptData.l1BlockHash.toString()}'` : null},
      l1From=${receiptData.l1From ? `'${receiptData.l1From.toString()}'` : null},
      l1To=${receiptData.l1To ? `'${receiptData.l1To.toString()}'` : null}
      WHERE hash='${receiptData.transactionHash.toString()}'
      AND blockHash='${receiptData.blockHash.toString()}'
    `);
  }

  async insertStateRootData(stateRootData) {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    await this.query(`INSERT IGNORE INTO stateRoot
      SET hash='${stateRootData.hash}',
      blockHash='${stateRootData.blockHash}',
      blockNumber=${Number(stateRootData.blockNumber)},
      stateRootHash='${stateRootData.stateRootHash}',
      stateRootBlockNumber=${Number(stateRootData.stateRootBlockNumber)},
      stateRootBlockHash='${stateRootData.stateRootBlockHash}',
      stateRootBlockTimestamp='${Number(stateRootData.stateRootBlockTimestamp)}'
  `);
  }

  async insertExitData(exitData) {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    await this.query(`INSERT IGNORE INTO exitL2
      SET hash='${exitData.hash}',
      blockHash='${exitData.blockHash}',
      blockNumber=${Number(exitData.blockNumber)},
      exitSender='${exitData.exitSender}',
      exitTo='${exitData.exitTo}',
      exitToken='${exitData.exitToken}',
      exitAmount='${exitData.exitAmount}',
      exitReceive='${exitData.exitReceive}',
      exitFeeRate='${exitData.exitFeeRate}',
      fastRelay=${exitData.fastRelay},
      status='pending'
  `);
  }

  async insertL1BridgeData(bridgeData) {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    await this.query(`INSERT IGNORE INTO l1Bridge
      SET hash='${bridgeData.hash.toString()}',
      blockHash='${bridgeData.blockHash.toString()}',
      blockNumber='${bridgeData.blockNumber.toString()}',
      \`from\`=${bridgeData.from ? "'" + bridgeData.from + "'" : null},
      \`to\`=${bridgeData.to ? "'" + bridgeData.to + "'" : null},
      contractAddress=${bridgeData.contractAddress ? "'" + bridgeData.contractAddress + "'" : null},
      contractName=${bridgeData.contractName ? "'" + bridgeData.contractName + "'" : null},
      \`activity\`=${bridgeData.activity ? "'" + bridgeData.activity + "'" : null},
      crossDomainMessage=${bridgeData.crossDomainMessage},
      crossDomainMessageFinalize=${bridgeData.crossDomainMessageFinalize},
      crossDomainMessageSendTime=${bridgeData.crossDomainMessageSendTime ? bridgeData.crossDomainMessageSendTime: null},
      crossDomainMessageEstimateFinalizedTime=${bridgeData.crossDomainMessage ? bridgeData.crossDomainMessageEstimateFinalizedTime : null},
      crossDomainMessageFinalizedTime = ${bridgeData.crossDomainMessageFinalizedTime ? bridgeData.crossDomainMessageFinalizedTime : null},
      timestamp=${bridgeData.timestamp ? bridgeData.timestamp.toString() : null},
      l2Hash=${bridgeData.l2Hash ? `'${bridgeData.l2Hash.toString()}'` : null},
      l2BlockNumber=${bridgeData.l2BlockNumber ? Number(bridgeData.l2BlockNumber) : null},
      l2BlockHash=${bridgeData.l2BlockHash ? `'${bridgeData.l2BlockHash.toString()}'` : null},
      l2From=${bridgeData.l2From ? `'${bridgeData.l2From.toString()}'` : null},
      l2To=${bridgeData.l2To ? `'${bridgeData.l2To.toString()}'` : null},
      fastDeposit=${bridgeData.fastDeposit}
    `);
  }

  async insertDepositL2(depositL2Data) {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    await this.query(`INSERT IGNORE INTO depositL2
      SET hash='${depositL2Data.hash}',
      blockHash='${depositL2Data.blockHash}',
      blockNumber=${Number(depositL2Data.blockNumber)},
      depositSender='${depositL2Data.depositSender}',
      depositTo='${depositL2Data.depositTo}',
      depositToken='${depositL2Data.depositToken}',
      depositAmount='${depositL2Data.depositAmount}',
      depositReceive='${depositL2Data.depositReceive}',
      depositFeeRate='${depositL2Data.depositFeeRate}',
      fastDeposit=${depositL2Data.fastDeposit},
      status='pending'
    `);
  }

  async updateExitData(exitData) {
    await this.query(`UPDATE exitL2
      SET status='${exitData.status}'
      WHERE blockNumber=${Number(exitData.blockNumber)}
  `);
  }

  async updateL1BridgeData(l1BridgeData) {
    await this.query(`UPDATE l1Bridge
      SET l2Hash='${l1BridgeData.l2Hash}',
      l2BlockNumber=${l1BridgeData.l2BlockNumber},
      l2BlockHash='${l1BridgeData.l2BlockHash}',
      l2From='${l1BridgeData.l2From}',
      l2To='${l1BridgeData.l2To}',
      crossDomainMessageFinalizedTime=${l1BridgeData.crossDomainMessageFinalizedTime},
      crossDomainMessageFinalize=${l1BridgeData.crossDomainMessageFinalize}
      WHERE blockNumber=${Number(l1BridgeData.blockNumber)} AND
      hash='${l1BridgeData.hash}'
    `);
  }

  async updateDepositL2Data(depositL2Data) {
    await this.query(`UPDATE depositL2
      SET status='${depositL2Data.status}'
      WHERE blockNumber=${Number(depositL2Data.blockNumber)}
      AND hash='${depositL2Data.hash}'
    `);
  }

  async getNewestBlockFromBlockTable() {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    return await this.query(`SELECT MAX(blockNumber) from block`);
  }

  async getNewestBlockFromStateRootTable() {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    return await this.query(`SELECT MAX(stateRootBlockNumber) from stateRoot`);
  }

  async getNewestBlockFromExitTable() {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    return await this.query(`SELECT MAX(blockNumber) from exitL2`);
  }

  async getNewestBlockFromL1BridgeTable() {
    await this.query(`USE ${this.MySQLDatabaseName}`);
    return await this.query(`SELECT MAX(blockNumber) from l1Bridge`);
  }
}

module.exports = DatabaseService;