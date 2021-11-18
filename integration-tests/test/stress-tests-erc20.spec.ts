import { expect } from 'chai'

/* Imports: External */
import { BigNumber, Contract, ContractFactory, Wallet } from 'ethers'
import { ethers } from 'hardhat'

/* Imports: Internal */
import { OptimismEnv } from './shared/env'
import * as helpers from './shared/stress-test-helpers'

/* Imports: Artifacts */
import l1Erc20Json from '../artifacts/contracts/ERC20.sol/ERC20.json'
import l2Erc20Json from '../artifacts-ovm/contracts/ERC20.sol/ERC20.json'
import L1LiquidityPoolJson from '../artifacts/contracts/LP/L1LiquidityPool.sol/L1LiquidityPool.json'
import L2LiquidityPoolJson from '../artifacts-ovm/contracts/LP/L2LiquidityPool.sol/L2LiquidityPool.json'

// Need a big timeout to allow for all transactions to be processed.
// For some reason I can't figure out how to set the timeout on a per-suite basis
// so I'm instead setting it for every test.
const STRESS_TEST_TIMEOUT = 300_000

describe('stress tests', () => {
  const initialAmount = 1000
  const tokenName = 'OVM Test'
  const tokenDecimals = 8
  const tokenSymbol = 'OVM'
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

    const L1LiquidityPool = new ethers.Contract(
      env.l1LiquidityPoolAddress,
      L1LiquidityPoolJson.abi,
      env.l1Wallet
    )

    const L2LiquidityPool = new ethers.Contract(
      env.l2LiquidityPoolAddress,
      L2LiquidityPoolJson.abi,
      env.l2Wallet
    )

    await L1LiquidityPool
      // Deployer PRIVATE KEY
      .connect(new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", env.l1Wallet.provider))
      .registerPool(l1ERC20.address, l2ERC20.address)

    await L2LiquidityPool
      .connect(new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", env.l2Wallet.provider))
      .registerPool(l1ERC20.address, l2ERC20.address)

    await l2ERC20.transfer(L2LiquidityPool.address, 500)
    await l1ERC20.transfer(L1LiquidityPool.address, 500)
    console.log("DONE beforeEach")
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

      const L1LiquidityPool = new ethers.Contract(
        env.l1LiquidityPoolAddress,
        L1LiquidityPoolJson.abi,
        env.l1Wallet
      )

      await helpers.executeRepeatedDepositErc20(
        env,
        l1ERC20,
        L1LiquidityPool,
        depositAmount,
        numTransactions
      )

      const postL1Balance: BigNumber = await l1ERC20.balanceOf(
        env.l1Wallet.address
      )
      const postL2Balance: BigNumber = await l2ERC20.balanceOf(
        env.l2Wallet.address
      )

      expect(postL1Balance).to.deep.eq(
        BigNumber.from(preL1Balance.sub(depositAmount * numTransactions))
      )
      expect(postL2Balance).to.deep.eq(
        BigNumber.from(preL2Balance.add(depositAmount * numTransactions))
      )
    }).timeout(STRESS_TEST_TIMEOUT)

    it('withdraw ERC20', async () => {
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

      const L2LiquidityPool = new ethers.Contract(
        env.l2LiquidityPoolAddress, // hardcoded
        L2LiquidityPoolJson.abi,
        env.l2Wallet
      )

      await helpers.executeRepeatedWithdrawErc20(
        env,
        l2ERC20,
        L2LiquidityPool,
        depositAmount,
        numTransactions
      )

      const postL1Balance: BigNumber = await l1ERC20.balanceOf(
        env.l1Wallet.address
      )
      const postL2Balance: BigNumber = await l2ERC20.balanceOf(
        env.l2Wallet.address
      )

      expect(postL1Balance).to.deep.eq(
        BigNumber.from(preL1Balance.add(depositAmount * numTransactions))
      )
      expect(postL2Balance).to.deep.eq(
        BigNumber.from(preL2Balance.sub(depositAmount * numTransactions))
      )
    }).timeout(STRESS_TEST_TIMEOUT)
  })
})
