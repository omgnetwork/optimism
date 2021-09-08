import React from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'
import Modal from 'components/modal/Modal';

import ListNFT from 'components/listNFT/listNFT'
import ListNFTfactory from 'components/listNFTfactory/listNFTfactory'

import { openAlert, openError } from 'actions/uiAction'

import { Box, Grid, Typography } from '@material-ui/core'
import PageHeader from 'components/pageHeader/PageHeader'

import networkService from 'services/networkService'

import Button from 'components/button/Button'
import Input from 'components/input/Input'

class Nft extends React.Component {

  constructor(props) {

    super(props);

    const { list, contracts } = this.props.nft;

    this.state = {
      list,
      contracts,
      loading: false,
      ownerName: '',
      tokenURI: '',
      newAddress: '',
      newNFTname: '',
      newNFTsymbol: '',
      deployModalOpen: false,
      minModalOpen: false
    }

    this.closeMintModal = this.closeMintModal.bind(this)
  }

  componentDidMount() {
    //ToDo
  }

  componentDidUpdate(prevState) {

    const { list, contracts } = this.props.nft;

    if (!isEqual(prevState.nft.list, list)) {
     this.setState({ list })
    }

    if (!isEqual(prevState.nft.contracts, contracts)) {
     this.setState({ contracts })
    }

  }

  async handleDeployContract() {

    const { newNFTsymbol, newNFTname } = this.state;

    const networkStatus = await this.props.dispatch(networkService.confirmLayer('L2'))

    if (!networkStatus) {
      this.props.dispatch(openError('Please use L2 network'))
      return;
    }

    this.setState({ loading: true })

    let originName = ''

    if(networkService.chainID === 28) {
      originName = 'OMGX_Rinkeby_28'
    } else if (networkService.chainID === 288) {
      originName = 'OMGX_Mainnet_288'
    } else {
      originName = 'OMGX_Other'
    }

    const deployTX = await networkService.deployNFTContract(
      newNFTsymbol,
      newNFTname,
      '0x0000000000000000000000000000000000000042',
      'simple',
      originName
    )

    if (deployTX) {
      this.props.dispatch(openAlert(`You have deployed a new NFT contract`))
    } else {
      this.props.dispatch(openError('NFT contract deployment error'))
    }

    this.setState({ loading: false, deployModalOpen: false })
  }

  closeMintModal() {
    this.setState({ minModalOpen: false})
  }

  render() {

    const {
      list,
      contracts,
      newNFTsymbol,
      newNFTname,
      loading
    } = this.state;

    const numberOfNFTs = Object.keys(list).length

    return (
      <>
        <PageHeader title="NFT" />

        <Grid item xs={12}>

          <Typography variant="h2" component="h2" sx={{fontWeight: "700"}}>Your NFTs</Typography>

          {numberOfNFTs === 1 &&
            <Typography variant="body2" component="p" sx={{mt: 1, mb: 4}}>You have one NFT and it should be shown below.</Typography>
          }
          {numberOfNFTs > 1 &&
            <Typography variant="body2" component="p" sx={{mt: 1, mb: 4}}>You have {numberOfNFTs} NFTs and they should be shown below.</Typography>
          }
          {numberOfNFTs < 1 &&
            <Typography variant="body2" component="p" sx={{mt: 1, mb: 4}}>Scanning the blockchain for your NFTs...</Typography>
          }

          <Grid
            container
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            xs={12}
          >
            {Object.keys(list).map((v, i) => {
              const key_UUID = `nft_` + i
              return (
                <ListNFT
                  key={key_UUID}
                  name={list[v].name}
                  symbol={list[v].symbol}
                  address={list[v].address}
                  UUID={list[v].UUID}
                  URL={list[v].url}
                  time={list[v].mintedTime}
                />)
              })
            }
          </Grid>
        </Grid>

        <Box display="flex" sx={{mt: 4, gap: 3}}>
          <Button size="large" variant="contained" onClick={()=> {this.setState({deployModalOpen: true})}}>Deploy NFT contract</Button>
          <Button size="large" variant="contained" onClick={()=> {this.setState({mintModalOpen: true})}}>Mint NFT</Button>
        </Box>

        <Modal maxWidth="md" open={this.state.deployModalOpen} onClose={()=> this.setState({deployModalOpen: false})}>
        <Typography variant="h2" component="h2" sx={{fontWeight: "700"}}>
            Deploy new NFT Contract
          </Typography>
          <Typography variant="body2" component="p" sx={{mt: 1, mb: 4}}>
            To mint your own NFTs, you first need to deploy your NFT contract. Specify the NFT's name and symbol, and then click
            "Deploy NFT contract".
          </Typography>
          <Box sx={{display: "flex", flexDirection: "column", gap: "10px", mb: 2}}>
            <Input
              placeholder="NFT Symbol (e.g. TWST)"
              onChange={i=>{this.setState({newNFTsymbol: i.target.value})}}
              value={newNFTsymbol}
              fullWidth
            />
            <Input
              placeholder="NFT Name (e.g. Twist)"
              onChange={i=>{this.setState({newNFTname: i.target.value})}}
              value={newNFTname}
              fullWidth
            />
          </Box>
          <Button
            variant="contained"
            fullWidth
            disabled={!newNFTname || !newNFTsymbol}
            onClick={()=>{this.handleDeployContract()}}
            loading={loading}
          >
            Deploy NFT contract
          </Button>

        </Modal>

        <Modal maxWidth="md" open={this.state.mintModalOpen} onClose={()=> this.setState({mintModalOpen: false})}>
        <Typography variant="h2" component="h2" sx={{fontWeight: "700"}}>
            Mint New NFTs
          </Typography>

          <ListNFTfactory
            contracts={contracts}
            closeMintModal={this.closeMintModal}
          />
        </Modal>
      </>
    )
  }
}

const mapStateToProps = state => ({
  nft: state.nft,
  setup: state.setup
})

export default connect(mapStateToProps)(Nft)
