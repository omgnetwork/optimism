import React from 'react';
import { ReactComponent as Logo } from './../../../images/logo-omgx.svg';
import * as S from './MobileNav.styles';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from 'react-router-dom';
import { Box, useTheme } from '@material-ui/core';
import MenuItems from '../menuItems/MenuItems';
import { Drawer } from '@material-ui/core';
import { useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/styles';
// import { useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      background: "#061122",
      backgroundImage: 'none'
    }
  })
);

function MobileNav () {
  const [ open, setOpen ] = useState(false);
  const classes = useStyles();

  return (
    <S.MobileNavTag>
      <MenuIcon fontSize="medium" onClick={() => setOpen(!open)} cursor/>

      <Drawer open={open} onClose={() => setOpen(false)} classes={{ paper: classes.paper }}>
        <MenuItems/>
      </Drawer>

      <Link to="/">
        <Logo width={100} />
      </Link>
    </S.MobileNavTag>
  );
}

export default MobileNav;
