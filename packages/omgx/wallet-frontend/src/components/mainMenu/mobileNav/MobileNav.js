import React from 'react';
import { ReactComponent as Logo } from './../../../images/logo-omgx.svg';
import * as S from './MobileNav.styles';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from 'react-router-dom';
import MenuItems from '../menuItems/MenuItems';
import { Box, Drawer } from '@material-ui/core';
import { useState } from 'react';
import { styled } from '@material-ui/system';
import { useTheme } from '@emotion/react';

const Style = styled(Box)`
  background-color: ${(props) => props.theme.palette.mode === 'light' ? 'white' : '#061122' };
  height: 100%;
`;

function MobileNav () {
  const [ open, setOpen ] = useState(false);
  const theme = useTheme();

  return (
    <S.MobileNavTag>
      <MenuIcon fontSize="medium" onClick={() => setOpen(!open)} />

      <Drawer open={open} onClose={() => setOpen(false)}>
        <Style theme={theme}>
          <MenuItems/>
        </Style>
      </Drawer>

      <Link to="/" style={{ display: "flex"}}>
        <Logo width={100} />
      </Link>
    </S.MobileNavTag>
  );
}

export default MobileNav;
