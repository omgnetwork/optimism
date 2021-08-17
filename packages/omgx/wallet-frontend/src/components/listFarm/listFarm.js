import React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';
import { logAmount, powAmount } from 'util/amountConvert';
import { BigNumber } from 'ethers';

import { openAlert, openError, openModal } from 'actions/uiAction';
import { getFarmInfo, updateStakeToken, updateWithdrawToken } from 'actions/farmAction';

import Button from 'components/button/Button';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import networkService from 'services/networkService';

import * as styles from './listFarm.module.scss';
import { Box, Grid, Paper, Typography } from '@material-ui/core';

class ListFarm extends React.Component {

  constructor(props) {

    super(props);

    const {
      logo,
      poolInfo,
      userInfo,
      L1orL2Pool,
      balance,
      decimals
    } = this.props;

    this.state = {
      logo,
      balance,
      decimals,
      L1orL2Pool,
      // data
      poolInfo,
      userInfo,
      //drop down box
      dropDownBox: false,
      dropDownBoxInit: true,
      // loading
      loading: false,
    }
  }

  componentDidUpdate(prevState) {

    const { poolInfo, userInfo, balance, decimals } = this.props;

    if (!isEqual(prevState.poolInfo, poolInfo)) {
      this.setState({ poolInfo });
    }

    if (!isEqual(prevState.userInfo, userInfo)) {
      this.setState({ userInfo });
    }

    if (!isEqual(prevState.balance, balance)) {
      this.setState({ balance });
    }

    if (!isEqual(prevState.decimals, decimals)) {
      this.setState({ decimals });
    }

  }

  handleStakeToken() {

    const { poolInfo, L1orL2Pool, balance, decimals } = this.state

    this.props.dispatch(updateStakeToken({
      symbol: poolInfo.symbol,
      currency: L1orL2Pool === 'L1LP' ? poolInfo.l1TokenAddress : poolInfo.l2TokenAddress,
      LPAddress: L1orL2Pool === 'L1LP' ? networkService.L1LPAddress : networkService.L2LPAddress,
      L1orL2Pool,
      balance,
      decimals
    }))

    this.props.dispatch(openModal('farmDepositModal'))
  }

  handleWithdrawToken() {

    const { poolInfo, L1orL2Pool, balance, decimals } = this.state;

    this.props.dispatch(updateWithdrawToken({
      symbol: poolInfo.symbol,
      currency: L1orL2Pool === 'L1LP' ? poolInfo.l1TokenAddress : poolInfo.l2TokenAddress,
      LPAddress: L1orL2Pool === 'L1LP' ? networkService.L1LPAddress : networkService.L2LPAddress,
      L1orL2Pool,
      balance,
      decimals
    }))

    this.props.dispatch(openModal('farmWithdrawModal'));
  }

