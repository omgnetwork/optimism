import React from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import { openAlert, openError } from 'actions/uiAction'

import Button from 'components/button/Button'
import Input from 'components/input/Input'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import networkService from 'services/networkService'

import { transfer } from 'actions/networkAction'

import * as styles from './listNFT.module.scss'

import truncate from 'truncate-middle'

class listNFT extends React.Component {

  constructor(props) {

    super(props);

    const {
      name,
      symbol,
      address,
      UUID,
      time,
      URL,
    } = this.props;


    this.state = {
      name,
      symbol,
      address,
      UUID,
      time,
      URL,
    }
  }

  componentDidUpdate(prevState) {

    const {
      name, symbol, owner, address, 
      UUID, time, URL
    } = this.props;

    if (!isEqual(prevState.name, name)) {
      this.setState({ name })
    }

    if (!isEqual(prevState.symbol, symbol)) {
      this.setState({ symbol })
    }

    if (!isEqual(prevState.address, address)) {
      this.setState({ address })
    }

    if (!isEqual(prevState.UUID, UUID)) {
      this.setState({ UUID })
    }

    if (!isEqual(prevState.time, time)) {
      this.setState({ time })
    }

    if (!isEqual(prevState.URL, URL)) {
      this.setState({ URL })
    }

  }

  render() {

    const {
      name,
      symbol,
      address,
      UUID,
      time,
      URL, 
    } = this.state;

    return (
      <div className={styles.ListNFT}>
        
        <img 
          src={URL} 
          alt="NFT URI" 
          width={'100%'}
        />

        <div className={styles.topContainer}>
          <div className={styles.Table2}>
            <div className={styles.BasicText}><strong>{name}</strong> ({symbol})</div>
            <div className={styles.BasicTextLight}>UUID: {UUID}</div>
            <div className={styles.BasicTextLight}>Address: {address}</div>
            <div className={styles.BasicTextLight}>URI: {URL}</div>
            <div className={styles.BasicTextLight}>Time minted: {time}</div>
          </div>
        </div>

      </div>
    )
  }
}

const mapStateToProps = state => ({
  nft: state.nft
})

export default connect(mapStateToProps)(listNFT)
