import React from 'react';
import { ReactComponent as Logo } from './../../images/logo-omgx.svg';
import {Button as ButtonMUI} from '@material-ui/core';
import { Menu, MenuItem } from "./MainMenu.styles";
import { Link } from 'react-router-dom';

function MainMenu ({ light, setLight }) {
  return (
    <Menu>
      <Link to="/">
        <Logo />
      </Link>

      <nav>
        <ul>
          <li><MenuItem to="/" selected>Wallet</MenuItem></li>
          <li><MenuItem to="/">Earn</MenuItem></li>
          <li><MenuItem to="/">Learn</MenuItem></li>
        </ul>
      </nav>
      <ButtonMUI onClick={() => setLight(prev => !prev)}>Toggle Theme</ButtonMUI>
    </Menu>
  );
}

export default MainMenu;
