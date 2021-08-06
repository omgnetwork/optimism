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
import chevron from 'images/chevron.svg';

function MenuItems () {
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
    <S.Nav>
      <ul>
        {menuItems.map((item, index) => {
          const Icon = iconObj[item.icon];
          const isActive = window.location.pathname === item.url;

          return (
            <li>
              <S.MenuItem onClick={() => item.items ? setOpenDropdown(!openDropdown) : null} onMouseEnter={() => setActiveItem(index)} onMouseLeave={() => setActiveItem(false)} to={item.url} selected={isActive}>
                <Icon color={activeItem === index ? theme.palette.background : "#fff"} />{item.title}

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
                      return (
                          <li>
                            <S.MenuItem to={children.url}>
                              <ChildrenIcon color={activeItem === index ? theme.palette.primary.main : "#fff"} />{children.title}
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
