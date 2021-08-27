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


const sleep = async (timeout) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve()
		}, timeout)
	})
}

async function main(){

    const l2_provider = new ethers.providers.JsonRpcProvider(env.L2_NODE_WEB3_URL, { chainId: 28 });

    const wallet1 = new ethers.Wallet(env.privateKey1, l2_provider);

    // const comp = new ethers.Contract(compAddress , Comp.abi , wallet1);
    const governorBravoDelegate = new ethers.Contract(governorBravoDelegateAddress , GovernorBravoDelegate.abi , wallet1);
    const timelock = new ethers.Contract(timelockAddress, Timelock.abi, wallet1);

    const governorBravoDelegator = new ethers.Contract(governorBravoDelegatorAddress, GovernorBravoDelegator.abi, wallet1);

    const comp = new ethers.Contract(compAddress, Comp.abi, wallet1);

    const governorBravo = await governorBravoDelegate.attach(
        governorBravoDelegator.address
    )
    const proposalStates = [
        'Pending',
        'Active',
        'Canceled',
        'Defeated',
        'Succeeded',
        'Queued',
        'Expired',
        'Executed',
    ]

    const value = await comp.balanceOf(wallet1.address)
    console.log('Comp power: ', value.toString())
    let addresses = [governorBravo.address]
    let values = [0]
    let signatures = ['_setProposalThreshold(uint256)']
    let calldatas = [ethers.utils.defaultAbiCoder.encode(
        ['uint256'],
        [65000]
    )]
    let description = '#Changing Proposal Threshold to 65000 Comp'

    await comp.delegate(wallet1.address)

    console.log(
        'current votes: ',
        (await comp.getCurrentVotes(wallet1.address)).toString()
    )

    await sleep(500)

    // THIS SECTION DOES ALL THE PROPOSING LOGIC YOU NEED TO
    // MAKE SURE THAT YOU'RE ONLY CALLING ONE OF THESE AT A TIME

    // DO THIS FIRST

    // await governorBravo.cancel(2);
    // return;
    const proposalID = await governorBravo.propose(
    	addresses,
    	values,
    	signatures,
    	calldatas,
    	description
    )
    console.log('proposed')

    // DO THIS SECOND
    console.log('Proposal ID:', proposalID);

    await governorBravo.castVote(proposalID, 1)
    console.log('vote cast')

    // DO THIS THIRD

    await governorBravo.queue(proposalID)
    console.log('Queued')

    // DO THIS FOURTH

    await governorBravo.execute(proposalID)
    console.log('Executed')

    await sleep(500)

    proposalCount = await governorBravo.proposalCount()
    console.log(proposalCount.toString())

    await governorBravo.proposals.call(proposalID, function (err, res) {
        if (err) {
            console.log('PROPOSALS', err)
        }
        console.log('PROPOSALS', res)
    })

    state = await governorBravo.state(1)
    console.log('State is : ', proposalStates[state])
    console.log(JSON.stringify(await governorBravo.getActions(1)))
    timeStamp = await timelock.exGetBlockTimestamp()
    console.log('Timestamp : ', timeStamp.toString())
    console.log('WEB3 : ', await web3.eth.getBlockNumber())
    const proposalThreshold = await governorBravo.proposalThreshold()
    console.log('Proposal Threshold : ', proposalThreshold.toString())
    const proposalId = await governorBravo.initialProposalId()
    console.log('proposalId : ', proposalId.toString())
}

(async () =>{
    try {
        await main();
    } catch (error) {
        console.log(error)
    }
})();