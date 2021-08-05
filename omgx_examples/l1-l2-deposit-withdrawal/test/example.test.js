/* External Imports */
const { ethers } = require('hardhat')
const { expect } = require('chai')
const { Watcher } = require('@eth-optimism/watcher')

/* Internal Imports */
const factory = (name, ovm = false) => {
  const artifact = require(`../artifacts${ovm ? '-ovm' : ''}/contracts/${name}.sol/${name}.json`)
  return new ethers.ContractFactory(artifact.abi, artifact.bytecode)
}
const factory__L1_ERC20 = factory('ERC20')
const factory__L2_ERC20 = factory('L2StandardERC20', true)
const factory__L1StandardBridge = factory('OVM_L1StandardBridge')
const factory__L2StandardBridge = factory('OVM_L2StandardBridge', true)

describe(`L1 to L2 Deposit`, () => {
  
  // Set up our RPC provider connections.
  const l1RpcProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:9545')
  const l2RpcProvider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

  // L1 standard bridge address depends on the deployment, this is default for our local deployment.
  const L1StandardBridgeAddress = '0x851356ae760d987E095750cCeb3bC6014560891C'
  // L2 standard bridge address is always the same.
  const L2StandardBridgeAddress = '0x4200000000000000000000000000000000000010'
  
  // L1 messenger address depends on the deployment, this is default for our local deployment.
  const l1MessengerAddress = '0x59b670e9fA9D0A427751Af201D676719a970857b'
  // L2 messenger address is always the same.
  const l2MessengerAddress = '0x4200000000000000000000000000000000000007'

  const L1Wallet = "0x0f2b8a26f2ddec8444c0ca412659a338d46d05963b72a72ccee34552e611269f"
  const Proxy__OVM_L1StandardBridgeAddress = "0x95c3b9448A9B5F563e7DC47Ac3e4D6fF0F9Fad93"

  const L1StandardERC20 = new ethers.Contract(
    Proxy__OVM_L1StandardBridgeAddress,
    L1StandardERC20Json.abi,
    L1Wallet,
  )

  // const depositTxStatus = await L1StandardERC20.depositERC20(
  //   L1ERC20.address,
  //   // "0xaEAdE81928dA4CDDF89634ee2BeF6957D98B58fD",
  //   L2ERC20.address,
  //   // "0xE1C45b9B10c1210B22d635462AE30D338c657941",
  //   ethers.utils.parseEther('100'),
  //   9999999,
  //   ethers.utils.formatBytes32String(new Date().getTime().toString())
  // )
  // await depositTxStatus.wait()
  async () => {
    try {
  const depositTxStatus = await L1StandardERC20.depositETH(
    9999999,
    ethers.utils.formatBytes32String(new Date().getTime().toString()),
    { value: ethers.utils.parseEther('0.1') }
  )
  await depositTxStatus.wait()

  const [l1ToL2msgHash] = await watcher.getMessageHashesFromL1Tx(
    depositTxStatus.hash
  )
  console.log(' got L1->L2 message hash', l1ToL2msgHash)
  const l2Receipt = await watcher.getL2TransactionReceipt(
    l1ToL2msgHash
  )
  console.log(' completed Deposit! L2 tx hash:', l2Receipt.transactionHash)
  } catch(error) {
    console.log(error)
    return false
   }
  }







//   // Constructor arguments for `ERC20.sol`
//   const INITIAL_SUPPLY = 1234
//   const L1_ERC20_NAME = 'L1 ERC20'
//   const L1_ERC20_SYMBOL = 'L1 ERC20'

//   // L1 standard bridge address depends on the deployment, this is default for our local deployment.
//   const L1StandardBridgeAddress = '0x851356ae760d987E095750cCeb3bC6014560891C'
//   // L2 standard bridge address is always the same.
//   const L2StandardBridgeAddress = '0x4200000000000000000000000000000000000010'
//   // L1 messenger address depends on the deployment, this is default for our local deployment.
//   const l1MessengerAddress = '0x59b670e9fA9D0A427751Af201D676719a970857b'
//   // L2 messenger address is always the same.
//   const l2MessengerAddress = '0x4200000000000000000000000000000000000007'

//   const L2_ERC20_NAME = 'L2 ERC20'
//   const L2_ERC20_SYMBOL = 'L2 ERC20'

//   // Set up our wallets (using a default private key with 10k ETH allocated to it).
//   // Need two wallets objects, one for interacting with L1 and one for interacting with L2.
//   // Both will use the same private key.
//   const key = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
//   const l1Wallet = new ethers.Wallet(key, l1RpcProvider)
//   const l2Wallet = new ethers.Wallet(key, l2RpcProvider)

//   // Tool that helps watches and waits for messages to be relayed between L1 and L2.
//   const watcher = new Watcher({
//     l1: {
//       provider: l1RpcProvider,
//       messengerAddress: l1MessengerAddress
//     },
//     l2: {
//       provider: l2RpcProvider,
//       messengerAddress: l2MessengerAddress
//     }
//   })

//   const L1StandardBridge = factory__L1StandardBridge.connect(l1Wallet).attach(L1StandardBridgeAddress)
//   const L2StandardBridge = factory__L2StandardBridge.connect(l2Wallet).attach(L2StandardBridgeAddress)
//   let L1_ERC20, L2_ERC20, L1GasLimit = 9999999, L2GasLimit = 9999999;

//   before(`deploy contracts`, async () => {
//     // Deploy an ERC20 token on L1.
//     L1_ERC20 = await factory__L1_ERC20.connect(l1Wallet).deploy(
//       INITIAL_SUPPLY,
//       L1_ERC20_NAME,
//       L1_ERC20_SYMBOL,
//       {
//         gasPrice: 0
//       }
//     )

//     await L1_ERC20.deployTransaction.wait()

//     // Deploy the paired ERC20 token to L2.
//     L2_ERC20 = await factory__L2_ERC20.connect(l2Wallet).deploy(
//       L2StandardBridgeAddress,
//       L1_ERC20.address,
//       L2_ERC20_NAME,
//       L2_ERC20_SYMBOL,
//       {
//         gasPrice: 0
//       }
//     )

//     await L2_ERC20.deployTransaction.wait()
//   })

//   describe('Initialization and initial balances', async () => {
//     it(`should have initial L1 balance of 1234 and initial L2 balance of 0`, async () => {
//       const l1Balance = await L1_ERC20.balanceOf(l1Wallet.address)
//       const l2Balance = await L2_ERC20.balanceOf(l1Wallet.address)
//       expect(l1Balance).to.eq(1234)
//       expect(l2Balance).to.eq(0)
//     })
//   })

//   describe('L1 to L2 deposit', async () => {
//     let l1Tx1

//     it(`should approve 1234 tokens for ERC20 bridge`, async () => {
//       const tx = await L1_ERC20.approve(L1StandardBridge.address, 1234)
//       await tx.wait()
//       const txHashPrefix = tx.hash.slice(0, 2)
//       expect(txHashPrefix).to.eq('0x')
//     })

//     it(`should deposit 1234 tokens into L2 ERC20`, async () => {
//       l1Tx1 = await L1StandardBridge.depositERC20(
//         L1_ERC20.address,
//         L2_ERC20.address,
//         1234,
//         L2GasLimit,
//         ethers.utils.formatBytes32String('0'),
//         { gasPrice: 0 }
//       )
//       await l1Tx1.wait()
//       const txHashPrefix = l1Tx1.hash.slice(0, 2)
//       expect(txHashPrefix).to.eq('0x')
//     })

//     it(`should relay deposit message to L2`, async () => {
//       // Wait for the message to be relayed to L2.
//       const [ msgHash1 ] = await watcher.getMessageHashesFromL1Tx(l1Tx1.hash)
//       const l2TxReceipt = await watcher.getL2TransactionReceipt(msgHash1)
//       expect(l2TxReceipt.to).to.eq(l2MessengerAddress)
//     })

//     it(`should have changed L1 balance to 0 and L2 balance to 1234`, async () => {
//       const l1Balance = await L1_ERC20.balanceOf(l1Wallet.address)
//       const l2Balance = await L2_ERC20.balanceOf(l1Wallet.address)
//       expect(l1Balance).to.eq(0)
//       expect(l2Balance).to.eq(1234)
//     })
//   })

//   describe('L2 to L1 withdrawal', async () => {
//     let l2Tx1

//     it(`should approve 1234 tokens for ERC20 bridge`, async () => {
//       const tx = await L2_ERC20.approve(L2StandardBridge.address, 1234)
//       await tx.wait()
//       const txHashPrefix = tx.hash.slice(0, 2)
//       expect(txHashPrefix).to.eq('0x')
//     })

//     it(`should withdraw tokens back to L1 ERC20 and relay the message`, async () => {
//       // Burn the tokens on L2 and ask the L1 contract to unlock on our behalf.
//       l2Tx1 = await L2StandardBridge.withdraw(
//         L2_ERC20.address,
//         1234,
//         L1GasLimit,
//         ethers.utils.formatBytes32String('0'),
//         { gasPrice: 0 }
//       )
//       await l2Tx1.wait()
//       const txHashPrefix = l2Tx1.hash.slice(0, 2)
//       expect(txHashPrefix).to.eq('0x')
//     })

//     it(`should relay withdrawal message to L1`, async () => {
//       const [ msgHash2 ] = await watcher.getMessageHashesFromL2Tx(l2Tx1.hash)
//       const l1TxReceipt = await watcher.getL1TransactionReceipt(msgHash2)
//       expect(l1TxReceipt.to).to.eq(l1MessengerAddress)
//     })

//     it(`should have changed L1 balance back to 1234 and L2 balance back to 0`, async () => {
//       const l1Balance = await L1_ERC20.balanceOf(l1Wallet.address)
//       const l2Balance = await L2_ERC20.balanceOf(l1Wallet.address)
//       expect(l1Balance).to.eq(1234)
//       expect(l2Balance).to.eq(0)
//     })
//   })
// })
