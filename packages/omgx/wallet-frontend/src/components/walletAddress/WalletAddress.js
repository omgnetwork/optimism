import React from 'react';
import Copy from 'components/copy/Copy';
import { Box } from '@material-ui/core';
import networkService from 'services/networkService';
import truncate from 'truncate-middle';
import * as S from './WalletAddress.styles';
import { ReactComponent as FoxIcon } from './../../images/icons/fox-icon.svg';

const WalletAddress = () => {
  const wAddress = networkService.account ? truncate(networkService.account, 6, 4, '...') : '';
  return (
    <S.WalletPill>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <FoxIcon width={21} height={19} />
        <Box sx={{ ml: 1.5 }}>{wAddress}</Box>
      </Box>
      {/* <Copy value={networkService.account} /> */}
    </S.WalletPill>
  )
};

export default WalletAddress;
