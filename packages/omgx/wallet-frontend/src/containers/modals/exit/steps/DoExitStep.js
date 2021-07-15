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
import { selectTokens } from 'selectors/tokenSelector'

import Button from 'components/button/Button'

import { logAmount, powAmount } from 'util/amountConvert'
import networkService from 'services/networkService'

import * as styles from '../ExitModal.module.scss'
import Input from 'components/input/Input'
import IconSelect from 'components/iconSelect/iconSelect'

function DoExitStep({ handleClose }) {
  const dispatch = useDispatch()

  const [currency, setCurrency] = useState('')

  const [tokenOptions, setTokenOptions] = useState([])
  const [priorityTokens, setPriorityTokens] = useState([])
  const [dropdownTokens, setDropDownTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [value, setValue] = useState('')

  const [disabledSubmit, setDisabledSubmit] = useState(true)

  const balancesL2 = useSelector(selectlayer2Balance, isEqual)
  const exitLoading = useSelector(selectLoading(['EXIT/CREATE']))

  async function doExit() {
    let res = await dispatch(exitOMGX(currency, value))

    //person will receive ETH on the L1, not oETH
    let currencyL1 = selectedToken.symbol
    if (res) {
      dispatch(
        openAlert(
          `${selectedToken.symbol} was exited to L1. You will receive ${Number(
            value
          ).toFixed(2)} ${
            currencyL1 === 'oETH' ? 'ETH' : currencyL1
          } on L1 after 7 days.`
        )
      )
      handleClose()
    } else {
      dispatch(openError(`Failed to exit L2`))
    }
  }

  function setExitAmount(value) {
    if (Number(value) > 0 && Number(value) < Number(selectedToken.balance)) {
      setDisabledSubmit(false)
    } else {
      setDisabledSubmit(true)
    }
    setValue(value)
  }

  useEffect(() => {
    console.log(priorityTokens)
    console.log(dropdownTokens)

    let pTokens = priorityTokens
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
          balanceL2 = logAmount(isBalanceExist.amount, isBalanceExist.decimals)
        }

        if (!balanceL2) {
          return
        }

        return {
          ...t,
          priority: true,
          showInDD: false,
          balanceL2,
          balance: balanceL2,
          ...isBalanceExist,
        }
      })
      .filter(Boolean)
    let ddTokens = dropdownTokens
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
          balanceL2 = logAmount(isBalanceExist.amount, isBalanceExist.decimals)
        }

        if (!balanceL2) {
          return
        }

        return {
          ...t,
          priority: false,
          showInDD: true,
          ...isBalanceExist,
          balanceL2,
          balance: balanceL2,
        }
      })
      .filter(Boolean)
    console.log('All options', [...pTokens, ...ddTokens])
    setTokenOptions([...pTokens, ...ddTokens])
  }, [balancesL2, priorityTokens, dropdownTokens])

  useEffect(() => {
    console.log('selectedToken', selectedToken)
    if (selectedToken && selectedToken.name === 'Manual') {
      setCurrency('')
    } else if (!!selectedToken) {
      setCurrency(selectedToken.L2address || '')
    }
  }, [selectedToken, setCurrency])

  useEffect(() => {
    setSelectedToken(null)
    networkService
      .getPriorityTokens()
      .then((res) => {
        setPriorityTokens(res)
      })
      .catch((err) => {
        console.log('error', err)
      })

    networkService
      .getDropdownTokens()
      .then((res) => {
        setDropDownTokens(res)
      })
      .catch((err) => {
        console.log('error dropdown tokens', err)
      })
  }, [])

  const renderUnit = (
    <div className={styles.tokenDetail}>
      <div className={styles.tokenSymbol}>
        {selectedToken ? selectedToken.symbol : ''}
      </div>
      <div className={styles.tokenBalance}>
        {selectedToken
          ? `Balance: ${Number(selectedToken.balance).toFixed(2)}`
          : ''}
      </div>
    </div>
  )

  return (
    <>
      <h2>
        Start Standard Exit : {` ${selectedToken ? selectedToken.name : ''}`}
      </h2>

      {!selectedToken ? (
        <IconSelect
          priorityOptions={tokenOptions.filter((d) => !!d.priority)}
          dropdownOptions={tokenOptions.filter((d) => !!d.showInDD)}
          onTokenSelect={setSelectedToken}
        />
      ) : null}

      {selectedToken ? (
        <>
          <Input
            label="L2 Contract Address"
            placeholder="0x"
            value={currency}
            paste={selectedToken ? selectedToken.name === 'Manual' : false}
            onChange={(i) => setCurrency(i.target.value.toLowerCase())} //because this is a user input!!
          />
        </>
      ) : null}
      <Input
        label="Amount to exit"
        placeholder={0}
        value={value}
        type="number"
        onChange={(i) => {
          setExitAmount(i.target.value)
        }}
        unit={
          selectedToken && selectedToken.name !== 'Manual' ? renderUnit : ''
        }
        maxValue={selectedToken ? selectedToken.balanceL2 : 0}
      />

      {!!selectedToken && selectedToken.symbol === 'oETH' && (
        <h3>
          {value &&
            `You will receive ${Number(value).toFixed(
              2
            )} ETH on L1. Your funds will be available on L1 in 7 days.`}
        </h3>
      )}

      {!!selectedToken && selectedToken.symbol !== 'oETH' && (
        <h3>
          {value &&
            `You will receive ${Number(value).toFixed(2)} ${
              selectedToken.symbol || ''
            } on L1. Your funds will be available on L1 in 7 days.`}
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
        {!!selectedToken && (
          <Button
            onClick={doExit}
            type="primary"
            style={{ flex: 0 }}
            loading={exitLoading}
            className={styles.button}
            tooltip="Your exit is still pending. Please wait for confirmation."
            disabled={disabledSubmit}
          >
            EXIT
          </Button>
        )}
      </div>
    </>
  )
}

export default React.memo(DoExitStep)
