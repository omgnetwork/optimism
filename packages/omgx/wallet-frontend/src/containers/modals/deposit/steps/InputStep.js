
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { depositETHL2, depositErc20 } from 'actions/networkAction'
import { openAlert, openError, setActiveHistoryTab1 } from 'actions/uiAction'

import Button from 'components/button/Button'
import Input from 'components/input/Input'

import { selectLoading } from 'selectors/loadingSelector'
import { selectSignatureStatus_depositTRAD } from 'selectors/signatureSelector'
import { amountToUsd, logAmount, powAmount } from 'util/amountConvert'

import { selectLookupPrice } from 'selectors/lookupSelector'
import { Typography, useMediaQuery } from '@material-ui/core'
import { useTheme } from '@emotion/react'
import { WrapperActionsModal } from 'components/modal/Modal.styles'
import { Box } from '@material-ui/system'

function InputStep({ handleClose, token }) {

  const dispatch = useDispatch()
  const [value, setValue] = useState('')
  const [disabledSubmit, setDisabledSubmit] = useState(true)
  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))
  const signatureStatus = useSelector(selectSignatureStatus_depositTRAD)
  const lookupPrice = useSelector(selectLookupPrice)

  async function doDeposit() {

    let res

    if(token.symbol === 'ETH') {
      console.log("Bridging ETH to L2")
      if (value > 0) {
        res = await dispatch(depositETHL2(value))
        if (res) {
          dispatch(setActiveHistoryTab1('L1->L2 Bridge'))
          dispatch(openAlert('ETH bridge transaction submitted'))
          handleClose()
        }
      }
    } else {
      console.log("Bridging ERC20 to L2")
      res = await dispatch(
        depositErc20(powAmount(value, token.decimals), token.address, token.addressL2)
      )
      if (res) {
        dispatch(setActiveHistoryTab1('L1->L2 Bridge'))
        dispatch(openAlert(`${token.symbol} bridge transaction submitted`))
        handleClose()
      } else {
        dispatch(openError(`Failed to bridge ${token.symbol}`))
      }
    }
  }

  function setAmount(valueStr) {
    const value = parseFloat(valueStr);
    const valid = value > 0 && value <= parseFloat(logAmount(token.balance, token.decimals))
    if (valid) {
      setDisabledSubmit(false)
    } else {
      setDisabledSubmit(true)
    }
    setValue(value)
  }

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    if (signatureStatus && depositLoading) {
      //we are all set - can close the window
      //transaction has been sent and signed
      handleClose()
    }
  }, [ signatureStatus, depositLoading, handleClose ])

  console.log("Loading:", depositLoading)

  let buttonLabel_1 = 'CANCEL'
  if( depositLoading ) buttonLabel_1 = 'CLOSE WINDOW'

  let convertToUSD = false

  if( Object.keys(lookupPrice) &&
      !!value &&
      value > 0 &&
      value <= logAmount(token.balance, token.decimals) &&
      !!amountToUsd(value, lookupPrice, token)
  ) {
    convertToUSD = true
  }

  return (
    <>
      <Box>
        <Typography variant="h2" sx={{fontWeight: 700, mb: 3}}>
          Classic Bridge {token && token.symbol ? token.symbol : ''} to L2
        </Typography>

        <Input
          label="Amount to bridge to L2"
          placeholder="0.0"
          value={value}
          type="number"
          onChange={(i)=>setAmount(i.target.value)}
          unit={token.symbol}
          maxValue={logAmount(token.balance, token.decimals)}
          variant="standard"
          newStyle
        />

        {!!convertToUSD && (
          <Typography variant="body1" sx={{mt: 2, fontWeight: 700}}>
            {`Amount in USD ${amountToUsd(value, lookupPrice, token).toFixed(2)}`}
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
          size="large"
          variant="contained"
          loading={depositLoading}
          tooltip={depositLoading ? "Your transaction is still pending. Please wait for confirmation." : "Click here to bridge your funds to L2"}
          disabled={disabledSubmit}
          triggerTime={new Date()}
          fullWidth={isMobile}
        >
          Bridge
        </Button>
      </WrapperActionsModal>
    </>
  )
}

export default React.memo(InputStep)
