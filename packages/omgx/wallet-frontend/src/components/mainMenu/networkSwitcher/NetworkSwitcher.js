import React, { useState, useRef, useCallback } from 'react';
import { Box } from '@material-ui/system';
import { useSelector, useDispatch } from 'react-redux';
import * as S from './NetworkSwitcher.styles.js';
import chevron from 'images/chevron.svg';
import {
  selectNetwork,
} from 'selectors/setupSelector';
import { setNetwork } from 'actions/setupAction';
import { getAllNetworks } from 'util/masterConfig';
import networkService from 'services/networkService'
import NetworkSwitcherIcon from 'components/icons/NetworkSwitcherIcon.js';
import { Typography } from '@material-ui/core';

function NetworkSwitcher() {
  const dispatch = useDispatch();
  const dropdownNode = useRef(null);
  const [ showAllNetworks, setShowAllNetworks ] = useState(false);
  const masterConfig = useSelector(selectNetwork())

  // defines the set of possible networks
  const networks = getAllNetworks();

  const networkLayer = networkService.L1orL2

  let allNetworks = [];
  for (var prop in networks) allNetworks.push(prop)

  const dispatchSetNetwork = useCallback((network) => {
    //console.log("dispatchSetNetwork:",network)
    setShowAllNetworks(false);
    dispatch(setNetwork(network));
  }, [ dispatch ])

  console.log('networkLayer', networkLayer)


  return (
    <S.WalletPickerContainer>
      <S.WallerPickerWrapper>
        <S.Menu>
          <S.NetWorkStyle
            onClick={()=>setShowAllNetworks(prev => !prev)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}} >
              <NetworkSwitcherIcon active={networkLayer === 'L1'} />
              <Typography variant="body1">BOBA {masterConfig}</Typography>
            </Box>
            {!!allNetworks.length && (
              <S.Chevron
                open={showAllNetworks}
                src={chevron}
                alt='chevron'
              />
            )}
          </S.NetWorkStyle>

          <S.Dropdown
            ref={dropdownNode}
          >
            {!!allNetworks.length && showAllNetworks && allNetworks.map((network,   ) => (
              <div
                style={{background: `linear-gradient(90deg, rgba(237, 72, 240, 0.09) 1.32%, rgba(237, 72, 236, 0.0775647) 40.2%`, color: 'white', marginTop: 5, paddingTop: 5, paddingBottom: 5, paddingLeft: 12, paddingRight: 5, borderRadius: 3, cursor: 'pointer'}}
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
