import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Contract, ContractFactory, utils } from 'ethers'
import chalk from 'chalk';

import { Direction, Relayer } from './shared/watcher-utils'

import L1FastMessageJson from '../artifacts/contracts/Message/L1FastMessage.sol/L1FastMessage.json'
import L2MessageJson from '../artifacts-ovm/contracts/Message/L2Message.sol/L2Message.json'

import { OptimismEnv } from './shared/env'

describe('Messenge Relayer Test', async () => {

  let Factory__L1FastMessage: ContractFactory
  let Factory__L2Message: ContractFactory

  let L1FastMessage: Contract
  let L2Message: Contract

  let env: OptimismEnv

  before(async () => {

    env = await OptimismEnv.new()

    Factory__L1FastMessage = new ContractFactory(
      L1FastMessageJson.abi,
      L1FastMessageJson.bytecode,
      env.bobl1Wallet
    )

    Factory__L2Message = new ContractFactory(
      L2MessageJson.abi,
      L2MessageJson.bytecode,
      env.bobl2Wallet
    )

    const accountNonceBob1 = await env.l1Provider.getTransactionCount(env.bobl1Wallet.address)
    console.log(`accountNonceBob1:`,accountNonceBob1)

    const accountNonceBob2 = await env.l2Provider.getTransactionCount(env.bobl2Wallet.address)
    console.log(`accountNonceBob2:`,accountNonceBob2)

  })

  it('should deploy contracts', async () => {
    L2Message = await Factory__L2Message.deploy(
      env.watcher.l2.messengerAddress,
      {gasLimit: 999999, gasPrice: 0}
    )
    await L2Message.deployTransaction.wait()
    console.log(`🌕 ${chalk.red('L2Message deployed to:')} ${chalk.green(L2Message.address)}`)
    
    // Deploy L1 liquidity pool
    L1FastMessage = await Factory__L1FastMessage.deploy(
      env.watcher.l1.messengerAddress,
      env.customWatcher.l1.messengerAddress,
      {gasLimit: 999999, gasPrice: 0}
    )
    await L1FastMessage.deployTransaction.wait()
    console.log(`🌕 ${chalk.red('L1FastMessage deployed to:')} ${chalk.green(L1FastMessage.address)}`)
    
    // Initialize L1 message
    const L1FastMessageTX = await L1FastMessage.init(
      L2Message.address,
      {gasLimit: 999999, gasPrice: 0}
    )
    await L1FastMessageTX.wait()
    console.log(`⭐️ ${chalk.blue('L1 Message initialized:')} ${chalk.green(L1FastMessageTX.hash)}`)

    // Initialize L2 message
    const L2MessageTX = await L2Message.init(
      L1FastMessage.address,
      {gasLimit: 999999, gasPrice: 0}
    )
    await L2MessageTX.wait()
    console.log(`⭐️ ${chalk.blue('L2 Message initialized:')} ${chalk.green(L2MessageTX.hash)}`)
  })

  it('should send message from L2 to L1', async () => {
    await env.waitForXDomainTransaction(
      L2Message.sendMessageL2ToL1({
        gasLimit: 999999, 
        gasPrice: 0, 
        //nonce: 221
      }),
      Direction.L2ToL1,
      Relayer.custom
    )
  })

  it('should send message from L1 to L2', async () => {
    await env.waitForXDomainTransaction(
      L1FastMessage.sendMessageL1ToL2({
        gasLimit: 999999, 
        gasPrice: 0, 
        //nonce: 28
      }),
      Direction.L1ToL2
    )
  })
})