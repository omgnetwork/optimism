import React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import { logAmount, powAmount } from 'util/amountConvert';
import { BigNumber } from 'ethers';

import { openAlert, openError, openModal } from 'actions/uiAction';
import { getFarmInfo, updateStakeToken, updateWithdrawToken } from 'actions/farmAction';

import Button from 'components/button/Button'
import Input from 'components/input/Input'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import networkService from 'services/networkService';

import cells from 'images/hela.jpg';

import * as styles from './listNFT.module.scss';

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
      URL
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
      receiverAddress: '',
      tokenURI: '',
      ownerName: '',
      /*logo,
      name, 
      shortName,
      balance,
      decimals,
      L1orL2Pool,
      // data
      poolInfo, userInfo,
      */
      //drop down box
      dropDownBox: false,
      dropDownBoxInit: true,
      // loading
      loading: false,
      newNFTsymbol: '',
      newNFTname: '' 
    }
  }
  
  componentDidUpdate(prevState) {

    const { name, layer, symbol, owner, address, UUID, time, URL } = this.props;

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

    // if (!isEqual(prevState.poolInfo, poolInfo)) {
    //   this.setState({ poolInfo });
    // }

    // if (!isEqual(prevState.userInfo, userInfo)) {
    //   this.setState({ userInfo });
    // }

    // if (!isEqual(prevState.balance, balance)) {
    //   this.setState({ balance });
    // }

    // if (!isEqual(prevState.decimals, decimals)) {
    //   this.setState({ decimals });
    // }

  }
/*
  handleStakeToken() {
    const { shortName, poolInfo, L1orL2Pool, balance, decimals } = this.state;
    this.props.dispatch(updateStakeToken({
      symbol: shortName,
      currency: L1orL2Pool === 'L1LP' ? poolInfo.l1TokenAddress : poolInfo.l2TokenAddress,
      LPAddress: L1orL2Pool === 'L1LP' ? networkService.L1LPAddress : networkService.L2LPAddress,
      L1orL2Pool,
      balance,
      decimals
    }));
    this.props.dispatch(openModal('farmDepositModal'));
  }

  handleWithdrawToken() {
    const { shortName, poolInfo, L1orL2Pool, balance, decimals } = this.state;
    this.props.dispatch(updateWithdrawToken({
      symbol: shortName,
      currency: L1orL2Pool === 'L1LP' ? poolInfo.l1TokenAddress : poolInfo.l2TokenAddress,
      LPAddress: L1orL2Pool === 'L1LP' ? networkService.L1LPAddress : networkService.L2LPAddress,
      L1orL2Pool,
      balance,
      decimals
    }));
    this.props.dispatch(openModal('farmWithdrawModal'));
  }

  async handleHarvest() {
    
    const { poolInfo, userInfo, shortName } = this.state;

    this.setState({ loading: true })

    const userReward = BigNumber.from(userInfo.pendingReward).add(
      BigNumber.from(userInfo.amount)
      .mul(BigNumber.from(poolInfo.accUserRewardPerShare))
      .div(BigNumber.from(powAmount(1, 12)))
      .sub(BigNumber.from(userInfo.rewardDebt))
    ).toString()

    let getRewardTX = null;

    if(networkService.L1orL2 === 'L1') {
      getRewardTX = await networkService.getRewardL1(
        poolInfo.l1TokenAddress,
        userReward
      )
    } else if (networkService.L1orL2 === 'L2') {
      getRewardTX = await networkService.getRewardL2(
        poolInfo.l2TokenAddress,
        userReward
      )
    } else {
      console.log("handleHarvest(): Chain not set")
    }

    if (getRewardTX) {
      this.props.dispatch(openAlert(`${logAmount(userReward, 18, 2)} ${shortName} was added to your account`));
      this.props.dispatch(getFarmInfo());
      this.setState({ loading: false });
    } else {
      this.props.dispatch(openError("Failed to get reward"));
      this.setState({ loading: false });
    }

  }
*/

/*
        <CardMedia
          className={styles.NFTmedia}
          image={cells}
          title="Cell line"
        />
        <CardContent 
          style={{padding: 0, margin: 7}}
        >
          <Typography variant="h5">
            {name}
          </Typography>
          <Typography variant="h6">
            {symbol}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p" style={{fontSize: '0.9em',marginBottom: '15px'}}>
            <span style={{fontWeight: '600'}}>NFT ID: </span>{UUID}<br/>
            <span style={{fontWeight: '600'}}>Owner: </span>{owner}<br/>
            <span style={{fontWeight: '600'}}>Time Minted:</span><br/>{time}<br/>
          </Typography>
          <Typography 
            variant="body2" 
            color="textSecondary" 
            component="p" 
          >
            <a style={{color: 'blue'}} 
              href={URL}
            >
              DATASHEET
            </a>
          </Typography>
        </CardContent>
        */

  async handleMintAndSend() {

    const { receiverAddress, ownerName, tokenURI } = this.state;

    const networkStatus = await this.props.dispatch(networkService.confirmLayer('L2'))
    
    if (!networkStatus) {
      this.props.dispatch(openError('Please use L2 network.'))
      return
    }

    this.setState({ loading: true });

    const mintTX = await networkService.mintAndSendNFT(
      receiverAddress, 
      ownerName, 
      tokenURI
    )
    
    if (mintTX) {
      this.props.dispatch(openAlert(`You minted a new NFT for ${receiverAddress}. The owner's name is ${ownerName}.`));
    } else {
      this.props.dispatch(openError('NFT minting error'));
    }

    this.setState({ loading: false })
  }

  render() {

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
      //logo, name, shortName,
      //poolInfo, userInfo,
      dropDownBox, 
      dropDownBoxInit,
      loading,
      receiverAddress,
      tokenURI,
      ownerName,
      newNFTsymbol,
      newNFTname 
      //L1orL2Pool
    } = this.state;

