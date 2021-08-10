import React from 'react';
import { ReactComponent as Logo } from './../../../images/logo-omgx.svg';
import * as S from './MobileNav.styles';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from 'react-router-dom';
import MenuItems from '../menuItems/MenuItems';
import { Drawer } from '@material-ui/core';
import { useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/styles';

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
      <MenuIcon fontSize="medium" onClick={() => setOpen(!open)} />

      <Drawer open={open} onClose={() => setOpen(false)} classes={{ paper: classes.paper }}>
        <MenuItems/>
      </Drawer>

      <Link to="/" style={{ display: "flex"}}>
        <Logo width={100} />
      </Link>
    </S.MobileNavTag>
  );
}

export default MobileNav;
