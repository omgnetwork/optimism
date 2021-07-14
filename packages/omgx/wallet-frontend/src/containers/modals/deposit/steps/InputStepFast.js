//import { depositETHL2, depositL1LP } from 'actions/networkAction'
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

import { depositL1LP } from 'actions/networkAction';

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
  const [selectedToken, setSelectedToken] = useState(null)
  const [LPBalance, setLPBalance] = useState(0)
  const [feeRate, setFeeRate] = useState(0)

  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))

  function handleClose() {
    onClose()
  }

  async function depositETH () {
    if (value > 0 && tokenInfo) {
      let res = await dispatch(depositL1LP(selectedToken.L1, value))
      if (res) {
        dispatch(setActiveHistoryTab1('Deposits'));
        dispatch(openAlert(`ETH was deposited the the L1LP. You will receive ${(Number(value) * (100 - Number(feeRate))/100).toFixed(2)} oETH on L2`));
        handleClose();
      } else {
        dispatch(openError('Failed to deposit ETH'));
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

  const disabledSubmit = value <= 0 ||
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

  return (
    <>
      <h2>Fast Swap onto OMGX</h2>

      {!selectedToken ? (
        <IconSelect 
          priorityOptions={tokens} 
          onTokenSelect={setSelectedToken} 
        />
      ) : null}

      {!!selectedToken && (
        <Input
          label="Amount to swap onto OMGX"
          type="number"
          unit={selectedToken ? selectedToken.symbol : ''}
          placeholder={0}
          value={value}
          onChange={(i)=>setValue(i.target.value)}
        />
      )}

      {selectedToken && selectedToken.symbol === 'ETH' && 
        <>
          <h3>
            The L2 liquidity pool contains {LPBalance} oETH. 
            The liquidity fee is{' '}{feeRate}%.{' '}
            {value &&
              `You will receive 
              ${(Number(value) * (100 - Number(feeRate))/100).toFixed(2)} 
              oETH on L2.`
            }
          </h3>
        </>
      }

      {selectedToken && selectedToken.symbol === 'TEST' &&
        <>
          <h3>
            The L2 liquidity pool contains {LPBalance} {selectedToken.symbol}. 
            The liquidity fee is {feeRate}%.{' '}
            {value &&
              `You will receive 
              ${(Number(value) * (100 - Number(feeRate))/100).toFixed(2)} 
              ${selectedToken.symbol} on L2.`
            }
          </h3>
        </>
      }

      {Number(LPBalance) < Number(value) && (
        <h3 style={{ color: 'red' }}>
          The L2 liquidity pool balance is too low to cover your swap - please
          use the traditional deposit instead.
        </h3>
      )}

      <div className={styles.buttons}>
        <Button 
          onClick={handleClose} 
          type="outline" 
          style={{flex: 0}}
        >
          CANCEL
        </Button>
        {selectedToken && selectedToken.symbol === 'ETH' && (
          <Button
            onClick={depositETH}
            type='primary'
            style={{flex: 0}}
            loading={depositLoading}
            tooltip='Your deposit is still pending. Please wait for confirmation.'
            disabled={disabledSubmit}
          >
            DEPOSIT
          </Button>
        )}
        {selectedToken && selectedToken.symbol !== 'ETH' && (
          <Button
            onClick={onNext}
            type="primary"
            style={{flex: 0}}
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
