import { expect } from 'chai'

/* Imports: External */
import { predeploys } from '@eth-optimism/contracts'
import { BigNumber, Contract, ContractFactory, Wallet } from 'ethers'
import { ethers } from 'hardhat'

/* Imports: Internal */
import { OptimismEnv } from './shared/env'
import * as helpers from './shared/stress-test-helpers'

/* Imports: Artifacts */
import l1Erc20Json from '../artifacts/contracts/ERC20.sol/ERC20.json'
import l2Erc20Json from '../artifacts-ovm/contracts/ERC20.sol/ERC20.json'

// Need a big timeout to allow for all transactions to be processed.
// For some reason I can't figure out how to set the timeout on a per-suite basis
// so I'm instead setting it for every test.
const STRESS_TEST_TIMEOUT = 300_000

describe('stress tests', () => {
  const initialAmount = 1000
  const tokenName = 'OVM Test'
  const tokenDecimals = 8
  const tokenSymbol = 'OVM'
  const l1GasLimit = 9999999
  const l2GasLimit = 9999999
  let env: OptimismEnv
  let l1Factory__ERC20: ContractFactory
  let l2Factory__ERC20: ContractFactory
  let l1ERC20: Contract
  let l2ERC20: Contract

  before(async () => {
    env = await OptimismEnv.new()
    l1Factory__ERC20 = new ContractFactory(
      l1Erc20Json.abi,
      l1Erc20Json.bytecode
    )
    l2Factory__ERC20 = new ContractFactory(
      l2Erc20Json.abi,
      l2Erc20Json.bytecode
    )
  })

  beforeEach(async () => {
    l1ERC20 = await l1Factory__ERC20
      .connect(env.l1Wallet)
      .deploy(initialAmount, tokenName, tokenDecimals, tokenSymbol)
    await l1ERC20.deployTransaction.wait()

    l2ERC20 = await l2Factory__ERC20
      .connect(env.l2Wallet)
      .deploy(initialAmount, tokenName, tokenDecimals, tokenSymbol)
    await l2ERC20.deployTransaction.wait()
  })

  describe('ERC20 stress tests', () => {
    it('deposit ERC20', async () => {
      const depositAmount = 10
      const numTransactions = 10

      const l1Symbol = await l1ERC20.symbol()
      expect(l1Symbol).to.equal(tokenSymbol)
      const l2Symbol = await l2ERC20.symbol()
      expect(l2Symbol).to.equal(tokenSymbol)

      const preL1Balance: BigNumber = await l1ERC20.balanceOf(
        env.l1Wallet.address
      )
      const preL2Balance: BigNumber = await l2ERC20.balanceOf(
        env.l2Wallet.address
      )
      console.log('preL1Balance:', preL1Balance.toString())
      console.log('preL2Balance:', preL2Balance.toString())

      await helpers.executeRepeatedDepositErc20(
        env,
        l1ERC20,
        l2ERC20,
        depositAmount,
        numTransactions
      )

      const postL1Balance: BigNumber = await l1ERC20.balanceOf(
        env.l1Wallet.address
      )
      const postL2Balance: BigNumber = await l2ERC20.balanceOf(
        env.l2Wallet.address
      )
      const postL2Erc20Balance: BigNumber = await l2ERC20.balanceOf(
        l2ERC20.address
      )
      const postl2MessengerBalance: BigNumber = await l2ERC20.balanceOf(
        env.l2Messenger.address
      )
      const postl2BridgeBalance: BigNumber = await l2ERC20.balanceOf(
        env.l2Bridge.address
      )
      console.log('postL1Balance:', postL1Balance.toString())
      console.log('postL2Balance:', postL2Balance.toString())
      console.log('postL2Erc20Balance:', postL2Erc20Balance.toString())
      console.log('postl2MessengerBalance:', postl2MessengerBalance.toString())
      console.log('postl2BridgeBalance:', postl2BridgeBalance.toString())

      expect(postL1Balance).to.deep.eq(
        BigNumber.from(initialAmount - depositAmount * numTransactions)
      )
      expect(postL2Balance).to.deep.eq(
        BigNumber.from(initialAmount + depositAmount * numTransactions)
      )
    }).timeout(STRESS_TEST_TIMEOUT)
  })
})
