import React from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'
import * as styles from './listNFT.module.scss'

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
      attributes
    } = this.props;


    this.state = {
      name,
      symbol,
      address,
      UUID,
      time,
      URL,
      attributes
    }
  }

  componentDidUpdate(prevState) {

    const {
      name, symbol, address,
      UUID, time, URL,attributes
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
    
    if (!isEqual(prevState.attributes, attributes)) {
      this.setState({ attributes })
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
      attributes
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
            {(attributes || []).map((attr, index)=>{
              return <div className={styles.BasicTextLight} key={index}>{attr.trait_type}: {attr.value}</div>
            })}
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
