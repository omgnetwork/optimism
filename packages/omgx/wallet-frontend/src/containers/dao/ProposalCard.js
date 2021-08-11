import React from 'react'
import { ethers, Contract } from 'ethers'
import getBlockchain from '../../services/ethereum'

class ProposalCard extends React.Component {
	constructor(props) {
		super(props)
		this.state = { proposal: null, state: '' }
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
		console.log(index)
		// this.setState({ state: proposalStates[index] })
		this.setState({ proposal })
	}

	async componentDidMount() {
		await this.getProposal(this.props.id)
		console.log('PROPOSAL :', this.state.proposal)
		console.log('State :', this.state.state)
	}

	render() {
		return <div className="proposal-card">ProposalCard</div>
	}
}

export default ProposalCard
