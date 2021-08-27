import React, { useState, useRef, useCallback } from 'react'
import { Box } from '@material-ui/system'
import { useSelector, useDispatch } from 'react-redux'
import * as S from './NetworkSwitcher.styles.js'
import chevron from 'images/chevron.svg'
import { selectNetwork } from 'selectors/setupSelector'
import { setNetwork } from 'actions/setupAction'
import { getAllNetworks } from 'util/masterConfig'
import networkService from 'services/networkService'
import { Typography } from '@material-ui/core'

function NetworkSwitcher({ walletEnabled }) {

  const dispatch = useDispatch()
  const dropdownNode = useRef(null)
  const [ showAllNetworks, setShowAllNetworks ] = useState(false)
  const masterConfig = useSelector(selectNetwork())

  // defines the set of possible networks
  const networks = getAllNetworks()

  let allNetworks = []
  for (var prop in networks) allNetworks.push(prop)

  const dispatchSetNetwork = useCallback((network) => {
    console.log("dispatchSetNetwork:",network)
    setShowAllNetworks(false)
    dispatch(setNetwork(network))
  }, [ dispatch ])

  return (
    <S.WalletPickerContainer>
      <S.WallerPickerWrapper>
        <S.Menu>

          <S.NetWorkStyle 
            onClick={()=>{setShowAllNetworks(prev => !prev)}}
          >

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}} >
              <Typography variant="body1">NETWORK: {masterConfig}</Typography>
            </Box>

            <S.Chevron
              open={showAllNetworks}
              src={chevron}
              alt='chevron'
            />

          </S.NetWorkStyle>

          <S.Dropdown ref={dropdownNode}>
            {!!allNetworks.length && showAllNetworks && allNetworks.map((network,   ) => (
              <div
                // key={index}
                onClick={()=>dispatchSetNetwork(network)}
              >
                {network}
              </div>))
            }
          </S.Dropdown>

        </S.Menu>
      </S.WallerPickerWrapper>
    </S.WalletPickerContainer>
  )
};

export default NetworkSwitcher;
