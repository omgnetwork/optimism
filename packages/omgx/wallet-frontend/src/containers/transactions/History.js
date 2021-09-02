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

import React, { useState } from 'react';
import { batch, useDispatch } from 'react-redux';
import { isEqual, orderBy } from 'lodash';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import networkService from 'services/networkService'

import moment from 'moment';

import { setActiveHistoryTab1 } from 'actions/uiAction'
// import { setActiveHistoryTab2 } from 'actions/uiAction'
import { fetchTransactions } from 'actions/networkAction';

import { selectActiveHistoryTab1 } from 'selectors/uiSelector'
import { selectActiveHistoryTab2 } from 'selectors/uiSelector'
import { selectTransactions } from 'selectors/transactionSelector';
import { selectNetwork } from 'selectors/setupSelector'

import Tabs from 'components/tabs/Tabs'

import ExitsOld from './Exits';
import DepositsOld from './Deposits';
import TransactionsOld from './Transactions';

import * as styles from './Transactions.module.scss';

import { getAllNetworks } from 'util/masterConfig';
import useInterval from 'util/useInterval';
import PageHeader from 'components/pageHeader/PageHeader';
import Transactions from './../history/transactions';
import Deposits from './../history/deposits';
import Exits from './..//history/exits';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@emotion/react';

const POLL_INTERVAL = 5000; //milliseconds

function History () {

  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [ searchHistory, setSearchHistory ] = useState('');

  const activeTab1 = useSelector(selectActiveHistoryTab1, isEqual);
  // const activeTab2 = useSelector(selectActiveHistoryTab2, isEqual);

  const unorderedTransactions = useSelector(selectTransactions, isEqual)

  const orderedTransactions = orderBy(unorderedTransactions, i => i.timeStamp, 'desc').map((i) => !i.timeStamp ? ({...i, timeStamp: String(i.timestamp)}) : i);

  const transactions = orderedTransactions.filter((i)=>{
    if(startDate && endDate) {
      return (moment.unix(i.timeStamp).isSameOrAfter(startDate) && moment.unix(i.timeStamp).isSameOrBefore(endDate));
    }
    return true;
  })

  const deposits = transactions.filter(i => {
    return i.hash.includes(searchHistory) && (
      i.to !== null && (
        i.to.toLowerCase() === networkService.L1LPAddress.toLowerCase() ||
        i.to.toLowerCase() === networkService.L1_ETH_Address.toLowerCase() ||
        i.to.toLowerCase() === networkService.L1StandardBridgeAddress.toLowerCase()
      )
    )
  })

  const exits = transactions.filter(i => {
    return i.hash.includes(searchHistory) && (
      i.to !== null && (
        i.to.toLowerCase() === networkService.L2LPAddress.toLowerCase() ||
        //i.to.toLowerCase() === networkService.L2_ETH_Address.toLowerCase() ||
        //i.to.toLowerCase() === networkService.L2_TEST_Address.toLowerCase() ||
        i.to.toLowerCase() === networkService.L2StandardBridgeAddress.toLowerCase()
      )
    )
  })

  const tabsContent = {
    All: transactions,
    Deposits: deposits,
    Exits: exits
  }

  const currentNetwork = useSelector(selectNetwork());

  const nw = getAllNetworks();

  const chainLink = (item) => {
    let network = nw[currentNetwork];
    if (!!network && !!network[item.chain]) {
      // network object should have L1 & L2
      if(item.chain === 'L1') {
        return `${network[item.chain].transaction}${item.hash}`;
      } else {
        return `${network[item.chain].transaction}${item.hash}?network=${currentNetwork[0].toUpperCase()+currentNetwork.slice(1)}`;
      }
    }
    return '';
  }

  useInterval(() => {
    batch(() => {
      dispatch(fetchTransactions());
    });
  }, POLL_INTERVAL * 2);

  return (
    <>
      <PageHeader title="Transaction History" />

      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', flexDirection: {xs:'column-reverse', md: 'row'}, gap: {xs: 2, md: 0}, alignItems: {xs: 'flex-start', md: 'center'}, ml: {xs: 1}}}>
          <Tabs
            onClick={tab => {
              dispatch(setActiveHistoryTab1(tab));
            }}
            activeTab={activeTab1}
            tabs={['All', 'Deposits', 'Exits']}
          />
          <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: {xs: '100%', md: 'initial' }}}>
            {!isMobile ? (
              <Typography variant="h4" sx={{color: 'rgba(255, 255, 255, 0.7)', whiteSpace: 'nowrap'}}>Show period from</Typography>
            ) : null}
            <Box sx={{width: '100%', m: {xs: '0 10px 0 0', md: '0 15px'}}}>
              <DatePicker
                wrapperClassName={styles.datePickerInput}
                popperClassName={styles.popperStyle}
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText={isMobile ? 'From' : ''}
              />
            </Box>

            {!isMobile ? (
              <Typography variant="h4" sx={{color: 'rgba(255, 255, 255, 0.7)'}}>to </Typography>
            ) : null}
            <Box sx={{width: '100%', m: {xs: '0 0 0 10px', md: '0 15px'}}}>
              <DatePicker
                wrapperClassName={styles.datePickerInput}
                popperClassName={styles.popperStyle}
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText={isMobile ? 'To' : ''}
              />
            </Box>
          </Box>
        </Box>


        <Transactions
          transactions={tabsContent[activeTab1]}
          chainLink={chainLink}
        />
        <hr />
      </Box>
    </>
  );
}

export default React.memo(History);
