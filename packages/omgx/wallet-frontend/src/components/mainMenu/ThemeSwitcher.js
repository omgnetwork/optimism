// TODO
// 1. Persist theme on localStorage
// 2. Testing

import React from 'react';
import * as S from './ThemeSwitcher.styles.js'
import { ReactComponent as DarkIcon } from './../../images/icons/dark-icon.svg';
import { ReactComponent as LightIcon } from './../../images/icons/light-icon.svg';

function ThemeSwitcher ({ light, setLight }) {
  const toggleTheme = () => {
    setLight(!light);
  }
  return (
    <S.ThemeSwitcherTag>
      <S.Button onClick={toggleTheme} selected={!light}>
        <DarkIcon />
      </S.Button>
      <S.Button onClick={toggleTheme} selected={light}>
        <LightIcon />
      </S.Button>
    </S.ThemeSwitcherTag>
  );
}

export default ThemeSwitcher;
