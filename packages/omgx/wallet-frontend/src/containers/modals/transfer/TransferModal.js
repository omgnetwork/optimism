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
import { useDispatch, useSelector } from 'react-redux';

import { transfer } from 'actions/networkAction';

import { closeModal, openAlert } from 'actions/uiAction';
import { selectLoading } from 'selectors/loadingSelector';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';

import { logAmount } from 'util/amountConvert'
import networkService from 'services/networkService';

import * as styles from './TransferModal.module.scss';
import Input from 'components/input/Input';
import { Box, Grid, TextField, Typography } from '@material-ui/core';
import NetworkSwitcherIcon from 'components/icons/NetworkSwitcherIcon';
import * as S from './TransferModal.style';
import BoxConfirmation from './boxConfirmation/BoxConfirmation';
import { styled } from '@material-ui/core/styles';

const CssTextField = styled(TextField)({
  '& .MuiTextField-root': {
    color: '#f00',
  },
});

function TransferModal ({ open, token }) {
  const dispatch = useDispatch()

  const [ value, setValue ] = useState('')
  const [ recipient, setRecipient ] = useState('')
  const [ showFeedback, setShowFeedback] = useState(false);

  const loading = useSelector(selectLoading([ 'TRANSFER/CREATE' ]));

  async function submit () {
    if (
      value > 0 &&
      token.address &&
      recipient
    ) {
      try {
        const transferResponse = await dispatch(transfer(recipient, value, token.address));
        if (transferResponse) {
          dispatch(openAlert('Transaction submitted'));
          handleClose();
        }
      } catch (err) {
        //guess not really?
      }
    }
  }

  function handleClose () {
    setValue('')
    setRecipient('')
    dispatch(closeModal('transferModal'))
  }

  const disabledTransfer = value <= 0 ||
    !token.address ||
    !recipient

  function renderTransferScreen () {

    if(typeof(token) === 'undefined') return

    return (
      <>
        <S.StyleCreateTransactions>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px"}}>
                <Typography variant="h2" component="h2">From ETH Mainnet</Typography>
                <NetworkSwitcherIcon active />
              </Box>
              <Typography variant="body1" component="span" sx={{opacity: 0.5}}>Select Token</Typography>
              <div className={styles.address}>
                {`From address: ${networkService.account}`}
              </div>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px"}}>
                <Typography variant="h2" component="h2">To OMGX Mainnet</Typography>
                <NetworkSwitcherIcon active />
              </Box>
              <Typography variant="body1" component="span" sx={{opacity: 0.5}}>Enter Adress</Typography>
              <Input
                label='To Address'
                placeholder='Hash or ENS name'
                paste
                value={recipient}
                onChange={i => setRecipient(i.target.value)}
              />
            </Grid>
          </Grid>

          {/* <Input
            placeholder={`Amount to transfer`}
            value={value}
            type="number"
            onChange={(i) => {setValue(i.target.value)}}
            unit={token.symbol}
            maxValue={logAmount(token.balance, token.decimals)}
          /> */}
          <S.Balance>
            <Grid container>
              <Grid item xs={5}>
                <S.ContentBalance>
                  <Box>
                    <CssTextField
                      id="standard-number"
                      label="Enter amount"
                      type="number"
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      variant="standard"
                    />
                    <Typography variant="body2" component="p" sx={{opacity: 0.5, mt: '5px'}}>($25,213)</Typography>
                  </Box>
                  <Button variant="small">Use all</Button>
                </S.ContentBalance>
              </Grid>

              <Grid item xs={2} sx={{margin: 'auto'}}>
                <S.TransactionsButton>
                  <Button>Fast</Button>
                  <Box>
                    <NetworkSwitcherIcon />
                  </Box>
                    <Button>Slow</Button>
                </S.TransactionsButton>
              </Grid>

              <Grid item xs={5}>
                <S.ContentBalance>
                  <Box>
                    <Typography variant="body2" component="p"sx={{opacity: 0.5}}>Current Balance</Typography>
                    <Typography variant="body2" component="p" sx={{opacity: 0.5}}>0,0224</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h3" component="span">+ 0,3142</Typography>
                    <Typography variant="body2" component="p" sx={{opacity: 0.5}}>New Balance: 0,3364</Typography>
                  </Box>
                </S.ContentBalance>
              </Grid>
            </Grid>
          </S.Balance>

          <div className={styles.buttons}>
            <Button
              onClick={handleClose}
              type='secondary'
              className={styles.button}
            >
              CANCEL
            </Button>

            <Button
              className={styles.button}
              onClick={()=>{submit({useLedgerSign: false})}}
              type='primary'
              loading={loading}
              tooltip='Your transfer is still pending. Please wait for confirmation.'
              disabled={disabledTransfer}
              triggerTime={new Date()}
            >
              TRANSFER
            </Button>
          </div>
          <Button onClick={() => setShowFeedback(true)}>Bridge</Button>
        </S.StyleCreateTransactions>
      </>
    );
  }

  return (
    <Modal title="Create bridging transaction" open={open} transparent onClose={handleClose}>
      {renderTransferScreen()}
      <BoxConfirmation showFeedback={showFeedback} setShowFeedback={setShowFeedback} handleClose={handleClose} />
    </Modal>
  );
}

export default React.memo(TransferModal);
