import { Wallet, providers } from 'ethers'
import {JsonRpcProvider} from '@ethersproject/providers'
import { Contract } from 'ethers'
import { getContractFactory } from '@eth-optimism/contracts'
import { Watcher } from '@eth-optimism/core-utils'

process.env.CONTRACTS_DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY
process.env.CONTRACTS_RPC_URL =
  process.env.L1_NODE_WEB3_URL || 'http://127.0.0.1:8545'

import hre from 'hardhat'

const main = async () => {
  console.log('Starting wallet deploy...')
  const config = parseEnv()
  const l1Provider = new providers.JsonRpcProvider(process.env.L1_NODE_WEB3_URL)
  const l2Provider = new providers.JsonRpcProvider(process.env.L2_NODE_WEB3_URL)
  const deployer_1 = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, l1Provider)
  const deployer_2 = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, l2Provider)

  const getAddressManager = (provider: any, addressManagerAddress: any) => {
    return getContractFactory('Lib_AddressManager')
      .connect(provider)
      .attach(addressManagerAddress) as any
  }

  const initWatcher = async (
    l1Provider: JsonRpcProvider,
    l2Provider: JsonRpcProvider,
    AddressManager: Contract
  ) => {
    const l1MessengerAddress = await AddressManager.getAddress(
      'Proxy__OVM_L1CrossDomainMessenger'
    )
    const l2MessengerAddress = await AddressManager.getAddress(
      'OVM_L2CrossDomainMessenger'
    )
    return new Watcher({
      l1: {
        provider: l1Provider,
        messengerAddress: l1MessengerAddress,
      },
      l2: {
        provider: l2Provider,
        messengerAddress: l2MessengerAddress,
      },
    })
  }

  let addressManager = process.env.ADDRESS_MANAGER_ADDRESS;
  console.log(`ADDRESS_MANAGER_ADDRESS was set to ${addressManager}`)
  const watcher = await initWatcher(l1Provider, l2Provider, getAddressManager(deployer_1, addressManager))
  await hre.run('deploy', {
    watcher: watcher,
    l1provider: l1Provider,
    l2provider: l2Provider,
    deployer_l1: deployer_1,
    deployer_l2: deployer_2,
    emOvmChainId: config.emOvmChainId,
    noCompile: process.env.NO_COMPILE ? true : false,
    addressManager: getAddressManager(deployer_1, addressManager),
    getAddressManager: getAddressManager,
  })

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(
      JSON.stringify({ error: error.message, stack: error.stack }, null, 2)
    )
    process.exit(1)
  })

function parseEnv() {
  function ensure(env, type) {
    if (typeof process.env[env] === 'undefined')
      return undefined
    if (type === 'number')
      return parseInt(process.env[env], 10)
    return process.env[env]
  }

  return {
    l1provider: ensure('L1_NODE_WEB3_URL', 'string'),
    l2provider: ensure('L2_NODE_WEB3_URL', 'string'),
    deployer: ensure('DEPLOYER_PRIVATE_KEY', 'string'),
    emOvmChainId: ensure('CHAIN_ID', 'number'),
  }
}
