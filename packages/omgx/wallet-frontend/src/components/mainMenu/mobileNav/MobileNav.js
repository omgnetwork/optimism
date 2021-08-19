import React from 'react';
import { ReactComponent as Logo } from './../../../images/logo-boba.svg';
import * as S from './MobileNav.styles';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from 'react-router-dom';
import MenuItems from '../menuItems/MenuItems';
import { Container, Drawer } from '@material-ui/core';
import { useState } from 'react';
import { useTheme } from '@emotion/react';
import WalletAddress from 'components/walletAddress/WalletAddress';
import NetworkSwitcherIcon from 'components/icons/NetworkSwitcherIcon';
import networkService from 'services/networkService';

function MobileNav ({ light, handleSetPage }) {
  const [ open, setOpen ] = useState(false);
  const theme = useTheme();
  const networkLayer = networkService.L1orL2

  return (
    <Container>
      <S.MobileNavTag>
        <MenuIcon fontSize="medium" onClick={() => setOpen(!open)} />

        <Drawer open={open} onClose={() => setOpen(false)}>
          <S.Style theme={theme}>
            <MenuItems handleSetPage={handleSetPage}/>
          </S.Style>
        </Drawer>

        <WalletAddress />

        <NetworkSwitcherIcon active={networkLayer === 'L1'} />

        {/* <Link to="/" style={{ display: "flex"}}>
          <Logo width={100} />
        </Link> */}
      </S.MobileNavTag>
    </Container>
  );
}

export default MobileNav;
