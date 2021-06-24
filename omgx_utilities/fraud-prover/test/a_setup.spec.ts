import { expect } from 'chai'

import {
  Contract,
  ContractFactory,
  BigNumber,
  Wallet,
  utils,
  providers,
} from 'ethers'

import { ethers, network } from 'hardhat'

import ERC20Json from '../artifacts-ovm/contracts/ERC20.sol/ERC20.json'

// import { OptimismEnv } from './shared/env'

import * as fs from 'fs'

describe('Fraud Prover Testing System Setup', async () => {
  
  console.log("\nFraud Prover Testing System Setup")
  
  let Factory__ERC20: ContractFactory
  let ERC20: Contract
  //let env: OptimismEnv

  //Test ERC20
  const INITIAL_SUPPLY = utils.parseEther('10000000000')
  const TOKEN_NAME = 'OMGX Test'
  const tokenDecimals = 18
  const tokenSymbol = 'OMGX'

  // task("accounts", "Prints the list of accounts", async () => {
  //   const accounts = await ethers.getSigners();

  //   for (const account of accounts) {
  //     console.log(account.address);
  //   }
  // });

  // const accounts = await ethers.getSigners();

  // console.log("accounts:",accounts)

  // for (const account of accounts) {
  //   console.log(account.address);
  // }


  //before(async () => {

    // const accounts = await ethers.getSigners();

    // console.log("accounts:",accounts)

    // for (const account of accounts) {
    //   console.log(account.address);
    // }

    let bob
    let alice
    let fraud

    before(`load accounts`, async () => {
      ;[ bob, alice, fraud ] = await ethers.getSigners()
    })

    //let ERC20

    beforeEach(`deploy ERC20 contract`, async () => {
      
      const Factory__ERC20 = await ethers.getContractFactory('ERC20')
      
      ERC20 = await Factory__ERC20.connect(bob).deploy(
        INITIAL_SUPPLY,
        TOKEN_NAME,
        tokenDecimals,
        tokenSymbol
      )

      await ERC20.deployTransaction.wait()
    })

    it(`should have a name`, async () => {
      const tokenName = await ERC20.name()
      expect(tokenName).to.equal(TOKEN_NAME)
    })

    it(`should have a total supply equal to the initial supply`, async () => {
      const tokenSupply = await ERC20.totalSupply()
      //console.log(tokenSupply.toString())
      //console.log(INITIAL_SUPPLY)
      expect(tokenSupply.toString()).to.equal(INITIAL_SUPPLY.toString())
    })

    it(`should give the initial supply to the creator's address`, async () => {
      const balance = await ERC20.balanceOf(await bob.getAddress())
      expect(balance.toString()).to.equal(INITIAL_SUPPLY.toString())
    })

    it(`should transfer from Bob to Fraud`, async () => {
      
      const transferTX = await ERC20.transfer(
        fraud.address,
        utils.parseEther('8'),
        { gasLimit: 800000, gasPrice: 0 }
      )

      await transferTX.wait()

      const balanceF = await ERC20.balanceOf(await fraud.getAddress())
      expect(balanceF.toString()).to.equal(utils.parseEther('8').toString())
    })


/*
const tranferToFraudTX = await L2DepositedERC20.connect(
  //     env.alicel2Wallet
  //   ).transfer(env.fraudl2Wallet.address, transferL2ERC20Amount, {
  //     gasLimit: 800000,
  //     gasPrice: 0,
  //   })
  //   await tranferToFraudTX.wait()
  */


    it(`should transfer from Fraud to Alice`, async () => {
      
      const transferTX = await ERC20
      .connect(
        fraud
      ).transfer(
        alice.address,
        utils.parseEther('4'),
        { gasLimit: 800000, gasPrice: 0 }
      )

      await transferTX.wait()

      const balanceA = await ERC20.balanceOf(await alice.getAddress())
      expect(balanceA.toString()).to.equal(utils.parseEther('4').toString())
    })

    //const tranferToAliceTX = await L2DepositedERC20.transfer(
  //     env.alicel2Wallet.address,
  //     transferL2ERC20Amount,
  //     { gasLimit: 800000, gasPrice: 0 }
  //   )
  //   await tranferToAliceTX.wait()

  //   const tranferToFraudTX = await L2DepositedERC20.transfer(
  //     env.fraudl2Wallet.address,
  //     transferL2ERC20Amount,
  //     { gasLimit: 800000, gasPrice: 0 }
  //   )
  //   await tranferToFraudTX.wait()

    // env = await OptimismEnv.new()

    // Factory__ERC20 = new ContractFactory(
    //   ERC20Json.abi,
    //   ERC20Json.bytecode,
    //   bob
    // )

})

