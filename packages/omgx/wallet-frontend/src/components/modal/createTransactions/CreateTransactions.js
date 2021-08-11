import { Box, Grid, Typography } from '@material-ui/core';
import Button from 'components/button/Button';
import NetworkSwitcherIcon from 'components/icons/NetworkSwitcherIcon';
import {ReactComponent as AlertMessage} from '../../../images/icons/alert-message.svg';
import React from 'react';
import { styled } from '@material-ui/system';

const Style = styled(Box)`
  background: rgba(32, 29, 49, 0.8);
  box-shadow: -13px 15px 39px rgba(0, 0, 0, 0.16), inset 123px 116px 230px rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(66px);
  padding: 40px;
  border-radius: 12px;
`;

const SliderStyle = styled(Box)`
  box-shadow: 10px -6px 234px rgba(1, 0, 74, 0.55), inset 33px 16px 80px rgba(255, 255, 255, 0.06);
  background: rgba(9, 22, 43, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);

  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 12px;
  padding: 20px 40px;
  margin-top: 50px;

`;

function CreateTransactions () {
  return (
    <>
      <Style>
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
      </Style>

      <SliderStyle>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <AlertMessage width={60} />
          <Typography variant="body1" component="p" sx={{fontSize: '16px', fontWeight: "700"}}>It will take 7 days withdraw funds from OMGX</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Button variant="outlined" color="neutral" size="large">Cancel</Button>
          <Button variant="contained" color="primary" size="large">Confirm</Button>
        </Box>
      </SliderStyle>
    </>
  );
}

export default CreateTransactions;
