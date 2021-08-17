import React, {useEffect, useState} from 'react';
import { ReactComponent as Logo } from './../../images/logo-boba.svg';
import { Menu } from "./MainMenu.styles";
import { Link } from 'react-router-dom';
import ThemeSwitcher from './themeSwitcher/ThemeSwitcher';
import NetworkSwitcher from './networkSwitcher/NetworkSwitcher';
import MenuItems from './menuItems/MenuItems';

function MainMenu ({ pageDisplay, handleSetPage }) {
  const themeFromLocalStorage = localStorage.getItem('theme');
  const [light, setLight] = useState(themeFromLocalStorage === 'light');

  useEffect(() => {
    localStorage.setItem('theme', light ? 'light' : 'dark');
  }, [light]);

  return (
    <Menu>
      <Link to="/" onClick={() => handleSetPage("AccountNow")}>
        <Logo />
      </Link>
      <NetworkSwitcher />
      <MenuItems pageDisplay={pageDisplay} handleSetPage={handleSetPage} />
      {/* <ThemeSwitcher light={light} setLight={setLight} /> */}
    </Menu>
  );
}

export default MainMenu;
