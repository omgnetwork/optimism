import React from 'react';
import { ReactComponent as LogoDark } from './../../../images/logo-dark-omgx.svg';
import { ReactComponent as LogoLight } from './../../../images/logo-light-omgx.svg';
import * as S from './MobileNav.styles';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from 'react-router-dom';
import MenuItems from '../menuItems/MenuItems';
import { Drawer } from '@material-ui/core';
import { useState } from 'react';
import { useTheme } from '@emotion/react';

function MobileNav ({ light }) {
  const [ open, setOpen ] = useState(false);
  const theme = useTheme();

  return (
    <S.MobileNavTag>
      <MenuIcon fontSize="medium" onClick={() => setOpen(!open)} />

      <Drawer open={open} onClose={() => setOpen(false)}>
        <S.Style theme={theme}>
          <MenuItems/>
        </S.Style>
      </Drawer>

      <Link to="/" style={{ display: "flex"}}>
        {light ? (
          <LogoDark width={100} />
        ) : (
          <LogoLight width={100} />
        )}
      </Link>
    </S.MobileNavTag>
  );
}

export default MobileNav;
