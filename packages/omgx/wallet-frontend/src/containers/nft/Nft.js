import React from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import ListNFT from 'components/listNFT/listNFT'
import ListNFTfactory from 'components/listNFTfactory/listNFTfactory'

import * as styles from './Nft.module.scss'

import cellIcon from 'images/hela.jpg'
import factoryIcon from 'images/factory.png'
import { Alert, Box, Typography } from '@material-ui/core'
import PageHeader from 'components/pageHeader/PageHeader'

class Nft extends React.Component {

  constructor(props) {

    super(props);

    const { list, factories } = this.props.nft;

    this.state = {
      list,
      factories,
      loading: false,
      ownerName: '',
      tokenURI: '',
      newAddress: ''
    }
  }

  componentDidMount() {
    //ToDo
  }

  componentDidUpdate(prevState) {

    const { list, factories } = this.props.nft;

    if (!isEqual(prevState.nft.list, list)) {
     this.setState({ list });
    }

    if (!isEqual(prevState.nft.factories, factories)) {
     this.setState({ factories });
    }

  }

  render() {

    const {
      list,
      factories
    } = this.state;

    const numberOfNFTs = Object.keys(list).length
    //const numberOfFactories = Object.keys(factories).length

    let rights = Object.keys(factories).map((v, i) => {
      return factories[v].haveRights
    }).filter(Boolean).length

    return (

      <Box>
        <PageHeader title="NFT" />

        <div className={styles.boxContainer}>

          <Typography variant="h2" marginBottom>Factories</Typography>
          {rights > 0 &&
            <Alert severity="success">
              Status: You have owner permissions for one or more NFT factories
              and are authorized to mint new NFTs. Select the desired NFT factory
              and click "Actions" to mint NFTs.
            </Alert>
          }
          {rights === 0 &&
            <Alert severity="error">
              Status: You do not have owner permissions and you not
              are authorized to mint new NFTs. To create you own NFT
              factory, obtain an NFT first.
            </Alert>
          }

          <Box>
            {Object.keys(factories).map((v, i) => {
              if(factories[v].haveRights) {
              return (
                <ListNFTfactory
                  key={i}
                  name={factories[v].name}
                  symbol={factories[v].symbol}
                  owner={factories[v].owner}
                  address={factories[v].address}
                  layer={factories[v].layer}
                  icon={factoryIcon}
                  oriChain={factories[v].originChain}
                  oriAddress={factories[v].originAddress}
                  oriID={factories[v].originID}
                  oriFeeRecipient={factories[v].originFeeRecipient}
                  haveRights={factories[v].haveRights}
                />
              )
              } else {
                return (<></>)
              }
            })}
          </Box>
        </div>

        <Box sx={{ my: 4 }}>
          <Typography variant="h2">Your NFTs ({numberOfNFTs})</Typography>

          {/* {numberOfNFTs === 1 &&
            <Alert severity="success">You have one NFT and it should be shown below.</Alert>
          }
          {numberOfNFTs > 1 &&
            <Alert severity="success">You have {numberOfNFTs} NFTs and they should be shown below.</Alert>
          }
          {numberOfNFTs < 1 &&
            <Alert severity="info">Scanning the blockchain for your NFTs...</Alert>
          } */}

          <div className={styles.nftTiles}>
          {Object.keys(list).map((v, i) => {
            return (
              <ListNFT
                key={i}
                name={list[v].name}
                symbol={list[v].symbol}
                owner={list[v].owner}
                address={list[v].address}
                layer={list[v].layer}
                icon={cellIcon}
                UUID={list[v].UUID}
                URL={list[v].url}
                time={list[v].mintedTime}
                oriChain={list[v].originChain}
                oriAddress={list[v].originAddress}
                oriID={list[v].originID}
                oriFeeRecipient={list[v].originFeeRecipient}
                type={list[v].type}
              />
            )
          })
          }
          </div>

        </Box>

      </Box>
    )
  }
}

const mapStateToProps = state => ({
  nft: state.nft,
  setup: state.setup
});

export default connect(mapStateToProps)(Nft);
