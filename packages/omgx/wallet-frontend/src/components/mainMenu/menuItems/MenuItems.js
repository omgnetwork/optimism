import { useTheme } from '@emotion/react';
import React, { useState } from 'react';
import { menuItems } from '../menuItems';
import * as S from './MenuItems.styles';
import LearnIcon from 'components/icons/LearnIcon';
import FarmIcon from 'components/icons/FarmIcon';
import PoolIcon from 'components/icons/PoolIcon';
import EarnIcon from 'components/icons/EarnIcon';
import WalletIcon from 'components/icons/WalletIcon';
import HistoryIcon from 'components/icons/HistoryIcon';
import NFTIcon from 'components/icons/NFTIcon';
// import chevron from 'images/chevron.svg';

function MenuItems ({handleSetPage, pageDisplay, setOpen }) {
  // const [ openDropdown, setOpenDropdown ] = useState(['/pool', '/farm'].includes(window.location.pathname));
  const [ activeItem, setActiveItem ] = useState(false);
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const colorIcon = theme.palette.common[isLight ? 'black' : 'white'];

  const iconObj = {
    WalletIcon,
    EarnIcon,
    LearnIcon,
    FarmIcon,
    PoolIcon,
    HistoryIcon,
    NFTIcon
  }

  return (
    <S.Nav>
      <S.NavList>
        {menuItems.map((item) => {
          const Icon = iconObj[item.icon];
          // const isActive = window.location.pathname === item.url;
          const isActive = pageDisplay === item.key;
          const title = item.title;
          return (
            <li key={title}>
              <S.MenuItem
                // onClick={() => item.items ? setOpenDropdown(!openDropdown) : null}
                onClick={() => {
                  handleSetPage(item.key)
                  setOpen(false)
                }}
                onMouseEnter={() => setActiveItem(title)}
                onMouseLeave={() => setActiveItem(false)}
                // to={item.url}
                selected={isActive}
              >
                <Icon color={isActive || activeItem === title ? theme.palette.secondary.main : colorIcon} />{item.title}

                {/* {item.items && item.items.length ? (
                  <Box sx={{display: 'flex'}}>
                    <img
                      open={openDropdown}
                      src={chevron}
                      alt='chevron'
                    />
                  </Box>
                ) : null } */}
              </S.MenuItem>

              {/* {openDropdown && item.items ? (
                <ul>
                  <Box>
                    {item.items.map((children) => {
                      const ChildrenIcon = iconObj[children.icon]
                      const isActive = window.location.pathname === children.url;
                      const title = children.title;

                      return (
                          <li key={title}>
                            <S.MenuItem
                              onMouseEnter={() => setActiveItem(title)}
                              onMouseLeave={() => setActiveItem(false)}
                              to={children.url}
                              selected={isActive}
                            >
                              <ChildrenIcon color={isActive || activeItem === title ? theme.palette.secondary.main : colorIcon} />{children.title}
                            </S.MenuItem>
                          </li>
                      )
                    })}
                  </Box>
                </ul>
              ) : null } */}
            </li>
          )
        })}
      </S.NavList>
    </S.Nav>
  );
}

export default MenuItems;
