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

import { exitOMGX, depositL2LP, approveErc20 } from 'actions/networkAction'
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
      approveErc20(powAmount(value, 18), currency, networkService.L2LPAddress)
    )
    if (res) {
      dispatch(openAlert(`Transaction was approved`))
      const allowance = await networkService.checkAllowance(
        currency,
        networkService.L2LPAddress
      )
      setAllowance(allowance)
      // hit to close modal
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
        setLPBalance(Number(res).toFixed(1))
      })
      networkService.getTotalFeeRate().then((feeRate) => {
        setFeeRate(feeRate)
      })
      networkService
        .checkAllowance(currency, networkService.L2LPAddress)
        .then((allowance) => {
          setAllowance(allowance)
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
            return
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

  return (
    <>
      <h2>Start Fast (Swap-off) Exit</h2>

      {!selectedToken ? (
        <IconSelect
          priorityOptions={priorityOptions}
          onTokenSelect={setSelectedToken}
        />
      ) : null}

      {!!selectedToken && (
        <Input
          label="Amount to exit"
          placeholder={0}
          value={value}
          type="number"
          onChange={(i) => {
            setExitAmount(i.target.value)
          }}
          unit={selectedToken ? renderUnit : ''}
          selectValue={currency}
          maxValue={selectedToken.balanceL2}
        />
      )}
      {selectedToken && selectedToken.symbol === 'oETH' && (
        <h3>
          The L1 liquidity pool has {LPBalance} ETH. The liquidity fee is{' '}
          {feeRate}%.{' '}
          {value &&
            `You will receive ${(Number(value) * 0.97).toFixed(2)} ETH on L1.`}
        </h3>
      )}

      {selectedToken && selectedToken.symbol !== 'oETH' && (
        <h3>
          The L1 liquidity pool has {LPBalance} {selectedToken.symbol}. The
          liquidity fee is {feeRate}%.{' '}
          {value &&
            `You will receive ${(Number(value) * 0.97).toFixed(2)} ${
              selectedToken.symbol
            } on L1.`}
        </h3>
      )}

      {BigNumber.from(allowance).lt(
        BigNumber.from(powAmount(value ? value : 0, 18))
      ) && (
        <h3>
          To deposit {value.toString()}{' '}
          {selectedToken && selectedToken.symbol === 'oETH'
            ? 'ETH'
            : selectedToken.symbol}
          , you first need to allow us to hold {value.toString()} of your{' '}
          {selectedToken && selectedToken.symbol === 'oETH'
            ? 'ETH'
            : selectedToken.symbol}
          . Click below to submit an approval transaction.
        </h3>
      )}

      {Number(LPBalance) < Number(value) && (
        <h3 style={{ color: 'red' }}>
          The L1 liquidity pool doesn't have enough balance to cover your swap.
        </h3>
      )}

      <div className={styles.buttons}>
        <Button
          onClick={handleClose}
          className={styles.button}
          type="outline"
          style={{ flex: 0 }}
        >
          CANCEL
        </Button>
        {BigNumber.from(allowance).lt(
          BigNumber.from(powAmount(value ? value : 0, 18))
        ) ? (
          <Button
            onClick={doApprove}
            type="primary"
            style={{ flex: 0 }}
            loading={approveLoading}
            className={styles.button}
            tooltip="Your exit is still pending. Please wait for confirmation."
            disabled={disabledSubmit}
          >
            APPROVE
          </Button>
        ) : null}
      </div>
    </>
  )
}

export default React.memo(DoExitStepFast)
