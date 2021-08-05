import { expect } from 'chai'

/* Imports: External */
import { Wallet, utils, BigNumber, ethers } from 'ethers'
import { predeploys } from '@eth-optimism/contracts'

/* Imports: Internal */
import { Direction } from './shared/watcher-utils'

import {
  expectApprox,
  fundUser,
  PROXY_SEQUENCER_ENTRYPOINT_ADDRESS,
  l1Provider,
  l2Provider
} from './shared/utils'
import { OptimismEnv, useDynamicTimeoutForWithdrawals } from './shared/env'

const DEFAULT_TEST_GAS_L1 = 330_000
const DEFAULT_TEST_GAS_L2 = 1_300_000
// TX size enforced by CTC:
const MAX_ROLLUP_TX_SIZE = 50_000

describe('Fund Initial L2 Account', async () => {
  
  let env: OptimismEnv

  it('depositETH', async () => {

    env = await OptimismEnv.new()
    
   // # l1_chain_1 | Account #9: 0xa0ee7a142d267c1f36714e4a8f75612f20a79720 (10000 ETH)
   // # l1_chain_1 | Private Key: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

    //This wallet needs to have ETH in it
    //const L1WalletPK = '0x0f2b8a26f2ddec8444c0ca412659a338d46d05963b72a72ccee34552e611269f'
    const L1WalletPK = '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6'

    // The private key which is funded on L1
    const l1Wallet = new Wallet(L1WalletPK, l1Provider)
    
    // The L2 account you will be using to pay for OMGX deployment on the L2
    // if it's using non-0 gas price
    const l2Wallet = l1Wallet.connect(l2Provider)

    const l1Balance = await l1Wallet.getBalance()
    const l2Balance = await l2Wallet.getBalance()

    console.log("Initial L1 ETH balance is:", ethers.utils.formatEther(l1Balance))
    console.log("Initial L2 ETH balance is:", ethers.utils.formatEther(l2Balance))

    const depositAmount = ethers.utils.parseEther('5.0')

    console.log("\nAmount to transfer:", ethers.utils.formatEther(depositAmount))

    const { tx, receipt } = await env.waitForXDomainTransaction(
      env.l1Bridge.depositETH(DEFAULT_TEST_GAS_L2, '0xFFFF', {
        value: depositAmount,
        gasLimit: DEFAULT_TEST_GAS_L1,
      }),
      Direction.L1ToL2
    )

    const l1Balance1 = await l1Wallet.getBalance()
    const l2Balance1 = await l2Wallet.getBalance()

    console.log("/nFinal L1 ETH balance is:", ethers.utils.formatEther(l1Balance1))
    console.log("Final L2 ETH balance is:", ethers.utils.formatEther(l2Balance1))

  })

})
 