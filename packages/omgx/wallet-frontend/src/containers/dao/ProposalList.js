import React from 'react'
import getBlockchain from '../../services/ethereum'
import ProposalCard from './ProposalCard'

class ProposalList extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			proposalCount: 0,
			proposals: null,
			comp: null,
			delegate: null,
			delegator: null,
			timelock: null,
			GovernorBravo: null,
		}
	}

	getGovBravo = async () => {
		const { comp, delegate, delegator, timelock, GovernorBravo } =
			await getBlockchain()
		this.setState({
			comp,
			delegate,
			delegator,
			timelock,
			GovernorBravo,
		})
	}

	getProposalCnt = async () => {
		const GovernorBravo = this.state.GovernorBravo
		var proposalCount = await GovernorBravo.proposalCount()
		this.setState({ proposalCount })
		console.log('COUNT: ', proposalCount.toString())
	}

	async componentDidMount() {
		await this.getGovBravo()
		await this.getProposalCnt()
		const proposals = await this.renderProposals()
		this.setState({ proposals })
	}

	renderProposals = async () => {
		var proposals = []
		const { comp, delegate, delegator, timelock, GovernorBravo } = this.state
		for (var i = 1; i <= this.state.proposalCount; i++) {
			proposals.push(
				<ProposalCard
					id={i}
					comp={comp}
					delegate={delegate}
					delegator={delegator}
					timelock={timelock}
					GovernorBravo={GovernorBravo}
				/>
			)
		}
		return proposals
	}

	render() {
		return <div>{this.state.proposals}</div>
	}
}

export default ProposalList
