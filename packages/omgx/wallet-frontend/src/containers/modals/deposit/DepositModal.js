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

import React, { useState, useCallback, useEffect } from 'react'
import { ethers } from 'ethers'
import { useDispatch } from 'react-redux'

import { closeModal } from 'actions/uiAction'
import { getToken } from 'actions/tokenAction'

import Modal from 'components/modal/Modal'

import InputStep from './steps/InputStep'
import InputStepFast from './steps/InputStepFast'
import ApproveStep from './steps/ApproveStep'

/* THIS ONLY MAKES SENSE ON L1 - so let's do all the lookups etc for L1 */

function DepositModal({ open, omgOnly = false, fast = false }) {
  
  const dispatch = useDispatch()

  const [step, setStep] = useState('INPUT_STEP')
  const [currencyL1Address, setCurrencyL1Address] = useState('')
  const [currencyL2Address, setCurrencyL2Address] = useState('')
  const [tokenInfo, setTokenInfo] = useState({})
  const [value, setValue] = useState('')

  //given choice of L1 currency, as defined by the currency's L1 address, obtain as much information as possible 
  //about this ERC20, and use that to parametrize the tokenInfo
  useEffect(() => {
    async function getTokenInfo() {
      if(currencyL1Address === '') return
      const _currencyL1Address = currencyL1Address.toLowerCase()
      if (_currencyL1Address && ethers.utils.isAddress(_currencyL1Address)) {
        const tokenInfo = await getToken(_currencyL1Address)
        setTokenInfo(tokenInfo) //that gets the token info for L1
        //if it's not yet in the system, pull all the info
      } else {
        setTokenInfo({})
      }
    }
    getTokenInfo()
  }, [currencyL1Address])

  const handleClose = useCallback(() => {
    setCurrencyL1Address('')
    setCurrencyL2Address('')
    setValue('')
    setStep('INPUT_STEP')
    dispatch(closeModal('depositModal'))
  }, [dispatch])

  return (
    <Modal open={open}>
      {!!fast && step === 'INPUT_STEP' && (
        <InputStepFast
          onClose={handleClose}
          onNext={()=>setStep('APPROVE_STEP')}
          currencyL1Address={currencyL1Address}
          currencyL2Address={currencyL2Address}
          setCurrencyL1Address={setCurrencyL1Address}
          setCurrencyL2Address={setCurrencyL2Address}
          tokenInfo={tokenInfo}
          setTokenInfo={setTokenInfo}
          value={value}
          setValue={setValue}
          omgOnly={omgOnly}
        />
      )}
      {!fast && step === 'INPUT_STEP' && (
        <InputStep
          onClose={handleClose}
          onNext={()=>setStep('APPROVE_STEP')}
          currencyL1Address={currencyL1Address}
          currencyL2Address={currencyL2Address}
          setCurrencyL1Address={setCurrencyL1Address}
          setCurrencyL2Address={setCurrencyL2Address}
          tokenInfo={tokenInfo}
          setTokenInfo={setTokenInfo}
          value={value}
          setValue={setValue}
          omgOnly={omgOnly}
        />
      )}
      {step === 'APPROVE_STEP' && (
        <ApproveStep
          onClose={handleClose}
          currencyL1Address={currencyL1Address}
          currencyL2Address={currencyL2Address}
          value={value}
          tokenInfo={tokenInfo}
          fast={fast}
        />
      )}
    </Modal>
  )
}

export default React.memo(DepositModal)
