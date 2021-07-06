import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useDispatch, useSelector } from 'react-redux'

import Button from 'components/button/Button'
import Input from 'components/input/Input'
import Tabs from 'components/tabs/Tabs'

import { openAlert, openError, setActiveHistoryTab1 } from 'actions/uiAction'
import networkService from 'services/networkService'
import { selectLoading } from 'selectors/loadingSelector'
import { depositETHL2, depositL1LP } from 'actions/networkAction'

import * as styles from '../DepositModal.module.scss'
import InputSelect from 'components/inputselect/InputSelect'

const ETH0x = '0x0000000000000000000000000000000000000000'

function InputStep({
  onClose,
  onNext,
  currency,
  tokenInfo,
  value,
  setCurrency,
  setTokenInfo,
  setValue,
  fast,
  tokenAddresses,
  setTokenAddresses,
}) {
  const dispatch = useDispatch()

  let uSC = 'ETH'

  const [tokens, setTokens] = useState([])

  const [activeTab1, setActiveTab1] = useState(uSC)
  const [LPBalance, setLPBalance] = useState(0)
  const [feeRate, setFeeRate] = useState(0)
  const [paste, setPaste] = useState(true)
  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))

  function handleClose() {
    setActiveTab1('ETH')
    onClose()
  }

  useEffect(() => {
    networkService
      .getTokens()
      .then((res) => {
        let localTokens = res.map((t) => {
          return {
            title: t.name,
            subTitle: t.symbol,
            value: JSON.stringify({
              L1address: t.L1address,
              L2address: t.L2address,
            }),
          }
        })
        setTokens(localTokens)
      })
      .catch((res) => {
        let localTokens = res.map((t) => {
          return {
            title: t.name,
            subTitle: t.symbol,
          }
        })
        setTokens(localTokens)
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

  const disabledSubmit = () => {
    if (activeTab1 === 'ERC20' && !fast) {
      return (
        value <= 0 ||
        !tokenAddresses ||
        !tokenAddresses.L1address ||
        !tokenAddresses.L2address
      )
    } else {
      return (
        value <= 0 ||
        !currency ||
        !ethers.utils.isAddress(currency) ||
        (fast && Number(value) > Number(LPBalance))
      )
    }
  }

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

      {!fast && <h2>Traditional Deposit</h2>}

      <Tabs
        className={styles.tabs}
        onClick={(i) => {
          i === 'ETH' ? setCurrency(ETH0x) : setCurrency('')
          setActiveTab1(i)
        }}
        activeTab={activeTab1}
        tabs={['ETH', 'ERC20']}
      />

      {activeTab1 === 'ERC20' ? (
        !fast ? (
          <>
            <InputSelect
              label="ERC20 Token Smart Contract Address."
              placeholder={'0x'}
              value={tokenAddresses.L1address}
              paste={paste}
              onChange={(i) => {
                console.log('On change L1', i.target.value)
                // setCurrency(i.target.value)
              }}
              type="text"
              selectOptions={tokens}
              onSelect={(i) => {
                console.log('On select L2', i.target.value)
                let value = JSON.parse(i.target.value)
                if (!value.L1address) {
                  setPaste(true)
                } else {
                  console.log('remove paste')
                  setPaste(false)
                }
                setTokenAddresses(value)
              }}
              selectValue={JSON.stringify(tokenAddresses)}
            />
            <InputSelect
              label="L2 Contract Address"
              placeholder={'0x'}
              value={tokenAddresses.L2address}
              paste={paste}
              onChange={(i) => {
                console.log('On change L2', i.target.value)
              }}
              type="text"
              selectOptions={tokens}
              onSelect={(i) => {
                let value = JSON.parse(i.target.value)
                if (!value.L1address) {
                  setPaste(true)
                } else {
                  setPaste(false)
                }
                setTokenAddresses(value)
                // setCurrency(i.target.value)
              }}
              selectValue={JSON.stringify(tokenAddresses)}
            />
          </>
        ) : (
          <Input
            label="ERC20 Token Smart Contract Address."
            placeholder="0x"
            paste
            value={currency}
            onChange={(i) => setCurrency(i.target.value.toLowerCase())} //because this is a user input!!
          />
        )
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
            disabled={disabledSubmit()}
          >
            DEPOSIT
          </Button>
        )}
        {activeTab1 === 'ERC20' && (
          <Button
            onClick={onNext}
            type="primary"
            style={{ flex: 0 }}
            disabled={disabledSubmit()}
          >
            NEXT
          </Button>
        )}
      </div>
    </>
  )
}

export default React.memo(InputStep)
