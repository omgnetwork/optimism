import React, { useState, useRef, useCallback } from 'react'
import { Box } from '@material-ui/system'
import { useSelector, useDispatch } from 'react-redux'
import * as S from './LayerSwitcher.styles.js'
import chevron from 'images/chevron.svg'
import { selectLayer } from 'selectors/setupSelector'
import { setLayer } from 'actions/setupAction'
import { Typography } from '@material-ui/core'
import networkService from 'services/networkService'

function LayerSwitcher({ walletEnabled }) {

  const dispatch = useDispatch()
  const dropdownNode = useRef(null)
  const [ showAllLayers, setShowAllLayers ] = useState(false)
  let layer = useSelector(selectLayer())

  if (networkService.L1orL2 !== layer) {
    //networkService.L1orL2 is always right...
    layer = networkService.L1orL2
  }

  let layers = ['L1', 'L2']

  //show only the one relevant to switching
  if(layer === 'L1') {
    layers = ['L2']
  } else {
    layers = ['L1']
  }

  const dispatchSetLayer = useCallback((layer) => {
    console.log("dispatchSetLayer:",layer)
    dispatch(setLayer(layer))
    networkService.switchChain(layer)
    setShowAllLayers(false)
  }, [ dispatch ])

  return (
    <S.WalletPickerContainer>
      <S.WalletPickerWrapper>
        <S.Menu>

          <S.NetWorkStyle 
            onClick={()=>{setShowAllLayers(prev => !prev)}}
          >

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}} >
              <Typography variant="body1">LAYER: {layer}</Typography>
            </Box>

            <S.Chevron
              open={showAllLayers}
              src={chevron}
              alt='chevron'
            />

          </S.NetWorkStyle>

          <S.Dropdown ref={dropdownNode}>
            {!!layers.length && showAllLayers && layers.map((layer) => (
              <div
                key={layer}
                onClick={()=>dispatchSetLayer(layer)}
              >
                {layer}
              </div>))
            }
          </S.Dropdown>

        </S.Menu>
      </S.WalletPickerWrapper>
    </S.WalletPickerContainer>
  )
};

export default LayerSwitcher;
