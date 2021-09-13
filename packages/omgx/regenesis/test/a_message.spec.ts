import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { BigNumber, Contract, ContractFactory, utils } from 'ethers'
import chalk from 'chalk';

import { Direction } from './shared/watcher-utils'

import L1MessageJson from '../artifacts/contracts/L1Message.sol/L1Message.json'
import L2MessageJson from '../artifacts-ovm/contracts/L2Message.sol/L2Message.json'

import { OptimismEnv } from './shared/env'
import * as fs from 'fs'

describe('Fast Messenge Relayer Test', async () => {

  let Factory__L1Message: ContractFactory
  let Factory__L2Message: ContractFactory

  let L1Message: Contract
  let L2Message: Contract

  let env: OptimismEnv

  before(async () => {

    env = await OptimismEnv.new()

    Factory__L1Message = new ContractFactory(
      L1MessageJson.abi,
      L1MessageJson.bytecode,
      env.bobl1Wallet
    )

    Factory__L2Message = new ContractFactory(
      L2MessageJson.abi,
      L2MessageJson.bytecode,
      env.bobl2Wallet
    )

    L1Message = await Factory__L1Message.deploy(
      env.watcher.l1.messengerAddress,
    )
    await L1Message.deployTransaction.wait()

    L2Message = await Factory__L2Message.deploy(
      env.watcher.l2.messengerAddress,
      { gasPrice: 0 }
    )
    await L2Message.deployTransaction.wait()

    const L1MessageTX = await L1Message.init(L2Message.address)
    await L1MessageTX.wait()

    const L2MessageTX = await L2Message.init(L1Message.address, { gasPrice: 0 })
    await L2MessageTX.wait()
  })

  it('should send message from L2 to L1', async () => {
    await L1Message.cr
    await env.waitForXDomainTransaction(
      L2Message.sendMessageL2ToL1({ gasPrice: 0 }),
      Direction.L2ToL1
    )
    expect(await L1Message.crossDomainMessageCount()).to.deep.eq(BigNumber.from('1'))
  })

})