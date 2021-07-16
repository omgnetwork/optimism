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
import { depositL1LP } from 'actions/networkAction'
import { openAlert, openError, setActiveHistoryTab1 } from 'actions/uiAction'
import Button from 'components/button/Button'
import IconSelect from 'components/iconSelect/iconSelect'
import Input from 'components/input/Input'
import { ethers } from 'ethers'
import { isEqual } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectlayer1Balance } from 'selectors/balanceSelector'
import { selectLoading } from 'selectors/loadingSelector'
import networkService from 'services/networkService'
import { logAmount } from 'util/amountConvert'
import * as styles from '../DepositModal.module.scss'

function InputStepFast({
  onClose,
  onNext,
  currencyL1Address,
  currencyL2Address,
  setCurrencyL1Address,
  setCurrencyL2Address,
  tokenInfo,
  value,
  setValue,
  setTokenInfo,
}) {
  const dispatch = useDispatch()

  const [tokens, setTokens] = useState([])
  const [priorityOptions, setPriorityOptions] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [LPBalance, setLPBalance] = useState(0)
  const [feeRate, setFeeRate] = useState(0)
  const balancesL1 = useSelector(selectlayer1Balance, isEqual)

  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))

  function handleClose() {
    onClose()
  }

  async function depositETH() {
    if (value > 0 && tokenInfo) {
      let res = await dispatch(depositL1LP(selectedToken.L1, value))
      if (res) {
        dispatch(setActiveHistoryTab1('Deposits'))
        dispatch(
          openAlert(
            `ETH was deposited into the L1LP. You will receive
            ${((Number(value) * (100 - Number(feeRate))) / 100).toFixed(2)}
            oETH on L2`
          )
        )
        handleClose()
      } else {
        dispatch(openError('Failed to deposit ETH'))
      }
    }
  }

  useEffect(() => {
    if (!!selectedToken) {
      setCurrencyL1Address(selectedToken.L1 || '')
      setCurrencyL2Address(selectedToken.L2 || '')
    }
  }, [selectedToken, setCurrencyL1Address, setCurrencyL2Address])

  //which tokens are available for swap on?
  useEffect(() => {
    networkService
      .getSwapTokens() //this is where the set of swap tokens is defined
      .then((res) => {
        setTokens(res)
      })
      .catch((err) => {
        console.log('error', err)
      })
  }, [])

  useEffect(() => {
    if (tokens && tokens.length > 0) {
      let allOptions = tokens
        .map((t) => {
          let isBalanceExist = balancesL1.find((b) => {
            if (
              (t.symbol === 'ETH' && b.symbol === 'oETH') ||
              t.symbol === b.symbol
            ) {
              return true
            }
            return false
          })

          let balanceL1 = ''
          if (isBalanceExist) {
            balanceL1 = logAmount(
              isBalanceExist.amount,
              isBalanceExist.decimals
            )
          }

          if (!balanceL1) {
            return null
          }

          return {
            ...t,
            ...isBalanceExist,
            balanceL1,
          }
        })
        .filter(Boolean)
      setPriorityOptions(allOptions)
    }
  }, [tokens, balancesL1])

  const disabledSubmit =
    value <= 0 ||
    !selectedToken.L2 ||
    !ethers.utils.isAddress(selectedToken.L2) ||
    Number(value) > Number(LPBalance)

  //look up levels in the L2 liquidity pools
  if (selectedToken) {
    networkService.L2LPBalance(selectedToken.L2).then((res) => {
      setLPBalance(Number(res).toFixed(2))
    })
    networkService.getTotalFeeRate().then((feeRate) => {
      setFeeRate(feeRate)
    })
  }

  const renderUnit = (
    <div className={styles.tokenDetail}>
      <div className={styles.tokenSymbol}>
        {selectedToken
          ? selectedToken.symbol === 'oETH'
            ? 'ETH'
            : selectedToken.symbol
          : ''}
      </div>
      <div className={styles.tokenBalance}>
        {selectedToken
          ? `Balance: ${Number(selectedToken.balanceL1).toFixed(2)}`
          : ''}
      </div>
    </div>
  )

  return (
    <>
      <h2>Fast Swap onto OMGX</h2>

      {!selectedToken ? (
        <IconSelect
          priorityOptions={priorityOptions}
          disableDD={true}
          onTokenSelect={setSelectedToken}
        />
      ) : null}

      {!!selectedToken && (
        <Input
          label="Amount to swap onto OMGX"
          type="number"
          unit={selectedToken ? renderUnit : null}
          placeholder={0}
          value={value}
          onChange={(i) => setValue(i.target.value)}
        />
      )}

      {selectedToken && selectedToken.symbol === 'ETH' && (
        <>
          <h3>
            Liquidity pool balance: {LPBalance} oETH
            <br />
            Liquidity fee: {feeRate}%<br />
            {value &&
              `You will receive
              ${((Number(value) * (100 - Number(feeRate))) / 100).toFixed(2)}
              oETH on L2`}
          </h3>
        </>
      )}

      {selectedToken && selectedToken.symbol !== 'ETH' && (
        <>
          <h3>
            Liquidity pool ballance: {LPBalance} {selectedToken.symbol}
            <br />
            Liquidity fee: {feeRate}%<br />
            {value &&
              `You will receive
              ${((Number(value) * (100 - Number(feeRate))) / 100).toFixed(2)}
              ${selectedToken.symbol} on L2`}
          </h3>
        </>
      )}

      {Number(LPBalance) < Number(value) && (
        <h3 style={{ color: 'red' }}>
          The L2 liquidity pool balance is too low to cover your swap - please
          use the traditional deposit instead.
        </h3>
      )}

      <div className={styles.buttons}>
        <Button onClick={handleClose} type="outline" style={{ flex: 0 }}>
          CANCEL
        </Button>
        {selectedToken && selectedToken.symbol === 'ETH' && (
          <Button
            onClick={depositETH}
            type="primary"
            style={{ flex: 0, minWidth: 200 }}
            loading={depositLoading}
            tooltip="Your transaction is still pending. Please wait for confirmation."
            disabled={disabledSubmit}
          >
            SWAP ON!
          </Button>
        )}
        {selectedToken && selectedToken.symbol !== 'ETH' && (
          <Button
            onClick={onNext}
            type="primary"
            style={{ flex: 0, minWidth: 200 }}
            disabled={disabledSubmit}
          >
            NEXT
          </Button>
        )}
      </div>
    </>
  )
}

export default React.memo(InputStepFast)
