import React, { useCallback } from 'react'
import { Box } from '@material-ui/core'
import { useSelector, useDispatch } from 'react-redux'
import * as S from './LayerSwitcher.styles.js'
import { selectLayer } from 'selectors/setupSelector'
import { setLayer } from 'actions/setupAction'
import { Typography } from '@material-ui/core'
import networkService from 'services/networkService'
import Button from 'components/button/Button';

import LayerIcon from 'components/icons/LayerIcon';

function LayerSwitcher({ walletEnabled, isButton = false }) {

  const dispatch = useDispatch()
  let layer = useSelector(selectLayer())

  if (networkService.L1orL2 !== layer) {
    //networkService.L1orL2 is always right...
    layer = networkService.L1orL2
  }

  let otherLayer = ''

  if(layer === 'L1') {
    otherLayer = 'L2'
  } else {
    otherLayer = 'L1'
  }

  const dispatchSetLayer = useCallback((layer) => {
    dispatch(setLayer(layer))
    networkService.switchChain(layer)
  }, [ dispatch ])

  if (!!isButton) {
    return (<>
      <Button
        onClick={() => { dispatchSetLayer(otherLayer) }}
        size='small'
        variant="contained"
        sx={{
          textTransform: 'uppercase',
          fontSize: '16px',
        }}
        >
          SWITCH LAYER
      </Button>
    </>)
  }

  return (
    <S.WalletPickerContainer>
      <S.WalletPickerWrapper>
        {/* <S.Menu> */}

          <Box
            sx={{
              display: 'flex',
              width: '100%',
              alignItems: 'center'
            }}
          >
            <LayerIcon />
            <S.LayerLabel variant="body1"  component="span">
                Layer
            </S.LayerLabel>
            <S.LayerSwitch
              onClick={()=>{dispatchSetLayer(otherLayer)}}
            >
              <Typography
                className={layer === 'L1' ? 'active': ''}
                variant="body1"
                component="span">
                  L1
              </Typography>
              <Typography
                className={layer === 'L2' ? 'active': ''}
                variant="body1"
                component="span">
                  L2
              </Typography>
            </S.LayerSwitch>
          </Box>

          {/* <S.NetWorkStyle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}} >
              <Typography variant="body1">LAYER: {layer}</Typography>
            </Box>
          </S.NetWorkStyle>

          <S.ButtonStyle
            onClick={()=>{dispatchSetLayer(otherLayer)}}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}} >
              SWITCH LAYER
            </Box>
          </S.ButtonStyle> */}

        {/* </S.Menu> */}
      </S.WalletPickerWrapper>
    </S.WalletPickerContainer>
  )
};

export default LayerSwitcher;
