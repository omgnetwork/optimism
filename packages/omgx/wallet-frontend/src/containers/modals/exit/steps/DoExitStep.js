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

import { exitOMGX } from 'actions/networkAction'
import { openAlert, openError } from 'actions/uiAction'
import Button from 'components/button/Button'
import IconSelect from 'components/iconSelect/iconSelect'
import Input from 'components/input/Input'
import { isEqual, values } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectlayer2Balance } from 'selectors/balanceSelector'
import { selectLoading } from 'selectors/loadingSelector'
import { selectTokens } from 'selectors/tokenSelector'
import networkService from 'services/networkService'
import { logAmount } from 'util/amountConvert'
import * as styles from '../ExitModal.module.scss'

function DoExitStep({ handleClose }) {
  const dispatch = useDispatch()

  const [currency, setCurrency] = useState('')

  const [tokenOptions, setTokenOptions] = useState([])
  const [priorityTokens, setPriorityTokens] = useState([])
  const [dropdownTokens, setDropDownTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)
  const [value, setValue] = useState('')

  const tokens = useSelector(selectTokens, isEqual)

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
    let allOptions = values(tokens)
      .map((t) => {
        let isBalanceL2Exists = balancesL2.find((b) => {
          if (
            (t.symbolL2 === 'ETH' && b.symbol === 'oETH') ||
            t.symbolL2 === b.symbol
          ) {
            return true
          }
          return false
        })

        let isPriority = priorityTokens.find((i) => i.symbol === t.symbolL2)
        let isDropdown = dropdownTokens.find((i) => i.symbol === t.symbolL2)
        let balanceL2 = ''
        
        if (isBalanceL2Exists) {
          balanceL2 = logAmount(
            isBalanceL2Exists.amount,
            isBalanceL2Exists.decimals
          )
        }

        // added this to have the token icon available
        let priorityToken = {}
        if (!!isPriority) {
          priorityToken = isPriority
        }

        // check the balance whether user has this token
        if (!balanceL2) {
          return null
        }

        return {
          ...t,
          priority: !!isPriority,
          ...priorityToken,
          showInDD: !!isDropdown,
          balanceL2,
          balance: balanceL2,
        }
      })
      .filter(Boolean)

    setTokenOptions(allOptions)
  }, [balancesL2, priorityTokens, dropdownTokens, tokens])

  useEffect(() => {
    if (selectedToken && selectedToken.name === 'Manual') {
      setCurrency('')
    } else if (!!selectedToken) {
      setCurrency(selectedToken.addressL2 || '')
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
