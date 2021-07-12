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

function InputStepFast({
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
  const [selectedToken, setSelectedToken] = useState(null)

  const [LPBalance, setLPBalance] = useState(0)
  const [feeRate, setFeeRate] = useState(0)

  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))

  function handleClose() {
    onClose()
  }

  useEffect(() => {
    setSelectedToken(null)
  }, [])

  useEffect(() => {
    if (!!selectedToken) {
      setCurrency(selectedToken.L1)
    }
  }, [selectedToken, setCurrency])

  useEffect(() => {
    networkService
      .getSwapTokens()
      .then((res) => {
        setTokens(res)
      })
      .catch((err) => {
        console.log('error', err)
      })
  }, [])

  async function depositETH() {
    if (value > 0 && tokenInfo) {
      let res = await dispatch(depositL1LP(currency, value))
      if (res) {
        dispatch(setActiveHistoryTab1('Deposits'))
        dispatch(
          openAlert(`ETH was deposited into the L1LP. You will receive 
            ${(Number(value) * 0.97).toFixed(2)} oETH on L2`
          )
        )
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
    (Number(value) > Number(LPBalance))

  if (Object.keys(tokenInfo).length && currency) {
    networkService.L2LPBalance(currency).then((LPBalance) => {
      setLPBalance(LPBalance)
    })
    networkService.getTotalFeeRate().then((feeRate) => {
      setFeeRate(feeRate)
    })
  }

  return (
    <>

      <h2>
        Fast Swap onto OMGX
      </h2>

      {!selectedToken ? (
        <IconSelect 
          selectOptions={tokens} 
          onTokenSelect={setSelectedToken} 
          allOptions={false}
        />
      ) : null}

      <Input
        label="Amount to deposit into OMGX"
        type="number"
        unit={(tokenInfo && selectedToken) ? tokenInfo.symbol : ''}
        placeholder={0}
        value={value}
        onChange={(i) => setValue(i.target.value)}
      />

      {selectedToken && selectedToken.symbol === 'ETH' &&
      Object.keys(tokenInfo).length &&
      currency ? (
        <>
          <h3>
            The L2 liquidity pool has {LPBalance} oETH. The liquidity fee is{' '}
            {feeRate}%.{' '}
            {value &&
              `You will receive ${(Number(value) * 0.97).toFixed(2)} oETH on L2.`
            }
          </h3>
        </>
      ) : (
        <></>
      )}

      {selectedToken && selectedToken.symbol === 'TEST' &&
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

      {Number(LPBalance) < Number(value) && (
        <h3 style={{ color: 'red' }}>
          The L2 liquidity pool balance is too low to cover your swap - please use the traditional deposit instead.
        </h3>
      )}

      <div className={styles.buttons}>
        <Button onClick={handleClose} type="outline" style={{ flex: 0 }}>
          CANCEL
        </Button>
        <Button
          onClick={onNext}
          type="primary"
          style={{ flex: 0 }}
          disabled={disabledSubmit}
        >
          NEXT
        </Button>
      </div>
    </>
  )
}

export default React.memo(InputStepFast)
