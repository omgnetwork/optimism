// /* eslint @typescript-eslint/no-var-requires: 0 */

// import { injectL2Context } from '@eth-optimism/core-utils'

// import {
//   getContractInterface,
//   getContractFactory,
// } from '@eth-optimism/contracts'

// import { Contract, Wallet, constants, providers, BigNumber } from 'ethers'

// import { ethers, network } from 'hardhat'

// require('dotenv').config()

// export const GWEI = BigNumber.from(0)

// // The hardhat instance
// //const l1HttpPort = 9545
// export const l1Provider = new providers.JsonRpcProvider(process.env.L1_NODE_WEB3_URL)
// export const l2Provider = new providers.JsonRpcProvider(process.env.L2_NODE_WEB3_URL)
// // export const l2Provider = injectL2Context(l2P)

// export const bobl2Wallet   = new Wallet("0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1", l2Provider)
// export const alicel2Wallet = new Wallet("0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd", l2Provider)
// export const fraudl2Wallet = new Wallet("0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd", l2Provider)

// // Predeploys
// export const PROXY_SEQUENCER_ENTRYPOINT_ADDRESS =
//   '0x4200000000000000000000000000000000000004'

// export const OVM_ETH_ADDRESS = 
//   '0x4200000000000000000000000000000000000006'

// export const Proxy__OVM_L2CrossDomainMessenger =
//   '0x4200000000000000000000000000000000000007'

// export const addressManagerAddress = process.env.ADDRESS_MANAGER_ADDRESS

// export const getAddressManager = (provider: any) => {
//   return getContractFactory('Lib_AddressManager')
//     .connect(provider)
//     .attach(addressManagerAddress) as any
// }

// // // Gets the gateway using the proxy if available
// // export const getL1ETHGateway = async (
// //   wallet: Wallet,
// //   AddressManager: Contract
// // ) => {
// //   const l1GatewayInterface = getContractInterface('OVM_L1ETHGateway')
// //   const ProxyGatewayAddress = await AddressManager.getAddress(
// //     'Proxy__OVM_L1ETHGateway'
// //   )

// //   const L1ETHGateway = new Contract(
// //     ProxyGatewayAddress,
// //     l1GatewayInterface as any,
// //     wallet
// //   )

// //   return L1ETHGateway
// // }

// // export const getL2ETHGateway = (wallet: Wallet) => {
// //   const OVM_ETH = new Contract(
// //     OVM_ETH_ADDRESS,
// //     getContractInterface('OVM_ETH') as any,
// //     wallet
// //   )
// //   return OVM_ETH
// // }

// export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
