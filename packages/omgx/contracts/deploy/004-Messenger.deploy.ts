/* Imports: External */
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory} from 'ethers'
import chalk from 'chalk';

import AtomicSwapJson from '../artifacts-ovm/contracts/AtomicSwap.sol/AtomicSwap.json';
import L1MessageJson from '../artifacts/contracts/Message/L1Message.sol/L1Message.json'
import L2MessageJson from '../artifacts-ovm/contracts/Message/L2Message.sol/L2Message.json'
import L1_MessengerJson from '../artifacts/contracts/OVM_L1CrossDomainMessengerFast.sol/OVM_L1CrossDomainMessengerFast.json'

let Factory__AtomicSwap: ContractFactory
let Factory__L1Message: ContractFactory
let Factory__L2Message: ContractFactory

let Factory__L1_Messenger: ContractFactory

let AtomicSwap: Contract
let L1Message: Contract
let L2Message: Contract
let L1_Messenger: Contract

const deployFn: DeployFunction = async (hre) => {

    Factory__L1_Messenger = new ContractFactory(
      L1_MessengerJson.abi,
      L1_MessengerJson.bytecode,
      (hre as any).deployConfig.deployer_l2
    )

    // Deploy fast messenger contract
    L1_Messenger = await Factory__L1_Messenger.deploy(
      {gasLimit: 1500000, gasPrice: 0}
    )
    
    await L1_Messenger.deployTransaction.wait()

    console.log('Deployed the L1_CrossDomainMessenger_Fast to ' + L1_Messenger.address)

    const L1_Messenger_Deployed = await Factory__L1_Messenger.attach(L1_Messenger.address)

    console.log('Initializing ...')
    
    // initialize with address_manager
    await L1_Messenger_Deployed.initialize(
      process.env.ADDRESS_MANAGER_ADDRESS //needs to be improved
    )

    console.log('Fast L1 Messenger Initialized')

    // const [deployer] = await ethers.getSigners();

    // const myContract = getContractFactory(
    //   'Lib_AddressManager',
    //   deployer
    // )

    // const Lib_AddressManager = await myContract.attach(process.env.ADDRESS_MANAGER_ADDRESS)

    // // this will fail for non deployer account
    // console.log('Registering L1 Messenger...')
    // await Lib_AddressManager.setAddress(
    //   'OVM_L1CrossDomainMessengerFast',
    //   L1_Messenger.address
    // )

    // console.log('Fast L1 Messenger registered in AddressManager')

}

deployFn.tags = ['FastMessenger', 'required']

export default deployFn
