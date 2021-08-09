import React, { useState } from 'react';
import { ReactComponent as Logo } from './../../images/logo-omgx.svg';
import {Box} from '@material-ui/core';
import { Menu, MenuItem } from "./MainMenu.styles";
import { Link } from 'react-router-dom';
import ThemeSwitcher from './themeSwitcher/ThemeSwitcher';
import NetworkSwitcher from './networkSwitcher/NetworkSwitcher';
import MenuItems from './menuItems/MenuItems';


function MainMenu ({ light, setLight }) {
  return (
    <Menu>
      <Link to="/">
        <Logo />
      </Link>
      <NetworkSwitcher />
      <MenuItems />
      <ThemeSwitcher light={light} setLight={setLight} />
      {/* <ButtonMUI onClick={() => setLight(prev => !prev)}>Toggle Theme</ButtonMUI> */}
    </Menu>
  );
}

export default MainMenu;
