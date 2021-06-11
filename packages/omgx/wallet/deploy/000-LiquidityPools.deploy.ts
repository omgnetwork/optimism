/* Imports: External */
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory} from 'ethers'
import chalk from 'chalk';

import L1LiquidityPoolJson from '../artifacts/contracts/LP/L1LiquidityPool.sol/L1LiquidityPool.json'
import L2LiquidityPoolJson from '../artifacts-ovm/contracts/LP/L2LiquidityPool.sol/L2LiquidityPool.json'

let Factory__L1LiquidityPool: ContractFactory
let Factory__L2LiquidityPool: ContractFactory

let L1LiquidityPool: Contract
let L2LiquidityPool: Contract

const deployFn: DeployFunction = async (hre) => {

    Factory__L1LiquidityPool = new ContractFactory(
      L1LiquidityPoolJson.abi,
      L1LiquidityPoolJson.bytecode,
      (hre as any).deployConfig.deployer_l1
    )

    Factory__L2LiquidityPool = new ContractFactory(
      L2LiquidityPoolJson.abi,
      L2LiquidityPoolJson.bytecode,
      (hre as any).deployConfig.deployer_l2
    )
    // Deploy L2 liquidity pool
    L2LiquidityPool = await Factory__L2LiquidityPool.deploy(
      (hre as any).deployConfig.watcher.l2.messengerAddress,
      {gasLimit: 800000, gasPrice: 0}
    )
    await L2LiquidityPool.deployTransaction.wait()
    const L2LiquidityPoolDeploymentSubmission: DeploymentSubmission = {
      ...L2LiquidityPool,
      receipt: L2LiquidityPool.receipt,
      address: L2LiquidityPool.address,
      abi: L1LiquidityPoolJson.abi,
    };
    await hre.deployments.save('L2LiquidityPool', L2LiquidityPoolDeploymentSubmission)
    console.log(`🌕 ${chalk.red('L2LiquidityPool deployed to:')} ${chalk.green(L2LiquidityPool.address)}`)

    // Deploy L1 liquidity pool
    L1LiquidityPool = await Factory__L1LiquidityPool.deploy(
      (hre as any).deployConfig.watcher.l1.messengerAddress
    )
    await L1LiquidityPool.deployTransaction.wait()
    const L1LiquidityPoolDeploymentSubmission: DeploymentSubmission = {
      ...L1LiquidityPool,
      receipt: L1LiquidityPool.receipt,
      address: L1LiquidityPool.address,
      abi: L2LiquidityPoolJson.abi,
    };
    await hre.deployments.save('L1LiquidityPool', L1LiquidityPoolDeploymentSubmission)
    console.log(`🌕 ${chalk.red('L1LiquidityPool deployed to:')} ${chalk.green(L1LiquidityPool.address)}`)

}

deployFn.tags = ['L1LiquidityPool', 'L2LiquidityPool', 'required']

export default deployFn
