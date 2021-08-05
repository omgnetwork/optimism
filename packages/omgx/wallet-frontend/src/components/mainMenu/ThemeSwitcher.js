// TODO
// 1. Persist theme on localStorage
// 2. Testing

import React from 'react';
import * as S from './ThemeSwitcher.styles.js'
import { ReactComponent as DarkIcon } from './../../images/icons/dark-icon.svg';
import { ReactComponent as LightIcon } from './../../images/icons/light-icon.svg';

function ThemeSwitcher ({ light, setLight }) {
  return (
    <S.ThemeSwitcherTag>
      <S.Button onClick={() => setLight(false)} selected={!light}>
        <DarkIcon />
      </S.Button>
      <S.Button onClick={() => setLight(true)} selected={light}>
        <LightIcon />
      </S.Button>
    </S.ThemeSwitcherTag>
  );
}

export default ThemeSwitcher;
