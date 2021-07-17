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

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BigNumber } from 'ethers'
import { isEqual } from 'lodash'

import { selectlayer2Balance } from 'selectors/balanceSelector'

import { 
  depositL2LP, 
  approveERC20_L2LP 
} from 'actions/networkAction'

import { openAlert, openError } from 'actions/uiAction'
import { selectLoading } from 'selectors/loadingSelector'

import Button from 'components/button/Button'

import { logAmount, powAmount } from 'util/amountConvert'
import networkService from 'services/networkService'

import * as styles from '../ExitModal.module.scss'
import Input from 'components/input/Input'
import IconSelect from 'components/iconSelect/iconSelect'

function DoExitStepFast({ handleClose }) {

  const dispatch = useDispatch()

  const [currency, setCurrency] = useState('')
  const [tokens, setTokens] = useState([])
  const [priorityOptions, setPriorityOptions] = useState([])

  const [selectedToken, setSelectedToken] = useState(null)
  const [value, setValue] = useState('')
  const [LPBalance, setLPBalance] = useState(0)
  const [feeRate, setFeeRate] = useState(0)
  const [allowance, setAllowance] = useState(0)
  const [disabledSubmit, setDisabledSubmit] = useState(true)

  const approveLoading = useSelector(selectLoading(['APPROVE/CREATE']))
  const exitLoading = useSelector(selectLoading(['EXIT/CREATE']))

  const balancesL2 = useSelector(selectlayer2Balance, isEqual)

  function setExitAmount(value) {
    if (
      Number(value) > 0 &&
      Number(value) < Number(LPBalance) &&
      Number(value) < Number(selectedToken.balanceL2)
    ) {
      setDisabledSubmit(false)
    } else {
      setDisabledSubmit(true)
    }
    setValue(value)
  }

  async function doApprove() {
    
    const res = await dispatch(
      approveERC20_L2LP(
        powAmount(value, 18), //takes a value, converts to 18 decimals, generates string
        currency 
      )
    )
    
    if (res) {
      dispatch(openAlert(`Transaction was approved`))
      setAllowance(powAmount(value, 18))
    }
  }

  const receivableAmount = (value) => {
     return (Number(value) * ((100 - Number(feeRate)) / 100)).toFixed(2)
  }

  async function doExit() {

    let res = await dispatch(
      depositL2LP(
        currency,
        powAmount(value, 18) //takes a value, converts to 18 decimals, generates string
      )
    )

    let currencyL1 = selectedToken.symbol

    //person will receive ETH on the L1, not oETH
    if (currencyL1 === 'oETH') {
      currencyL1 = 'ETH'
    }

    if (res) {
      dispatch(openAlert(`${selectedToken.symbol} was deposited into the L2 liquidity pool. 
        You will receive ${receivableAmount(value)} ${currencyL1} on L1.`));
      handleClose();
    } else {
      dispatch(openError(`Failed to fast-exit fund from L2`));
    }

  }

  useEffect(() => {
    setSelectedToken(null)
    networkService
      .getSwapTokens()
      .then((res) => {
        setTokens(res)
      })
      .catch((error) => {
        console.log('Error while loading swap', error)
      })
  }, [])

  useEffect(() => {
    if (currency) {
      networkService.L1LPBalance(currency).then((res) => {
        setLPBalance(Number(res).toFixed(2))
      })
      networkService.getTotalFeeRate().then((feeRate) => {
        setFeeRate(feeRate)
      })
    }
  }, [currency])

  useEffect(() => {
    if (!!selectedToken) {
      setCurrency(selectedToken.L2 || '')
    }
  }, [selectedToken, setCurrency])

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      let allOptions = tokens
        .map((t) => {
          let isBalanceExist = balancesL2.find((b) => {
            if (
              (t.symbol === 'ETH' && b.symbol === 'oETH') ||
              t.symbol === b.symbol
            ) {
              return true
            }
            return false
          })

          let balanceL2 = ''
          if (isBalanceExist) {
            balanceL2 = logAmount(
              isBalanceExist.amount,
              isBalanceExist.decimals
            )
          }

          if (!balanceL2) {
            return null
          }

          return {
            ...t,
            ...isBalanceExist,
            balanceL2,
          }
        })
        .filter(Boolean)
      setPriorityOptions(allOptions)
    }
  }, [tokens, balancesL2])

  const renderUnit = (
    <div className={styles.tokenDetail}>
      <div className={styles.tokenSymbol}>
        {selectedToken ? selectedToken.symbol : ''}
      </div>
      <div className={styles.tokenBalance}>
        {selectedToken
          ? `Balance: ${Number(selectedToken.balanceL2).toFixed(2)}`
          : ''}
      </div>
    </div>
  )

  console.log(allowance)
  console.log(value)
  console.log(typeof(value))

  const allowanceTooSmall = BigNumber.from(allowance).lt(BigNumber.from(powAmount(value ? value : 0, 18)))

  return (
    <>

      {!selectedToken && 
        <h2>Fast Exit</h2>
      }

      {selectedToken && value === '' &&
        <h2>Select Amount</h2>
      }

      {selectedToken && Number(value) > 0 && allowanceTooSmall &&
        <h2>Approve Amount</h2>
      }

      {selectedToken && allowance > 0 &&
        <h2>Complete fast exit</h2>
      }

      {!selectedToken ? (
        <IconSelect
          priorityOptions={priorityOptions}
          disableDD={true}
          onTokenSelect={setSelectedToken}
        />
      ) : null}

      {selectedToken && (
        <Input
          label="Amount to exit"
          placeholder={0}
          value={value}
          type="number"
          onChange={(i)=>{setExitAmount(i.target.value)}}
          unit={selectedToken ? renderUnit : ''}
          maxValue={selectedToken.balanceL2}
        />
      )}

      {selectedToken && selectedToken.symbol === 'oETH' && (
        <h3>
          Fee:{' '}{feeRate}%<br/>
          {value &&
            `You will receive 
            ${receivableAmount(value)} 
            ETH on L1`}
        </h3>
      )}

      {selectedToken && selectedToken.symbol !== 'oETH' && (
        <h3>
          Fee:{' '}{feeRate}%<br/>
          {value &&
            `You will receive 
            ${receivableAmount(value)} 
            ${selectedToken.symbol} 
            on L1`}
        </h3>
      )}

      {allowanceTooSmall && (
        <h3>
          To exit {Number(value).toFixed(2)} {selectedToken.symbol},
          you first need to approve the amount.
        </h3>
      )}

      {Number(LPBalance) < Number(value) && (
        <h3 style={{color: 'red'}}>
          The liquidity pool balance (of {LPBalance}) is too low to cover your swap - please
          use the traditional exit or reduce the amount to swap.
        </h3>
      )}

      <div className={styles.buttons}>
        <Button
          onClick={handleClose}
          className={styles.button}
          type="outline"
          style={{flex: 0}}
        >
          CANCEL
        </Button>
        {allowanceTooSmall && 
          <Button
            onClick={doApprove}
            type='primary'
            style={{flex: 0, minWidth: 200}}
            loading={approveLoading}
            className={styles.button}
            tooltip='Your exit is still pending. Please wait for confirmation.'
            disabled={disabledSubmit}
          >
            APPROVE AMOUNT
          </Button>
        }
        {selectedToken && !allowanceTooSmall && 
          <Button
            onClick={doExit}
            type='primary'
            style={{flex: 0, minWidth: 200}}
            loading={exitLoading}
            className={styles.button}
            tooltip='Your exit is still pending. Please wait for confirmation.'
            disabled={disabledSubmit}
          >
            FAST EXIT
          </Button>
        }
      </div>
    </>
  )
}

export default React.memo(DoExitStepFast)
