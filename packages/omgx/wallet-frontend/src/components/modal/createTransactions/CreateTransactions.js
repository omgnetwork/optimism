import { Box, Grid, Typography } from '@material-ui/core';
import Button from 'components/button/Button';
import NetworkSwitcherIcon from 'components/icons/NetworkSwitcherIcon';
import {ReactComponent as AlertMessage} from '../../../images/icons/alert-message.svg';
import {ReactComponent as SuccessMessage} from '../../../images/icons/success-message.svg';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import * as S from './CreateTransactions.style';


const Stage0 = ({ setStep, setShowFeedback }) => {
  return (
    <>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
        <AlertMessage width={60} />
        <Typography variant="body1" component="p" sx={{fontSize: '16px', fontWeight: "700"}}>
          It will take 7 days withdraw funds from OMGX
        </Typography>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
        <Button variant="outlined" color="neutral" size="large" onClick={() => setShowFeedback(false)}>Cancel</Button>
        <Button variant="contained" color="primary" size="large" onClick={() => setStep(1)}>Confirm</Button>
      </Box>
    </>
  )
}

const Stage1 = ({ setStep, setShowFeedback }) => {
  return (
    <>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
        <AlertMessage width={60} />
        <Box>
          <Typography variant="body1" component="p" sx={{fontSize: '16px', fontWeight: "700"}}>
            Send funds to the bridge
          </Typography>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Typography variant="body1" component="p" sx={{fontSize: '14px'}}>
              You are sending XXXX to the adress
              <Box sx={{fontSize: '14px', background: 'rgba(32, 29, 49, 0.8)', borderRadius: '29px', display: 'inline', textAlign: 'center', ml: '3px', py: '2px', px: '5px'}}>0x9a58.c438d8a78493412</Box>
            </Typography>
          </Box>
            <Typography variant="body1" component="p" sx={{fontSize: '14px'}}>
              It will cost XXXX ETH in gas
            </Typography>
        </Box>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
        <Button variant="outlined" color="neutral" size="large" onClick={() => setShowFeedback(false)}>Cancel</Button>
        <Button variant="contained" color="primary" size="large" onClick={() => setStep(2)}>Confirm</Button>
      </Box>
    </>
  )
}

const Stage2 = ({setOpen}) => {
  return (
    <>
      <Box sx={{display: 'flex', alignItems: 'center' }}>
        <SuccessMessage />
        <Box sx={{mx: '24px'}}>
          <Typography variant="body1" component="p" sx={{fontSize: '16px', fontWeight: "700"}}>
            Awaiting for transaction
          </Typography>
          <Box>
            <Typography variant="body1" component="p" sx={{fontSize: '14px'}}>
              Your transaction 0x123...123a has been sent
            </Typography>
            <Typography variant="body1" component="p" sx={{fontSize: '14px'}}>
              Confirmation (3/15)
            </Typography>
            <Typography variant="body1" component="p" sx={{fontSize: '14px'}}>
              Once 15 confirmations has passed, the token will be sent to your adress at OMGX Mainnet
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{whiteSpace: 'nowrap'}}>
        <Button variant="contained" color="primary" size="large" onClick={() => setOpen(false)}>Finish and Hide</Button>
      </Box>
    </>
  )
}

function CreateTransactions ({ setOpen }) {
  const [ step, setStep ] = useState(0);
  const [ showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setStep(0);
  }, [showFeedback]);

  return (
    <>
      <S.StyleCreateTransactions>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <Typography variant="h3" component="h3">From ETH Mainnet</Typography>
              <NetworkSwitcherIcon active />
            </Box>
            <Typography variant="body1" component="span" sx={{opacity: 0.5}}>Select Token</Typography>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
              <Typography variant="h3" component="h3">To OMGX Mainnet</Typography>
              <NetworkSwitcherIcon active />
            </Box>
            <Typography variant="body1" component="span" sx={{opacity: 0.5}}>Enter Adress</Typography>
          </Grid>
        </Grid>
        <Button onClick={() => setShowFeedback(true)}>Bridge</Button>
      </S.StyleCreateTransactions>

      {showFeedback ? (
        <S.StyleStages>
          {step === 0 ? (
            <Stage0 setShowFeedback={setShowFeedback} setStep={setStep}/>
          ) : step === 1 ? (
            <Stage1 setShowFeedback={setShowFeedback} setStep={setStep} />
          ) : (
            <Stage2 setOpen={setOpen} setStep={setStep} />
          )}
        </S.StyleStages>
      ) : null }
    </>
  );
}

export default CreateTransactions;
