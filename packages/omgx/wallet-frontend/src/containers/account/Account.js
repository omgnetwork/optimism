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

import React,{useState,useEffect,useCallback} from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { isEqual } from 'lodash'

import { selectLoading } from 'selectors/loadingSelector'
import { selectIsSynced } from 'selectors/statusSelector'

import { selectlayer2Balance, selectlayer1Balance } from 'selectors/balanceSelector'

import ListAccount from 'components/listAccount/listAccount';

import { logAmount } from 'util/amountConvert'
import networkService from 'services/networkService'

import * as S from './Account.styles'
import { selectTokens } from 'selectors/tokenSelector'
import PageHeader from 'components/pageHeader/PageHeader'
import { Box, Grid, Tab, Tabs, Typography, useMediaQuery } from '@material-ui/core'
import { fetchGas, fetchLookUpPrice } from 'actions/networkAction'
import { selectNetwork } from 'selectors/setupSelector'
import { useTheme } from '@emotion/react'
import { tableHeadList } from './tableHeadList'
import TabPanel from 'components/tabs/TabPanel'
import Drink from '../../images/backgrounds/drink.png'
import NetworkSwitcherIcon from 'components/icons/NetworkSwitcherIcon'

function Account () {
  const networkLayer = networkService.L1orL2 === 'L1' ? 'L1' : 'L2';
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(networkLayer === 'L1' ? 0 : 1);

  const childBalance = useSelector(selectlayer2Balance, isEqual);
  const rootBalance = useSelector(selectlayer1Balance, isEqual);

  const isSynced = useSelector(selectIsSynced);
  const criticalTransactionLoading = useSelector(selectLoading([ 'EXIT/CREATE' ]));
  const tokenList = useSelector(selectTokens);

  const network = useSelector(selectNetwork());

  const getLookupPrice = useCallback(()=>{
    const symbolList = Object.values(tokenList).map((i)=> {
      if(i.symbolL1 === 'ETH') {
        return 'ethereum'
      } else if(i.symbolL1 === 'OMG') {
        return 'omisego'
      } else {
        return i.symbolL1.toLowerCase()
      }
    });
    dispatch(fetchLookUpPrice(symbolList));
  },[tokenList,dispatch])

  const getGasPrice = useCallback(() => {
    dispatch(fetchGas({
      network: network || 'local',
      networkLayer
    }));
  }, [dispatch, network, networkLayer])

  useEffect(()=>{
    getLookupPrice();
    getGasPrice()
  },[childBalance, rootBalance, getLookupPrice, getGasPrice])

  const disabled = criticalTransactionLoading || !isSynced

  let balances = {
    oETH : {have: false, amount: 0, amountShort: '0'}
  }

  childBalance.reduce((acc, cur) => {
    if (cur.symbol === 'oETH' && cur.balance > 0 ) {
      acc['oETH']['have'] = true;
      acc['oETH']['amount'] = cur.balance;
      acc['oETH']['amountShort'] = logAmount(cur.balance, cur.decimals, 2);
    }
    return acc;
  }, balances)

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const ActiveItem = ({active}) => (
    <Box display="flex" sx={{ justifyContent: 'center', gap: 1 }}>
      <NetworkSwitcherIcon active={active} /> <Typography variant="overline">Active</Typography>
    </Box>
  )

  const L1Column = () => (
    <S.AccountWrapper >
      {!isMobile ? (
        <S.WrapperHeading>
          <Typography variant="h3" sx={{opacity: networkLayer === 'L1' ? "1.0" : "0.2", fontWeight: "700"}}>Ethereum Mainnet - L1</Typography>
          {/* <SearchIcon color={theme.palette.secondary.main}/> */}
          {networkLayer === 'L1' ? <ActiveItem active={false} /> : null}
        </S.WrapperHeading>
      ) : (null)}

      <S.TableHeading>
        {tableHeadList.map((item) => {
          return (
            <S.TableHeadingItem key={item.label} variant="body2" component="div" sx={{opacity: networkLayer === 'L1' ? "1.0" : "0.2"}}>
              {item.label}
            </S.TableHeadingItem>
          )
        })}
      </S.TableHeading>

      <Box>
        {rootBalance.map((i, index) => {
          return (
            <ListAccount
              key={i.currency}
              token={i}
              chain={'L1'}
              networkLayer={networkLayer}
              disabled={disabled}
            />
          )
        })}
      </Box>
    </S.AccountWrapper>
  );

  const L2Column = () => (
    <S.AccountWrapper>
      {!isMobile ? (
        <S.WrapperHeading>
          <Typography variant="h3" sx={{opacity: networkLayer === 'L2' ? "1.0" : "0.4", fontWeight: "700"}}>OMGX Mainnet - L2</Typography>
          {/* <SearchIcon color={theme.palette.secondary.main}/> */}
          {networkLayer === 'L2' ? <ActiveItem active /> : null}
        </S.WrapperHeading>
      ) : (null)}

      <S.TableHeading sx={{opacity: networkLayer === 'L2' ? "1.0" : "0.4"}}>
        {tableHeadList.map((item) => {
          return (
            <S.TableHeadingItem key={item.label} variant="body2" component="div">{item.label}</S.TableHeadingItem>
          )
        })}
      </S.TableHeading>

      <Box>
        {childBalance.map((i, index) => {
          return (
            <ListAccount
              key={i.currency}
              token={i}
              chain={'L2'}
              networkLayer={networkLayer}
              disabled={disabled}
            />
          )
        })}
      </Box>
    </S.AccountWrapper>
  );

  return (
    <>
      <PageHeader title="Wallet"/>

      <S.CardTag>
        <S.CardContentTag>
          <S.CardInfo>Boba Balance</S.CardInfo>
          <S.BalanceValue component ="div">{balances['oETH'].amountShort}</S.BalanceValue>
          <Typography>oETH</Typography>
        </S.CardContentTag>

        <S.ContentGlass>
          <img src={Drink} href="#" width={135} alt="" />
        </S.ContentGlass>

      </S.CardTag>
      {isMobile ? (
        <>
          <Tabs value={activeTab} onChange={handleChange} sx={{color: '#fff', fontWeight: 700, my: 2}}>
            <Tab label="Ethereum Mainnet - L1" />
            <Tab label="OMGX Mainnet - L2" />
          </Tabs>
          <TabPanel value={activeTab} index={0}>
            <L1Column />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <L2Column />
          </TabPanel>
        </>
      ) : (
        <Grid container spacing={2} >
          <Grid item xs={12} md={6} >
            <L1Column />
          </Grid>

          <Grid item xs={12} md={6}>
            <L2Column />
          </Grid>
        </Grid>
      )}
    </>
  );

}

export default React.memo(Account);