/*

const { ethers, network } = require('hardhat')
const chai = require('chai')
const { solidity } = require('ethereum-waffle')
const { expect } = chai

chai.use(solidity)

describe(`ERC20`, () => {
  const INITIAL_SUPPLY = 1000000
  const TOKEN_NAME = 'An Optimistic ERC20'

  let account1
  let account2
  before(`load accounts`, async () => {
    ;[ account1, account2 ] = await ethers.getSigners()
  })

  let ERC20
  beforeEach(`deploy ERC20 contract`, async () => {
    const Factory__ERC20 = await ethers.getContractFactory('ERC20')
    ERC20 = await Factory__ERC20.connect(account1).deploy(
      INITIAL_SUPPLY,
      TOKEN_NAME
    )

    await ERC20.deployTransaction.wait()
  })
  */



  //   Factory__L2DepositedERC20 = new ContractFactory(
  //     L2DepositedERC20Json.abi,
  //     L2DepositedERC20Json.bytecode,
  //     env.bobl2Wallet
  //   )

  //   Factory__L1ERC20Gateway = new ContractFactory(
  //     L1ERC20GatewayJson.abi,
  //     L1ERC20GatewayJson.bytecode,
  //     env.bobl1Wallet
  //   )

  //})

  // before(async () => {
    
    //Mint a new token on L1 and set up the L1 and L2 infrastructure
    // [initialSupply, name, decimals, symbol]
    // this is owned by bobl1Wallet
    
    // ERC20 = await Factory__ERC20.deploy(
    //   initialAmount,
    //   tokenName,
    //   tokenDecimals,
    //   tokenSymbol
    // )
    // await ERC20.deployTransaction.wait()
    // console.log('L2 ERC20 deployed to:', ERC20.address)

  //   //Set up things on L2 for this new token
  //   // [l2MessengerAddress, name, symbol]
  //   L2DepositedERC20 = await Factory__L2DepositedERC20.deploy(
  //     env.watcher.l2.messengerAddress,
  //     tokenName,
  //     tokenSymbol,
  //     { gasLimit: 800000, gasPrice: 0 }
  //   )
  //   await L2DepositedERC20.deployTransaction.wait()
  //   console.log('L2DepositedERC20 deployed to:', L2DepositedERC20.address)

  //   //Deploy a gateway for the new token
  //   // [L1_ERC20.address, OVM_L2DepositedERC20.address, l1MessengerAddress]
  //   L1ERC20Gateway = await Factory__L1ERC20Gateway.deploy(
  //     L1ERC20.address,
  //     L2DepositedERC20.address,
  //     env.watcher.l1.messengerAddress
  //   )
    
  //   await L1ERC20Gateway.deployTransaction.wait()
  //   console.log('L1ERC20Gateway deployed to:', L1ERC20Gateway.address)

  //   //Initialize the contracts for the new token
  //   const initL2 = await L2DepositedERC20.init(L1ERC20Gateway.address, {
  //     gasLimit: 800000,
  //     gasPrice: 0,
  //   })
  //   await initL2.wait()
  //   console.log('L2 ERC20 initialized:', initL2.hash)
  // })

  // it('Bob Approve and Deposit ERC20 from L1 to L2', async () => {
  //   const depositL2ERC20Amount = utils.parseEther('150')
  //   const preL1ERC20Balance = await L1ERC20.balanceOf(env.bobl1Wallet.address)
  //   const preL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.bobl2Wallet.address
  //   )

  //   console.log(' Bob Depositing L1 ERC20 to L2...')
  //   console.log(' On L1, Bob has:', preL1ERC20Balance)
  //   console.log(' On L2, Bob has:', preL2ERC20Balance)

  //   const approveL1ERC20TX = await L1ERC20.approve(
  //     L1ERC20Gateway.address,
  //     depositL2ERC20Amount
  //   )
  //   await approveL1ERC20TX.wait()

  //   const { tx, receipt } = await env.waitForXDomainTransaction(
  //     L1ERC20Gateway.deposit(depositL2ERC20Amount),
  //     Direction.L1ToL2
  //   )

  //   const l1FeePaid = receipt.gasUsed.mul(tx.gasPrice)
  //   const postL1ERC20Balance = await L1ERC20.balanceOf(env.bobl1Wallet.address)
  //   const postL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.bobl2Wallet.address
  //   )

  //   console.log(' On L1, Bob now has:', postL1ERC20Balance)
  //   console.log(' On L2, Bob now has:', postL2ERC20Balance)

  //   expect(preL1ERC20Balance).to.deep.eq(
  //     postL1ERC20Balance.add(depositL2ERC20Amount)
  //   )
  //   expect(preL2ERC20Balance).to.deep.eq(
  //     postL2ERC20Balance.sub(depositL2ERC20Amount)
  //   )
  // })

  // it('should transfer ERC20 token to Alice and Fraud', async () => {
  //   const transferL2ERC20Amount = utils.parseEther('10')

  //   const preBobL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.bobl2Wallet.address
  //   )
  //   const preAliceL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.alicel2Wallet.address
  //   )
  //   const preFraudL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.fraudl2Wallet.address
  //   )

  //   const tranferToAliceTX = await L2DepositedERC20.transfer(
  //     env.alicel2Wallet.address,
  //     transferL2ERC20Amount,
  //     { gasLimit: 800000, gasPrice: 0 }
  //   )
  //   await tranferToAliceTX.wait()

  //   const tranferToFraudTX = await L2DepositedERC20.transfer(
  //     env.fraudl2Wallet.address,
  //     transferL2ERC20Amount,
  //     { gasLimit: 800000, gasPrice: 0 }
  //   )
  //   await tranferToFraudTX.wait()

  //   const postBobL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.bobl2Wallet.address
  //   )
  //   const postAliceL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.alicel2Wallet.address
  //   )
  //   const postFraudL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.fraudl2Wallet.address
  //   )

  //   //because i'm sending the same amount out, twice....
  //   expect(preBobL2ERC20Balance).to.deep.eq(
  //     postBobL2ERC20Balance
  //       .add(transferL2ERC20Amount)
  //       .add(transferL2ERC20Amount)
  //   )

  //   expect(preAliceL2ERC20Balance).to.deep.eq(
  //     postAliceL2ERC20Balance.sub(transferL2ERC20Amount)
  //   )

  //   expect(preFraudL2ERC20Balance).to.deep.eq(
  //     postFraudL2ERC20Balance.sub(transferL2ERC20Amount)
  //   )
  // })

  // it('should transfer ERC20 token from Alice to Fraud', async () => {
  //   const transferL2ERC20Amount = utils.parseEther('3')

  //   const preAliceL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.alicel2Wallet.address
  //   )
  //   const preFraudL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.fraudl2Wallet.address
  //   )

  //   console.log(' On L2, Alice has:', preAliceL2ERC20Balance.toString())
  //   console.log(' On L2, Fraud has:', preFraudL2ERC20Balance.toString())

  //   const tranferToFraudTX = await L2DepositedERC20.connect(
  //     env.alicel2Wallet
  //   ).transfer(env.fraudl2Wallet.address, transferL2ERC20Amount, {
  //     gasLimit: 800000,
  //     gasPrice: 0,
  //   })
  //   await tranferToFraudTX.wait()

  //   const postAliceL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.alicel2Wallet.address
  //   )
  //   const postFraudL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.fraudl2Wallet.address
  //   )

  //   console.log(' On L2, Alice now has:', postAliceL2ERC20Balance.toString())
  //   console.log(' On L2, Fraud now has:', postFraudL2ERC20Balance.toString())

  //   expect(postAliceL2ERC20Balance).to.deep.eq(
  //     preAliceL2ERC20Balance.sub(transferL2ERC20Amount)
  //   )

  //   expect(postFraudL2ERC20Balance).to.deep.eq(
  //     preFraudL2ERC20Balance.add(transferL2ERC20Amount)
  //   )
  // })

  // it('should transfer ERC20 token from Fraud to Bob and commit fraud', async () => {
  //   const transferL2ERC20Amount = utils.parseEther('1')

  //   const preBobL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.bobl2Wallet.address
  //   )
  //   const preFraudL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.fraudl2Wallet.address
  //   )

  //   console.log(' On L2, Bob has:', preBobL2ERC20Balance.toString())
  //   console.log(' On L2, Fraud has:', preFraudL2ERC20Balance.toString())

  //   const tranferToFraudTX = await L2DepositedERC20.connect(
  //     env.fraudl2Wallet
  //   ).transfer(env.bobl2Wallet.address, transferL2ERC20Amount, {
  //     gasLimit: 800000,
  //     gasPrice: 0,
  //   })
  //   await tranferToFraudTX.wait()

  //   const postBobL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.bobl2Wallet.address
  //   )
  //   const postFraudL2ERC20Balance = await L2DepositedERC20.balanceOf(
  //     env.fraudl2Wallet.address
  //   )

  //   console.log(' On L2, Bob now has:', postBobL2ERC20Balance.toString())
  //   console.log(' On L2, Fraud now has:', postFraudL2ERC20Balance.toString())

  //   expect(postBobL2ERC20Balance).to.deep.eq(
  //     preBobL2ERC20Balance.add(transferL2ERC20Amount)
  //   )

  //   expect(postFraudL2ERC20Balance).to.deep.eq(
  //     preFraudL2ERC20Balance.sub(transferL2ERC20Amount)
  //   )
  // })
//})
