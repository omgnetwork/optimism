import React, { useState, useCallback } from 'react'
import { Box } from '@material-ui/system'
import { useSelector, useDispatch } from 'react-redux'
import * as S from './LayerSwitcher.styles.js'
import { selectLayer } from 'selectors/setupSelector'
import { setLayer } from 'actions/setupAction'
import { Typography } from '@material-ui/core'
import networkService from 'services/networkService'

function LayerSwitcher({ walletEnabled }) {

  const dispatch = useDispatch()
  const [ setShowAllLayers ] = useState(false)
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
    console.log("dispatchSetLayer:",layer)
    dispatch(setLayer(layer))
    networkService.switchChain(layer)
    setShowAllLayers(false)
  }, [ dispatch, setShowAllLayers ])

  return (
    <S.WalletPickerContainer>
      <S.WalletPickerWrapper>
        <S.Menu>

          <S.NetWorkStyle>
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
          </S.ButtonStyle>

        </S.Menu>
      </S.WalletPickerWrapper>
    </S.WalletPickerContainer>
  )
};

export default LayerSwitcher;
