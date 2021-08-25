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
const l1GasLimit = 9999999
const l2GasLimit = 9999999

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
  l2ERC20: Contract,
  txs: number[]
) => {
  for (const depositAmount of txs) {
    const tx = await l1ERC20.approve(env.l1Bridge.address, depositAmount)
    await tx.wait()

    const l1Tx1 = await env.l1Bridge.depositERC20To(
      l1ERC20.address,
      l2ERC20.address,
      env.l2Wallet.address,
      depositAmount,
      l2GasLimit,
      ethers.utils.formatBytes32String('0')
    )
    await l1Tx1.wait()

    // Wait for the message to be relayed to L2.
    const [msgHash1] = await env.watcher.getMessageHashesFromL1Tx(l1Tx1.hash)
    console.log(msgHash1)
    await env.watcher.getL2TransactionReceipt(msgHash1)
  }
}

export const executeWithdrawErc20 = async (
  env: OptimismEnv,
  l1ERC20: Contract,
  l2ERC20: Contract,
  txs: number[]
) => {
  console.log('fdsf')
}

export const executeWithdrawETH = async (env: OptimismEnv, txs: number[]) => {
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

export const executeDepositETH = async (env: OptimismEnv, txs: number[]) => {
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
  l2ERC20: Contract,
  depositAmount: number,
  count: number
) => {
  await executeDepositErc20(
    env,
    l1ERC20,
    l2ERC20,
    [...Array(count).keys()].map(() => depositAmount)
  )
}

export const executeRepeatedWithdrawErc20 = async (
  env: OptimismEnv,
  l1ERC20: Contract,
  l2ERC20: Contract,
  withdrawAmount: number,
  count: number
) => {
  await executeWithdrawErc20(
    env,
    l1ERC20,
    l2ERC20,
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
            gasPrice: 0,
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
