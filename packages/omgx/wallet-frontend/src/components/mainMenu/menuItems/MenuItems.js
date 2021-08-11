import { useTheme } from '@emotion/react';
import { Box } from '@material-ui/core';
import React, { useState } from 'react';
import { menuItems } from '../menuItems';
import * as S from './MenuItems.styles';
import LearnIcon from 'components/icons/LearnIcon';
import FarmIcon from 'components/icons/FarmIcon';
import PoolIcon from 'components/icons/PoolIcon';
import EarnIcon from 'components/icons/EarnIcon';
import WalletIcon from 'components/icons/WalletIcon';
import HistoryIcon from 'components/icons/HistoryIcon';
import chevron from 'images/chevron.svg';

function MenuItems () {
  const [ openDropdown, setOpenDropdown ] = useState(['/pool', '/farm'].includes(window.location.pathname));
  const [ activeItem, setActiveItem ] = useState(false);
  const theme = useTheme();

  const iconObj = {
    WalletIcon,
    EarnIcon,
    LearnIcon,
    FarmIcon,
    PoolIcon,
    HistoryIcon
  }

  return (
    <S.Nav>
      <ul>
        {menuItems.map((item) => {
          const Icon = iconObj[item.icon];
          const isActive = window.location.pathname === item.url;
          const title = item.title;
          return (
            <li key={title}>
              <S.MenuItem
                onClick={() => item.items ? setOpenDropdown(!openDropdown) : null}
                onMouseEnter={() => setActiveItem(title)}
                onMouseLeave={() => setActiveItem(false)}
                to={item.url}
                selected={isActive}
              >
                <Icon color={isActive || activeItem === title ? theme.palette.secondary.main : "#fff"} />{item.title}

                {item.items && item.items.length ? (
                  <Box sx={{display: 'flex'}}>
                    <S.Chevron
                      open={openDropdown}
                      src={chevron}
                      alt='chevron'
                    />
                  </Box>
                ) : null }
              </S.MenuItem>

              {openDropdown && item.items ? (
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
                              <ChildrenIcon color={isActive || activeItem === title ? theme.palette.secondary.main : "#fff"} />{children.title}
                            </S.MenuItem>
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
    </S.Nav>
  );
}

export default MenuItems;
