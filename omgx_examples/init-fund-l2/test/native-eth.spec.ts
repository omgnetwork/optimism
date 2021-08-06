import { expect } from 'chai'

/* Imports: External */
import { Wallet, utils, BigNumber, ethers } from 'ethers'
import { predeploys } from '@eth-optimism/contracts'

/* Imports: Internal */
import { Direction } from './shared/watcher-utils'

import {
  expectApprox,
  PROXY_SEQUENCER_ENTRYPOINT_ADDRESS,
  l1Provider,
  l2Provider
} from './shared/utils'
import { OptimismEnv, useDynamicTimeoutForWithdrawals } from './shared/env'

const DEFAULT_TEST_GAS_L1 = 330_000
const DEFAULT_TEST_GAS_L2 = 1_300_000
const MAX_ROLLUP_TX_SIZE = 50_000 // TX size enforced by CTC

describe('Fund Initial L2 Account', async () => {
  
  let env: OptimismEnv

  it('Check connectivity and initial balances', async () => {

    //env = await OptimismEnv.new()
    //const l1Wallet = env.l1Wallet
    //const l2Wallet = l1Wallet.connect(l2Provider)

    console.log('Check connectivity and initial balances')

    const l1Balance = await env.l1Wallet.getBalance()
    const l2Balance = await env.l2Wallet.getBalance()

    console.log("\nInitial L1 ETH balance:", ethers.utils.formatEther(l1Balance))
    console.log("Initial L2 ETH balance:", ethers.utils.formatEther(l2Balance))

  })

  it('depositETH', async () => {

    env = await OptimismEnv.new()
    const l1Wallet = env.l1Wallet
    const l2Wallet = l1Wallet.connect(l2Provider)

    const depositAmount = ethers.utils.parseEther('0.01')

    console.log("\nAmount to transfer:", ethers.utils.formatEther(depositAmount))

    const depositTxStatus = await env.l1Bridge.depositETH(
      DEFAULT_TEST_GAS_L2,
      utils.formatBytes32String(new Date().getTime().toString()),
        { 
          value: depositAmount,
          gasPrice: DEFAULT_TEST_GAS_L1,
        }
    )
    await depositTxStatus.wait()
    console.log(' depositTxStatus', depositTxStatus)

    const [l1ToL2msgHash] = await env.watcher.getMessageHashesFromL1Tx(
      depositTxStatus.hash
    )
    console.log(' got L1->L2 message hash', l1ToL2msgHash)

    const l2Receipt = await env.watcher.getL2TransactionReceipt(
      l1ToL2msgHash
    )
    console.log(' completed Deposit! L2 tx hash:', l2Receipt.transactionHash)

    // const { tx, receipt } = await env.waitForXDomainTransaction(
    //   env.l1Bridge.depositETH(
    //     DEFAULT_TEST_GAS_L2, 
    //     '0xFFFF', 
    //     {
    //       value: depositAmount,
    //       gasLimit: DEFAULT_TEST_GAS_L1,
    //     }
    //   ),
    //   Direction.L1ToL2
    // )

    const l1Balance1 = await l1Wallet.getBalance()
    const l2Balance1 = await l2Wallet.getBalance()

    console.log("\nFinal L1 ETH balance:", ethers.utils.formatEther(l1Balance1))
    console.log("Final L2 ETH balance:", ethers.utils.formatEther(l2Balance1))

  })

})
 

 /*
 depositETHL2 = async (value = '1', gasPrice) => {
    try {
      const depositTxStatus = await this.L1StandardBridgeContract.depositETH(
        this.L2GasLimit,
        utils.formatBytes32String(new Date().getTime().toString()),
        { 
          value: parseEther(value),
          gasPrice: ethers.utils.parseUnits(`${gasPrice}`, 'wei'),
        }
      )
      await depositTxStatus.wait()

      const [l1ToL2msgHash] = await this.watcher.getMessageHashesFromL1Tx(
        depositTxStatus.hash
      )
      console.log(' got L1->L2 message hash', l1ToL2msgHash)

      const l2Receipt = await this.watcher.getL2TransactionReceipt(
        l1ToL2msgHash
      )
      console.log(' completed Deposit! L2 tx hash:', l2Receipt.transactionHash)

      return l2Receipt
    } catch(error) {
      console.log(error)
      return false
    }
  }
  */
