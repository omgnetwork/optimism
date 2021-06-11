/* Imports: External */
import { ethers } from 'ethers'
import { Contract, ContractFactory } from 'ethers'
import { task } from 'hardhat/config'
import * as types from 'hardhat/internal/core/params/argumentTypes'

import { Watcher } from '@eth-optimism/core-utils'
//import L2LiquidityPoolJson from '../artifacts-ovm/contracts/LP/L2LiquidityPool.sol/L2LiquidityPool.json'

const DEFAULT_EM_OVM_CHAIN_ID = 28
// let Factory__L1LiquidityPool: ContractFactory
// let Factory__L2LiquidityPool: ContractFactory
// let Factory__L1ERC20: ContractFactory
// let Factory__L2DepositedERC20: ContractFactory
// let Factory__L1ERC20Gateway: ContractFactory
// let Factory__L2TokenPool: ContractFactory
// let Factory__AtomicSwap: ContractFactory
// let Factory__L1Message: ContractFactory
// let Factory__L2Message: ContractFactory

// let L1LiquidityPool: Contract
// let L2LiquidityPool: Contract
// let L1ERC20: Contract
// let L2DepositedERC20: Contract
// let L1ERC20Gateway: Contract
// let L2TokenPool: Contract
// let AtomicSwap: Contract
// let L1Message: Contract
// let L2Message: Contract

task('deploy', 'Deploy contracts to L1 and L2').addOptionalParam(
  'emOvmChainId',
  'Chain ID for the L2 network.',
  DEFAULT_EM_OVM_CHAIN_ID,
  types.int
).setAction(async (args, hre: any, runSuper) => {
    hre.deployConfig = args
    return runSuper(args)
  })

