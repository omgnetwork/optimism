import React from 'react';
import { connect } from 'react-redux';
import Input from 'components/input/Input';
import NFTCard from 'components/nft/NftCard';
import Button from 'components/button/Button';
import { openError, openAlert } from 'actions/uiAction';
import networkService from 'services/networkService';
import { Grid } from '@material-ui/core/'
import { isEqual } from 'lodash';

import ListNFT from 'components/listNFT/listNFT';

import * as styles from './Nft.module.scss';

import cellIcon from 'images/hela.jpg';
import factoryIcon from 'images/factory.png';

class Nft extends React.Component {

  constructor(props) {

    super(props);

    const { list, factories } = this.props.nft;
    const { minter } = this.props.setup;

    console.log(this.props.setup)
    console.log(this.props)
    console.log("List:", list)
    console.log("Factories:", factories)

    this.state = {
      list,
      factories,
      minter: minter,
      loading: false,
      receiverAddress: '',
      ownerName: '',
      tokenURI: '' 
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

  async handleDeployDerivative() {

    const { /*receiverAddress, ownerName, tokenURI*/ } = this.state;

    const networkStatus = await this.props.dispatch(networkService.confirmLayer('L2'));
    
    if (!networkStatus) {
      this.props.dispatch(openError('Please use L2 network.'));
      return;
    }

    this.setState({ loading: true });

    const deployTX = await networkService.deployNewNFTContract(
      //receiverAddress, 
      //ownerName, 
      //tokenURI
    )
    
    if (deployTX) {
      this.props.dispatch(openAlert(`You have deployed a new NFT factory.`));
    } else {
      this.props.dispatch(openError('NFT factory deployment error'));
    }

    this.setState({ loading: false })
  }

  render() {

    const { 
      loading,
      receiverAddress,
      ownerName,
      tokenURI,
      list,
      factories,
      minter 
    } = this.state;

    console.log("List:",list)
    console.log("Factories:",factories)

    const numberOfNFTs = Object.keys(list).length;

    return (

      <div className={styles.container}>
        
        <div className={styles.boxContainer}>

          <h2>Your NFT Factories</h2>

          {minter && 
            <div className={styles.note}>Status: You have owner permissions and are authorized to mint new NFTs. Select the desired NFT factory, click "Actions", fill in the information, and click "Mint and Send".</div> 
          }
          {!minter &&
            <div className={styles.note}>Status: You do not have owner permissions and you not are authorized to mint new NFTs. Obtain an NFT, and then you can derive new NFTs from it.</div> 
          }

          <div className={styles.TableContainer}>
            {Object.keys(factories).map((v, i) => {
              return (
                <ListNFT 
                  key={i}
                  name={factories[v].name}
                  symbol={factories[v].symbol}
                  owner={factories[v].owner}
                  address={factories[v].address}
                  layer={factories[v].layer}
                  icon={factoryIcon}
                />
              )
            })
          }
          </div>
      </div>

        <div className={styles.nftContainer}>
          
          <h2>Your NFTs</h2>

          {numberOfNFTs === 1 && 
            <div className={styles.note}>You have one NFT and it should be shown below.</div> 
          }
          {numberOfNFTs > 1 && 
            <div className={styles.note}>You have {numberOfNFTs} NFTs and they should be shown below.</div> 
          }
          {numberOfNFTs < 1 &&
            <div className={styles.note}>You do not have any NFTs.</div> 
          }

          <div className={styles.TableContainer}>
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
                />
              )
            })
          }
          </div>

        </div>

      </div>
    )
  }
}

const mapStateToProps = state => ({ 
  nft: state.nft,
  setup: state.setup
});

export default connect(mapStateToProps)(Nft);