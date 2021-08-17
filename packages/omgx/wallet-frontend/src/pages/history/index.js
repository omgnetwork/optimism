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

import PageHeader from 'components/pageHeader/PageHeader';
import StyledTabs from 'components/tabs';
import StyledTable from 'components/table';
import React, { useState } from 'react';
import {
  PageContent,
} from '../page.style';
import { batch, useDispatch } from 'react-redux';
import { isEqual, orderBy } from 'lodash';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { setActiveHistoryTab1 } from 'actions/uiAction'
import { setActiveHistoryTab2 } from 'actions/uiAction'
import { fetchTransactions } from 'actions/networkAction';

import { selectActiveHistoryTab1 } from 'selectors/uiSelector'
import { selectActiveHistoryTab2 } from 'selectors/uiSelector'
import { selectTransactions } from 'selectors/transactionSelector';
import { selectNetwork } from 'selectors/setupSelector'
import { getAllNetworks } from 'util/masterConfig';
import useInterval from 'util/useInterval';
import Transactions from 'containers/history/transactions';
import Deposits from 'containers/history/deposits';
import Exits from 'containers/history/exits';
import { POLL_INTERVAL } from 'util/constant';

function HistoryPage() {
  const dispatch = useDispatch();
  const [selectedTab, setSelectedTab] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const tabList = ['All', 'Deposits', 'Exits']

  const unorderedTransactions = useSelector(selectTransactions, isEqual);
  const orderedTransactions = orderBy(unorderedTransactions, i => i.timeStamp, 'desc');
    
  const transactions = orderedTransactions.filter((i)=>{
    if(startDate && endDate) {
      return (moment.unix(i.timeStamp).isSameOrAfter(startDate) && moment.unix(i.timeStamp).isSameOrBefore(endDate));
    }
    return true;
  })  

  const currentNetwork = useSelector(selectNetwork());

  const nw = getAllNetworks();

  const chainLink = (item) => {
    let network = nw[currentNetwork];
    if (!!network && !!network[item.chain]) {
      // network object should have L1 & L2
      return `${network[item.chain].transaction}${item.hash}`;
    }
    return '';
  }

  useInterval(() => {
    batch(() => {
      dispatch(fetchTransactions());
    });
  }, POLL_INTERVAL * 2);

  console.log(transactions);

  const onTabChagne = (event, newValue) => {
    console.log([event, newValue]);
    setSelectedTab(newValue);
  }

  return (
    <PageContent>
      <PageHeader title="Transaction History" />
      <StyledTabs
        selectedTab={selectedTab}
        onChange={onTabChagne}
        optionList={tabList}
        isSearch={true}
      />
      {tabList[selectedTab] === 'All' ?
        <Transactions
          transactions={transactions}
          chainLink={chainLink}
        /> : null
      }
      {tabList[selectedTab] === 'Deposits' ?
        <Deposits
        transactions={transactions}
        chainLink={chainLink}
        /> : null
      }
      {tabList[selectedTab] === 'Exits' ?
        <Exits 
        transactions={transactions}
        chainLink={chainLink}
        /> : null
      }
    </PageContent>
  );

}

export default React.memo(HistoryPage);
