const { ethers } = require('ethers')

require('dotenv').config()
const env = process.env

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
    10, // the duration of the voting period in blocks
    10, // the duration of the time between when a proposal is proposed and when the voting period starts
    ethers.utils.parseEther('100000')
  )
  await GovernorBravoDelegator.deployed()
  console.log('deployed delegator')
}
