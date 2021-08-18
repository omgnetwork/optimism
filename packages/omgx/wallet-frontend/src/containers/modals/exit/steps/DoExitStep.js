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

import { Box, Grid, Typography } from '@material-ui/core'
import { exitOMGX } from 'actions/networkAction'
import { openAlert, openError } from 'actions/uiAction'
import Button from 'components/button/Button'
import Input from 'components/input/Input'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectLoading } from 'selectors/loadingSelector'
import { selectLookupPrice } from 'selectors/lookupSelector'
import { amountToUsd, logAmount } from 'util/amountConvert'
import * as styles from '../ExitModal.module.scss'

function DoExitStep({ handleClose, token }) {

  const dispatch = useDispatch()

  const [value, setValue] = useState('')
  const [disabledSubmit, setDisabledSubmit] = useState(true)
  const exitLoading = useSelector(selectLoading(['EXIT/CREATE']))
  const lookupPrice = useSelector(selectLookupPrice);

  async function doExit() {

    let res = await dispatch(exitOMGX(token.address, value))

    //person will receive ETH on the L1, not oETH
    let currencyL1 = token.symbol

    if (currencyL1 === 'oETH')
      currencyL1 = 'ETH'

    if (res) {
      dispatch(
        openAlert(
          `${token.symbol} was exited to L1. You will receive
          ${Number(value).toFixed(2)} ${currencyL1}
          on L1 in 7 days.`
        )
      )
      handleClose()
    } else {
      dispatch(openError(`Failed to exit L2`))
    }
  }

  function setExitAmount(value) {
    if (Number(value) > 0 && Number(value) < Number(token.balance)) {
      setDisabledSubmit(false)
    } else {
      setDisabledSubmit(true)
    }
    setValue(value)
  }

  return (
    <>
      <Typography variant="h3" gutterBottom>
        Standard Exit ({` ${token ? token.symbol : ''}`})
      </Typography>

      <Box display="block">
        <Input
          label={'Amount to exit'}
          placeholder="0.0"
          value={value}
          type="number"
          onChange={(i)=>{setExitAmount(i.target.value)}}
          unit={token.symbol}
          maxValue={logAmount(token.balance, token.decimals)}
        />
      </Box>


      {token && token.symbol === 'oETH' && (
        <h3>
          {value &&
            `You will receive ${Number(value).toFixed(2)} ETH
            ${!!amountToUsd(value, lookupPrice, token) ?  `($${amountToUsd(value, lookupPrice, token).toFixed(2)})`: ''}
            on L1.
            Your funds will be available on L1 in 7 days.`}
        </h3>
      )}

      {token && token.symbol !== 'oETH' && (
        <h3>
          {value &&
            `You will receive ${Number(value).toFixed(2)}
            ${token.symbol}
            ${!!amountToUsd(value, lookupPrice, token) ?  `($${amountToUsd(value, lookupPrice, token).toFixed(2)})`: ''}
            on L1.
            Your funds will be available on L1 in 7 days.`}
        </h3>
      )}

      <Grid justifyContent="flex-end" container spacing={2}>
        <Grid item>
          <Button
            onClick={handleClose}
            color="neutral"
            style={{ flex: 0 }}
          >
            Cancel
          </Button>
        </Grid>
        <Grid item>
          {token && (
            <Button
              onClick={doExit}
              color="primary"
              variant="contained"
              loading={exitLoading}
              tooltip="Your exit is still pending. Please wait for confirmation."
              disabled={disabledSubmit}
              triggerTime={new Date()}
            >
              Exit
            </Button>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default React.memo(DoExitStep)
