import React from 'react'
import getBlockchain from '../../services/ethereum'
import ProposalCard from './ProposalCard'

class ProposalList extends React.Component {
	constructor(props) {
		super(props)
		this.state = { proposalCount: 0, GovernorBravo: null, proposals: null }
	}

	getGovBravo = async () => {
		const { GovernorBravo } = await getBlockchain()
		this.setState({ GovernorBravo: GovernorBravo })
	}

	getProposalCnt = async () => {
		const GovernorBravo = this.state.GovernorBravo
		var proposalCount = await GovernorBravo.proposalCount()
		this.setState({ proposalCount })
		console.log(proposalCount.toString())
	}

	async componentDidMount() {
		await this.getGovBravo()
		await this.getProposalCnt()
		const proposals = await this.renderProposals()
		this.setState({ proposals })
	}

	renderProposals = async () => {
		var proposals = []
		for (var i = 0; i < this.state.proposalCount; i++) {
			proposals.push(
				<ProposalCard id={i} GovernorBravo={this.state.GovernorBravo} />
			)
		}
		return proposals
	}

	render() {
		return <div>{this.state.proposals}</div>
	}
}

export default ProposalList
