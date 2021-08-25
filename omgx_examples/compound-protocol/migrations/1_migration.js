const { ethers } = require('ethers')

const sleep = (timeout) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, timeout)
  })
}

module.exports = async function (deployer) {
  
  const accounts = await web3.eth.getAccounts()
  
  const Comp = artifacts.require('Comp')
  const Timelock = artifacts.require('Timelock')
  const GovernorBravoDelegate = artifacts.require('GovernorBravoDelegate')
  const GovernorBravoDelegator = artifacts.require('GovernorBravoDelegator')

  const user = accounts[0]
  
  console.log('STARTING HERE')
  console.log(user)
  // Deploy Comp
  await deployer.deploy(Comp, user)
  const comp = await Comp.deployed()
  console.log('deployed comp')

  // Deploy Timelock
  await deployer.deploy(Timelock, user, 0)
  const timelock = await Timelock.deployed()
  console.log('deployed timelock')

  // Deploy GovernorBravoDelegate
  await deployer.deploy(GovernorBravoDelegate)
  const delegate = await GovernorBravoDelegate.deployed()
  console.log('deployed delegate')

  // Deploy GovernorBravoDelegator
  await deployer.deploy(
    GovernorBravoDelegator,
    timelock.address,
    comp.address,
    timelock.address,
    delegate.address,
    10,
    10,
    ethers.utils.parseEther('100000')
  )
  const delegator = await GovernorBravoDelegator.deployed()
  console.log('deployed delegator')

  const GovernorBravo = await GovernorBravoDelegate.at(delegator.address)
  // Set Delegator as pending admin
  var provider = new ethers.providers.JsonRpcProvider()
  var blockNumber = await provider.getBlockNumber()
  var block = await provider.getBlock(blockNumber)
  var eta = block.timestamp + 3
  var data = ethers.utils.defaultAbiCoder.encode(
    ['address'],
    [delegator.address]
  )
  await timelock.queueTransaction(
    timelock.address,
    0,
    'setPendingAdmin(address)',
    data,
    eta
  )

  // Wait for timelock delay

  console.log('Waiting for timelock...')
  await sleep(5000)

  // Execute transaction
  await timelock.executeTransaction(
    timelock.address,
    0,
    'setPendingAdmin(address)',
    data,
    eta
  )

  await sleep(5000)

  blockNumber = await provider.getBlockNumber()
  block = await provider.getBlock(blockNumber)
  eta = block.timestamp + 10

  await timelock.queueTransaction(
    GovernorBravo.address,
    0,
    '_initiate()',
    0,
    eta
  )

  await sleep(5000)

  await timelock.executeTransaction(
    GovernorBravo.address,
    0,
    '_initiate()',
    0,
    eta
  )

  // Initiate GovernorBravo

  console.log('HERE')
}
