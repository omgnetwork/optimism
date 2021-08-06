module.exports = async function main(callback) {
	try {
		// deployer.then(async () => {
		// 	await deployer.deploy(GovernorBravoDelegate)
		// 	await deployer.deploy(SafeMath)
		// 	await deployer.deploy(Comp, adminAddress)
		// 	await deployer.deploy(Timelock, adminAddress, 172800)
		// 	await deployer.deploy(
		// 		GovernorBravoDelegator,
		// 		Timelock.address,
		// 		Comp.address,
		// 		Timelock.address,
		// 		GovernorBravoDelegate.address,
		// 		17280,
		// 		1,
		// 		'100000000000000000000000'
		// 	)
		// })

		const GovernorBravoDelegate = artifacts.require('GovernorBravoDelegate')
		const governorBravoDelegate = await GovernorBravoDelegate.deployed()
		const GovernorBravoDelegator = artifacts.require('GovernorBravoDelegator')
		const governorBravoDelegator = await GovernorBravoDelegator.deployed()
		const Comp = artifacts.require('Comp')
		const comp = await Comp.deployed()
		const SafeMath = artifacts.require('SafeMath')
		const safeMath = await SafeMath.deployed()
		const Timelock = artifacts.require('Timelock')
		const timelock = await Timelock.deployed()

		const accounts = await web3.eth.getAccounts()
		const value = await comp.balanceOf(accounts[0])
		let addresses = [governorBravoDelegate.address]
		let values = [0]
		let signatures = ['_setProposalThreshold(uint256)']
		let calldatas = [
			'0x000000000000000000000000000000000000000000000dc3a8351f3d86a00000',
		]
		let description = 'Testing out a proposal'
		console.log(
			`Proposing @ address GovernorBravoDelegate: ${addresses} \nValues: ${values}\nSignatures: ${signatures}\nCalldatas: ${calldatas}`
		)
		console.log(description)
		// console.log('initialized')
		await governorBravoDelegate.initialProposalId.call(function (err, res) {
			console.log('initialProposalId: ', res.toString())
		})

		comp.delegate(accounts[0])
		const accountNonce =
			'0x' +
			((await web3.eth.getTransactionCount(accounts[0])) + 1).toString(16)

		console.log(accountNonce)

		console.log('votes: ', (await comp.getCurrentVotes(accounts[0])).toString())
		await governorBravoDelegate.propose(
			addresses,
			values,
			signatures,
			calldatas,
			description,
			{ nonce: accountNonce }
		)

		// await comp.delegate(accounts[0])
		// console.log((await comp.getCurrentVotes(accounts[0])).toString())
		// await governorBravoDelegate.proposalThreshold.call(function (err, res) {
		// 	console.log('Proposal Threshold after: ', res.toString())
		// })

		// await governorBravoDelegate.proposalCount.call(function (err, res) {
		// 	if (err) {
		// 		console.log(err)
		// 	}
		// 	console.log('Proposal Count', res)
		// })

		// await governorBravoDelegate.initialProposalId.call(function (err, res) {
		// 	if (err) {
		// 		console.log(err)
		// 	}
		// 	console.log('Initial proposal ID', res)
		// })

		console.log(JSON.stringify(await governorBravoDelegate.getActions(1)))
		// console.log('done :)')
	} catch (error) {
		console.log(error)
		callback(1)
	}
}
