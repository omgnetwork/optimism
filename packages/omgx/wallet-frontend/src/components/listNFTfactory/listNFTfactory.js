import React from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import { openAlert, openError } from 'actions/uiAction'

import Button from 'components/button/Button'
import Input from 'components/input/Input'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import networkService from 'services/networkService'

import * as styles from './listNFTfactory.module.scss'

import { Typography , Fade } from '@material-ui/core'

import factoryIcon from 'images/factory.png'

class listNFTfactory extends React.Component {

  constructor(props) {

    super(props);

    const {
      name,
      symbol,
      address,
      layer,
    } = this.props;


    this.state = {

      //details of this contract
      name,
      symbol,
      address,
      layer,

      //drop down box
      dropDownBox: false,
      dropDownBoxInit: true,

      // loading
      loading: false,

      //for minting new NFTs
      receiverAddress: '',
      tokenURI: '',
    }
  }

  componentDidUpdate(prevState) {

    const {
      name, symbol, address, layer, 
    } = this.props;

    if (!isEqual(prevState.name, name)) {
      this.setState({ name })
    }

    if (!isEqual(prevState.layer, layer)) {
      this.setState({ layer })
    }

    if (!isEqual(prevState.symbol, symbol)) {
      this.setState({ symbol })
    }

    if (!isEqual(prevState.address, address)) {
      this.setState({ address })
    }

  }

  async handleSimpleMintAndSend() {

    const { receiverAddress, tokenURI, address } = this.state;

    const networkStatus = await this.props.dispatch(networkService.confirmLayer('L2'))

    if (!networkStatus) {
      this.props.dispatch(openError('Please use L2 network.'))
      return
    }

    this.setState({ loading: true })

    const mintTX = await networkService.mintAndSendNFT(
      receiverAddress,
      address,
      tokenURI
    )

    if (mintTX) {
      this.props.dispatch(openAlert(`You minted a new NFT for ${receiverAddress}.`))
    } else {
      this.props.dispatch(openError('NFT minting error'))
    }

    this.setState({ loading: false })
  }

  render() {

    const {
      name,
      symbol,
      address,
      dropDownBox,
      loading,
      receiverAddress, // for new NFTs
      tokenURI,        // for new NFTs
    } = this.state;

    return (
      <div className={styles.ListNFT}>

        <div className={styles.topContainer}>

          <div className={styles.Table1}>
            <img 
              className={styles.Image} 
              src={factoryIcon} 
              alt="icon"
            />
          </div>

          <div className={styles.Table2}>
            <>
              <div className={styles.BasicText}>NFT MINTING CONTRACT</div>
              <div className={styles.BasicText}>Name: {symbol}</div>
              <div className={styles.BasicText}>Symbol: {name}</div>
              <div className={styles.BasicTextLight}>Address: {address}</div>
            </>
          </div>

          <div
            className={styles.Table3}
            onClick={()=>{this.setState({ dropDownBox: !dropDownBox, dropDownBoxInit: false })}}
          >
            <div className={styles.LinkText}>Mint NFT</div>
            <ExpandMoreIcon className={styles.LinkButton} />
          </div>
        </div>

        {/*********************************************/
        /**************  Drop Down Box ****************/
        /**********************************************/
        }
        {
        /* <div
          className={dropDownBox ?
            styles.dropDownContainer: dropDownBoxInit ? styles.dropDownInit : styles.closeDropDown}
        > */
        }
        {dropDownBox ? (
          <Fade in={dropDownBox}>
              <div className={styles.boxContainer}>
                <>
                  <Typography variant="h3">Mint and Send</Typography>
                  <div className={styles.BasicLightText} style={{paddingBottom: '3px'}}>
                    To mint and send a new {name} NFT, please fill in the information and click "Mint and Send".
                  </div>
                  <Input
                    fullwidth
                    placeholder="Receiver Address (Ox.....)"
                    onChange={i=>{this.setState({receiverAddress: i.target.value})}}
                    value={receiverAddress}
                  />
                  <Input
                    fullwidth
                    placeholder="NFT URL (e.g. https://jimb.stanford.edu)"
                    onChange={i=>{this.setState({tokenURI: i.target.value})}}
                    value={tokenURI}
                  />
                  <Button
                    disabled={!receiverAddress || !tokenURI}
                    onClick={()=>{this.handleSimpleMintAndSend()}}
                    loading={loading}
                  >
                    Mint and Send
                  </Button>
                </>
              </div>
          </Fade>
        ) : null }
        {/* </div> */}

      </div>
    )
  }
}

const mapStateToProps = state => ({
  nft: state.nft
})

export default connect(mapStateToProps)(listNFTfactory)
