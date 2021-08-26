import React from 'react'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'

import { openAlert, openError } from 'actions/uiAction'

import Button from 'components/button/Button'
import Input from 'components/input/Input'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import networkService from 'services/networkService'

import { transfer } from 'actions/networkAction'

import * as S from './ListNFT.styles'
import truncate from 'truncate-middle'
import { Box, Fade, Link, Typography } from '@material-ui/core'

class listNFT extends React.Component {

  constructor(props) {

    super(props);

    const {
      name,
      symbol,
      owner,
      address,
      layer,
      icon,
      UUID,
      time,
      URL,
      oriChain,
      oriAddress,
      oriID,
      haveRights,
      type,
      oriFeeRecipient
    } = this.props;


    this.state = {
      name,
      symbol,
      owner,
      address,
      layer,
      icon,
      UUID,
      time,
      URL,
      tokenURI: '',
      ownerName: '',
      //drop down box
      dropDownBox: false,
      dropDownBoxInit: true,
      // loading
      loading: false,
      newNFTsymbol: '',
      newNFTname: '',
      oriChain,
      oriAddress,
      oriID,
      haveRights,
      type,
      typeNew : 0,
      oriFeeRecipient
    }
  }

  componentDidUpdate(prevState) {

    const {
      name, layer, symbol, owner,
      address, UUID, time, URL,
      oriChain, oriAddress, oriID,
      haveRights, type, oriFeeRecipient,
      typeNew
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

    if (!isEqual(prevState.owner, owner)) {
      this.setState({ owner })
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

    if (!isEqual(prevState.oriChain, oriChain)) {
      this.setState({ oriChain })
    }

    if (!isEqual(prevState.oriAddress, oriAddress)) {
      this.setState({ oriAddress })
    }

    if (!isEqual(prevState.oriID, oriID)) {
      this.setState({ oriID })
    }

    if (!isEqual(prevState.haveRights, haveRights)) {
      this.setState({ haveRights })
    }

    if (!isEqual(prevState.type, type)) {
      this.setState({ type })
    }

    if (!isEqual(prevState.typeNew, typeNew)) {
      this.setState({ typeNew })
    }

    if (!isEqual(prevState.oriFeeRecipient, oriFeeRecipient)) {
      this.setState({ oriFeeRecipient })
    }

  }

  async handleMintAndSend() {

    const { receiverAddress, ownerName, tokenURI, address, typeNew, oriFeeRecipient } = this.state;

    const networkStatus = await this.props.dispatch(networkService.confirmLayer('L2'))

    if (!networkStatus) {
      this.props.dispatch(openError('Please use L2 network'))
      return
    }

    this.setState({ loading: true })

    const mintTX = await networkService.mintAndSendNFT(
      receiverAddress,
      address,
      ownerName,
      tokenURI,
      typeNew //can be 0, 1, or 2 - 0 denotes full rights
    )

    //for the payment, this is always in oETH, is always 0.01 oETH in magnitude (for now), and
    //goes to the owner of the NFT that was the parent of the NFT you are sending to someone else

    const ETHL2 = '0x4200000000000000000000000000000000000006'

    if (mintTX) {

      this.props.dispatch(openAlert(`You minted a new NFT for ${receiverAddress}.
        The owner's name is ${ownerName}.
        You will now be prompted to send a payment to the creator of the parent NFT`
      ))

      try {
        const transferResponse = await this.props.dispatch(
          transfer(oriFeeRecipient, 0.01, ETHL2)
        )
        if (transferResponse) {
          this.props.dispatch(openAlert('Payment submitted'))
        }
      } catch (err) {
        //guess not really?
      }

    } else {
      this.props.dispatch(openError('NFT minting error'))
    }

    this.setState({ loading: false })
  }

  async handleDeployDerivative() {

    const { newNFTsymbol, newNFTname, address, UUID  } = this.state;

    const networkStatus = await this.props.dispatch(networkService.confirmLayer('L2'))

    if (!networkStatus) {
      this.props.dispatch(openError('Please use L2 network'))
      return
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

    const deployTX = await networkService.deployNewNFTContract(
      newNFTsymbol,
      newNFTname,
      address,
      UUID,
      originName
    )

    if (deployTX) {
      this.props.dispatch(openAlert(`You have deployed a new NFT factory`))
    } else {
      this.props.dispatch(openError('NFT factory deployment error'))
    }

    this.setState({ loading: false })
  }

  render() {

    const {
      name,
      symbol,
      owner,
      address,
      icon,
      UUID,
      time,
      URL,
      oriChain,
      oriAddress,
      oriID,
      dropDownBox,
      loading,
      newNFTsymbol,
      newNFTname,
      type,
      oriFeeRecipient
    } = this.state;

    let typeString = 'Commercial; derivatizable'

    if(type === 1){
      typeString = 'Commercial; no derivatives'
    } else if (type === 2) {
      typeString = 'Non-profit; no derivatives'
    }

    return (
      <S.Wrapper>
        <img src={icon} alt="icon" height={60} width="100%"/>
        <Box sx={{p: 3}}>
          {oriID === 'simple' &&
            <Box>
              <S.NFTTitle variant="h4" component="div">
                <strong>{name} </strong>({symbol})
              </S.NFTTitle>
              <S.NFTItem variant="body2" component="div">
                Owner: {owner}
              </S.NFTItem>
              <S.NFTItem variant="body2" component="div">
                UUID: {UUID}
              </S.NFTItem>
              <S.NFTItem variant="body2" component="div">
                Address: {truncate(address, 6, 4, '...')}
              </S.NFTItem>
              <S.NFTItem variant="body2" component="div">
                Time minted: {time}
              </S.NFTItem>
              <Link to={URL}>Link</Link>
            </Box>
          }

          {oriID !== 'simple' && <>
            <Box>
              <S.NFTTitle variant="h4" component="div">
                {name} ({symbol})
              </S.NFTTitle>
              <S.NFTItem variant="body2" component="div">
                Owner: {owner}
              </S.NFTItem>
              <S.NFTItem variant="body2" component="div">
                UUID: {UUID}
              </S.NFTItem>
              <S.NFTItem variant="body2" component="div">
                Address: {truncate(address, 6, 4, '...')}
              </S.NFTItem>
              <S.NFTItem variant="body2" component="div">
                Time minted: {time}
              </S.NFTItem>
              <S.NFTItem variant="body2" component="div">
                Type: {typeString}
              </S.NFTItem>
              <S.NFTItem variant="body2" component="div">
                Time minted: {time}
              </S.NFTItem>
              <Link sx={{cursor: "pointer"}} underline="hover" to={URL}>DATASHEET</Link>
            </Box>

            <Button
              variant="outlined"
              color="neutral"
              fullWidth
              onClick={()=>{this.setState({ dropDownBox: !dropDownBox, dropDownBoxInit: false })}}
              sx={{display: 'flex', cursor: 'pointer', alignItems: 'center'}}
            >
              <Typography>Actions</Typography>
              <Box sx={{display: "flex", transform: dropDownBox ? "rotate(-180deg)" : ""}}>
                <ExpandMoreIcon sx={{width: "12px"}}/>
              </Box>
            </Button>
          </>}
        </Box>

        {/*********************************************/
        /**************  Drop Down Box ****************/
        /**********************************************/
        }

        {dropDownBox ? (
          <Fade in={dropDownBox}>
            <S.DropdownWrapper>
                <Box>
                  <S.NFTTitle variant="h3" component="h4" sx={{mt: 2}}>Root</S.NFTTitle>
                  <S.NFTItem variant="body2" component="div">Address: {oriAddress}</S.NFTItem>
                  <S.NFTItem variant="body2" component="div">NFT: {oriID}</S.NFTItem>
                  <S.NFTItem variant="body2" component="div">Chain: {oriChain}</S.NFTItem>
                  <S.NFTItem variant="body2" component="div">Fee recipient: {oriFeeRecipient}</S.NFTItem>
                </Box>

                <Box>
                {(type === 0) && <>
                  <S.NFTTitle variant="h3" component="h4" sx={{mt: 2}}>Derive New NFT Factory</S.NFTTitle>
                  <S.NFTItem variant="body2" component="p">
                    To create a new NFT factory from this NFT, please fill in the information and click "Create New NFT Factory".
                  </S.NFTItem>
                  <Box sx={{display: "flex", flexDirection: "column", gap: "10px", mb: 1}}>
                    <Input
                      fullWidth
                      placeholder="NFT Symbol (e.g. TWST)"
                      onChange={i=>{this.setState({newNFTsymbol: i.target.value})}}
                      value={newNFTsymbol}
                    />
                    <Input
                      fullWidth
                      placeholder="NFT Name (e.g. Twist Bio NFT)"
                      onChange={i=>{this.setState({newNFTname: i.target.value})}}
                      value={newNFTname}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!newNFTname || !newNFTsymbol}
                    onClick={()=>{this.handleDeployDerivative()}}
                    loading={loading}
                  >
                    Create New NFT Factory
                  </Button>
                </>}
                </Box>
            </S.DropdownWrapper>
          </Fade>
        ) : null}
      </S.Wrapper>
    )
  }
}

const mapStateToProps = state => ({
  nft: state.nft
})

export default connect(mapStateToProps)(listNFT)
