import { expect } from 'chai'

/* Imports: Internal */
import { OptimismEnv } from './shared/env'
import { expectApprox } from './shared/utils'
import * as helpers from './shared/stress-test-helpers'

// Need a big timeout to allow for all transactions to be processed.
// For some reason I can't figure out how to set the timeout on a per-suite basis
// so I'm instead setting it for every test.
const STRESS_TEST_TIMEOUT = 300_000

describe('stress tests', () => {
  let env: OptimismEnv

  before(async () => {
    env = await OptimismEnv.new()
  })

  describe('ETH stress tests', () => {
    const getBalances = async (_env: OptimismEnv) => {
      const l1UserBalance = await _env.l1Wallet.getBalance()
      const l2UserBalance = await _env.l2Wallet.getBalance()

      const l1BridgeBalance = await _env.l1Wallet.provider.getBalance(
        _env.l1Bridge.address
      )

      return {
        l1UserBalance,
        l2UserBalance,
        l1BridgeBalance,
      }
    }

    it('deposit ETH', async () => {
      const numTransactions = 10
      const depositAmount = 10
      const preBalances = await getBalances(env)

      const totalL1FeePaid = await helpers.executeRepeatedDepositETH(
        env,
        depositAmount,
        numTransactions
      )

      const postBalances = await getBalances(env)

      expect(postBalances.l1BridgeBalance).to.deep.eq(
        preBalances.l1BridgeBalance.add(depositAmount * numTransactions)
      )
      expect(postBalances.l2UserBalance).to.deep.eq(
        preBalances.l2UserBalance.add(depositAmount * numTransactions)
      )
      expect(postBalances.l1UserBalance).to.deep.eq(
        preBalances.l1UserBalance.sub(
          totalL1FeePaid.add(depositAmount * numTransactions)
        )
      )
    }).timeout(STRESS_TEST_TIMEOUT)

    it('withdraw ETH', async () => {
      const numTransactions = 10

      const withdrawAmount = 3
      const preBalances = await getBalances(env)

      expect(
        preBalances.l2UserBalance.gt(0),
        'Cannot run withdrawal test before any deposits...'
      )

      const fee = await helpers.executeRepeatedWithdrawETH(
        env,
        withdrawAmount,
        numTransactions
      )

      const postBalances = await getBalances(env)

      // Approximate because there's a fee related to relaying the L2 => L1 message and it throws off the math.
      expectApprox(
        postBalances.l1BridgeBalance,
        preBalances.l1BridgeBalance.sub(withdrawAmount),
        { upperPercentDeviation: 1 }
      )
      expectApprox(
        postBalances.l2UserBalance,
        preBalances.l2UserBalance.sub(fee.add(withdrawAmount)),
        { upperPercentDeviation: 1 }
      )
      expectApprox(
        postBalances.l1UserBalance,
        preBalances.l1UserBalance.add(withdrawAmount),
        { upperPercentDeviation: 1 }
      )
    }).timeout(STRESS_TEST_TIMEOUT)
  })
})
