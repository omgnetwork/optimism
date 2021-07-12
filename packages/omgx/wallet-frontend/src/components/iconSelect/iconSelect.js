/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import { KeyboardArrowDown } from '@material-ui/icons'
import React from 'react'
import Button from '../button/Button'
import omgxIcon from '../../images/omg-icon-circle.png'
import sushiIcon from '../../images/sushi-icon.png'
import etherIcon from '../../images/ether-icon.png'
import * as styles from './iconSelect.module.scss'

const tokenIcons = {
  omgxIcon: omgxIcon,
  sushiIcon: sushiIcon,
  etherIcon: etherIcon,
}

function IconSelect({
  selected,
  onTokenSelect,
  selectOptions,
  allOptions,
  disabledSelect = false,
}) {
  
  const onSelect = (e) => {
    let value = e.target.value
    let selectedToken = selectOptions.find(
      (t) => t.title.toLowerCase() === value.toLowerCase()
    )
    onTokenSelect(selectedToken)
  }

  const renderOptions = (
    <div className={styles.selectContainer}>
      <select
        className={styles.select}
        value={selectOptions[0]}
        onChange={onSelect}
        disabled={disabledSelect}
      >
        <option key={-1} value={-1}>
          Select
        </option>
        {selectOptions
          .filter((i) => !i.icon)
          .filter(Boolean)
          .map((i, index) => (
            <option key={index} value={i.value}>
              {i.title} - {i.subTitle}
            </option>
          ))}
      </select>
      <div className={styles.selected}>
        <div className={styles.details}>
          <div className={styles.title}>{selected ? selected.title : ''}</div>
          <div className={styles.subTitle}>
            {selected ? selected.subTitle : ''}
          </div>
        </div>
        {disabledSelect ? <></> : <KeyboardArrowDown />}
      </div>
    </div>
  )

  const tokenPicker = (
    <div className={styles.tokenPicker}>
      {selectOptions
        .filter((i) => !!i.icon)
        .filter(Boolean)
        .map((t) => {
          return (
            <div
              className={styles.tokenIcon}
              onClick={() => {
                onTokenSelect(t)
              }}
            >
              <img src={tokenIcons[t.icon]} width="40px" alt={t.title} />
              <p>{t.symbol}</p>
            </div>
          )
        })}
    </div>
  )

  return (
    <div className={styles.iconSelectContainer}>
      {tokenPicker}
      {allOptions &&
        <div className={styles.customOptionContainer}>
          {renderOptions}
          <Button
            onClick={() => {
              onTokenSelect({
                title: 'manual',
              })
            }}
            type="primary"
            style={{ flex: 0, whiteSpace: 'nowrap' }}
          >
            Manual/Other
          </Button>
        </div>
      }
    </div>
  )
}

export default React.memo(IconSelect)
