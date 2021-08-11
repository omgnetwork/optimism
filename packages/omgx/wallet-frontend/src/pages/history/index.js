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

import {
  Box,
  Tabs,
  Tab
} from '@material-ui/core';
import PageHeader from 'components/pageHeader/PageHeader';
import React, { useState } from 'react';
import { PageContent, Th, CellTitle, CellSubTitle } from '../page.style';
import SearchIcon from 'components/icons/SearchIcon';
import UpDownArrowIcon from 'components/icons/UpDownArrowIcon';
import L2ToL1Icon from 'components/icons/L2ToL1Icon';

function HistoryPage() {

  const [currentTab, setCurrentTab] = useState(0);

  const historyTabs = ['All', 'Deposits', 'Exits']

  const handleTabChange = (event, newValue) => {
    console.log([event, newValue]);
    setCurrentTab(newValue);
  }

  return (
    <PageContent>
      <PageHeader title="Transaction History" />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}
      >
        <Tabs value={currentTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleTabChange}
          aria-label="transaction tabs"
        >
          {historyTabs.map((label) => (<Tab
            sx={{
              maxWidth: 'unset',
              minWidth: 'unset',
              alignItems: 'flex-start',
              margin: '0px 5px',
              height: '24px',
              fontWeight: 'normal',
              fontSize: '24px',
              lineHeight: '24px',
              textTransform: 'capitalize'
            }}
            label={label} />))}
        </Tabs>
        <SearchIcon color="#F0A000" />
      </Box>
      <Box
        sx={{
          marginTop: '30px',
          textAlign: 'left',
          width: '100%',
          background: 'linear-gradient(132.17deg, rgba(255, 255, 255, 0.019985) 0.24%, rgba(255, 255, 255, 0.03) 94.26%)',
          borderRadius: '8px',
          padding: '20px 0px'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0px 20px',
            alignItems: 'center'
          }}
        >
          <Th>Transaction</Th>
          <Th>Result
            <UpDownArrowIcon color="white" />
          </Th>
          <Th>My Deposits <UpDownArrowIcon color="white" /></Th>
          <Th>External Information <UpDownArrowIcon color="white" /></Th>
          <Th>More</Th>
        </Box>
        <Box
          sx={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '16px',
            padding: '40px 0px'
          }}
        >
          <Box
            sx={{
              display: 'flex'
            }}
          >
            <L2ToL1Icon />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CellTitle> L2 - L1 Exit </CellTitle>
              <CellSubTitle> Fast Offramp </CellSubTitle>
            </Box>
          </Box>
          <div>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CellTitle> Swapped </CellTitle>
              <CellSubTitle> Aug 6, 2021 11:56 AM </CellSubTitle>
            </Box>
          </div>
          <div>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CellTitle> 0xb62379...de1be9 </CellTitle>
              <CellSubTitle> Block 9066690 </CellSubTitle>
            </Box>
          </div>
          <div>
            
          </div>
          <div>
            
          </div>
        </Box>

      </Box>
    </PageContent>
  );

}

export default React.memo(HistoryPage);
