// TODO
// 2. Testing

import React, { useEffect } from 'react';
import * as S from './ThemeSwitcher.styles.js'
import DarkIcon from 'components/icons/DarkIcon.js';
import LightIcon from 'components/icons/LightIcon.js';
import { Box } from '@material-ui/core';
import { ReactComponent as ShadowMenu } from './../../../images/backgrounds/shadow-menu.svg';
import { styled } from '@material-ui/system';

const Style = styled(Box)`
  position: absolute;
  bottom: -40px;
  left: -290px;
`;

function ThemeSwitcher ({ light, setLight }) {
  useEffect(() => {
    localStorage.setItem('theme', light ? 'light' : 'dark');
  }, [light]);

  return (
    <S.ThemeSwitcherTag>
      <S.Button onClick={() => setLight(false)} selected={!light}>
        <DarkIcon />
      </S.Button>
      <S.Button onClick={() => setLight(true)} selected={light}>
        <LightIcon />
      </S.Button>
      <Style>
        <ShadowMenu height={250}/>
      </Style>
    </S.ThemeSwitcherTag>
  );
}

export default ThemeSwitcher;
