import { Wallet, providers, ethers} from 'ethers'
import L1StandardBridgeJson from '../artifacts/contracts/OVM_L1StandardBridge.sol/OVM_L1StandardBridge.json'
import { getContractFactory } from '@eth-optimism/contracts'

require('dotenv').config()
const Proxy__OVM_L1StandardBridgeAddress = process.env.Proxy__OVM_L1StandardBridgeAddress;

import { Watcher } from '@eth-optimism/watcher'
// import { JsonRpcProvider } from 'ethers/providers'



 const main = async () => {

  const watcher = new Watcher({
    l1: {
      provider: new providers.JsonRpcProvider(process.env.L1_NODE_WEB3_URL),
      messengerAddress: '0x0C1E0c73A48e7624DB86bc5234E7E3188cb7b47e'
    },
    l2: {
      provider: new providers.JsonRpcProvider(process.env.L2_NODE_WEB3_URL),
      messengerAddress: '0x4200000000000000000000000000000000000007'
    }
  })

  console.log(`L1Provider: ${process.env.L1_NODE_WEB3_URL}`)
  const l1Provider = new providers.JsonRpcProvider(process.env.L1_NODE_WEB3_URL)
  const l2Provider = new providers.JsonRpcProvider(process.env.L2_NODE_WEB3_URL)

  const L1Wallet = new Wallet(process.env.DEPLOYER_PRIVATE_KEY, l1Provider)

  const L1StandardBridge = new ethers.Contract(
      '0x95c3b9448A9B5F563e7DC47Ac3e4D6fF0F9Fad93',
      L1StandardBridgeJson.abi,
      L1Wallet,
  )

  // const depositTxStatus = await L1StandardBridge.depositERC20(
  //   L1ERC20.address,
  //   // "0xaEAdE81928dA4CDDF89634ee2BeF6957D98B58fD",
  //   L2ERC20.address,
  //   // "0xE1C45b9B10c1210B22d635462AE30D338c657941",
  //   ethers.utils.parseEther('100'),
  //   9999999,
  //   ethers.utils.formatBytes32String(new Date().getTime().toString())
  // )
  // await depositTxStatus.wait()

  const depositTxStatus = await L1StandardBridge.depositETH(
    9999999,
    ethers.utils.formatBytes32String(new Date().getTime().toString()),
    { value: ethers.utils.parseEther('3.0') }
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




}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(
      JSON.stringify({ error: error.message, stack: error.stack }, null, 2)
    )
    process.exit(1)
  })