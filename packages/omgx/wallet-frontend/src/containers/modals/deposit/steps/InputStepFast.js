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
import { Typography, useMediaQuery } from '@material-ui/core'
import { Box } from '@material-ui/system'
import { depositL1LP, approveERC20 } from 'actions/networkAction'
import { openAlert, openError, setActiveHistoryTab1 } from 'actions/uiAction'
import Button from 'components/button/Button'
import Input from 'components/input/Input'
import { WrapperActionsModal } from 'components/modal/Modal.styles'

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectLoading } from 'selectors/loadingSelector'
import { selectLookupPrice } from 'selectors/lookupSelector'
import { selectSignatureStatus_depositLP } from 'selectors/signatureSelector'

import networkService from 'services/networkService'
import { powAmount, logAmount, amountToUsd } from 'util/amountConvert'

function InputStepFast({ handleClose, token }) {

  const dispatch = useDispatch()

  const [value, setValue] = useState('')
  const [LPBalance, setLPBalance] = useState(0)
  const [feeRate, setFeeRate] = useState(0)
  const [disabledSubmit, setDisabledSubmit] = useState(true)

  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))
  const approvalLoading = useSelector(selectLoading(['APPROVE/CREATE']))
  const lookupPrice = useSelector(selectLookupPrice)
  const signatureStatus = useSelector(selectSignatureStatus_depositLP)

  const maxValue = logAmount(token.balance, token.decimals)
  const valueIsValid = value > 0 && value <= maxValue

  function setAmount(valueStr) {
    const value = parseFloat(valueStr);
    const valid = value > 0 && value <= parseFloat(logAmount(token.balance, token.decimals))
    if ( valid && Number(value) < Number(LPBalance) ) {
      setDisabledSubmit(false)
    } else {
      setDisabledSubmit(true)
    }
    setValue(valueStr)
  }

  async function doDeposit() {

    let res

    if(token.symbol === 'ETH') {

      console.log("ETH Fast Bridge")

      if (valueIsValid) {
        res = await dispatch(depositL1LP(token.address, value, token.decimals))
        if (res) {
          dispatch(setActiveHistoryTab1('L1->L2 Bridge'))
          dispatch(
            openAlert(
              `ETH was bridged. You will receive
              ${((Number(value) * (100 - Number(feeRate)))/100).toFixed(2)}
              ETH on L2`
            )
          )
          handleClose()
          return
        } else {
          dispatch(openError('Failed to bridge ETH'))
          return
        }
      }
    }

    //at this point we know it's not ETH
    console.log("ERC20 Fast Bridge")

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
      dispatch(setActiveHistoryTab1('L1->L2 Bridge'))
      dispatch(
        openAlert(
          `${token.symbol} was bridged to the L1LP. You will receive
           ${receivableAmount(value)} ${token.symbol} on L2`
        )
      )
      handleClose()
    } else {
      dispatch(openError('Failed to bridge ERC20'))
    }

  }

  const receivableAmount = (value) => {
    return (Number(value) * ((100 - Number(feeRate)) / 100)).toFixed(2)
  }

  useEffect(() => {
    if (typeof(token) !== 'undefined') {
      networkService.L2LPBalance(token.addressL2,token.decimals).then((res) => {
        setLPBalance(Number(res).toFixed(2))
      })
      networkService.getTotalFeeRate().then((feeRate) => {
        setFeeRate(feeRate)
      })
    }
  }, [token])

  useEffect(() => {
    if (signatureStatus && depositLoading) {
      //we are all set - can close the window
      //transaction has been sent and signed
      handleClose()
    }
  }, [ signatureStatus, depositLoading, handleClose ])

  const label = 'There is a ' + feeRate + '% fee.'

  let buttonLabel_1 = 'CANCEL'
  if( depositLoading || approvalLoading ) buttonLabel_1 = 'CLOSE WINDOW'

  let buttonLabel_2 = 'Bridge'

  if(depositLoading) {
    buttonLabel_2 = "Bridging..."
  } else if (approvalLoading) {
    buttonLabel_2 = "Approving..."
  }

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <Box>
        <Typography variant="h2" sx={{fontWeight: 700, mb: 1}}>
          Fast Bridge
        </Typography>

        <Typography variant="body2" sx={{mb: 3}}>{label}</Typography>

        <Input
          label={`Amount to bridge`}
          placeholder="0.0"
          value={value}
          type="number"
          onChange={(i)=>{setAmount(i.target.value)}}
          unit={token.symbol}
          maxValue={maxValue}
          variant="standard"
          newStyle
        />

        {valueIsValid && token && (
          <Typography variant="body2" sx={{mt: 2}}>
            {value && `You will receive ${receivableAmount(value)} ${token.symbol} ${!!amountToUsd(value, lookupPrice, token) ?  `($${amountToUsd(value, lookupPrice, token).toFixed(2)})`: ''} on L2.`}
          </Typography>
        )}

        {Number(LPBalance) < Number(value) && (
          <Typography variant="body2" sx={{ color: 'red', my: 2}}>
            The liquidity pool balance (of {LPBalance}) is too low to cover your fast bridge. Please
            use the traditional bridge or reduce the amount.
          </Typography>
        )}

        {(depositLoading || approvalLoading) && (
          <Typography variant="body2" sx={{mt: 2, color: 'green'}}>
            This window will automatically close when your transaction has been signed and submitted.
          </Typography>
        )}
      </Box>

      <WrapperActionsModal>
        <Button
          onClick={handleClose}
          color="neutral"
          size="large"
        >
          {buttonLabel_1}
        </Button>
        <Button
          onClick={doDeposit}
          color='primary'
          variant="contained"
          loading={depositLoading || approvalLoading}
          tooltip={depositLoading ? "Your transaction is still pending. Please wait for confirmation." : "Click here to bridge your funds to L2"}
          disabled={disabledSubmit}
          triggerTime={new Date()}
          size="large"
          fullWidth={isMobile}
          newStyle
        >
          {buttonLabel_2}
        </Button>
      </WrapperActionsModal>
    </>
  )
}

export default React.memo(InputStepFast)
