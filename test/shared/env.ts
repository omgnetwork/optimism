import { getContractInterface, getContractFactory } from 'enyalabs_contracts'
import { Contract, utils, Wallet } from 'ethers'
import { Watcher } from './watcher'

import {
  getAddressManager,
  l1Provider,
  l2Provider,
  bobl1Wallet,
  bobl2Wallet,
  getL2ETHGateway,
  getL1ETHGateway,
  alicel1Wallet,
  alicel2Wallet,
} from './utils'

import {
  initWatcher,
  CrossDomainMessagePair,
  Direction,
  waitForXDomainTransaction,
} from './watcher-utils'

import * as fs from 'fs'

import { TransactionResponse } from '@ethersproject/providers'

/// Helper class for instantiating a test environment with a funded account
export class OptimismEnv {
  // L1 Contracts
  addressManager: Contract
  L1ETHGateway: Contract
  l1Messenger: Contract
  l1MessengerAddress: String
  ctc: Contract

  // L2 Contracts
  L2ETHGateway: Contract
  l2Messenger: Contract

  // The L1 <> L2 State watcher
  watcher: Watcher

  // The wallets
  bobl1Wallet: Wallet
  bobl2Wallet: Wallet
  
  alicel2Wallet: Wallet
  alicel1Wallet: Wallet

  constructor(args: any) {
    this.addressManager = args.addressManager
    this.L1ETHGateway = args.L1ETHGateway
    this.l1Messenger = args.l1Messenger
    this.l1MessengerAddress = args.l1MessengerAddress
    this.L2ETHGateway = args.L2ETHGateway
    this.l2Messenger = args.l2Messenger
    this.watcher = args.watcher
    this.bobl1Wallet = args.bobl1Wallet
    this.bobl2Wallet = args.bobl2Wallet
    this.alicel1Wallet = args.alicel1Wallet
    this.alicel2Wallet = args.alicel2Wallet
    this.ctc = args.ctc
  }

  static async new(): Promise<OptimismEnv> {

    const addressManager = getAddressManager(bobl1Wallet)
    const watcher = await initWatcher(l1Provider, l2Provider, addressManager)

    //const L1ETHGateway = await getL1ETHGateway(bobl1Wallet, addressManager)
    const L1ETHGateway = await getL1ETHGateway(alicel1Wallet, addressManager)

    // fund the user if needed
    //const balance = await l2Wallet.getBalance()
    //if (balance.isZero()) {
    //  await fundUser(watcher, gateway, utils.parseEther('10'))
    //}

    //const L2ETHGateway = getL2ETHGateway(bobl2Wallet)
    const L2ETHGateway = getL2ETHGateway(alicel2Wallet)

    const l1Messenger = getContractFactory('iOVM_L1CrossDomainMessenger')
      .connect(bobl1Wallet)
      .attach(watcher.l1.messengerAddress)

    const l1MessengerAddress = l1Messenger.address;  
    
    const l2Messenger = getContractFactory('iOVM_L2CrossDomainMessenger')
      .connect(bobl2Wallet)
      .attach(watcher.l2.messengerAddress)

    const ctcAddress = await addressManager.getAddress(
      'OVM_CanonicalTransactionChain'
    )
    const ctc = getContractFactory('OVM_CanonicalTransactionChain')
      .connect(bobl1Wallet)
      .attach(ctcAddress)

    return new OptimismEnv({
      addressManager,
      L1ETHGateway,
      ctc,
      l1Messenger,
      l1MessengerAddress,
      L2ETHGateway,
      l2Messenger,
      watcher,
      bobl1Wallet,
      bobl2Wallet,
      alicel1Wallet,
      alicel2Wallet
    })
  }

  async waitForXDomainTransaction(
    tx: Promise<TransactionResponse> | TransactionResponse,
    direction: Direction
  ): Promise<CrossDomainMessagePair> {
    return waitForXDomainTransaction(this.watcher, tx, direction)
  }
}
