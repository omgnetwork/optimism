/* Imports: External */
import { BigNumber, Contract, ethers } from 'ethers'
import { predeploys } from '@eth-optimism/contracts'

/* Imports: Internal */
import { OptimismEnv, useDynamicTimeoutForWithdrawals } from './env'
import { Direction, CrossDomainMessagePair } from './watcher-utils'

interface TransactionParams {
  contract: ethers.Contract
  functionName: string
  functionParams: any[]
}

// Arbitrary big amount of gas for the L1<>L2 messages.
const MESSAGE_GAS = 8_000_000
const DEFAULT_TEST_GAS_L1 = 330_000
const DEFAULT_TEST_GAS_L2 = 1_300_000

export const executeL1ToL2Transactions = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  for (const tx of txs) {
    const signer = env.l1Wallet //ethers.Wallet.createRandom().connect(env.l1Wallet.provider)

    const receipt = await env.l1Messenger
      .connect(signer)
      .sendMessage(
        tx.contract.address,
        tx.contract.interface.encodeFunctionData(
          tx.functionName,
          tx.functionParams
        ),
        MESSAGE_GAS,
        {
          //gasPrice: 0,
        }
      )

    await env.waitForXDomainTransaction(receipt, Direction.L1ToL2)
  }
}

export const executeL2ToL1Transactions = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  for (const tx of txs) {
    const signer = env.l2Wallet

    const receipt = await env.l2Messenger
      .connect(signer)
      .sendMessage(
        tx.contract.address,
        tx.contract.interface.encodeFunctionData(
          tx.functionName,
          tx.functionParams
        ),
        MESSAGE_GAS,
        {
          //gasPrice: 0,
        }
      )

    await env.relayXDomainMessages(receipt)
    await env.waitForXDomainTransaction(receipt, Direction.L2ToL1)
  }
}

export const executeL2Transactions = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  for (const tx of txs) {
    const signer = env.l2Wallet
    const result = await tx.contract
      .connect(signer)
      .functions[tx.functionName](...tx.functionParams, {
        //gasPrice: 0,
      })
    await result.wait()
  }
}

export const executeDepositErc20 = async (
  env: OptimismEnv,
  l1ERC20: Contract,
  L1LiquidityPool: Contract,
  txs: number[]
) => {
  for (const depositAmount of txs) {
    // Move tokens from L1 to L2
    const approveL1TX = await l1ERC20.approve(
      L1LiquidityPool.address,
      depositAmount
    )
    await approveL1TX.wait()

    const depositTX = await L1LiquidityPool.clientDepositL1(
      depositAmount,
      l1ERC20.address,
      { gasLimit: DEFAULT_TEST_GAS_L1 }
    )

    await depositTX.wait()

    const [l1ToL2msgHash] = await env.watcher.getMessageHashesFromL1Tx(
      depositTX.hash
    )

    await env.watcher.getL2TransactionReceipt(l1ToL2msgHash)
  }
}

export const executeWithdrawErc20 = async (
  env: OptimismEnv,
  l2ERC20: Contract,
  L2LiquidityPool: Contract,
  txs: number[]
) => {
  for (const depositAmount of txs) {
    // Move tokens from L2 to L1
    const approveL2TX = await l2ERC20.approve(
      L2LiquidityPool.address,
      depositAmount
    )
    await approveL2TX.wait()

    const withdrawTX = await L2LiquidityPool.clientDepositL2(
      depositAmount,
      l2ERC20.address
    )
    await withdrawTX.wait()

    const [l2ToL1msgHash] = await env.watcherFast.getMessageHashesFromL2Tx(
      withdrawTX.hash
    )

    await env.watcherFast.getL1TransactionReceipt(l2ToL1msgHash)
  }
}

export const executeWithdrawETH = async (env: OptimismEnv, txs) => {
  let totalL1FeePaid: BigNumber = BigNumber.from(0)
  for (const withdrawAmount of txs) {
    await useDynamicTimeoutForWithdrawals(this, env)
    const transaction = await env.l2Bridge.withdraw(
      predeploys.OVM_ETH,
      withdrawAmount,
      DEFAULT_TEST_GAS_L2,
      '0xFFFF'
    )
    await transaction.wait()
    await env.relayXDomainMessages(transaction)
    const { tx } = await env.waitForXDomainTransaction(
      transaction,
      Direction.L2ToL1
    )
    totalL1FeePaid = totalL1FeePaid.add(tx.gasLimit.mul(tx.gasPrice))
  }
  return totalL1FeePaid
}

export const executeDepositETH = async (env: OptimismEnv, txs) => {
  let totalL1FeePaid: BigNumber = BigNumber.from(0)
  for (const depositAmount of txs) {
    const { tx, receipt } = await env.waitForXDomainTransaction(
      env.l1Bridge.depositETH(DEFAULT_TEST_GAS_L2, '0xFFFF', {
        value: depositAmount,
        gasLimit: DEFAULT_TEST_GAS_L1,
      }),
      Direction.L1ToL2
    )
    totalL1FeePaid = totalL1FeePaid.add(receipt.gasUsed.mul(tx.gasPrice))
  }
  return totalL1FeePaid
}

