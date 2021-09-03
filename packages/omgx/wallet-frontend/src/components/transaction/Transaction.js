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

import React, { useState } from 'react'

import Tooltip from 'components/tooltip/Tooltip'
import { Button as ButtonMUI, Grid } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import LinkIcon from 'components/icons/LinkIcon'
import * as styles from './Transaction.module.scss'
import * as S from './Transaction.styles'

function Transaction({
  link,
  status,
  statusPercentage,
  subStatus,
  button,
  title,
  midTitle,
  subTitle,
  chain,
  typeTX,
  blockNumber,
  tooltip = '',
  detail
}) {

  const [dropDownBox, setDropDownBox] = useState(false);
  const [dropDownBoxInit, setDropDownBoxInit] = useState(false);

  function renderValue() {

    if (button) {
      return (
        <div className={styles.statusContainer}>
          <div
            onClick={button.onClick}
            className={styles.button}
          >
            {button.text}
          </div>
          <div>{subStatus}</div>
        </div>
      )
    }

    return (
      <div className={styles.statusContainer}>
        <div className={styles.status}>
          <div
            className={[
              styles.indicator,
              status === 'Pending' ? styles.pending : '',
              status === 'Exited' ? styles.exited : '',
              status === 'Failed' ? styles.failed : ''
            ].join(' ')}
          />
          <span>{status}</span>
          {status === 'Pending' && !!statusPercentage && (
            <Tooltip title={tooltip}>
              <span className={styles.percentage}>
                {`(${Math.max(statusPercentage, 0)}%)`}
              </span>
            </Tooltip>
          )}
        </div>
        <div>{subStatus}</div>
      </div>
    )
  }

  function renderDetailRedesign() {

    if (!detail) {
      return null
    }

    return (
    <S.TableBody
      style={{ justifyContent: 'center' }}
    >
      <S.TableCell sx={{
        gap: '5px',
        width: '98% !important',
        padding: '10px',
        alignItems: 'flex-start !important',
      }}>
        <div
          className={dropDownBox ?
            styles.dropDownContainer : dropDownBoxInit ? styles.dropDownInit : styles.closeDropDown}
        >
          <Grid className={styles.dropDownContent} container spacing={1}>
            L1 Hash:&nbsp;
            <a className={styles.href} href={detail.l1TxLink} target="_blank" rel="noopener noreferrer">
              {detail.l1Hash}
            </a>
          </Grid>
          <Grid className={styles.dropDownContent} container spacing={1}>
            L1 Block:&nbsp;{detail.l1BlockNumber}
          </Grid>
          <Grid className={styles.dropDownContent} container spacing={1}>
            Block Hash:&nbsp;{detail.l1BlockHash}
          </Grid>
          <Grid className={styles.dropDownContent} container spacing={1}>
            L1 From:&nbsp;{detail.l1From}
          </Grid>
          <Grid className={styles.dropDownContent} container spacing={1}>
            L1 To:&nbsp;{detail.l1To}
          </Grid>
        </div>
      </S.TableCell>
    </S.TableBody>)
  }

  return (
  <
    div style={{
      padding: '10px',
      borderRadius: '8px',
      background: '#192333',
    }}
  >
    <S.TableBody>
      
      <S.TableCell 
        sx={{ gap: '5px' }}
        style={{ width: '50%' }}
      >
        <div>{chain}</div>
        <div style={{fontSize:'0.8em'}}>{midTitle}</div>
        <div style={{fontSize:'0.8em'}}>{title}</div>
        <div className={styles.muted} style={{fontSize: '0.8em'}}>{typeTX}</div>
      </S.TableCell>

      <S.TableCell 
        sx={{ gap: '5px' }}
        style={{ width: '20%' }}
      >
        <div className={styles.muted}>{blockNumber}</div>
      </S.TableCell>
      
      <S.TableCell sx={{ gap: "5px" }}>
        {link &&
          <a
            href={link}
            target={'_blank'}
            rel='noopener noreferrer'
            style={{color: 'white'}}
          >
            Blockexplorer
          </a>
        }
        {!!detail && 
          <S.TableCell 
            sx={{
              gap: '5px',
              cursor: 'pointer',
            }}
            onClick={() => {
              setDropDownBox(!dropDownBox)
              setDropDownBoxInit(false)
            }}
          >
            More Information 
          </S.TableCell>
        }
        {button && 
          <ButtonMUI
            variant="contained"
            color="primary"
            sx={{
              boder: '1.4px solid #506DFA',
              borderRadius: '8px',
              width: '180px'
            }}
            onClick={button.onClick}
          >
            {button.text}
          </ButtonMUI>
        }

      </S.TableCell>
    </S.TableBody>
    {renderDetailRedesign()}
  </div>)

}

export default Transaction
