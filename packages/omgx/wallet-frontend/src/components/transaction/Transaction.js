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

import { Grid, Typography } from '@material-ui/core'
import Button from 'components/button/Button'
import * as styles from './Transaction.module.scss'
import * as S from './Transaction.styles'
import { useTheme } from '@emotion/react'

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
  const theme = useTheme()

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
              <Typography variant="body2" >
                L1 Hash:&nbsp;
                <Typography className={styles.muted} variant="body2" component="span">
                  <a className={styles.href} href={detail.l1TxLink} target="_blank" rel="noopener noreferrer">
                    {detail.l1Hash}
                  </a>
                </Typography>
              </Typography>
            </Grid>
            <Grid className={styles.dropDownContent} container spacing={1}>
              <Typography variant="body2" >
                L1 Block:&nbsp;
                <Typography className={styles.muted} variant="body2" component="span">
                  {detail.l1BlockNumber}
                </Typography>
              </Typography>
            </Grid>
            <Grid className={styles.dropDownContent} container spacing={1}>
              <Typography variant="body2" >
                Block Hash:&nbsp;
                <Typography className={styles.muted} variant="body2" component="span">
                  {detail.l1BlockHash}
                </Typography>
              </Typography>
            </Grid>
            <Grid className={styles.dropDownContent} container spacing={1}>
              <Typography variant="body2" >
                L1 From:&nbsp;
                <Typography className={styles.muted} variant="body2" component="span">
                  {detail.l1From}
                </Typography>
              </Typography>
            </Grid>
            <Grid className={styles.dropDownContent} container spacing={1}>
              <Typography variant="body2" >
                L1 To:&nbsp;
                <Typography className={styles.muted} variant="body2" component="span">
                  {detail.l1To}
                </Typography>
              </Typography>
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
        background: theme.palette.background.secondary,
      }}
    >
      <S.TableBody>

        <S.TableCell
          sx={{ gap: '5px' }}
          style={{ width: '50%' }}
        >
          <Typography variant="h3">{chain}</Typography>
          <Typography variant="body1">{midTitle}</Typography>
          <Typography variant="body1">{title}</Typography>
          <Typography variant="body2" className={styles.muted}>{typeTX}</Typography>
          {!!detail &&
            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
              }}
              onClick={() => {
                setDropDownBox(!dropDownBox)
                setDropDownBoxInit(false)
              }}
            >
              More Information
            </Typography>
          }
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
              style={{ color: theme.palette.mode === 'light' ? 'black' : 'white' }}
            >
              Blockexplorer
            </a>
          }

          {button &&
            <Button
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
            </Button>
          }

        </S.TableCell>
      </S.TableBody>
      {renderDetailRedesign()}
    </div>)

}

export default Transaction
