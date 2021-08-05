import React from 'react';
import { ReactComponent as Logo } from './../../images/logo-omgx.svg';
import {Button as ButtonMUI} from '@material-ui/core';
import { Menu, MenuItem } from "./MainMenu.styles";
import { Link } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';
import NetworkSwitcher from './NetworkSwitcher';

function MainMenu ({ light, setLight }) {
  return (
    <Menu>
      <Link to="/">
        <Logo />
      </Link>

      <NetworkSwitcher />

      <nav>
        <ul>
          <li><MenuItem to="/" selected>Wallet</MenuItem></li>
          <li><MenuItem to="/earn">Earn</MenuItem></li>
          <li><MenuItem to="/learn">Learn</MenuItem></li>
        </ul>
      </nav>
      <ThemeSwitcher light={light} setLight={setLight} />
      {/* <ButtonMUI onClick={() => setLight(prev => !prev)}>Toggle Theme</ButtonMUI> */}
    </Menu>
  );
}

export default MainMenu;
