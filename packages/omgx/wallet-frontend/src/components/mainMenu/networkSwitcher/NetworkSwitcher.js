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

function NetworkSwitcher({ walletEnabled }) {
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

  console.log('----> ta logado fi?', walletEnabled)

  return (
    <S.WalletPickerContainer>
      <S.WallerPickerWrapper>
        <S.Menu>

          <S.NetWorkStyle walletEnabled={walletEnabled} onClick={()=>{
            if (walletEnabled === false)
            setShowAllNetworks(prev => !prev)
          }}>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}} >
              <NetworkSwitcherIcon active={networkLayer === 'L2'} />
              <Typography variant="body1">BOBA {masterConfig}</Typography>
            </Box>

            {walletEnabled !== false || !!allNetworks.length && (
              <S.Chevron
                open={showAllNetworks}
                src={chevron}
                alt='chevron'
              />
            )}
          </S.NetWorkStyle>

          {walletEnabled !== false || networkLayer === 'L1' || 'L2' ? (
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
          ) : (null)}

        </S.Menu>
      </S.WallerPickerWrapper>
    </S.WalletPickerContainer>
  )
};

export default NetworkSwitcher;
