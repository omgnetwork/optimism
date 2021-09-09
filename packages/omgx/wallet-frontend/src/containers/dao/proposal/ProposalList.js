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

import React, {useState} from 'react';
import {Typography} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { openModal } from 'actions/uiAction';

import Button from 'components/button/Button';
import Proposal from 'components/Proposal/Proposal';

import * as styles from './proposalList.module.scss'
import * as S from './ProposalList.styles'
import { selectProposals } from 'selectors/daoSelector';
import { selectLoading } from 'selectors/loadingSelector';
import Pager from 'components/pager/Pager'
import { orderBy } from 'lodash';

const PER_PAGE = 3;

function ProposalList() {

    const [page, setPage] = useState(1);
    const dispatch = useDispatch()
    const loading = useSelector(selectLoading(['PROPOSALS/GET']))
    const proposals = useSelector(selectProposals)

    const orderedProposals = orderBy(proposals, i => i.startBlock, 'desc')

    const startingIndex = page === 1 ? 0 : ((page - 1) * PER_PAGE);
    const endingIndex = page * PER_PAGE;
    const paginatedProposals = orderedProposals.slice(startingIndex, endingIndex);

    let totalNumberOfPages = Math.ceil(orderedProposals.length / PER_PAGE);
    if (totalNumberOfPages === 0) totalNumberOfPages = 1

    return <>
        <S.ContainerAction>
            <Typography variant="h3">Proposal List</Typography>
            <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                    dispatch(openModal('newProposalModal'))
                }}
            >
              Create Proposal
            </Button>
        </S.ContainerAction>

        <S.ListContainer>
            <Pager
                currentPage={page}
                isLastPage={paginatedProposals.length < PER_PAGE}
                totalPages={totalNumberOfPages}
                onClickNext={()=>setPage(page + 1)}
                onClickBack={()=>setPage(page - 1)}
            />


            {!!loading && !proposals.length ?
                <S.LoadingContainer>
                    <Typography variant="body1">Loading...</Typography>
                </S.LoadingContainer>
                : null}

            {paginatedProposals.map((p, index) => {
                return <React.Fragment key={index}>
                    <Proposal proposal={p} />
                </React.Fragment>
            })}
        </S.ListContainer>
    </>
}

export default React.memo(ProposalList)

