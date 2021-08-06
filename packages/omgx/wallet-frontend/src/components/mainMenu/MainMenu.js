import React, { useState } from 'react';
import { ReactComponent as Logo } from './../../images/logo-omgx.svg';
import {Box} from '@material-ui/core';
import { Menu, MenuItem } from "./MainMenu.styles";
import { Link } from 'react-router-dom';
import ThemeSwitcher from './themeSwitcher/ThemeSwitcher';
import NetworkSwitcher from './networkSwitcher/NetworkSwitcher';
import * as S from './MainMenu.styles';
import chevron from 'images/chevron.svg';
import LearnIcon from 'components/icons/LearnIcon';
import FarmIcon from 'components/icons/FarmIcon';
import PoolIcon from 'components/icons/PoolIcon';
import EarnIcon from 'components/icons/EarnIcon';
import WalletIcon from 'components/icons/WalletIcon';
import { menuItems } from "./menuItems";
import { useTheme } from '@material-ui/core/styles';

function MainMenu ({ light, setLight }) {
  const [ openDropdown, setOpenDropdown ] = useState(false);
  const [ activeItem, setActiveItem ] = useState(false);
  const theme = useTheme();

  const iconObj = {
    WalletIcon,
    EarnIcon,
    LearnIcon,
    FarmIcon,
    PoolIcon,
  }

  return (
    <Menu>
      <Link to="/">
        <Logo />
      </Link>

      <NetworkSwitcher />

      <nav>
        <ul>
          {menuItems.map((item, index) => {
            const Icon = iconObj[item.icon];
            const isActive = window.location.pathname === item.url;

            return (
              <li>
                <MenuItem onClick={() => item.items ? setOpenDropdown(!openDropdown) : null} onMouseEnter={() => setActiveItem(index)} onMouseLeave={() => setActiveItem(false)} to={item.url} selected={isActive}>
                  <Icon color={activeItem === index ? theme.palette.primary.main : "#fff"} />{item.title}

                  {item.items && item.items.length ? (
                    <Box sx={{paddingLeft: 2, display: 'flex'}}>
                      <S.Chevron
                        open={openDropdown}
                        src={chevron}
                        alt='chevron'
                      />
                    </Box>
                  ) : null }
                </MenuItem>

                {openDropdown && item.items ? (
                  <ul>
                    <Box sx={{paddingLeft: 10, marginTop: -3}}>
                      {item.items.map((children) => {
                        const ChildrenIcon = iconObj[children.icon]
                        return (
                            <li>
                              <MenuItem to={children.url}>
                                <ChildrenIcon color={activeItem === index ? theme.palette.primary.main : "#fff"} />{children.title}
                              </MenuItem>
                            </li>
                        )
                      })}
                    </Box>
                  </ul>
                ) : null }
              </li>
            )
          })}
        </ul>
      </nav>
      <ThemeSwitcher light={light} setLight={setLight} />
      {/* <ButtonMUI onClick={() => setLight(prev => !prev)}>Toggle Theme</ButtonMUI> */}
    </Menu>
  );
}

export default MainMenu;
