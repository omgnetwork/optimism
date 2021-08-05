import React from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import networkService from 'services/networkService'
import { openAlert, openError } from 'actions/uiAction'

import Button from 'components/button/Button'
import Input from 'components/input/Input'

import * as styles from './dau.module.scss'

class DAU extends React.Component {

  constructor(props) {

    super(props);

    //const {  } = this.props.dau;

    this.state = {
      laodinf: false,
      address: '0x3a6C1f6C2de6c47e45d1Fd2d04C0F2601CF5979C',
      votes: 0
      // list,
      // factories,
      // loading: false,
      // ownerName: '',
      // tokenURI: '',
      // newAddress: ''
    }
  }

  componentDidMount() {
    //ToDo
  }

  componentDidUpdate(prevState) {

    // const { list, factories } = this.props.nft;
    
    // if (!isEqual(prevState.nft.list, list)) {
    //  this.setState({ list });
    // }

    // if (!isEqual(prevState.nft.factories, factories)) {
    //  this.setState({ factories });
    // }
 
  }

  async getVotes() {

    const { address  } = this.state;

    const networkStatus = await this.props.dispatch(networkService.confirmLayer('L2'))
    
    if (!networkStatus) {
      this.props.dispatch(openError('Please use L2 network.'));
      return;
    }

    this.setState({ loading: true })

    const votes = await networkService.fetchDAUCurrentVotes(
      address
    )
    
    if (votes) {
      this.props.dispatch(openAlert(`Success: DAU Queried`));
    } else {
      this.props.dispatch(openError('Could not query DAU'));
    }

    this.setState({ 
      loading: false,
      votes
    })

  }

  render() {

    const { 
      loading,
      address,
      votes
    } = this.state;

    return (

      <div className={styles.container}>
        
        <h2>OMGX DAU</h2>

        {votes > 0 && 
          <div className={styles.note}>
            Nice, there are {votes} votes.
          </div> 
        }

        {votes < 1 &&
          <div className={styles.note}>
           Zero votes so far - patience!
          </div> 
        }

        <Input
          small={true}
          placeholder="Address for vote query"
          onChange={i=>{this.setState({address: i.target.value})}}
          value={address}
        />

        <Button
          type='primary'
          size='small'
          disabled={!address}
          onClick={()=>{this.getVotes()}}
          loading={loading}
        >
          Query DAU
        </Button>

      </div>

    )
  }
}

const mapStateToProps = state => ({ 
  //dau: state.dau,
  setup: state.setup
})

export default connect(mapStateToProps)(DAU);