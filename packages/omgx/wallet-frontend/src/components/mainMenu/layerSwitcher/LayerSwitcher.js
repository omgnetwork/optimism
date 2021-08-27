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
  const layer = useSelector(selectLayer())

  let layers = ['L1', 'L2']

  const dispatchSetLayer = useCallback((layer) => {
    console.log("dispatchSetLayer:",layer)
    dispatch(setLayer(layer))
    setShowAllLayers(false)
    networkService.switchChain(layer)
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
