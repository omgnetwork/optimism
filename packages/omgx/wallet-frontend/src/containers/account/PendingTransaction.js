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

const PER_PAGE = 3;

function PendingTransaction() {

    const [page, setPage] = useState(1);
    const unorderedTransactions = useSelector(selectTransactions, isEqual)
    const orderedTransactions = orderBy(unorderedTransactions, i => i.timeStamp, 'desc');

    const pendingTransactions = orderedTransactions.filter((i) => {
        if (i.crossDomainMessage
            && !!i.crossDomainMessage.crossDomainMessage
            && !i.crossDomainMessage.crossDomainMessageFinailze
            && i.to !== null
            && (i.to.toLowerCase() === networkService.L2LPAddress.toLowerCase()
                || i.to.toLowerCase() === networkService.L2StandardBridgeAddress.toLowerCase())
        ) {
            return true;
        }
        return false;
    })

    let totalNumberOfPages = Math.ceil(pendingTransactions.length / PER_PAGE);

    console.log(['pendingTransactions', pendingTransactions])

    const currentNetwork = useSelector(selectNetwork());

    const nw = getAllNetworks();

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

    return <S.AccountWrapper >
        <S.WrapperHeading>
            <Typography variant="h3" sx={{ opacity: "1.0", fontWeight: "700" }}>Pending Transactions</Typography>
            <Pager
                currentPage={page}
                isLastPage={pendingTransactions.length < PER_PAGE}
                totalPages={totalNumberOfPages}
                onClickNext={() => setPage(page + 1)}
                onClickBack={() => setPage(page - 1)}
            />
        </S.WrapperHeading>
        
        {
            pendingTransactions && !pendingTransactions.length
            && <Box
                sx={{
                    background: 'rgba(9, 22, 43, 0.5)',
                    borderRadius: '12px',
                    margin: '5px',
                    padding: '15px 20px',
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
            pendingTransactions
            && !!pendingTransactions.length
            && pendingTransactions.map((i) => {
                let link = chainLink(i);
                return <Grid
                    key={i.hash}
                    container
                    sx={{
                        background: 'rgba(9, 22, 43, 0.5)',
                        borderRadius: '12px',
                        margin: '5px',
                        padding: '15px 20px',
                    }}
                >
                    <Grid item xs={2}>
                        {'L2->L1 Exit'}
                    </Grid>
                    <Grid item xs={3}>
                        {'Started : '} {moment.unix(i.timestamp).format('lll')}
                    </Grid>
                    <Grid item xs={2}>
                        {'In Progress'}
                    </Grid>
                    <Grid item xs={4}>
                        <a style={{color: 'white'}}
                            href={link}
                            target={'_blank'}
                            rel='noopener noreferrer'
                        >
                            Advanced Details
                        </a>
                    </Grid>
                </Grid>
            })
        }


    </S.AccountWrapper>
}

export default PendingTransaction;


