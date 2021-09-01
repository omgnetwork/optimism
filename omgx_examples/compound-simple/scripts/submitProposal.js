const {ethers} = require('ethers');
const Timelock = require('../build-ovm/Timelock.json');
const GovernorBravoDelegate = require('../build-ovm/GovernorBravoDelegate.json');
const GovernorBravoDelegator = require('../build-ovm/GovernorBravoDelegator.json');
const Comp = require('../build-ovm/Comp.json');
const addresses = require('../networks/rinkeby-boba.json');
const BigNumber = require('bignumber.js');
require('dotenv').config();

const env = process.env;
const DECIMALS  = BigInt(10**18);

const compAddress = addresses.Comp;
const timelockAddress = addresses.Timelock;
const governorBravoDelegateAddress = addresses.GovernorBravoDelegate;
const governorBravoDelegatorAddress = addresses.GovernorBravoDelegator;


const sleep = async (timeout) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve()
		}, timeout)
	});
}

async function main(){

    const l2_provider = new ethers.providers.JsonRpcProvider(env.L2_NODE_WEB3_URL, { chainId: 28 });

    const wallet1 = new ethers.Wallet(env.pk_0, l2_provider);

    const governorBravoDelegate = new ethers.Contract(governorBravoDelegateAddress , GovernorBravoDelegate.abi , wallet1);
    const timelock = new ethers.Contract(timelockAddress, Timelock.abi, wallet1);

    const governorBravoDelegator = new ethers.Contract(governorBravoDelegatorAddress, GovernorBravoDelegator.abi, wallet1);

    const comp = new ethers.Contract(compAddress, Comp.abi, wallet1);

    const governorBravo = await governorBravoDelegate.attach(
        governorBravoDelegator.address
    );



    const proposalStates = [
        'Pending',
        'Active',
        'Canceled',
        'Defeated',
        'Succeeded',
        'Queued',
        'Expired',
        'Executed',
    ];

    const value = await comp.balanceOf(wallet1.address);
    console.log('Comp power: ', value.toString());
    let addresses = [governorBravo.address]; // the address of the contract where the function will be called
    let values = [0]; // the eth necessary to send to the contract above
    let signatures = ['_setProposalThreshold(uint256)']; // the function that will carry out the proposal
    let calldatas = [ethers.utils.defaultAbiCoder.encode( // the parameter for the above function
        ['uint256'],
        [DECIMALS * BigInt(65000)] // 65000 * 10^18
    )];
    let description = '#Changing Proposal Threshold to 65000 Comp'; // the description of the proposal

    await comp.delegate(wallet1.address); // delegate votes to yourself

    console.log(
        'current votes: ',
        (await comp.getCurrentVotes(wallet1.address)).toString()
    );

    console.log(`Wait 5 minutes to make sure votes are processed.`);
    // await sleep(300 * 1000);

    // THIS SECTION DOES ALL THE PROPOSING LOGIC YOU NEED TO SUBMIT a Proposal



    // DO THIS FIRST

    console.log(`Proposing`);

    // submitting the proposal
    await governorBravo.propose(
    	addresses,
    	values,
    	signatures,
    	calldatas,
    	description
    );
    sleep(15 * 1000);
    const proposalID = (await governorBravo.proposalCount())._hex;

    await sleep(250 * 1000);
    // DO THIS SECOND
    console.log(`Casting Votes`);
    await sleep(250 * 1000);

    for(let i = 0; i < 30; i++){
        await sleep(15 * 1000);
        console.log(`Attempt: ${i + 1}`);
        try{
            await governorBravo.castVote(proposalID, 1);
            console.log('Success: vote cast')
            break;
        }catch(error){
            if(i == 29){
                await governorBravo.cancel(proposalID);
                console.log(`Proposal failed and has been canceled, please try again`);
                console.log(error);
                return;
            }
            console.log("\tVoting is closed\n");
        }
    }






    // DO THIS THIRD


    console.log(`Queuing Proposal`);
    await sleep(250 * 1000);

    for(let i= 0; i < 30; i++){
        console.log(`Attempt: ${i + 1}`);
        await sleep(15 * 1000)
        try{
            await governorBravo.queue(proposalID);
            console.log('Success: Queued');
            break;
        }catch(error){
            if(i == 29){
                await governorBravo.cancel(proposalID);
                console.log(`Proposal failed and has been canceled, please try again`);
                console.log(error);
                return;
            }
            console.log(`\tproposal can only be queued if it is succeeded`);
        }
    }


    console.log(`Executing Proposal`);
    await sleep(250 * 1000);
    // DO THIS FOURTH
    for(let i= 0; i < 30; i++){
        await sleep(15 * 1000);
        console.log(`Attempt: ${i + 1}`);
        try{
            await governorBravo.execute(proposalID);
            console.log('Success: Executed');
            break;
        }catch(error){
            if(i == 29){
                await governorBravo.cancel(proposalID);
                console.log(`Proposal failed and has been canceled, please try again`);
                console.log(error)
                return;
            }

            console.log(`\tproposal can only be executed if it is queued`);
        }
    }


    await sleep(500)

    proposalCount = await governorBravo.proposalCount();
    console.log(proposalCount.toString());
    const proposal = await governorBravo.proposals(proposalID)
    console.log(proposal);
    state = await governorBravo.state(proposalID);
    console.log('State is : ', proposalStates[state]);
    console.log(JSON.stringify(await governorBravo.getActions(proposalID)));
    timeStamp = await timelock.exGetBlockTimestamp();
    console.log('Timestamp : ', timeStamp.toString());
    console.log('BlockNum : ', await l2_provider.getBlockNumber());
    const proposalThreshold = BigInt(await governorBravo.proposalThreshold());
    console.log('Proposal Threshold : ', proposalThreshold.toString());
    console.log('proposalId : ', proposalID.toString());
}

(async () =>{
    try {
        await main();
    } catch (error) {
        console.log(error)
    }
})();