import React from 'react';
import { connect } from 'react-redux';
import { isEqual } from 'lodash';

import { closeModal, openAlert, openError } from 'actions/uiAction';
import { getFarmInfo } from 'actions/farmAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import { logAmount } from 'util/amountConvert';

import networkService from 'services/networkService';

import { Typography } from '@material-ui/core';
import { WrapperActionsModal } from 'components/modal/Modal.styles';

class FarmWithdrawModal extends React.Component {
  constructor(props) {
    super(props)

    const { open } = this.props
    const { withdrawToken, userInfo } = this.props.farm

    this.state = {
      open,
      withdrawToken,
      withdrawValue: '',
      userInfo,
      LPBalance: 0,
      loading: false,
    }
  }

  async componentDidUpdate(prevState) {

    const { open } = this.props
    const { withdrawToken, userInfo } = this.props.farm

    if (prevState.open !== open) {
      this.setState({ open })
    }

    if (!isEqual(prevState.farm.withdrawToken, withdrawToken)) {
      let LPBalance = 0
      if (withdrawToken.L1orL2Pool === 'L1LP') {
        LPBalance = await networkService.L1LPBalance(withdrawToken.currency, withdrawToken.decimals)
      } else {
        LPBalance = await networkService.L2LPBalance(withdrawToken.currency, withdrawToken.decimals)
      }
      this.setState({ withdrawToken, LPBalance })
    }

    if (!isEqual(prevState.farm.userInfo, userInfo)) {
      this.setState({ userInfo });
    }

  }

  getMaxTransferValue () {

    const { userInfo, withdrawToken, LPBalance } = this.state

    let transferingBalance = 0
    if (typeof userInfo[withdrawToken.L1orL2Pool][withdrawToken.currency] !== 'undefined') {
      transferingBalance = userInfo[withdrawToken.L1orL2Pool][withdrawToken.currency].amount
      transferingBalance = logAmount(transferingBalance, withdrawToken.decimals)
    }

    //BUT, if the current balance is lower than what you staked, can only withdraw the balance
    //console.log("LPBalance:",LPBalance)
    if (LPBalance < transferingBalance)
      transferingBalance = LPBalance

    return transferingBalance
  }

  handleClose() {
    this.props.dispatch(closeModal("farmWithdrawModal"))
  }

  async handleConfirm() {

    const { withdrawToken, withdrawValue } = this.state;

    this.setState({ loading: true });

    const withdrawLiquidityTX = await networkService.withdrawLiquidity(
      withdrawToken.currency,
      withdrawValue,
      withdrawToken.L1orL2Pool,
      withdrawToken.decimals,
    )
    if (withdrawLiquidityTX) {
      this.props.dispatch(openAlert("Your liquidity was withdrawn."));
      this.props.dispatch(getFarmInfo());
      this.setState({ loading: false, withdrawValue: '' });
      this.props.dispatch(closeModal("farmWithdrawModal"));
    } else {
      this.props.dispatch(openError("Failed to withdraw liquidity."));
      this.setState({ loading: false, withdrawValue: '' });
    }
  }

  render() {

    const {
      open,
      withdrawToken, 
      withdrawValue,
      LPBalance,
      loading,
    } = this.state

    return (
      
      <Modal 
        open={open} 
        onClose={()=>{this.handleClose()}}
      >
        
        <Typography variant="h2" sx={{fontWeight: 700, mb: 3}}>
          Withdraw {`${withdrawToken.symbol}`}
        </Typography>

        <Input
          placeholder={`Amount to withdraw`}
          value={withdrawValue}
          type="number"
          onChange={i=>{this.setState({withdrawValue: i.target.value})}}
          unit={withdrawToken.symbol}
          maxValue={this.getMaxTransferValue()}
          disabledSelect={true}
          variant="standard"
          newStyle
        />

        {Number(withdrawValue) > Number(this.getMaxTransferValue()) &&
          <Typography variant="body2" sx={{mt: 2}}>
            You don't have enough {withdrawToken.symbol} to withdraw.
          </Typography>
        }
        {Number(withdrawValue) > Number(LPBalance) &&
          <Typography variant="body2" sx={{mt: 2}}>
            We don't have enough {withdrawToken.symbol} in the {' '}
            {withdrawToken.L1orL2Pool === 'L1LP' ? 'L1' : 'L2'} liquidity pool.
            Please contact us.
          </Typography>
        }

        <WrapperActionsModal>
          <Button
            onClick={()=>{this.handleClose()}}
            color="neutral"
            size="large"
          >
            CANCEL
          </Button>
          <Button
            onClick={()=>{this.handleConfirm()}}
            color='primary'
            size="large"
            variant="contained"
            disabled={
              Number(this.getMaxTransferValue()) < Number(withdrawValue) ||
              Number(withdrawValue) > Number(LPBalance) ||
              withdrawValue === '' ||
              !withdrawValue
            }
            loading={loading}
          >
            CONFIRM
          </Button>
        </WrapperActionsModal>
      </Modal>
    )
  }
};

const mapStateToProps = state => ({
  ui: state.ui,
  farm: state.farm,
  balance: state.balance,
});

export default connect(mapStateToProps)(FarmWithdrawModal);
