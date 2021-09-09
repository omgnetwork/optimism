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

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {Typography} from '@material-ui/core';

import { closeModal, openAlert, openError } from 'actions/uiAction';
import { transferDao } from 'actions/daoAction';

import * as styles  from './daoModal.module.scss'

import Modal from 'components/modal/Modal'
import Button from 'components/button/Button'
import Input from 'components/input/Input'
import { WrapperActionsModal } from 'components/modal/Modal.styles';

function TransferDaoModal({ open }) {

    const [recipient, setRecipient] = useState('')
    const [amount, setAmount] = useState('')
    const dispatch = useDispatch()

    function handleClose() {
        setRecipient('')
        setAmount('')
        dispatch(closeModal('transferDaoModal'))
    }

    const submit = async () => {
        let res = await dispatch(transferDao({recipient, amount}));

        if(res) {
            dispatch(openAlert(`Governance token transferred`))
            handleClose()
        } else {
            dispatch(openError(`Failed to transfer governance token`))
            handleClose()
        }
    }

    const disabledTransfer = amount <= 0 || !recipient;

    return (
        <Modal open={open} maxWidth="md" onClose={handleClose}>
            <Typography variant="h2" sx={{mb: 3}}>Transfer Boba</Typography>

            <Input
                label='To Address'
                placeholder='Hash or ENS name'
                paste
                value={recipient}
                onChange={i => setRecipient(i.target.value)}
                sx={{mb: 2}}
            />

            <Input
                label='Amount'
                placeholder={`Amount to transfer`}
                value={amount}
                type="number"
                onChange={(i) => { setAmount(i.target.value) }}
            />
            <WrapperActionsModal>
              <Button
                  onClick={handleClose}
                  color='neutral'
                  size="large"
              >
                  CANCEL
              </Button>

              <Button
                  onClick={() => { submit() }}
                  color='primary'
                  size="large"
                  variant="contained"
                  // loading={loading} // TODO: Implement loading base on the action trigger
                  disabled={disabledTransfer}
              >
                  TRANSFER
              </Button>
            </WrapperActionsModal>
        </Modal>
    )
}

export default React.memo(TransferDaoModal)
