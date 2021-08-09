const { ethers } = require("ethers");

module.exports = async function (deployer) {
  const Comp = artifacts.require("Comp");
  const Timelock = artifacts.require("Timelock");
  const GovernorBravoDelegate = artifacts.require("GovernorBravoDelegate");
  const GovernorBravoDelegator = artifacts.require("GovernorBravoDelegator");

  const user = "0x21A235cf690798ee052f54888297Ad8F46D3F389";

  // Deploy Comp
  await deployer.deploy(Comp, user);
  const comp = await Comp.deployed();

  // Deploy Timelock
  await deployer.deploy(Timelock, user, 0);
  const timelock = await Timelock.deployed();

  // Deploy GovernorBravoDelegate
  await deployer.deploy(GovernorBravoDelegate);
  const delegate = await GovernorBravoDelegate.deployed();

  // Deploy GovernorBravoDelegator
  await deployer.deploy(
    GovernorBravoDelegator,
    timelock.address,
    comp.address,
    user,
    delegate.address,
    5760,
    5760,
    ethers.utils.parseEther("100000")
  );
  const delegator = await GovernorBravoDelegator.deployed();

  // Set Delegator as pending admin
  const provider = new ethers.providers.JsonRpcProvider('http://rinkeby.omgx.network');
  let blockNumber = await provider.getBlockNumber();
  let block = await provider.getBlock(blockNumber);
  const eta = block.timestamp + 3;
  console.log(`eta: ${eta}`);
  const data = ethers.utils.defaultAbiCoder.encode(
    ["address"],
    [delegator.address]
  );
  await timelock.queueTransaction(
    timelock.address,
    0,
    "setPendingAdmin(address)",
    data,
    eta
  );

  // Wait for timelock delay
  const sleep = (timeout) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, timeout);
    });
  };
  console.log("Waiting for timelock...");
  await sleep(100000);
  blockNumber = await provider.getBlockNumber();
  block = await provider.getBlock(blockNumber);
  console.log(`Current timestamp: ${block.timestamp}`);
  console.log(`Data: ${data}`);
  console.log(`Timelock addres ${timelock.address}`);
  console.log(`Delegator address: ${delegator.address}`);


  // Execute transaction
  await timelock.executeTransaction(
    timelock.address,
    0,
    "setPendingAdmin(address)",
    data,
    eta
  );

  // Initiate GovernorBravo
  const GovernorBravo = await GovernorBravoDelegate.at(delegator.address);
  GovernorBravo._initiate();
};
