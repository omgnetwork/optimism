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

//const ETH0x = '0x0000000000000000000000000000000000000000'

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
    if (selectedToken && selectedToken.title === 'manual') {
      setCurrency('')
      setCurrencyL2('')
    } else if (!!selectedToken) {
      console.log(selectedToken)
      setCurrency(selectedToken.L1address)
      setCurrencyL2(selectedToken.L2address)
    }
  }, [selectedToken, setCurrency, setCurrencyL2])

  useEffect(() => {
    networkService
      .getPriorityTokens()
      .then((res) => {
        console.log(res)
        // let priorityTokens = res.map((t) => {
        //   return {
        //     title: t.name,
        //     subTitle: t.symbol,
        //     value: t.name,
        //     ...t,
        //   }
        // })
        setTokens(res)
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

      {fast && (
        <h2>
          Fast Swap onto OMGX
        </h2>
      )}

      {!fast && (
        <h2>
          {`Traditional Deposit ${ selectedToken ? selectedToken.title : ''}`}
        </h2>
      )}

      {!selectedToken ? (
        <IconSelect 
          selectOptions={tokens} 
          onTokenSelect={setSelectedToken} 
          allOptions={fast ? false : true}
        />
      ) : null}

      {!fast && selectedToken ? (
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

      {!!fast ? (
        <Input
          label="L1 Token Contract Address"
          placeholder="0x"
          paste
          value={currency}
          onChange={(i) => setCurrency(i.target.value.toLowerCase())} //because this is a user input!!
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

      {fast && selectedToken === 'ETH' &&
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

      {fast && selectedToken !== 'ETH' &&
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
          The L2 liquidity pool balance is too low to cover your swap - please use the traditional deposit instead.
        </h3>
      )}

      <div className={styles.buttons}>
        <Button onClick={handleClose} type="outline" style={{ flex: 0 }}>
          CANCEL
        </Button>
        {selectedToken === 'ETH' && (
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
        {selectedToken !== 'ERC20' && (
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
