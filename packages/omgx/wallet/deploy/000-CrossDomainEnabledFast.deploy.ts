/* Imports: External */
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory} from 'ethers'
import chalk from 'chalk';

import OVM_L1CrossDomainMessengerFastJson from '../artifacts/contracts/message-relayer-fast/OVM_L1CrossDomainMessengerFast.sol/OVM_L1CrossDomainMessengerFast.json';

let Factory__OVM_L1CrossDomainMessengerFast: ContractFactory

let OVM_L1CrossDomainMessengerFast: Contract


const deployFn: DeployFunction = async (hre) => {

  Factory__OVM_L1CrossDomainMessengerFast = new ContractFactory(
    OVM_L1CrossDomainMessengerFastJson.abi,
    OVM_L1CrossDomainMessengerFastJson.bytecode,
      (hre as any).deployConfig.deployer_l1
    )

    OVM_L1CrossDomainMessengerFast = await Factory__OVM_L1CrossDomainMessengerFast.deploy()
    await OVM_L1CrossDomainMessengerFast.deployTransaction.wait()
    console.log(`🌕 ${chalk.red('OVM_L1CrossDomainMessengerFast deployed to:')} ${chalk.green(OVM_L1CrossDomainMessengerFast.address)}`)

    // initialize with address_manager
    await OVM_L1CrossDomainMessengerFast.initialize((hre as any).deployConfig.addressManager.address)
    console.log('OVM_L1CrossDomainMessengerFast Initialized')

    const OVM_L1CrossDomainMessengerFastSubmission: DeploymentSubmission = {
      ...OVM_L1CrossDomainMessengerFast,
      receipt: OVM_L1CrossDomainMessengerFast.receipt,
      address: OVM_L1CrossDomainMessengerFast.address,
      abi: OVM_L1CrossDomainMessengerFastJson.abi,
    };

    (hre as any).deployConfig.addressManager.setAddress(
      'OVM_L1CrossDomainMessengerFast',
      OVM_L1CrossDomainMessengerFast.address
    )

    console.log(`🌕 ${chalk.red('OVM_L1CrossDomainMessengerFast registered.')}`)
    await hre.deployments.save('OVM_L1CrossDomainMessengerFast', OVM_L1CrossDomainMessengerFastSubmission)

}

deployFn.tags = ['OVM_L1CrossDomainMessengerFast', 'required']

export default deployFn
