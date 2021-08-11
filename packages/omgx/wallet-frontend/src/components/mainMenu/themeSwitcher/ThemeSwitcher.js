// TODO
// 2. Testing

import React, { useEffect } from 'react';
import * as S from './ThemeSwitcher.styles.js'
import DarkIcon from 'components/icons/DarkIcon.js';
import LightIcon from 'components/icons/LightIcon.js';

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
    </S.ThemeSwitcherTag>
  );
}

export default ThemeSwitcher;
