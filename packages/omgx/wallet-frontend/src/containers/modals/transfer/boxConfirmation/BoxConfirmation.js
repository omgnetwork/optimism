import { Box, Fade, Typography } from '@material-ui/core';
import Button from 'components/button/Button';
import {ReactComponent as AlertMessage} from '../../../../images/icons/alert-message.svg';
import {ReactComponent as SuccessMessage} from '../../../../images/icons/success-message.svg';
import React, { useState, useEffect } from 'react';
import * as S from './BoxConfirmation.styles';


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

const Stage1 = ({ setStep, setShowFeedback, onSubmit }) => {
  return (
    <>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
        <AlertMessage width={60} />
        <Box sx={{flex: '1'}}>
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
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {
          setStep(2);
          onSubmit();
        }}>
          Confirm
        </Button>
      </Box>
    </>
  )
}

const Stage2 = ({ handleClose }) => {
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
        <Button variant="contained" color="primary" size="large" onClick={() => handleClose()}>Finish and Hide</Button>
      </Box>
    </>
  )
}

function BoxConfirmation ({ showFeedback, setShowFeedback, handleClose, onSubmit }) {
  const [ step, setStep ] = useState(0);

  const Circles = []

  useEffect(() => {
    setStep(0);
  }, [showFeedback]);

  return (
    <>
      {showFeedback ? (
        <Fade in={showFeedback}>
          <Box sx={{ position: 'relative'}}>
            <S.StyleStages>
              {step === 0 ? (
                <Stage0 setShowFeedback={setShowFeedback} setStep={setStep}/>
              ) : step === 1 ? (
                <Stage1 setShowFeedback={setShowFeedback} setStep={setStep} onSubmit={onSubmit} />
              ) : (
                <Stage2 setStep={setStep} handleClose={handleClose} />
              )}
            </S.StyleStages>
            <S.ContentCircles>
              {[0, 1, 2].map((item) => <S.Circle active={item === step}/> )}
            </S.ContentCircles>
          </Box>
        </Fade>
      ) : null }
    </>
  );
}

export default BoxConfirmation;