/*
    let userReward = 0;

    if (Object.keys(userInfo).length && Object.keys(poolInfo).length) {
      userReward = BigNumber.from(userInfo.pendingReward).add(
        BigNumber.from(userInfo.amount)
        .mul(BigNumber.from(poolInfo.accUserRewardPerShare))
        .div(BigNumber.from(powAmount(1, 12)))
        .sub(BigNumber.from(userInfo.rewardDebt))
      ).toString()
    }
*/
    // L1orL2Pool: L1LP || L2LP
    // networkService.L1OrL2 L1: || L2
//    const disabled = !L1orL2Pool.includes(networkService.L1orL2);

    return (
      <div className={styles.listNFT}>

        <div 
          className={styles.topContainer} 
        >
          
          <div className={styles.Table1}>
            <img className={styles.Image} src={icon} alt="icon"/>
          </div>

          <div className={styles.Table2}>
            {UUID && <>
              <div className={styles.BasicText}>{name} ({symbol})</div>
              <div className={styles.BasicLightText}>Owner: {owner}</div>
              <div className={styles.BasicLightText}>UUID: {UUID}</div>
              <div className={styles.BasicLightText}>Address: {address}</div>
              <div className={styles.BasicLightText}>Time minted: {time}</div>
              <div className={styles.BasicLightText}>{URL}</div>
              <a style={{color: 'blue', paddingTop: '3px'}} href={URL}>DATASHEET</a>
            </> }
            {!UUID && <>
            <div className={styles.BasicText}>{name} ({symbol}) Factory</div><br/>
            <div className={styles.BasicLightText}>Owner:<br/>{owner}</div><br/>
            <div className={styles.BasicLightText}>Address:<br/>{address}</div>
            </> }
          </div>

          <div 
            className={styles.Table3}
            onClick={()=>{this.setState({ dropDownBox: !dropDownBox, dropDownBoxInit: false })}}
          >
            <div className={styles.LinkText}>Actions</div>
            <ExpandMoreIcon className={styles.LinkButton} />
          </div>
        </div>

        {/*********************************************/
        /**************  Drop Down Box ****************/
        /**********************************************/
        }
        <div 
          className={dropDownBox ? 
            styles.dropDownContainer: dropDownBoxInit ? styles.dropDownInit : styles.closeDropDown}
        >
          <div className={styles.boxContainer}>
          {!UUID && <>
            <Input
              small={true}
              placeholder="Receiver Address (Ox.....)"
              onChange={i=>{this.setState({receiverAddress: i.target.value})}}
              value={receiverAddress}
            />
            <Input
              small={true}
              placeholder="NFT Owner Name (e.g. Henrietta Lacks)"
              onChange={i=>{this.setState({ownerName: i.target.value})}}
              value={ownerName}
            />
            <Input
              small={true}
              placeholder="NFT URL (e.g. https://jimb.stanford.edu)"
              onChange={i=>{this.setState({tokenURI: i.target.value})}}
              value={tokenURI}
            />
            <Button
              type='primary'
              size='small'
              disabled={!receiverAddress || !ownerName || !tokenURI}
              onClick={()=>{this.handleMintAndSend()}}
              loading={loading}
            >
              Mint and Send
            </Button>
          </>}  
          {UUID && <>
            <Input
              small={true}
              placeholder="NFT Symbol (e.g. TWST)"
              onChange={i=>{this.setState({newNFTsymbol: i.target.value})}}
              value={newNFTsymbol}
            />
            <Input
              small={true}
              placeholder="NFT Name (e.g. Twist Bio NFT)"
              onChange={i=>{this.setState({newNFTname: i.target.value})}}
              value={newNFTname}
            />
            <Button
              type='primary'
              size='small'
              disabled={!newNFTname || !newNFTsymbol}
              onClick={()=>{this.handleMintAndSend()}}
              loading={loading}
            >
              Derive NFT factory from this NFT
            </Button>
          </>}  
          </div>
        </div>

      </div>
    )
  }
}

const mapStateToProps = state => ({ 
  nft: state.nft
  /*
  login: state.login,
  sell: state.sell,
  sellTask: state.sellTask,
  buy: state.buy,
  */
});

export default connect(mapStateToProps)(listNFT);