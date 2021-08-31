
const { ethers } = require('ethers')

const ERC20 = artifacts.require('ERC20')
const CToken = artifacts.require('CToken')
const Timelock = artifacts.require('Timelock')
const GovernorBravoDelegate = artifacts.require('GovernorBravoDelegate')
const GovernorBravoDelegator = artifacts.require('GovernorBravoDelegator')

require('dotenv').config()

module.exports = async function (deployer, network, accounts) {

// module.exports = function(deployer, network, accounts) {
//   deployer.then(async () => {
//   await deployer.deploy(GovernorBravoDelegate);
//   await deployer.deploy(SafeMath);
//   await deployer.deploy(Comp, adminAddress);
//   await deployer.deploy(Timelock, adminAddress, 172800);
//   await deployer.deploy(GovernorBravoDelegator, Timelock.address, Comp.address, Timelock.address, GovernorBravoDelegate.address, 17280, 1, "100000000000000000000000"); 
//   });
// };

  let gasSet = {}

  if( network === 'rinkeby_l2' ) {
    gasSet = {
      gasPrice:  15000000,
      gas: 165000000,
    }
  }

  console.log("network:",network)
  console.log("accounts:",accounts)

  const host = deployer.networks[network].host
  const provider = new ethers.providers.JsonRpcProvider(host)

  // Deploy CToken, Timelock, GovernorBravoDelegate
  await deployer.deploy(CToken, accounts[0])
  const ctoken = await CToken.deployed()
  console.log("ctoken address:", ctoken.address)

  //Let's move some CToken so others can vote
  console.log("Distributing CTokens")
  //from the zeroth, to the first
  //and from the zeroth to the second
  for (let i = 1; i < 3; i++) {
    console.log("Account:",accounts[i])
    await ctoken.transfer(accounts[i], ethers.utils.parseEther("1000000"))
    await ctoken.delegate(accounts[i], { from: accounts[i] })
  }
  //why does this need delegate?
  ctoken.delegate(accounts[0])

  //What does the zero mean?
  await deployer.deploy(Timelock, accounts[0], 0) //Increase Timelock
  const timelock = await Timelock.deployed()
  console.log("timelock address:", timelock.address)

  await deployer.deploy(GovernorBravoDelegate, gasSet)

  const delegate = await GovernorBravoDelegate.deployed()
  console.log("delegate address:", delegate.address)

  // constructor(
  //   address timelock_,
  //   address ctoken_,
  //   address admin_,
  //   address implementation_,
  //   uint votingPeriod_,
  //   uint votingDelay_,
  //   uint proposalThreshold_) public {

  // Deploy GovernorBravoDelegator
  await deployer.deploy(
    GovernorBravoDelegator,
    timelock.address,
    ctoken.address,
    accounts[0],
    delegate.address,
    3, // uint votingPeriod_ in minutes - normally a few days such as 60*24*4
    1, // uint votingDelay_ in minutes
    ethers.utils.parseEther("100000") //How did you chose this value?
  );
  const delegator = await GovernorBravoDelegator.deployed();

  console.log("delegator address:", delegator.address)

  // Set Delegator as pending admin
  let blockNumber = await provider.getBlockNumber()
  let block = await provider.getBlock(blockNumber)
  let eta = block.timestamp + 3 //basically, wait for three seconds?
  
  console.log("Block:", block)
  console.log("ETA:", eta)

  const data = ethers.utils.defaultAbiCoder.encode(
    ["address"],
    [delegator.address]
  );

  // module.exports = function(deployer, network, accounts) {
  //   deployer.then(async () => {
  //   await deployer.deploy(GovernorBravoDelegate);
  //   await deployer.deploy(SafeMath);
  //   await deployer.deploy(Comp, adminAddress);
  //   await deployer.deploy(Timelock, adminAddress, 172800);
  //   await deployer.deploy(
  //     GovernorBravoDelegator, 
  //     Timelock.address, 
  //     Comp.address, 
  //     Timelock.address, 
  //     GovernorBravoDelegate.address, 
  //     17280, 
  //     1, 
  //     "100000000000000000000000"
  //     ); 
  //   });
  // };

  await timelock.queueTransaction(
    timelock.address,
    0, // What it this?
    "setPendingAdmin(address)",
    data,
    eta,
    gasSet
  )

  const sleep = (timeout) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    })
  }

  console.log("Waiting for timelock...")

  await sleep(10000)

  block = await provider.getBlock(blockNumber)
  console.log("Block.timestamp after the 10s wait:", block.timestamp)

  await timelock.executeTransaction(
    timelock.address,
    0,
    "setPendingAdmin(address)",
    data,
    eta,
  )

  const GovernorBravo = await GovernorBravoDelegate.at(delegator.address);
  GovernorBravo._initiate();

  await GovernorBravo.propose(
    [delegator.address],
    [0],
    ["_setVotingPeriod(uint256)"],
    [ethers.utils.defaultAbiCoder.encode(["uint256"], [7 * 5760])],
    "Increase Voting Period\nGive CToken users more time to vote on proposals"
  )

  await GovernorBravo.propose(
    [delegator.address],
    [0],
    ["_setVotingDelay(uint256)"],
    [ethers.utils.defaultAbiCoder.encode(["uint256"], [2 * 5760])],
    "Increase Voting Delay\nAllow CToken users more time to review proposals",
    { from: accounts[1] }
  )

  await GovernorBravo.castVote(2, 1)
};
