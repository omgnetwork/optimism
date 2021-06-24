// import {
//   getContractInterface,
//   getContractFactory,
// } from '@eth-optimism/contracts'
// import { Contract, utils, Wallet } from 'ethers'

// import {
//   getAddressManager,
//   l1Provider,
//   l2Provider,
//   bobl1Wallet,
//   bobl2Wallet,
//   alicel1Wallet,
//   alicel2Wallet,
//   fraudl1Wallet,
//   fraudl2Wallet,
// } from './utils'

// import * as fs from 'fs'

// import { TransactionResponse } from '@ethersproject/providers'

// export class OptimismEnv {
  
//   addressManager: Contract
//   ctc: Contract
  
//   l2Provider

//   // The wallets
//   bobl1Wallet: Wallet
//   bobl2Wallet: Wallet

//   alicel2Wallet: Wallet
//   alicel1Wallet: Wallet

//   fraudl2Wallet: Wallet
//   fraudl1Wallet: Wallet

//   constructor(args: any) {
//     this.addressManager = args.addressManager
//     this.bobl1Wallet = args.bobl1Wallet
//     this.bobl2Wallet = args.bobl2Wallet
//     this.alicel1Wallet = args.alicel1Wallet
//     this.alicel2Wallet = args.alicel2Wallet
//     this.fraudl1Wallet = args.fraudl1Wallet
//     this.fraudl2Wallet = args.fraudl2Wallet
//     this.l2Provider = args.l2Provider
//     this.ctc = args.ctc
//   }

//   static async new(): Promise<OptimismEnv> {
    
//     const addressManager = getAddressManager(bobl1Wallet)

//     const ctcAddress = await addressManager.getAddress(
//       'OVM_CanonicalTransactionChain'
//     )

//     const ctc = getContractFactory('OVM_CanonicalTransactionChain')
//       .connect(bobl1Wallet)
//       .attach(ctcAddress)

//     return new OptimismEnv({
//       addressManager,
//       ctc,
//       bobl1Wallet,
//       bobl2Wallet,
//       alicel1Wallet,
//       alicel2Wallet,
//       fraudl1Wallet,
//       fraudl2Wallet,
//       l2Provider,
//     })
//   }

// }
