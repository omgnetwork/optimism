import React from 'react';
import { ReactComponent as LogoLight } from './../../images/logo-light-omgx.svg';
import { ReactComponent as LogoDark } from './../../images/logo-dark-omgx.svg';
import { Menu } from "./MainMenu.styles";
import { Link } from 'react-router-dom';
import ThemeSwitcher from './themeSwitcher/ThemeSwitcher';
import NetworkSwitcher from './networkSwitcher/NetworkSwitcher';
import MenuItems from './menuItems/MenuItems';

function MainMenu ({ light, setLight }) {
  return (
    <Menu>
      <Link to="/">
        {light ? (
          <LogoDark />
          ) : (
          <LogoLight />
        )}
      </Link>
      <NetworkSwitcher />
      <MenuItems />
      <ThemeSwitcher light={light} setLight={setLight} />
      {/* <ButtonMUI onClick={() => setLight(prev => !prev)}>Toggle Theme</ButtonMUI> */}
    </Menu>
  );
}

export default MainMenu;
