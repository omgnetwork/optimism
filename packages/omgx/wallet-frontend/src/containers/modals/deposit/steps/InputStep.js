import { depositETHL2, depositL1LP } from 'actions/networkAction'
import { openAlert, openError, setActiveHistoryTab1 } from 'actions/uiAction'
import Button from 'components/button/Button'
import IconSelect from 'components/iconSelect/iconSelect'
import Input from 'components/input/Input'
import Tabs from 'components/tabs/Tabs'
import { ethers } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectLoading } from 'selectors/loadingSelector'
import networkService from 'services/networkService'
import * as styles from '../DepositModal.module.scss'

function InputStep({
  onClose,
  onNext,
  currency,
  currencyL2,
  setCurrency,
  setCurrencyL2,
  tokenInfo,
  value,
  setValue,
  setTokenInfo,
}) {
  const dispatch = useDispatch()

  const [tokens, setTokens] = useState([])
  const [priorityTokens, setPriorityTokens] = useState([])
  const [dropdownTokens, setDropDownTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)

  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))

  function handleClose() {
    onClose()
  }

  useEffect(() => {
    setSelectedToken(null)
  }, [])

  useEffect(() => {
    console.log(selectedToken)
    if (selectedToken && selectedToken.label === 'manual') {
      setCurrency('')
      setCurrencyL2('')
    } else if (!!selectedToken && !!selectedToken.details) {
      setCurrency(selectedToken.details.L1 || '')
      setCurrencyL2(selectedToken.details.L2 || '')
    }
  }, [selectedToken, setCurrency, setCurrencyL2])

  useEffect(() => {
    // load priority tokens
    networkService
      .getPriorityTokens()
      .then((res) => {
        setTokens(res)
        setPriorityTokens(res)
      })
      .catch((err) => {
        console.log('error', err)
      })
    // load dropdown tokens
    networkService
      .getDropdownTokens()
      .then((res) => {
        setDropDownTokens(res)
      })
      .catch((err) => {
        console.log('error dropdown tokens', err)
      })
  }, [])

  async function depositETH() {
    //move ETH from L1 to L2
    if (value > 0 && tokenInfo) {
      let res = await dispatch(depositETHL2(value))
      if (res) {
        dispatch(setActiveHistoryTab1('Deposits'))
        dispatch(openAlert('ETH deposit submitted.'))
        handleClose()
      } else {
        dispatch(openError('Failed to deposit ETH'))
      }
    }
  }

  const disabledSubmit =
    value <= 0 ||
    !currency ||
    !ethers.utils.isAddress(currency) ||
    !currencyL2 ||
    !ethers.utils.isAddress(currencyL2)

  return (
    <>
      <h2>
        {`Traditional Deposit ${
          selectedToken && selectedToken.details
            ? selectedToken.details.name
            : ''
        }`}
      </h2>

      {!selectedToken ? (
        <IconSelect
          priorityOptions={priorityTokens}
          dropdownOptions={dropdownTokens}
          onTokenSelect={setSelectedToken}
        />
      ) : null}

      {selectedToken && selectedToken.symbol !== 'ETH' ? (
        <>
          <Input
            label="L1 Token Contract Address"
            placeholder="0x"
            value={currency}
            paste={selectedToken ? selectedToken.title === 'manual' : false}
            onChange={(i) => setCurrency(i.target.value.toLowerCase())} //because this is a user input!!
          />
          <Input
            label="L2 Token Contract Address"
            placeholder="0x"
            value={currencyL2}
            paste={selectedToken ? selectedToken.title === 'manual' : false}
            onChange={(i) => setCurrencyL2(i.target.value.toLowerCase())} //because this is a user input!!
          />
        </>
      ) : null}

      <Input
        label="Amount to deposit into OMGX"
        type="number"
        unit={tokenInfo && selectedToken ? tokenInfo.symbol : ''}
        placeholder={0}
        value={value}
        onChange={(i) => setValue(i.target.value)}
      />

      <div className={styles.buttons}>
        <Button onClick={handleClose} type="outline" style={{ flex: 0 }}>
          CANCEL
        </Button>
        {selectedToken && selectedToken.symbol === 'ETH' && (
          <Button
            onClick={depositETH}
            type="primary"
            style={{ flex: 0 }}
            loading={depositLoading}
            tooltip="Your deposit is still pending. Please wait for confirmation."
            disabled={disabledSubmit}
          >
            DEPOSIT
          </Button>
        )}
        {selectedToken && selectedToken.symbol !== 'ETH' && (
          <Button
            onClick={onNext}
            type="primary"
            style={{ flex: 0 }}
            disabled={disabledSubmit}
          >
            NEXT
          </Button>
        )}
      </div>
    </>
  )
}

export default React.memo(InputStep)