export const executeDepositETHParallel = async (env: OptimismEnv, txs) => {
  let totalL1FeePaid: BigNumber = BigNumber.from(0)
  const result: CrossDomainMessagePair[] = await Promise.all(
    txs.map(async (depositAmount) => {
      const receipt = await env.l1Bridge.depositETH(
        DEFAULT_TEST_GAS_L2,
        '0xFFFF',
        {
          value: depositAmount,
          gasLimit: DEFAULT_TEST_GAS_L1,
        }
      )
      await env.waitForXDomainTransaction(receipt, Direction.L1ToL2)
    })
  )
  for (const { tx, receipt } of result) {
    totalL1FeePaid = totalL1FeePaid.add(receipt.gasUsed.mul(tx.gasPrice))
  }
  return totalL1FeePaid
}

export const executeRepeatedL1ToL2Transactions = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL1ToL2Transactions(
    env,
    [...Array(count).keys()].map(() => tx)
  )
}

export const executeRepeatedL2ToL1Transactions = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL2ToL1Transactions(
    env,
    [...Array(count).keys()].map(() => tx)
  )
}

export const executeRepeatedL2Transactions = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL2Transactions(
    env,
    [...Array(count).keys()].map(() => tx)
  )
}

export const executeRepeatedDepositErc20 = async (
  env: OptimismEnv,
  l1ERC20: Contract,
  l1LiquidityPool: Contract,
  depositAmount: number,
  count: number
) => {
  await executeDepositErc20(
    env,
    l1ERC20,
    l1LiquidityPool,
    [...Array(count).keys()].map(() => depositAmount)
  )
}

export const executeRepeatedWithdrawErc20 = async (
  env: OptimismEnv,
  l2ERC20: Contract,
  l2LiquidityPool: Contract,
  withdrawAmount: number,
  count: number
) => {
  await executeWithdrawErc20(
    env,
    l2ERC20,
    l2LiquidityPool,
    [...Array(count).keys()].map(() => withdrawAmount)
  )
}

export const executeRepeatedWithdrawETH = async (
  env: OptimismEnv,
  withdrawAmount: number,
  count: number
) => {
  return executeWithdrawETH(
    env,
    [...Array(count).keys()].map(() => withdrawAmount)
  )
}

export const executeRepeatedDepositETH = async (
  env: OptimismEnv,
  depositAmount: number,
  count: number
) => {
  return executeDepositETH(
    env,
    [...Array(count).keys()].map(() => depositAmount)
  )
}

export const executeRepeatedDepositETHParallel = async (
  env: OptimismEnv,
  depositAmount: number,
  count: number
) => {
  return executeDepositETHParallel(
    env,
    [...Array(count).keys()].map(() => depositAmount)
  )
}

export const executeL1ToL2TransactionsParallel = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  await Promise.all(
    txs.map(async (tx) => {
      const signer = env.l1Wallet
      const receipt = await env.l1Messenger
        .connect(signer)
        .sendMessage(
          tx.contract.address,
          tx.contract.interface.encodeFunctionData(
            tx.functionName,
            tx.functionParams
          ),
          MESSAGE_GAS,
          {
            gasPrice: 0
          }
        )

      await env.waitForXDomainTransaction(receipt, Direction.L1ToL2)
    })
  )
}

export const executeL2ToL1TransactionsParallel = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  await Promise.all(
    txs.map(async (tx) => {
      const signer = env.l2Wallet
      const receipt = await env.l2Messenger
        .connect(signer)
        .sendMessage(
          tx.contract.address,
          tx.contract.interface.encodeFunctionData(
            tx.functionName,
            tx.functionParams
          ),
          MESSAGE_GAS,
          {
            //gasPrice: 0,
          }
        )

      await env.relayXDomainMessages(receipt)
      await env.waitForXDomainTransaction(receipt, Direction.L2ToL1)
    })
  )
}

export const executeL2TransactionsParallel = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  await Promise.all(
    txs.map(async (tx) => {
      const signer = env.l2Wallet
      const result = await tx.contract
        .connect(signer)
        .functions[tx.functionName](...tx.functionParams, {
          //gasPrice: 0,
        })
      await result.wait()
    })
  )
}

export const executeRepeatedL1ToL2TransactionsParallel = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL1ToL2TransactionsParallel(
    env,
    [...Array(count).keys()].map(() => tx)
  )
}

export const executeRepeatedL2ToL1TransactionsParallel = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL2ToL1TransactionsParallel(
    env,
    [...Array(count).keys()].map(() => tx)
  )
}

export const executeRepeatedL2TransactionsParallel = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL2TransactionsParallel(
    env,
    [...Array(count).keys()].map(() => tx)
  )
}
