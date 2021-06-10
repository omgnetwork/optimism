import { Wallet, providers } from 'ethers'
import {JsonRpcProvider} from '@ethersproject/providers'
import { Contract } from 'ethers'
import { getContractFactory } from '@eth-optimism/contracts'
import { Watcher } from '@eth-optimism/core-utils'
// import path from 'path'
// import dirtree from 'directory-tree'
// import fs from 'fs'

// Ensures that all relevant environment vars are properly set. These lines *must* come before the
// hardhat import because importing will load the config (which relies on these vars). Necessary
// because CI currently uses different var names than the ones we've chosen here.
// TODO: Update CI so that we don't have to do this anymore.
process.env.HARDHAT_NETWORK = 'optimism' // "custom" here is an arbitrary name. only used for CI.
process.env.CONTRACTS_TARGET_NETWORK = 'optimism'
process.env.CONTRACTS_DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY
process.env.CONTRACTS_RPC_URL =
  process.env.L1_NODE_WEB3_URL || 'http://127.0.0.1:8545'

import hre from 'hardhat'


const main = async () => {

  const config = parseEnv()

//   const l1Messenger = getContractFactory('iOVM_L1CrossDomainMessenger')
//   .connect(bobl1Wallet)
//   .attach(watcher.l1.messengerAddress)

// const l1MessengerAddress = l1Messenger.address;

// const l2Messenger = getContractFactory('iOVM_L2CrossDomainMessenger')
//   .connect(bobl2Wallet)
//   .attach(watcher.l2.messengerAddress)
  const l1Provider = new providers.JsonRpcProvider(process.env.L1_NODE_WEB3_URL)
  const l2Provider = new providers.JsonRpcProvider(process.env.L2_NODE_WEB3_URL)
  const deployer_1 = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, l1Provider)
  const deployer_2 = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, l2Provider)
  const addressManagerAddress = process.env.ETH1_ADDRESS_RESOLVER_ADDRESS

  const getAddressManager = (provider: any) => {
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

  const watcher = await initWatcher(l1Provider, l2Provider, getAddressManager(deployer_1))
  await hre.run('deploy', {
    watcher: watcher,
    l1provider: l1Provider,
    l2provider: l2Provider,
    deployer_l1: deployer_1,
    deployer_l2: deployer_2,
    emOvmChainId: config.emOvmChainId,
    noCompile: process.env.NO_COMPILE ? true : false,
    addressManager: getAddressManager(deployer_1),
    getAddressManager: getAddressManager
  })

  // // Stuff below this line is currently required for CI to work properly. We probably want to
  // // update our CI so this is no longer necessary. But I'm adding it for backwards compat so we can
  // // get the hardhat-deploy stuff merged. Woot.
  // const nicknames = {
  //   'Lib_AddressManager': 'AddressManager',
  //   'mockOVM_BondManager': 'OVM_BondManager'
  // }

  // const contracts: any = dirtree(
  //   path.resolve(__dirname, `../deployments/custom`)
  // ).children.filter((child) => {
  //   return child.extension === '.json'
  // }).reduce((contracts, child) => {
  //   const contractName = child.name.replace('.json', '')
  //   const artifact = require(path.resolve(__dirname, `../deployments/custom/${child.name}`))
  //   contracts[nicknames[contractName] || contractName] = artifact.address
  //   return contracts
  // }, {})

  // contracts.OVM_Sequencer = await sequencer.getAddress()
  // contracts.Deployer = await deployer.getAddress()

  // const addresses = JSON.stringify(contracts, null, 2)
  // const dumpsPath = path.resolve(__dirname, "../dist/dumps")
  // if (!fs.existsSync(dumpsPath)) {
  //   fs.mkdirSync(dumpsPath)
  // }
  // const addrsPath = path.resolve(dumpsPath, 'addresses.json')
  // fs.writeFileSync(addrsPath, addresses)
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
