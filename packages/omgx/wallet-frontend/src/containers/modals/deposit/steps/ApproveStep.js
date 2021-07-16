import React, { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BN from 'bn.js'

import Button from 'components/button/Button'
import GasPicker from 'components/gaspicker/GasPicker'

import {
  approveERC20,
  depositErc20,
  resetApprove,
  depositL1LP,
} from 'actions/networkAction'

import { openAlert, setActiveHistoryTab1 } from 'actions/uiAction'
import networkService from 'services/networkService'
import { selectLoading } from 'selectors/loadingSelector'
import { powAmount, logAmount } from 'util/amountConvert'

import * as styles from '../DepositModal.module.scss'

function ApproveStep({
  onClose,
  currencyL1Address,
  currencyL2Address,
  value,
  tokenInfo,
  fast,
}) {
  
  const dispatch = useDispatch()
  const [allowance, setAllowance] = useState('')
  const [allowDeposit, setAllowDeposit] = useState(false)
  const [selectedSpeed, setSelectedSpeed] = useState('normal')
  const [gasPrice, setGasPrice] = useState()

  const resetLoading = useSelector(selectLoading(['APPROVE/RESET']))
  const approveLoading = useSelector(selectLoading(['APPROVE/CREATE']))
  const depositLoading = useSelector(selectLoading(['DEPOSIT/CREATE']))
  const weiAmount = powAmount(value, tokenInfo.decimals)
  
  const checkAllowance = useCallback(async () => {
    
    try {
      let allowance
      
      if (fast) {
        allowance = await networkService.checkAllowance(
          currencyL1Address,
          networkService.L1LPAddress
        )
      } else {
        allowance = await networkService.checkAllowance(
          currencyL1Address,
          networkService.L1StandardBridgeAddress
        )
      }

      setAllowance(allowance)
      
      const allowanceBN = new BN(allowance)
      const weiAmountBN = new BN(weiAmount)
      
      allowanceBN.gte(weiAmountBN)
        ? setAllowDeposit(true)
        : setAllowDeposit(false)
      
    } catch (error) {
      onClose()
    }
  }, [onClose, currencyL1Address, weiAmount, fast])

  useEffect(() => {
    checkAllowance()
  }, [checkAllowance])

  function handleClose() {
    setAllowance('')
    setAllowance(false)
    setSelectedSpeed('normal')
    onClose()
  }

  async function doApprove() {
    
    let res
    
    if (fast) {
      res = await dispatch(
        approveERC20(weiAmount, currencyL1Address, networkService.L1LPAddress)
      )
    } else {
      res = await dispatch(approveERC20(weiAmount, currencyL1Address))
    }

    if (res) {
      dispatch(openAlert('Amount approval submitted'))
      checkAllowance()
    }
  }

  async function doReset() {
    let res
    if (fast) {
      res = await dispatch(
        resetApprove(weiAmount, currencyL1Address, networkService.L1LPAddress)
      )
    } else {
      res = await dispatch(resetApprove(weiAmount, currencyL1Address))
    }
    if (res) {
      dispatch(openAlert('Amount reset'))
      checkAllowance()
    }
  }

  async function doDeposit() {
    
    let res
    
    if (fast) {
      res = await dispatch(depositL1LP(currencyL1Address, value))
    } else {
      res = await dispatch(
        depositErc20(weiAmount, currencyL1Address, gasPrice, currencyL2Address)
      )
    }
    
    if (res) {
      dispatch(setActiveHistoryTab1('Deposits'))
      if (fast) {
        dispatch(
          openAlert(
            `${tokenName} was deposited to the L1LP. You will receive 
             ${(Number(value) * 0.97).toFixed(2)} ${tokenName} on L2`
          )
        )
      } else {
        dispatch(openAlert(`${tokenName} deposit submitted.`))
      }
      handleClose()
    }
  }

  const renderCancelButton = (
    <Button 
      onClick={handleClose} 
      type="outline" 
      style={{flex: 0}}
    >
      CANCEL
    </Button>
  )

  const renderGasPicker = (
    <GasPicker
      selectedSpeed={selectedSpeed}
      setSelectedSpeed={setSelectedSpeed}
      setGasPrice={setGasPrice}
    />
  )

  const tokenName = tokenInfo.symbolL1 || tokenInfo.currency

  return (
    <>

      {!allowDeposit && (
        <h2>Approve Amount</h2>
      )}

      {allowDeposit && fast && (
        <h2>Complete Swap</h2>
      )}

      {allowDeposit && !fast && (
        <h2>Complete Deposit</h2>
      )}

      {!allowance && (
        <div className={styles.loader}>
          <span>Checking allowance...</span>
        </div>
      )}

      {allowance === '0' && (
        <>
          <p>
            {`To deposit ${value.toString()} ${tokenName}, please first approve the amount.`}
          </p>
          {renderGasPicker}
          <div className={styles.buttons}>
            {renderCancelButton}
            <Button
              onClick={doApprove}
              type="primary"
              style={{flex: 0, minWidth: 200}}
              tooltip="Your amount approval is still pending. Please wait for confirmation."
              loading={approveLoading}
              disabled={approveLoading}
            >
              APPROVE AMOUNT
            </Button>
          </div>
        </>
      )}

      {allowance &&
        allowance !== '0' &&
        new BN(allowance).lt(new BN(weiAmount)) && (
          <>
            <p>
              {`You are approved for  
                ${logAmount(allowance,tokenInfo.decimals)} ${tokenName}. 
                Since you want to deposit ${value} ${tokenName}, 
                please approve the new amount.`}
            </p>
            <p>
              You will be prompted with 2 requests. One to reset the
              amount to 0, and the other for the new amount.
            </p>
            {renderGasPicker}
            <div className={styles.buttons}>
              {renderCancelButton}
              <Button
                onClick={doReset}
                type="primary"
                style={{flex: 0, minWidth: 200}}
                tooltip="Your approval is still pending. Please wait for confirmation."
                loading={resetLoading}
                disabled={resetLoading}
              >
                INCREASE AMOUNT
              </Button>
            </div>
          </>
        )}

      {allowDeposit && (
        <>
          <p>
            {`Amount approved. To complete the transaction, click ${fast ? `COMPLETE SWAP` : `DEPOSIT`}`}
          </p>
          {renderGasPicker}
          <div className={styles.buttons}>
            {renderCancelButton}
            <Button
              onClick={doDeposit}
              type="primary"
              style={{flex: 0, minWidth: 200}}
              tooltip={`Your transaction is still pending. Please wait for confirmation.`}
              loading={depositLoading}
              disabled={depositLoading}
            >
              {fast ? `COMPLETE SWAP` : `DEPOSIT`} 
            </Button>
          </div>
        </>
      )}

    </>
  )
}

export default React.memo(ApproveStep)
