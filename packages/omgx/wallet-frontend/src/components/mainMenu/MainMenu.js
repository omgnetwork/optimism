import React from 'react';
import { Menu } from "./MainMenu.styles";
import ThemeSwitcher from './themeSwitcher/ThemeSwitcher';
import NetworkSwitcher from './networkSwitcher/NetworkSwitcher';
import MenuItems from './menuItems/MenuItems';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from './../../images/logo-omgx.svg';


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
