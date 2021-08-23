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

import React,{useEffect,useCallback} from 'react'
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
import { Box, Grid, Paper, Tab, Tabs, Typography, useMediaQuery } from '@material-ui/core'
import { fetchGas, fetchLookUpPrice } from 'actions/networkAction'
import { selectNetwork } from 'selectors/setupSelector'
import { WrapperHeading } from './Account.styles'
import { useTheme } from '@emotion/react'
import { tableHeadList } from './tableHeadList'

function Account () {
  const dispatch = useDispatch();

  const childBalance = useSelector(selectlayer2Balance, isEqual);
  const rootBalance = useSelector(selectlayer1Balance, isEqual);

  const isSynced = useSelector(selectIsSynced);
  const criticalTransactionLoading = useSelector(selectLoading([ 'EXIT/CREATE' ]));
  const tokenList = useSelector(selectTokens);

  const network = useSelector(selectNetwork());

  const networkLayer = networkService.L1orL2 === 'L1' ? 'L1' : 'L2';

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
  return (
    <>
      <PageHeader title="Wallet"/>

      {/* {!balances['oETH']['have'] &&
        <div className={styles.RabbitBox}>
          <div className={styles.RabbitRight}>
            <div className={styles.RabbitRightTop}>
              BOBA Balance
            </div>
            <div className={styles.RabbitRightMiddle}>
                <div className={styles.sad}>0</div>
            </div>
            <div className={styles.RabbitRightBottom}>
              oETH
            </div>
            <div className={styles.RabbitRightBottomNote}>
            {networkLayer === 'L1' &&
              <span>You are on L1. To use the L2, please switch to L2 in MetaMask.</span>
            }
            {networkLayer === 'L2' &&
              <span>You are on L2. To use the L1, please switch to L1 in MetaMask.</span>
            }
            </div>
          </div>
        </div>
      } */}
      {isMobile ? (
      <Tabs aria-label="basic tabs example" sx={{color: '#fff', fontWeight: 700}}>
        <Tab label="Ethereum Mainnet - L1" />
        <Tab label="OMGX Mainnet - L2" />
      </Tabs>
      ) : (null)}

      <Grid container spacing={2} >
        <Grid item xs={12} md={6} >
          <S.AccountWrapper >
            {!isMobile ? (
              <S.WrapperHeading>
                <Typography variant="h3" sx={{opacity: networkLayer === 'L1' ? "1.0" : "0.2", fontWeight: "700"}}>Ethereum Mainnet - L1</Typography>
                {/* <SearchIcon color={theme.palette.secondary.main}/> */}
              </S.WrapperHeading>
            ) : (null)}

            <S.TableHeading>
              {tableHeadList.map((item) => {
                return (
                  <S.TableHeadingItem variant="body2" component="div" sx={{opacity: networkLayer === 'L1' ? "1.0" : "0.2"}}>
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
        </Grid>

        <Grid item xs={12} md={6}>
          <S.AccountWrapper>
            {!isMobile ? (
              <S.WrapperHeading>
                <Typography variant="h3" sx={{opacity: networkLayer === 'L2' ? "1.0" : "0.4", fontWeight: "700"}}>OMGX Mainnet - L2</Typography>
                {/* <SearchIcon color={theme.palette.secondary.main}/> */}
              </S.WrapperHeading>
            ) : (null)}

            <S.TableHeading sx={{opacity: networkLayer === 'L2' ? "1.0" : "0.4"}}>
              {tableHeadList.map((item) => {
                return (
                  <S.TableHeadingItem variant="body2" component="div">{item.label}</S.TableHeadingItem>
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
        </Grid>
      </Grid>
    </>
  );

}

export default React.memo(Account);
