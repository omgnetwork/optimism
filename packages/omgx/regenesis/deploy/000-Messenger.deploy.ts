import { getContractFactory } from '@eth-optimism/contracts'
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory} from 'ethers'
import chalk from 'chalk';

require('dotenv').config()

import L1_MessengerJson from '../artifacts/contracts/OVM_L1CrossDomainMessengerRegenesis.sol/OVM_L1CrossDomainMessengerRegenesis.json'

let Factory__L1_Messenger: ContractFactory

let L1_Messenger: Contract

const deployFn: DeployFunction = async (hre) => {

  const addressManager = getContractFactory('Lib_AddressManager')
    .connect((hre as any).deployConfig.deployer_l1)
    .attach(process.env.ADDRESS_MANAGER_ADDRESS) as any

  Factory__L1_Messenger = new ContractFactory(
    L1_MessengerJson.abi,
    L1_MessengerJson.bytecode,
    (hre as any).deployConfig.deployer_l1
  )

  L1_Messenger = await Factory__L1_Messenger.deploy()

  await L1_Messenger.deployTransaction.wait()

  const L1_MessengerDeploymentSubmission: DeploymentSubmission = {
    ...L1_Messenger,
    receipt: L1_Messenger.receipt,
    address: L1_Messenger.address,
    abi: L1_MessengerJson.abi,
  };
  await hre.deployments.save('OVM_L1CrossDomainMessengerRegenesis', L1_MessengerDeploymentSubmission)
  await hre.deployments.save('OVM_L1CrossDomainMessenger', { address: (hre as any).deployConfig.OVM_L1CrossDomainMessengerAddress, abi: null, receipt: null})

  console.log(`🌕 ${chalk.red('OVM_L1CrossDomainMessengerRegenesis deployed to:')} ${chalk.green(L1_Messenger.address)}`)

  const L1_Messenger_Deployed = Factory__L1_Messenger.attach(L1_Messenger.address)

  // initialize with address_manager
  const L1MessagerTX = await L1_Messenger_Deployed.initialize(
    addressManager.address,
  )
  console.log(`⭐️ ${chalk.blue('OVM_L1CrossDomainMessengerRegenesis initialized:')} ${chalk.green(L1MessagerTX.hash)}`)

  //this will fail for non deployer account
  const L1MessagerTXReg1 = await addressManager.setAddress(
    'OVM_L1CrossDomainMessenger',
    L1_Messenger.address
  )
  console.log(`⭐️ ${chalk.blue('OVM_L1CrossDomainMessengerRegenesis registered:')} ${chalk.green(L1MessagerTXReg1.hash)}`)

  //this will fail for non deployer account
  const L1MessagerTXReg2 = await addressManager.setAddress(
    'OVM_L1CrossDomainMessengerOrigin',
    (hre as any).deployConfig.OVM_L1CrossDomainMessengerAddress
  )
  console.log(`⭐️ ${chalk.blue('OVM_L1CrossDomainMessengerOrigin registered:')} ${chalk.green(L1MessagerTXReg2.hash)}`)

}

deployFn.tags = ['FastMessenger', 'required']

export default deployFn
