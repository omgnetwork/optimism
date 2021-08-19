import React from 'react';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import WalletAddress from 'components/walletAddress/WalletAddress';

const PageHeader = ({ title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ my: 5, display: isMobile ? "none" : "flex", justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h1">{title}</Typography>
      <WalletAddress />
    </Box>
  )
};

export default PageHeader;
