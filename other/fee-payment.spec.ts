import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
import { BigNumber, utils } from 'ethers'
import { OptimismEnv } from './shared/env'

describe('Fee Payment Integration Tests', async () => {
  let env: OptimismEnv
  const other = '0x1234123412341234123412341234123412341234'

  before(async () => {
    env = await OptimismEnv.new()
  })

  it('Paying a nonzero but acceptable gasPrice fee', async () => {
    const amount = 10

    const balanceBefore = await env.alicel2Wallet.getBalance()
    const tx = await env.L2ETHGateway.transfer(other, amount)
    await tx.wait()
    const balanceAfter = await env.alicel2Wallet.getBalance()
    // TODO: The fee paid MUST be the receipt.gasUsed, and not the tx.gasLimit
    // https://github.com/ethereum-optimism/optimism/blob/0de7a2f9c96a7c4860658822231b2d6da0fefb1d/packages/contracts/contracts/optimistic-ethereum/OVM/accounts/OVM_ECDSAContractAccount.sol#L103
    expect(balanceBefore.sub(balanceAfter)).to.be.deep.eq(
      tx.gasPrice.mul(tx.gasLimit).add(amount)
    )
  })

  it('sequencer rejects transaction with a non-multiple-of-1M gasPrice', async () => {
    const gasPrice = BigNumber.from(1_000_000 - 1)
    await expect(
      env.L2ETHGateway.transfer(other, 0, { gasPrice })
    ).to.be.eventually.rejectedWith(
      'Gas price must be a multiple of 1,000,000 wei'
    )
  })
})
