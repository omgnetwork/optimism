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
  await deployer.deploy(Timelock, user, 172800)
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
    17280,
    1,
    '100000000000000000000000'
  )
  const delegator = await GovernorBravoDelegator.deployed()
  console.log('deployed delegator')

  const GovernorBravo = await GovernorBravoDelegate.at(delegator.address)

  // Initiate GovernorBravo

  console.log('HERE')
}
