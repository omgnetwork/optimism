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
import { useSelector } from 'react-redux'
import { isEqual, orderBy } from 'lodash'
import { selectTransactions } from 'selectors/transactionSelector'
import { selectNetwork } from 'selectors/setupSelector'
import { getAllNetworks } from 'util/masterConfig'

import AlertIcon from 'components/icons/AlertIcon'
import moment from 'moment'
import Pager from 'components/pager/Pager'
import { useTheme } from '@emotion/react'

const PER_PAGE = 3

function PendingTransaction() {

    const [page, setPage] = useState(1)
    const unorderedTransactions = useSelector(selectTransactions, isEqual)
    const orderedTransactions = orderBy(unorderedTransactions, i => i.timeStamp, 'desc')

    console.log("orderedTransactions:",orderedTransactions)

    let pending = orderedTransactions.filter((i) => {
        if (i.crossDomainMessage &&
            i.crossDomainMessage.crossDomainMessage === 1 &&
            i.crossDomainMessage.crossDomainMessageFinalize === 0 &&
            i.exit.status === "pending"
        ) {
            return true
        }
        return false
    })

    let pendingL1 = pending.filter((i) => {
        if (i.chain === 'L1') return true
        return false
    })

    let pendingL2 = pending.filter((i) => {
        if (i.chain === 'L2') return true
        return false
    })

    //Part 1 - exit that is not final and we do not have a state root hash yet
    let pendingExitsStage0 = pendingL2.filter((i) => {
        if (!i.stateRoot.stateRootHash && i.exit.fastRelay) return true
        return false
    })
    pendingExitsStage0 = pendingExitsStage0.map(v => ({
        ...v,label: 'L2->L1 Fast Exit',labelStatus: 'Step 0, No SR Hash yet, Pending',
        completion: v.crossDomainMessage.crossDomainMessageEstimateFinalizedTime,
      })
    )

    //Part 2 - exit that is not final, but we have a state root hash
    let pendingExitsStage1 = pendingL2.filter((i) => {
        if (i.stateRoot.stateRootHash && i.exit.fastRelay) return true
        return false
    })
    pendingExitsStage1 = pendingExitsStage1.map(v => ({
        ...v, label: 'L2->L1 Fast Exit', labelStatus: 'Step 1, Have SR Hash, Pending',
        completion: v.crossDomainMessage.crossDomainMessageEstimateFinalizedTime,
      })
    )

    //Part 3 - exit that is not final, but we have a state root hash, and we ARE NOT using the fast message relayer
    //so this is a traditional exit 
    let pendingTradExits = pendingL2.filter((i) => {
        if (i.stateRoot.stateRootHash && !i.exit.fastRelay) return true
        return false
    })
    pendingTradExits = pendingTradExits.map(v => ({
        ...v,label: 'L2->L1 Trad Exit',labelStatus: 'In 7 day window',
        completion: v.crossDomainMessage.crossDomainMessageEstimateFinalizedTime,
      })
    )

    //DEPOSIT Part 1 - deposit that is not final and we do not have a state root hash yet
    let pendingDepositsStage0 = pendingL1.filter((i) => {
        if (!i.stateRoot.stateRootHash && i.exit.fastRelay) return true
        return false
    })
    pendingDepositsStage0 = pendingDepositsStage0.map(v => ({
        ...v,label: 'L1->L2 Fast Deposit',labelStatus: 'Step 0, No SR Hash yet, Pending',
        completion: v.crossDomainMessage.crossDomainMessageEstimateFinalizedTime,
      })
    )

    //DEPOSIT Part 2 - deposit that is not final but we have a state root hash
    let pendingDepositsStage1 = pendingL1.filter((i) => {
        if (i.stateRoot.stateRootHash && i.exit.fastRelay) return true
        return false
    })
    pendingDepositsStage1 = pendingDepositsStage1.map(v => ({
        ...v,label: 'L1->L2 Fast Deposit',labelStatus: 'Step 1, Have SR Hash, Pending',
        completion: v.crossDomainMessage.crossDomainMessageEstimateFinalizedTime,
      })
    )

    //DEPOSIT Part 3 - deposit is not final, but we have a state root hash, and we ARE NOT using the fast message relayer
    //so this is a traditional deposit 
    let pendingTradDeposits = pendingL1.filter((i) => {
        if (i.stateRoot.stateRootHash && !i.exit.fastRelay) return true
        return false
    })
    pendingTradDeposits = pendingTradDeposits.map(v => ({
        ...v, label: 'L1->L2 Trad Deposit', labelStatus: 'In progress',
        completion: v.crossDomainMessage.crossDomainMessageEstimateFinalizedTime,
      })
    )

    const pendingTransactions = [
        ...pendingTradExits,
        ...pendingExitsStage0,
        ...pendingExitsStage1,
        ...pendingTradDeposits,
        ...pendingDepositsStage0,
        ...pendingDepositsStage1
    ]

    const startingIndex = page === 1 ? 0 : ((page - 1) * PER_PAGE);
    const endingIndex = page * PER_PAGE;
    const paginatedTransactions = pendingTransactions.slice(startingIndex, endingIndex);

    let totalNumberOfPages = Math.ceil(pendingTransactions.length / PER_PAGE);

    //if totalNumberOfPages === 0, set to one so we don't get the strange "page 1 of 0" display
    if (totalNumberOfPages === 0) totalNumberOfPages = 1

    //console.log(['pendingTransactions', pendingTransactions])

    const currentNetwork = useSelector(selectNetwork());
    const nw = getAllNetworks();
    const theme = useTheme();

    const chainLink = (item) => {
        let network = nw[currentNetwork];
        if (!!network && !!network[item.chain]) {
            // network object should have L1 & L2
            if (item.chain === 'L1') {
                return `${network[item.chain].transaction}${item.hash}`;
                //our custom watcher
            } else {
                //etherscan
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

/*
blockHash: "0xf37d45a2601a75024ab35210bc18061eb726ef2e4a9d94530ed68c2b9c914012"
blockNumber: "9246425"
chain: "L1"
confirmations: "3"
contractAddress: ""
cumulativeGasUsed: "2384972"
from: "0x4161aef7ac9f8772b83cda1e5f054ade308d9049"
gas: "506029"
gasPrice: "2000000000"
gasUsed: "487835"
hash: "0x46d9849c32a1910f8ba4bc8e9b4e14d721e2c202667354dfdb3f64ed72db9fe0"
input: "0xb1a1a8820000000000000000000000000000000000000000000000000000000000989680000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000203136333039353032383731373500000000000000000000000000000000000000"
isError: "0"
nonce: "8"
timeStamp: "1630950306"
to: "0xde085c82536a06b40d20654c2aba342f2abd7077"
transactionIndex: "17"
txreceipt_status: "1"
typeTX: "Traditional"
value: "10000000000000000"
*/

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

export default PendingTransaction