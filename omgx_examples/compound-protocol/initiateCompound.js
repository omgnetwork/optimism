const {ethers} = require('ethers');
const Timelock = require('./build-ovm/Timelock.json');
const GovernorBravoDelegate = require('./build-ovm/GovernorBravoDelegate.json');
const GovernorBravoDelegator = require('./build-ovm/GovernorBravoDelegator.json');
const Comp = require('./build-ovm/Comp.json');
const addresses = require('./networks/rinkeby-boba.json');
require('dotenv').config();
const env = process.env;
const compAddress = addresses.Comp;
const timelockAddress = addresses.Timelock;
const governorBravoDelegateAddress = addresses.GovernorBravoDelegate;
const governorBravoDelegatorAddress = addresses.GovernorBravoDelegator;


const sleep = (timeout) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, timeout)
    })
  }

async function getTimestamp(web3URL, chainID){
    let provider = new ethers.providers.JsonRpcProvider(web3URL, { chainId: chainID });
    let blockNumber = await provider.getBlockNumber();
    let block = await provider.getBlock(blockNumber);
    return block.timestamp;
}


async function main(){


    const l2_provider = new ethers.providers.JsonRpcProvider(env.L2_NODE_WEB3_URL, { chainId: 28 });
    const wallet1 = new ethers.Wallet(env.privateKey1, l2_provider);

    // const comp = new ethers.Contract(compAddress , Comp.abi , wallet1);
    const governorBravoDelegate = new ethers.Contract(governorBravoDelegateAddress , GovernorBravoDelegate.abi , wallet1);
    const timelock = new ethers.Contract(timelockAddress, Timelock.abi, wallet1);
    const governorBravoDelegator = new ethers.Contract(governorBravoDelegatorAddress, GovernorBravoDelegator.abi, wallet1);


    const governorBravo = await governorBravoDelegate.attach(
        governorBravoDelegator.address
    );

    var blockNumber = await l2_provider.getBlockNumber();
    var block = await l2_provider.getBlock(blockNumber);
    var eta = block.timestamp + 300;
    var setPendingAdminData = ethers.utils.defaultAbiCoder.encode(
    ['address'],
    [governorBravoDelegator.address]
    );
    console.log("-----------Initiating Compound-----------\n");
    console.log("Current Time: ", block.timestamp);
    console.log("Time at which transaction can be executed:", eta);

    console.log(
    '\n\n\n-----------queueing setPendingAdmin-----------\n'
    );
    await timelock.queueTransaction(
    timelock.address,
    0,
    'setPendingAdmin(address)',
    setPendingAdminData,
    eta
    );
    console.log('queued setPendingAdmin');
    console.log('execute setPendingAdmin');

    // let currTimestamp = await getTimestamp(env.L2_NODE_WEB3_URL, 28);
    // while(eta > currTimestamp){
    //     console.log("It is not yet time to execute the proposal.Timestamp: ", currTimestamp);
    //     await sleep(120 * 1000);
    //     currTimestamp = await getTimestamp(env.L2_NODE_WEB3_URL, 28);
    // }
    // await timelock.executeTransaction(
    //     timelock.address,
    //     0,
    //     'setPendingAdmin(address)',
    //     setPendingAdminData,
    //     eta
    // );
    // console.log('executed setPendingAdmin')
    await sleep(250 * 1000);
    for(let i = 0; i < 30; i++){
      console.log(`Attempt: ${i + 1}`)
      console.log(`\tTimestamp: ${await getTimestamp(env.L2_NODE_WEB3_URL, 28)}`);
      try{
        await timelock.executeTransaction(
          timelock.address,
          0,
          'setPendingAdmin(address)',
          setPendingAdminData,
          eta
        );
        console.log('\texecuted setPendingAdmin')
        break;
      }catch(error){
        // if(error.message === `execution reverted: Timelock::executeTransaction: Transaction hasn't surpassed time lock.`){
            console.log("\tTransaction hasn't surpassed time lock\n");
        // }else{
        //   throw error;
        // }
      }
      await sleep(15 * 1000);
    }

    console.log(
    '\n\n\n-----------queueing initiate-----------\n'
    );

    blockNumber = await l2_provider.getBlockNumber();
    block = await l2_provider.getBlock(blockNumber);
    eta = block.timestamp + 300
    var initiateData = ethers.utils.defaultAbiCoder.encode(
    ['bytes'],
    [[]]
    );

    console.log("Current Time: ", block.timestamp);
    console.log("Time at which transaction can be executed:", eta);

    await timelock.queueTransaction(
    governorBravo.address,
    0,
    '_initiate()',
    initiateData,
    eta
    );
    console.log('queued initiate');
    console.log('execute initiate');
    // while(eta > currTimestamp){
    //     console.log("It is not yet time to execute the proposal.Timestamp: ", currTimestamp);
    //     await sleep(120 * 1000);
    //     currTimestamp = await getTimestamp(env.L2_NODE_WEB3_URL, 28);
    // }
    // await timelock.executeTransaction(
    //     governorBravo.address,
    //     0,
    //     '_initiate()',
    //     initiateData,
    //     eta
    // )
    // console.log('Executed initiate');
    await sleep(250 * 1000);
    for(let i = 0; i < 30; i++ ){
        console.log(`Attempt: ${i + 1}`);
        console.log(`\tTimestamp: ${await getTimestamp(env.L2_NODE_WEB3_URL, 28)}`);
        try{
            await timelock.executeTransaction(
                governorBravo.address,
                0,
                '_initiate()',
                initiateData,
                eta
            );
            console.log('Executed initiate');
            break;
        }catch(error){
            // if(error.message === `execution reverted: Timelock::executeTransaction: Transaction hasn't surpassed time lock.`){
                console.log("\tTransaction hasn't surpassed time lock\n");
            // }else{
            //   throw error;
            // }
        }
        await sleep(15 * 1000);
    }
}

(async () =>{
    try{
        await main();
    }catch(error){
        console.log(error);
    }
})();