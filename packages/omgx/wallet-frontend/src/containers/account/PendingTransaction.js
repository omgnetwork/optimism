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
import {Button as ButtonMUI, Box, Grid, Typography } from '@material-ui/core'
import * as S from './Account.styles'
import { useSelector } from 'react-redux';
import { isEqual, orderBy } from 'lodash';
import { selectTransactions } from 'selectors/transactionSelector';
import { selectNetwork } from 'selectors/setupSelector';
import { getAllNetworks } from 'util/masterConfig';
import networkService from 'services/networkService';
import AlertIcon from 'components/icons/AlertIcon';
import moment from 'moment';
import LinkIcon from 'components/icons/LinkIcon';
import Pager from 'components/pager/Pager';
import { useTheme } from '@emotion/react';

const PER_PAGE = 3;

function PendingTransaction() {

    const [page, setPage] = useState(1);
    const unorderedTransactions = useSelector(selectTransactions, isEqual)
    const orderedTransactions = orderBy(unorderedTransactions, i => i.timeStamp, 'desc');

    // let exitL2 = orderedTransactions.filter((i) => {
    //     if (i.crossDomainMessage &&
    //         i.crossDomainMessage.crossDomainMessage === 1 &&
    //         i.crossDomainMessage.crossDomainMessageFinailze === 0 &&
    //         i.exitL2
    //     ) {
    //         return true;
    //     }
    //     return false;
    // })
    // exitL2 = exitL2.map(v => ({...v, label: 'L2->L1 exit', labelStatus: 'All exits'}))

    let pending = orderedTransactions.filter((i) => {
        if (i.crossDomainMessage &&
            i.crossDomainMessage.crossDomainMessage === 1 &&
            i.crossDomainMessage.crossDomainMessageFinailze === 0 &&
            i.exit.status === "pending"
        ) {
            return true;
        }
        return false;
    })

    //exit that is not final and we do not have a state root hash yet
    let pendingExitsStage0 = pending.filter((i) => {
        if (!i.stateRoot.stateRootHash && i.exit.fastRelay)
        //this means it's very early - no stateRootHash yet
            return true
        return false
    })
    pendingExitsStage0 = pendingExitsStage0.map(v => ({
        ...v,
        label: 'L2->L1 Fast Exit',
        labelStatus: 'Step 0, No SR Hash yet, Pending',
        completion: v.crossDomainMessage.crossDomainMessageEstimateFinalizedTime,
      })
    )

    //exit that is not final, but we have a state root hash
    let pendingExitsStage1 = pending.filter((i) => {
        if (i.stateRoot.stateRootHash && i.exit.fastRelay)
        //ok, we have a stateRootHash
            /*
            i.to !== null &&
            ( i.to.toLowerCase() === networkService.L2LPAddress.toLowerCase() ||
              i.to.toLowerCase() === networkService.L2StandardBridgeAddress.toLowerCase()
            )
            */
        {
            return true
        }
        return false
    })
    pendingExitsStage1 = pendingExitsStage1.map(v => ({
        ...v,
        label: 'L2->L1 Fast Exit',
        labelStatus: 'Step 1, Have SR Hash, Pending',
        completion: v.crossDomainMessage.crossDomainMessageEstimateFinalizedTime,
      })
    )

    //exit that is not final, but we have a state root hash
    let pendingTradExits = pending.filter((i) => {
        if (i.stateRoot.stateRootHash && !i.exit.fastRelay) //ok, we have a stateRootHash
        {
            return true
        }
        return false
    })
    pendingTradExits = pendingTradExits.map(v => ({
        ...v,
        label: 'L2->L1 Trad Exit',
        labelStatus: 'In 7 day window',
        completion: v.crossDomainMessage.crossDomainMessageEstimateFinalizedTime,
      })
    )

    const pendingTransactions = [
        ...pendingTradExits,
        ...pendingExitsStage0,
        ...pendingExitsStage1
    ]

    //let totalNumberOfPages = Math.ceil(pendingTransactions.length / PER_PAGE);

    const startingIndex = page === 1 ? 0 : ((page - 1) * PER_PAGE);
    const endingIndex = page * PER_PAGE;
    const paginatedTransactions = pendingTransactions.slice(startingIndex, endingIndex);

    let totalNumberOfPages = Math.ceil(pendingTransactions.length / PER_PAGE);

    //if totalNumberOfPages === 0, set to one so we don't get the strange "page 1 of 0" display
    if (totalNumberOfPages === 0) totalNumberOfPages = 1

    console.log(['pendingTransactions', pendingTransactions])

    const currentNetwork = useSelector(selectNetwork());
    const nw = getAllNetworks();
    const theme = useTheme();

    const chainLink = (item) => {
        let network = nw[currentNetwork];
        if (!!network && !!network[item.chain]) {
            // network object should have L1 & L2
            if (item.chain === 'L1') {
                return `${network[item.chain].transaction}${item.hash}`;
            } else {
                return `${network[item.chain].transaction}${item.hash}?network=${currentNetwork[0].toUpperCase() + currentNetwork.slice(1)}`;
            }
        }
        return '';
    }

/*
        <Pager
          currentPage={page}
          isLastPage={paginatedDeposits.length < PER_PAGE}
          totalPages={totalNumberOfPages}
          onClickNext={() => setPage(page + 1)}
          onClickBack={() => setPage(page - 1)}
        />
*/

    return <S.AccountWrapper >
        <S.WrapperHeading>
            <Typography variant="h3" sx={{ opacity: "1.0", fontWeight: "700" }}>Pending Transactions</Typography>
            <Pager
                currentPage={page}
                isLastPage={paginatedTransactions.length < PER_PAGE}
                totalPages={totalNumberOfPages}
                onClickNext={()=>setPage(page + 1)}
                onClickBack={()=>setPage(page - 1)}
            />
        </S.WrapperHeading>

        {
            pendingTransactions &&
            !pendingTransactions.length &&
            <Box
                sx={{
                    background: theme.palette.background.secondary,
                    borderRadius: '12px',
                    margin: '5px',
                    padding: '10px 20px',
                    display: 'flex',
                    justifyContent: 'flex-start'
                }}
            >
                <AlertIcon />
                <Typography
                    sx={{ wordBreak: 'break-all', marginLeft: '10px' }}
                    variant="body1"
                    component="p"
                >
                    No Pending Transactions
                </Typography>
            </Box>
        }

        {
            paginatedTransactions &&
            paginatedTransactions.length > 0 &&
            paginatedTransactions.map((i) => {

                console.log(i)

                let completionTime = 'Not available'

                if(i.completion)
                    completionTime = moment.unix(i.completion).format('lll')

                let link = chainLink(i)

                return <Grid
                    key={i.hash}
                    container
                    sx={{
                        background: '#192333',
                        borderRadius: '8px',
                        margin: '5px',
                        padding: '5px 20px',
                    }}
                >
                    <Grid item xs={2}>
                        {i.label}
                    </Grid>
                    <Grid item xs={4}>
                        {'Started: '}{moment.unix(i.timeStamp).format('lll')}<br/>
                        {'Completion estimated: '}{completionTime}
                    </Grid>
                    <Grid item xs={3}>
                        {i.labelStatus}
                    </Grid>
                    <Grid item xs={1}>
                        <a style={{color: 'white'}}
                            href={link}
                            target={'_blank'}
                            rel='noopener noreferrer'
                        >
                            Details
                        </a>
                    </Grid>
                </Grid>
            })
        }


    </S.AccountWrapper>
}

export default PendingTransaction;


