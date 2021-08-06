import React from 'react';
import { Box, Typography } from '@material-ui/core';
import WalletAddress from 'components/walletAddress/WalletAddress';

const PageHeader = ({ title }) => {
  return (
    <Box sx={{ my: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h1">{title}</Typography>
      <WalletAddress />
    </Box>
  )
};

export default PageHeader;
