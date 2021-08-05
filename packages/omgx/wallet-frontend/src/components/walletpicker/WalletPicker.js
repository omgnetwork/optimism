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

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import WrongNetworkModal from 'containers/modals/wrongnetwork/WrongNetworkModal';
import networkService from 'services/networkService';

import { selectModalState } from 'selectors/uiSelector';

import {
  selectWalletMethod,
  selectNetwork,
} from 'selectors/setupSelector';

import { openModal } from 'actions/uiAction';
import { setWalletMethod, setNetwork } from 'actions/setupAction';
import { getAllNetworks } from 'util/masterConfig';

import logo from 'images/omgx.png';
import chevron from 'images/chevron.svg';

import { isChangingChain } from 'util/changeChain';
import Button from 'components/button/Button';
import * as S from "./WalletPicker.styles"
import { ReactComponent as Arrow } from './../../images/icons/arrow-right.svg';
import { ReactComponent as Fox } from './../../images/icons/fox-icon.svg';
import { Box, Container, Grid, Link } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { grey } from '@material-ui/core/colors';

function WalletPicker ({ onEnable, enabled }) {
  const dispatch = useDispatch();
  const dropdownNode = useRef(null);

  const [ walletEnabled, setWalletEnabled ] = useState(false);
  const [ accountsEnabled, setAccountsEnabled ] = useState(false);
  const [ wrongNetwork, setWrongNetwork ] = useState(false);
  const [ showAllNetworks, setShowAllNetworks ] = useState(false);

  const walletMethod = useSelector(selectWalletMethod())
  const masterConfig = useSelector(selectNetwork())

  const wrongNetworkModalState = useSelector(selectModalState('wrongNetworkModal'));

  const dispatchSetWalletMethod = useCallback((methodName) => {
    dispatch(setWalletMethod(methodName));
  }, [ dispatch ])

  const dispatchSetNetwork = useCallback((network) => {
    //console.log("dispatchSetNetwork:",network)
    setShowAllNetworks(false);
    dispatch(setNetwork(network));
  }, [ dispatch ])

  useEffect(() => {

    if (walletMethod === 'browser') {
      enableBrowserWallet();
    }

    async function enableBrowserWallet () {
      //console.log("enableBrowserWallet() for",masterConfig)
      const selectedNetwork = masterConfig ? masterConfig : "local";
      const walletEnabled = await networkService.enableBrowserWallet(selectedNetwork);
      //console.log("walletEnabled:",walletEnabled)
      return walletEnabled
        ? setWalletEnabled(true)
        : dispatchSetWalletMethod(null);
    }

  }, [ dispatchSetWalletMethod, walletMethod, masterConfig ]);

  useEffect(() => {

    async function initializeAccounts () {

      //console.log("initializeAccounts() for:",masterConfig)

      const initialized = await networkService.initializeAccounts(masterConfig);

      if (!initialized) {
        console.log("Error !initialized for:",masterConfig)
        return setAccountsEnabled(false);
      }

      if (initialized === 'wrongnetwork') {
        setAccountsEnabled(false);
        return setWrongNetwork(true);
      }

      if (initialized === 'enabled') {
        return setAccountsEnabled(true);
      }

    }
    if (walletEnabled) {
      initializeAccounts();
    }
  }, [ walletEnabled, masterConfig ]);

  useEffect(() => {
    if (accountsEnabled) {
      onEnable(true);
    }
  }, [ onEnable, accountsEnabled ]);

  useEffect(() => {
    if (walletEnabled && wrongNetwork) {
      dispatch(openModal('wrongNetworkModal'));
      localStorage.setItem('changeChain', false);
    }
  }, [ dispatch, walletEnabled, wrongNetwork ]);

  function resetSelection () {
    dispatchSetWalletMethod(null);
    setWalletEnabled(false);
    setAccountsEnabled(false);
  }

  const browserEnabled = !!window.ethereum;

  // defines the set of possible networks
  const networks = getAllNetworks();

  let allNetworks = [];
  for (var prop in networks) allNetworks.push(prop)

  if (!wrongNetwork && !enabled && isChangingChain) {
    return <S.Loading>Switching Chain...</S.Loading>
  }

  return (
    <>
      <WrongNetworkModal
        open={wrongNetworkModalState}
        onClose={resetSelection}
      />
      <Box sx={{ py: 10, px: 10 }}>
        <Container maxWidth="lg">
            <Grid container spacing={8}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h1" component="h1" gutterBottom>
                    Connect a Wallet to access your assets on the network
                  </Typography>
                  <Box sx={{ mt: 4, mb: 8, mr: 10 }}>
                    <Typography variant="body1" component="p" gutterBottom paragraph={true} style={{ color: grey[500] }}>
                      Select the wallet that u use to connect it to OMGx system! Don’t worry more wallets support is coming soon
                    </Typography>
                  </Box>
                  <S.DescriptionContent>
                    <Link
                      style={{ color: grey[500] }}
                      color= '#fff'
                      href="#"
                      underline="hover"
                      variant="body1"
                      onClick={() => {
                        console.info("I'm a button.");
                      }}
                    >
                      More about OMGX and how L2 work
                    </Link>
                    <Arrow />
                  </S.DescriptionContent>
                </Grid>
              <Grid item xs={12} md={6}>
                <S.WalletCard onClick={() => dispatchSetWalletMethod('browser')}>
                  <S.WalletCardHeading>
                    <div>+</div>
                    <Typography variant="h2" component="h2" paragraph={true} mb={0}>
                      Metamask
                    </Typography>
                  </S.WalletCardHeading>
                  {/* <S.WalletCardIcon> */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                    <Typography variant="body1" component="p" gutterBottom paragraph={true} mt={4} mr={4}>
                      Connect using <strong>browser </strong>wallet
                    </Typography>
                    <Fox width={50} />
                    </Box>
                  {/* </S.WalletCardIcon> */}
                </S.WalletCard>
                <br />
                <Button
                  // type="primary"
                  // className={styles.ButtonAdd}
                  onClick={() => networkService.addL2Network()}
                >
                  Add OMGX L2 Provider
                </Button>
              </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}

export default React.memo(WalletPicker);