  async handleHarvest() {

    const { poolInfo, userInfo } = this.state;

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
      this.props.dispatch(openAlert(`${logAmount(userReward, 18, 2)} ${poolInfo.symbol} was added to your account`));
      this.props.dispatch(getFarmInfo());
      this.setState({ loading: false });
    } else {
      this.props.dispatch(openError("Failed to get reward"));
      this.setState({ loading: false });
    }

  }

  render() {

    const {
      logo,
      poolInfo, userInfo,
      dropDownBox, dropDownBoxInit,
      loading, L1orL2Pool
    } = this.state;

    let userReward = 0;

    if (Object.keys(userInfo).length && Object.keys(poolInfo).length) {
      userReward = BigNumber.from(userInfo.pendingReward).add(
        BigNumber.from(userInfo.amount)
        .mul(BigNumber.from(poolInfo.accUserRewardPerShare))
        .div(BigNumber.from(powAmount(1, 12)))
        .sub(BigNumber.from(userInfo.rewardDebt))
      ).toString()
    }

    // L1orL2Pool: L1LP || L2LP
    // networkService.L1OrL2 L1: || L2
    const disabled = !L1orL2Pool.includes(networkService.L1orL2)
    const symbol = poolInfo.symbol
    const name = poolInfo.name

    return (
      <div className={styles.ListFarm}>
        <div
          className={styles.topContainer}
          style={disabled ? {pointerEvents: 'none'} : {}}
          onClick={()=>{this.setState({ dropDownBox: !dropDownBox, dropDownBoxInit: false })}}
        >
          <div className={styles.Table1}>
            <img className={styles.Image} src={logo} alt="logo"/>
            <Typography variant="overline">{name}</Typography>
          </div>
          <div className={styles.Table2}>
            <Typography variant="overline">Earned</Typography>
            <Typography variant="body1">
              {userReward ?
                `${logAmount(userReward, 18, 2)} ${symbol}` : `0 ${symbol}`
              }
            </Typography>
          </div>
          <div className={styles.Table3}>
            <Typography variant="overline">Share</Typography>
            <Typography variant="body1">
              {userInfo.amount ?
                `${logAmount(userInfo.amount, 18, 2)} ${symbol}` : `0 ${symbol}`
              }
            </Typography>
          </div>
          <div className={styles.Table4}>
            <Typography variant="overline">APR</Typography>
            <Typography variant="body1">
              {`${poolInfo.APR ? poolInfo.APR.toFixed(2) : 0}%`}
            </Typography>
          </div>
          <div className={styles.Table5}>
            <Typography variant="overline">Liquidity</Typography>
            <Typography variant="body1">
              {poolInfo.userDepositAmount ?
                `${logAmount(poolInfo.userDepositAmount, 18, 2)} ${symbol}` : `0 ${symbol}`
              }
            </Typography>
          </div>
          <div className={styles.Table5}>
            <Typography variant="overline">Balance</Typography>
            <Typography variant="body1">
              {poolInfo.tokenBalance ?
                `${logAmount(poolInfo.tokenBalance, 18, 2)} ${symbol}` : `0 ${symbol}`
              }
            </Typography>
          </div>
          {disabled &&
            <div className={styles.Table6}>
              <div className={styles.LinkTextOff}>Staking</div>
              <ExpandMoreIcon className={styles.LinkButtonOff} />
            </div>
          }
          {!disabled &&
            <div className={styles.Table6}>
              <div className={styles.LinkText}>Staking</div>
              <ExpandMoreIcon className={styles.LinkButton} />
            </div>
          }
        </div>

        {/*********************************************/
        /**************  Drop Down Box ****************/
        /**********************************************/
        }
        <div
          className={dropDownBox ?
            styles.dropDownContainer: dropDownBoxInit ? styles.dropDownInit : styles.closeDropDown}
        >
          <Box display="flex" sx={{ p: 4, justifyContent: 'center' }}>
            <Paper sx={{ minWidth: 300, p: 2, mr: 2 }}>
              <Typography variant="subtitle1">{`${name}`} Earned</Typography>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="h5" color="secondary">{logAmount(userReward, 18, 2)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant='primary'
                    size='small'
                    // className={styles.smallButton}
                    disabled={logAmount(userReward, 18) === '0' || disabled}
                    onClick={()=>{this.handleHarvest()}}
                    loading={loading}
                  >
                    Harvest
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ minWidth: 300, p: 2 }}>
              {logAmount(userInfo.amount, 18) === '0' ?
                <>
                  <Typography variant="subtitle1">Stake {`${name}`}</Typography>
                  <Box>
                    <Button
                      type='primary'
                      className={styles.largeButton}
                      onClick={() => {this.handleStakeToken()}}
                      disabled={disabled}
                    >
                      Stake
                    </Button>
                  </Box>
                </> :
                <>
                  <Typography variant="subtitle1">{`${name}`} Staked</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Typography variant="h5" color="secondary">{logAmount(userInfo.amount, 18)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <div
                          className={disabled ? styles.AdjustButtonContainerDisabled : styles.AdjustButtonContainer}
                          onClick={() => {!disabled && this.handleStakeToken()}}
                        >
                          <AddIcon className={styles.AdjustButton} />
                        </div>
                        <div
                          className={disabled ? styles.AdjustButtonContainerDisabled : styles.AdjustButtonContainer}
                          onClick={() => {!disabled && this.handleWithdrawToken()}}
                        >
                          <RemoveIcon className={styles.AdjustButton} />
                        </div>
                      </Box>
                    </Grid>
                  </Grid>
                </>
              }
            </Paper>
          </Box>

        </div>

      </div>
    )
  }
}

const mapStateToProps = state => ({
  login: state.login,
  sell: state.sell,
  sellTask: state.sellTask,
  buy: state.buy,
});

export default connect(mapStateToProps)(ListFarm);
