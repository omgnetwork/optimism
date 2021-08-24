/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import { useTheme } from '@emotion/react'
import { Alert, Box, Grid, Typography, useMediaQuery } from '@material-ui/core'
import { depositL1LP, approveERC20 } from 'actions/networkAction'
import { openAlert, openError, setActiveHistoryTab1 } from 'actions/uiAction'
import Button from 'components/button/Button'
import Input from 'components/input/Input'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectLoading } from 'selectors/loadingSelector'
import { selectLookupPrice } from 'selectors/lookupSelector'
import networkService from 'services/networkService'
import { powAmount, logAmount, amountToUsd } from 'util/amountConvert'
import * as S from './InputSteps.styles'

function InputStepFast({ handleClose, token }) {

  const dispatch = useDispatch()

  const [value, setValue] = useState('')
  const [LPBalance, setLPBalance] = useState(0)
  const [feeRate, setFeeRate] = useState(0)
  const [disabledSubmit, setDisabledSubmit] = useState(true)

  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))
  const approvalLoading = useSelector(selectLoading(['APPROVE/CREATE']))
  const lookupPrice = useSelector(selectLookupPrice);

  function setAmount(value) {
    if (
      Number(value) > 0 &&
      Number(value) < Number(LPBalance) &&
      Number(value) < Number(token.balance)
    ) {
      setDisabledSubmit(false)
    } else {
      setDisabledSubmit(true)
    }
    setValue(value)
  }

  async function doDeposit() {

    let res

    if(token.symbol === 'ETH') {

      console.log("ETH Fast swap on")

      if (value > 0) {
        res = await dispatch(depositL1LP(token.address, value))
        if (res) {
          dispatch(setActiveHistoryTab1('Deposits'))
          dispatch(
            openAlert(
              `ETH was deposited into the L1LP. You will receive
              ${((Number(value) * (100 - Number(feeRate)))/100).toFixed(2)}
              oETH on L2`
            )
          )
          handleClose()
          return
        } else {
          dispatch(openError('Failed to deposit ETH'))
          return
        }
      }
    }

    //at this point we know it's not ETH
    console.log("ERC20 Fast swap on")

    res = await dispatch(
      approveERC20(
        powAmount(value, token.decimals),
        token.address,
        networkService.L1LPAddress
      )
    )

    if(!res) {
      dispatch(openError('Failed to approve amount'))
    }

    res = await dispatch(
      depositL1LP(token.address, value)
    )

    if (res) {
      dispatch(setActiveHistoryTab1('Deposits'))
      dispatch(
        openAlert(
          `${token.symbol} was deposited to the L1LP. You will receive
           ${receivableAmount(value)} ${token.symbol} on L2`
        )
      )
      handleClose()
    } else {
      dispatch(openError('Failed to deposit ERC20'))
    }

  }

  const receivableAmount = (value) => {
    return (Number(value) * ((100 - Number(feeRate)) / 100)).toFixed(2)
  }

  useEffect(() => {
    if (typeof(token) !== 'undefined') {
      networkService.L2LPBalance(token.address).then((res) => {
        setLPBalance(Number(res).toFixed(2))
      })
      networkService.getTotalFeeRate().then((feeRate) => {
        setFeeRate(feeRate)
      })
    }
  }, [token])

  const label = 'There is a ' + feeRate + '% fee.'

  let buttonLabel = 'Deposit'

  if(depositLoading) {
    buttonLabel = "Depositing..."
  } else if (approvalLoading) {
    buttonLabel = "Approving..."
  }

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Typography variant="h2" sx={{fontWeight: 700, mb: 1}}>
        Fast Deposit
      </Typography>

      <Typography variant="body2" sx={{mb: 3}}>{label}</Typography>

      <Input
        label={`Enter amount to deposit`}
        placeholder="0.0000"
        value={value}
        type="number"
        onChange={(i)=>{setAmount(i.target.value)}}
        unit={token.symbol}
        maxValue={logAmount(token.balance, token.decimals)}
        variant="standard"
        newStyle
      />

      {token && token.symbol === 'ETH' && (
        <Typography variant="body2" sx={{mt: 2}}>
          {value && `You will receive ${receivableAmount(value)} oETH ${!!amountToUsd(value, lookupPrice, token) ?  `($${amountToUsd(value, lookupPrice, token).toFixed(2)})`: ''} on L2.`}
        </Typography>
      )}

      {token && token.symbol !== 'ETH' && (
        <Typography variant="body2" sx={{mt: 2}}>
          {value && `You will receive ${receivableAmount(value)} ${token.symbol} ${!!amountToUsd(value, lookupPrice, token) ?  `($${amountToUsd(value, lookupPrice, token).toFixed(2)})`: ''} on L2.`}
        </Typography>
      )}

      {Number(LPBalance) < Number(value) && (
        <Typography variant="body2" sx={{ color: 'red', my: 2}}>
          The liquidity pool balance (of {LPBalance}) is too low to cover your fast deposit. Please
          use the traditional deposit or reduce the amount.
        </Typography>
      )}

      <S.WrapperActions>
        {!isMobile ? (
          <Button
            onClick={handleClose}
            color="neutral"
            size="lg"
          >
            Cancel
          </Button>
        ) : null}
        <Button
          onClick={doDeposit}
          color='primary'
          variant="contained"
          loading={depositLoading || approvalLoading}
          tooltip="Your deposit is still pending. Please wait for confirmation."
          disabled={disabledSubmit}
          triggerTime={new Date()}
          size="lg"
          fullWidth={isMobile}
          newStyle
        >
          {buttonLabel}
        </Button>
      </S.WrapperActions>
    </>
  )
}

export default React.memo(InputStepFast)
