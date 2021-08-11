import { Box, Typography } from '@material-ui/core';
import NetworkSwitcherIcon from 'components/icons/NetworkSwitcherIcon';
import React from 'react';

function CreateTransactions () {
  return (
    <Box sx={{display: "flex", justifyContent: "space-between"}}>
      <Typography variant="h1" component="h1">From</Typography>
      <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
        <Typography variant="body1" component="p">ETH  Mainnet L1</Typography>
        <NetworkSwitcherIcon active />
      </Box>
    </Box>
  );
}

export default CreateTransactions;
