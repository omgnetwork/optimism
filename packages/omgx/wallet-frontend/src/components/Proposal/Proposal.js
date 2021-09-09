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

import React, { useState, useEffect } from 'react';

import { useDispatch } from 'react-redux';

import { openAlert, openError } from 'actions/uiAction';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from 'components/button/Button';

import * as styles from './Proposal.module.scss';
import * as S from './Proposal.styles';

import { castProposalVote } from 'actions/daoAction';
import { Typography } from '@material-ui/core';

function Proposal({
    proposal,
}) {
    const dispatch = useDispatch()

    const [dropDownBox, setDropDownBox] = useState(false)
    const [dropDownBoxInit, setDropDownBoxInit] = useState(true)

    const [votePercent, setVotePercent] = useState(undefined)

    useEffect(() => {
        const init = async () => {
            if (proposal.totalVotes > 0) {
                setVotePercent(Math.round((100 * proposal.forVotes) / proposal.totalVotes));
            } else {
                setVotePercent(50);
            }
        };
        init();
    }, [proposal])


    const updateVote = async (id, userVote, label) => {
        let res = await dispatch(castProposalVote({id, userVote}));
        if(res) {
            dispatch(openAlert(`${label}`));
        } else {
            dispatch(openError(`Failed to cast vote!`));
        }
    }

    return (
      <S.ProposalCard>
        {proposal.state === 'Active' &&
            <div
                onClick={() => {
                    setDropDownBox(!dropDownBox);
                    setDropDownBoxInit(false);
                }}
            >
                <S.ProposalHeader>
                    <div>
                        <Typography variant="h3" gutterBottom>Proposal #{proposal.id}</Typography>
                        <S.Muted variant="body2">Title: {proposal.description}</S.Muted>
                        <S.Muted variant="body2">Status: {proposal.state}</S.Muted>
                        <S.Muted variant="body2">Start L1 Block: {proposal.startBlock} End L1 Block: {proposal.endBlock}</S.Muted>
                    </div>
                    <ExpandMoreIcon /> VOTE
                </S.ProposalHeader>
                <S.ProposalContent>
                    <div>For: {proposal.forVotes}</div>
                    <div>Against: {proposal.againstVotes}</div>
                    <div>Abstain: {proposal.abstainVotes}</div>
                    <div>Percentage For: {votePercent}% </div>
                    <div>Total Votes: {proposal.totalVotes}</div>
                </S.ProposalContent>
            </div>
        }

        {proposal.state !== 'Active' &&
            <div
            >
                <S.ProposalHeader>
                    <div>
                        <Typography variant="h3" gutterBottom>Proposal #{proposal.id}</Typography>
                        <S.Muted variant="body2">Title: {proposal.description}</S.Muted>
                        <S.Muted variant="body2">Status: {proposal.state}</S.Muted>
                        <S.Muted variant="body2">Start L1 Block: {proposal.startBlock} End L1 Block: {proposal.endBlock}</S.Muted>
                    </div>
                </S.ProposalHeader>
                <S.ProposalContent>
                    <div>For: {proposal.forVotes}</div>
                    <div>Against: {proposal.againstVotes}</div>
                    <div>Abstain: {proposal.abstainVotes}</div>
                    <div>Percentage For: {votePercent}% </div>
                    <div>Total Votes: {proposal.totalVotes}</div>
                </S.ProposalContent>
            </div>
        }

        <div className={dropDownBox ? styles.dropDownContainer : dropDownBoxInit ? styles.dropDownInit : styles.closeDropDown}>
            <div className={styles.proposalDetail}>
                <Button
                    type="primary"
                    variant="outlined"
                    fullWidth
                    onClick={(e) => {
                        updateVote(proposal.id, 1, 'Cast Vote For')
                    }}

                > Cast Vote For</Button>
                <Button
                    type="primary"
                    variant="contained"
                    fullWidth
                    onClick={(e) => {
                        updateVote(proposal.id, 0, 'Cast Vote Against')
                    }}

                > Cast Vote Against</Button>
                <Button
                    type="outline"
                    variant="outlined"
                    fullWidth
                    onClick={(e) => {
                        updateVote(proposal.id, 2, 'Cast Vote Abstain')
                    }}
                > Cast Vote Abstain</Button>
            </div>
        </div>
    </S.ProposalCard>)
}


export default React.memo(Proposal);
