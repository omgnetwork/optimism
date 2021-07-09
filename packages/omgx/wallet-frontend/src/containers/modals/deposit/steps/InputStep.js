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

const ETH0x = '0x0000000000000000000000000000000000000000'

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
  fast,
  setTokenInfo,
}) {
  const dispatch = useDispatch()

  let uSC = 'ETH'

  const [tokens, setTokens] = useState([])
  const [selectedToken, setSelectedToken] = useState(null)

  const [activeTab1, setActiveTab1] = useState(uSC)
  const [LPBalance, setLPBalance] = useState(0)
  const [feeRate, setFeeRate] = useState(0)

  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))

  function handleClose() {
    setActiveTab1('ETH')
    onClose()
  }

  useEffect(() => {
    setSelectedToken(null)
  }, [])
  useEffect(() => {
    if (activeTab1 === 'ETH') setSelectedToken(null)
  }, [activeTab1])

  useEffect(() => {
    if (selectedToken && selectedToken.title === 'manual') {
      setCurrency('')
      setCurrencyL2('')
    } else if (!!selectedToken) {
      setCurrency(selectedToken.L1address)
      setCurrencyL2(selectedToken.L2address)
    }
  }, [selectedToken, setCurrency, setCurrencyL2])

  useEffect(() => {
    networkService
      .getTokens()
      .then((res) => {
        let localTokens = res.map((t) => {
          return {
            title: t.name,
            subTitle: t.symbol,
            value: t.name,
            ...t,
          }
        })
        setTokens(localTokens)
      })
      .catch((err) => {
        console.log('error', err)
      })
  }, [])

  async function depositETH() {
    if (value > 0 && tokenInfo) {
      let res
      if (fast) {
        res = await dispatch(depositL1LP(currency, value))
      } else {
        res = await dispatch(depositETHL2(value))
      }
      if (res) {
        dispatch(setActiveHistoryTab1('Deposits'))
        if (fast) {
          dispatch(
            openAlert(
              `ETH was deposited the the L1LP. You will receive ${(
                Number(value) * 0.97
              ).toFixed(2)} oETH on L2`
            )
          )
        } else {
          dispatch(openAlert('ETH deposit submitted.'))
        }
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
    (!fast && !currencyL2) ||
    (!fast && !ethers.utils.isAddress(currencyL2)) ||
    (fast && Number(value) > Number(LPBalance))

  if (fast && Object.keys(tokenInfo).length && currency) {
    networkService.L2LPBalance(currency).then((LPBalance) => {
      setLPBalance(LPBalance)
    })
    networkService.getTotalFeeRate().then((feeRate) => {
      setFeeRate(feeRate)
    })
  }

  return (
    <>
      {fast && <h2>Fast swap onto OMGX</h2>}

      {!fast && (
        <h2>{`Traditional Deposit : ${
          selectedToken ? selectedToken.title : ''
        }`}</h2>
      )}

      <Tabs
        className={styles.tabs}
        onClick={(i) => {
          if (i === 'ETH') {
            setCurrency(ETH0x)
            setCurrencyL2('')
          } else {
            setCurrency('')
            setCurrencyL2('')
          }
          setActiveTab1(i)
        }}
        activeTab={activeTab1}
        tabs={['ETH', 'ERC20']}
      />

      {activeTab1 === 'ERC20' && !fast && !selectedToken ? (
        <IconSelect selectOptions={tokens} onTokenSelect={setSelectedToken} />
      ) : null}

      {activeTab1 === 'ERC20' && !fast && selectedToken ? (
        <>
          <Input
            label="ERC20 Token Smart Contract Address."
            placeholder="0x"
            value={currency}
            paste={selectedToken ? selectedToken.title === 'manual' : false}
            onChange={(i) => setCurrency(i.target.value.toLowerCase())} //because this is a user input!!
          />
          <Input
            label="L2 Contract Address"
            placeholder="0x"
            value={currencyL2}
            paste={selectedToken ? selectedToken.title === 'manual' : false}
            onChange={(i) => setCurrencyL2(i.target.value.toLowerCase())} //because this is a user input!!
          />
        </>
      ) : null}

      {activeTab1 === 'ERC20' && !!fast ? (
        <Input
          label="ERC20 Token Smart Contract Address."
          placeholder="0x"
          paste
          value={currency}
          onChange={(i) => setCurrency(i.target.value.toLowerCase())} //because this is a user input!!
        />
      ) : null}

      <Input
        label="Amount to deposit into OMGX"
        type="number"
        unit={tokenInfo ? tokenInfo.symbol : ''}
        placeholder={0}
        value={value}
        onChange={(i) => setValue(i.target.value)}
      />

      {fast &&
      activeTab1 === 'ETH' &&
      Object.keys(tokenInfo).length &&
      currency ? (
        <>
          <h3>
            The L2 liquidity pool has {LPBalance} oETH. The liquidity fee is{' '}
            {feeRate}%.{' '}
            {value &&
              `You will receive ${(Number(value) * 0.97).toFixed(
                2
              )} oETH on L2.`}
          </h3>
        </>
      ) : (
        <></>
      )}

      {fast &&
      activeTab1 === 'ERC20' &&
      Object.keys(tokenInfo).length &&
      currency ? (
        <>
          <h3>
            The L2 liquidity pool contains {LPBalance} {tokenInfo.symbol}. The
            liquidity fee is {feeRate}%.{' '}
            {value &&
              `You will receive ${(Number(value) * 0.97).toFixed(2)} ${
                tokenInfo.symbol
              } on L2.`}
          </h3>
        </>
      ) : (
        <></>
      )}

      {fast && Number(LPBalance) < Number(value) && (
        <h3 style={{ color: 'red' }}>
          The L2 liquidity pool doesn't have enough balance to cover your swap.
        </h3>
      )}

      <div className={styles.buttons}>
        <Button onClick={handleClose} type="outline" style={{ flex: 0 }}>
          CANCEL
        </Button>
        {activeTab1 === 'ETH' && (
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
        {activeTab1 === 'ERC20' && (
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
