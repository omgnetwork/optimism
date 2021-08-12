import React from 'react'
import { ethers, Contract } from 'ethers'
import getBlockchain from '../../services/ethereum'
import './ProposalCard.css'

class ProposalCard extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			proposal: null,
			state: '',
			actions: null,
			show: false,
			signerAddress: '',
		}
	}

	getProposal = async (i) => {
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
		const GovernorBravo = this.props.GovernorBravo
		const proposal = await GovernorBravo.proposals(i)
		const index = await GovernorBravo.state(i)
		const actions = await GovernorBravo.getActions(i)
		const signerAddress = await this.props.signer.getAddress()
		this.setState({ state: proposalStates[index] })
		this.setState({ proposal })
		this.setState({ actions })
		this.setState({ signerAddress })
	}

	async componentDidMount() {
		await this.getProposal(this.props.id)
	}

	makeSymbol(state) {
		switch (state) {
			case 'Pending':
				return <p>&#8230;</p>
			case 'Active':
				return <p>Active</p>
			case 'Canceled':
				return <p>&#10006;</p>
			case 'Defeated':
				return <p>&#9760;</p>
			case 'Succeeded':
				return <p>&#10004;</p>
			case 'Queued':
				return <p>Queued</p>
			case 'Expired':
				return <p>Expired</p>
			case 'Executed':
				return <p>&#10004;</p>
		}
	}

	getVotingStatus() {
		const { forVotes, againstVotes } = this.state.proposal
	}

	handleShow() {
		this.setState({ show: !this.state.show })
	}

	async vote(vote) {
		const GovernorBravo = this.props.GovernorBravo
		await GovernorBravo.castVote(this.props.id, vote)
	}

	async queue() {
		const GovernorBravo = this.props.GovernorBravo
		await GovernorBravo.queue(this.props.id)
	}

	async execute() {
		const GovernorBravo = this.props.GovernorBravo
		await GovernorBravo.execute(this.props.id)
	}

	async cancel() {
		const GovernorBravo = this.props.GovernorBravo
		await GovernorBravo.cancel(this.props.id)
	}

	getTargets(targets) {
		console.log('HERE')
		const { comp, delegate, delegator, timelock, GovernorBravo } = this.props
		console.log(targets)
		var targetHTML = []
		for (var i = 0; i < targets.length; i++) {
			console.log(targets[i])
			console.log(comp.address)
			switch (targets[i]) {
				case comp.address:
					var link = `https://blockexplorer.rinkeby.omgx.network/address/${comp.address}`
					targetHTML.push(<a href={link}>Targets: BOBA</a>)
				case delegate.address:
					var link = `https://blockexplorer.rinkeby.omgx.network/address/${delegate.address}`
					targetHTML.push(<a href={link}>Targets: GovernorBravoDelegate</a>)

				case delegator.address:
					var link = `https://blockexplorer.rinkeby.omgx.network/address/${delegator.address}`
					targetHTML.push(<a href={link}>Targets: GovernorBravoDelegator</a>)

				case timelock.address:
					var link = `https://blockexplorer.rinkeby.omgx.network/address/${timelock.address}`
					targetHTML.push(<a href={link}>Targets: Timelock</a>)
			}
		}
		return targetHTML
	}

	getDate(endBlock) {
		var link = `https://rinkeby.etherscan.io/block/countdown/${endBlock}`
		return <a href={link}>Voting Ends On</a>
	}

	proposalActions(state) {
		if (state == 'Active') {
			return (
				<div>
					<h2>Cast Vote</h2>
					<button className="forVotes" onClick={() => this.vote(1)}>
						For
					</button>
					<button className="againstVotes" onClick={() => this.vote(0)}>
						Against
					</button>
					<button className="abstain" onClick={() => this.vote(2)}>
						Abstain
					</button>
				</div>
			)
		} else if (state == 'Succeeded') {
			return (
				<div>
					<h2>Queue</h2>
					<button onClick={() => this.queue()}>Queue</button>
				</div>
			)
		} else if (state == 'Queued') {
			return (
				<div>
					<h2>Queue</h2>
					<button onClick={() => this.execute()}>Execute</button>
				</div>
			)
		}
	}

	cancelProposal(proposer) {
		if (this.state.signerAddress == proposer) {
			return (
				<div>
					<h2>Cancel</h2>
					<button onClick={() => this.cancel()}>Cancel</button>
				</div>
			)
		}
	}

	render() {
		if (this.state.actions !== null) {
			const {
				abstainVotes,
				againstVotes,
				canceled,
				endBlock,
				eta,
				executed,
				forVotes,
				id,
				proposer,
				startBlock,
			} = this.state.proposal
			const state = this.state.state
			const { signatures, calldatas, targets } = this.state.actions
			return (
				<>
					<div className="proposal-card">
						<div className="proposal-content">
							<div className="proposal-title">
								{signatures[0]}
								{parseInt(calldatas[0], 16) / 1000000000000000000}
							</div>
							<div className="proposal-details">
								<div className="proposal-voting-state">
									For Votes:
									{ethers.utils.formatEther(forVotes).toLocaleString()}
								</div>
								<div className="proposal-against-votes">
									Against Votes:{' '}
									{ethers.utils.formatEther(againstVotes).toLocaleString()}
								</div>
								<div className="proposal-abstain-votes">
									Abstain Votes:{' '}
									{ethers.utils.formatEther(abstainVotes).toLocaleString()}
								</div>
								<div className="proposal-text-details">
									<span>{id.toString()}</span>
									<span> • </span>
									<span>{this.getDate(endBlock.toString())}</span>
								</div>
							</div>
						</div>
						<div className="proposal-state" onClick={() => this.handleShow()}>
							{this.makeSymbol(state)}
						</div>
					</div>

					{this.state.show ? (
						<div>
							{
								<>
									<div className="modal">
										<div className="castVotes">
											<h2>Actions</h2>
											<div className="actions">
												{signatures} <br /> {calldatas} <br />
												{this.getTargets(targets)} <br />
											</div>

											{this.proposalActions(state)}

											<div>{this.cancelProposal(proposer)}</div>

											<button
												className="close"
												onClick={() => this.handleShow()}
											>
												x
											</button>
										</div>
									</div>
									<div className="tint" />
								</>
							}
						</div>
					) : null}
				</>
			)
		}
		return null
	}
}

export default ProposalCard
