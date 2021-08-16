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

import React from 'react'
import { Search } from '@material-ui/icons'
import BN from 'bignumber.js'
import * as styles from './Input.module.scss'
import { CssTextField } from './Input.styles'
import Button from 'components/button/Button'
import { Box, Grid, TextField, Typography } from '@material-ui/core'

function Input({
  placeholder,
  label,
  type = 'text',
  disabled,
  icon,
  unit,
  value,
  onChange,
  // paste,
  // className,
  maxValue,
  // small,
  fullWidth,
  size,
  variant,
}) {
  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        onChange({ target: { value: text } })
      }
    } catch (err) {
      // navigator clipboard api not supported in client browser
    }
  }

  function handleMaxClick() {
    onChange({ target: { value: maxValue } })
  }

  const overMax = new BN(value).gt(new BN(maxValue))

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={unit ? 6 : 12}>
          <Typography variant="body2" component="div" sx={{opacity: 0.5}}>
            {label}
          </Typography>
          {/* <div className={[styles.field, overMax ? styles.error : ''].join(' ')}> */}
          {icon && <Search className={styles.icon} />}
            <CssTextField
              // className={[styles.input, small ? styles.small : ''].join(' ')} // todo
              placeholder={placeholder}
              type={type}
              value={value}
              onChange={onChange}
              disabled={disabled}
              fullWidth={fullWidth}
              size={size}
              id="custom-css-outlined-input"
              variant={variant}
              error={overMax}
            />
            {/* </div> */}
        </Grid>
        {unit && (
          <Grid item xs={6}>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px'}}>
                {/* {unit} */}
              <Typography variant="body2" component="p" sx={{opacity: 0.5, textAlign: "end"}}>
                Available: {Number(maxValue).toFixed(3)}
              </Typography>

              {maxValue && value !== maxValue && (
                <Box>
                  <Button onClick={handleMaxClick} variant="small" >
                    Use All
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>
        )}
      </Grid>

      {/* <div className={[styles.Input, className].join(' ')}>
        {label &&
          <Typography variant="body1" component="div" sx={{opacity: 0.5}}>
            {label}
          </Typography>
        }
        <div className={[styles.field, overMax ? styles.error : ''].join(' ')}>
          {icon && <Search className={styles.icon} />}
          <input
            className={[styles.input, small ? styles.small : ''].join(' ')}
            placeholder={placeholder}
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
          {unit && (
            <Box sx={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                {unit}
              <Typography variant="body2" component="p" sx={{opacity: 0.5}}>
                Available: {Number(maxValue).toFixed(3)}
              </Typography>

              {maxValue && value !== maxValue && (
                <Button onClick={handleMaxClick} variant="small" >
                  Use All
                </Button>
              )}
            </Box>
          )}
          {paste && (
            <div onClick={handlePaste} className={styles.paste}>
              Paste
            </div>
          )}
        </div>
      </div> */}
    </>
  )
}

export default React.memo(Input)
