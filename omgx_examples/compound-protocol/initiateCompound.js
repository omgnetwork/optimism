const {ethers} = require('ethers');
const Timelock = require('./build-ovm/Timelock.json');
const GovernorBravoDelegate = require('./build-ovm/GovernorBravoDelegate.json');
const GovernorBravoDelegator = require('./build-ovm/GovernorBravoDelegator.json');
const Comp = require('./build-ovm/Comp.json');
require('dotenv').config();
const env = process.env;
const compAddress = '0x60ddAa9c4926705F8ab23565e21eB9e5DF2aBF2c';
const timelockAddress = '0xdfDA22e95116D0c034B3fBBA9838B1E9Bf2cAA17';
const governorBravoDelegateAddress = '0x174e7DC50BCE45fC04671939A8f1762ed6725423';
const governorBravoDelegatorAddress = '0xA8637a094550f49e8A0879de1620Ae2AD1DB8A02';


const sleep = (timeout) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve()
      }, timeout)
    })
  }

async function getTimestamp(web3URL, chainID){
    let provider = new ethers.providers.JsonRpcProvider(web3URL, { chainId: chainID });
    var blockNumber = await provider.getBlockNumber();
    var block = await provider.getBlock(blockNumber);
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
      )

    var blockNumber = await l2_provider.getBlockNumber()
    var block = await l2_provider.getBlock(blockNumber)
    var eta = block.timestamp + 300
    var setPendingAdminData = ethers.utils.defaultAbiCoder.encode(
    ['address'],
    [governorBravoDelegator.address]
    )
    console.log("block.timestamp: ", block.timestamp);
    console.log("eta", eta)

    console.log(
        '\n\n\n---------------------------------------------------\nqueueing setPendingAdmin'
      )
    await timelock.queueTransaction(
    timelock.address,
    0,
    'setPendingAdmin(address)',
    setPendingAdminData,
    eta
    )
    console.log('queued setPendingAdmin')
    console.log('execute setPendingAdmin')
    for(let i = 0; i < 30; i++){
      await sleep(120 * 1000);
      console.log(`Timestamp: ${await getTimestamp(env.L2_NODE_WEB3_URL, 28)}`);
      try{
        await timelock.executeTransaction(
          timelock.address,
          0,
          'setPendingAdmin(address)',
          setPendingAdminData,
          eta
        );
        console.log('executed setPendingAdmin')
        break;
      }catch(error){
        console.log("\n\n\n-----FAILED-----\n\n\n");
        console.log(JSON.stringify(error));
        console.log("\n\n\n-----RETRYING-----\n\n\n");
      }
    }

    console.log(
    '\n\n\n---------------------------------------------------\nqueueing initiate'
    )

    blockNumber = await l2_provider.getBlockNumber()
    block = await l2_provider.getBlock(blockNumber)
    eta = block.timestamp + 300
    var initiateData = ethers.utils.defaultAbiCoder.encode(
    ['bytes'],
    [[]]
    );

    console.log(eta)

    await timelock.queueTransaction(
    governorBravo.address,
    0,
    '_initiate()',
    initiateData,
    eta
    )
    console.log('queued initiate');
    console.log('execute initiate');
    for(let i = 0; i < 15; i++ ){
        await sleep(120 * 1000);
        console.log(`Timestamp: ${await getTimestamp(env.L2_NODE_WEB3_URL, 28)}`);
        try{
            await timelock.executeTransaction(
                governorBravo.address,
                0,
                '_initiate()',
                initiateData,
                eta
            )
            console.log('Executed initiate');
            break;
        }catch(error){
            console.log("\n\n\n-----FAILED-----\n\n\n");
            console.log(JSON.stringify(error));
            console.log("\n\n\n-----RETRYING-----\n\n\n");
        }
    }
}

(async () =>{
    try{
        await main();
    }catch(error){
        console.log(error);
    }
})();