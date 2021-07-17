import { depositETHL2 } from 'actions/networkAction'
import { openAlert, openError, setActiveHistoryTab1 } from 'actions/uiAction'
import Button from 'components/button/Button'
import IconSelect from 'components/iconSelect/iconSelect'
import Input from 'components/input/Input'
import { ethers } from 'ethers'
import { isEqual, values } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectlayer1Balance } from 'selectors/balanceSelector'
import { selectLoading } from 'selectors/loadingSelector'
import { selectTokens } from 'selectors/tokenSelector'
import networkService from 'services/networkService'
import { logAmount } from 'util/amountConvert'
import * as styles from '../DepositModal.module.scss'

function InputStep({
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
  const [tokenOptions, setTokenOptions] = useState([])
  const [priorityTokens, setPriorityTokens] = useState([])
  const [dropdownTokens, setDropDownTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)

  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))

  const balancesL1 = useSelector(selectlayer1Balance, isEqual)
  const tokens = useSelector(selectTokens, isEqual)

  function handleClose() {
    onClose()
  }

  useEffect(() => {
    let allOptions = values(tokens)
      .map((t) => {
        let isBalanceL1Exists = balancesL1.find((i) => i.symbol === t.symbolL1)
        let isPriority = priorityTokens.find((i) => i.symbol === t.symbolL1)
        let isDropdown = dropdownTokens.find((i) => i.symbol === t.symbolL1)

        let balanceL1 = ''
        if (isBalanceL1Exists) {
          balanceL1 = logAmount(
            isBalanceL1Exists.amount,
            isBalanceL1Exists.decimals
          )
        }

        // added this to have the token icon available;
        let priorityToken = {}
        if (!!isPriority) {
          priorityToken = isPriority
        }

        // check the balance wether user is having it or not.
        if (!balanceL1) {
          return null
        }

        return {
          ...t,
          priority: !!isPriority,
          ...priorityToken,
          showInDD: !!isDropdown,
          balanceL1,
          balance: balanceL1,
        }
      })
      .filter(Boolean)

    setTokenOptions(allOptions)
  }, [tokens, priorityTokens, dropdownTokens, balancesL1])

  useEffect(() => {
    setSelectedToken(null)
  }, [])

  useEffect(() => {
    if (selectedToken && selectedToken.label === 'Manual') {
      setCurrencyL1Address('')
      setCurrencyL2Address('')
    } else if (selectedToken) {
      setCurrencyL1Address(selectedToken.addressL1 || '')
      setCurrencyL2Address(selectedToken.addressL2 || '')
    }
  }, [selectedToken, setCurrencyL1Address, setCurrencyL2Address])

  useEffect(() => {
    networkService
      .getPriorityTokens()
      .then((res) => {
        setPriorityTokens(res)
      })
      .catch((err) => {
        console.log('error priority tokens', err)
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
        dispatch(openAlert('ETH deposit submitted'))
        handleClose()
      } else {
        dispatch(openError('Failed to deposit ETH'))
      }
    }
  }

  const disabledSubmit =
    value <= 0 ||
    !currencyL1Address ||
    !ethers.utils.isAddress(currencyL1Address) ||
    !currencyL2Address ||
    !ethers.utils.isAddress(currencyL2Address)

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
      <h2>
        {`Traditional Deposit ${
          selectedToken && selectedToken.name ? selectedToken.name : ''
        }`}
      </h2>

      {!selectedToken ? (
        <IconSelect
          priorityOptions={tokenOptions.filter((d) => !!d.priority)}
          dropdownOptions={tokenOptions.filter((d) => !!d.showInDD)}
          onTokenSelect={setSelectedToken}
        />
      ) : null}

      {selectedToken && selectedToken.symbol !== 'ETH' ? (
        <>
          <Input
            label="L1 Token Contract Address"
            placeholder="0x"
            value={currencyL1Address}
            paste={true}
            onChange={(i) => setCurrencyL1Address(i.target.value.toLowerCase())} //because this is a user input!!
          />
          <Input
            label="L2 Token Contract Address"
            placeholder="0x"
            value={currencyL2Address}
            paste={true}
            onChange={(i) => setCurrencyL2Address(i.target.value.toLowerCase())} //because this is a user input!!
          />
        </>
      ) : null}

      {selectedToken &&
        <Input
          label="Amount to deposit into OMGX"
          type="number"
          unit={selectedToken && selectedToken.symbol ? renderUnit : ''}
          placeholder={0}
          value={value}
          onChange={(i) => setValue(i.target.value)}
        />
      }

      <div className={styles.buttons}>
        <Button onClick={handleClose} type="outline" style={{ flex: 0 }}>
          CANCEL
        </Button>
        {selectedToken &&
          selectedToken.symbol === 'ETH' &&
          !!selectedToken.balanceL1 &&
          !!Number(selectedToken.balanceL1) && (
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
