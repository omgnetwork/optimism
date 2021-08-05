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