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

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { openModal } from 'actions/uiAction';

import * as styles from './Dao.module.scss';
import * as S from './Dao.styles';

import { Box, Typography } from '@material-ui/core'
import { useTheme } from '@emotion/react'

import PageHeader from 'components/pageHeader/PageHeader'
import Button from 'components/button/Button';
import AlertIcon from 'components/icons/AlertIcon';
import LayerSwitcher from 'components/mainMenu/layerSwitcher/LayerSwitcher'

import ProposalList from './proposal/ProposalList';

import { selectDaoBalance, selectDaoVotes } from 'selectors/daoSelector';
import { selectLayer } from 'selectors/setupSelector';
import networkService from 'services/networkService'

function DAO() {

    const theme = useTheme();
    const dispatch = useDispatch();
    const balance = useSelector(selectDaoBalance);
    const votes = useSelector(selectDaoVotes);

    let layer = useSelector(selectLayer());

    if (networkService.L1orL2 !== layer) {
        //networkService.L1orL2 is always right...
        layer = networkService.L1orL2
    }


    if (layer === 'L1') {
        return <>
            <PageHeader title="BOBO DAO" />
            <div className={styles.container}>
                <div className={styles.content}>
                    <Box
                        sx={{
                            background: theme.palette.background.secondary,
                            borderRadius: '12px',
                            margin: '20px 5px',
                            padding: '10px 20px',
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <AlertIcon />
                            <Typography
                                sx={{ wordBreak: 'break-all', marginLeft: '10px' }}
                                variant="body1"
                                component="p"
                            >
                                To use the Boba DAO, you must be on L2 - SWITCH LAYER to L2
                            </Typography>
                        </div>
                        <LayerSwitcher isButton={true} />
                    </Box>
                </div>
            </div>
        </>
    }

    return (
        <>
            <PageHeader title="BOBO DAO" />

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.action}>
                        <S.Container>
                            <div>
                                <Typography variant="h2" gutterBottom>{balance} Comp</Typography>
                                <Typography variant="h4">Wallet Balance</Typography>
                                <S.HelpText variant="body2">Expanation Here - Help Text Help Text Help Text?</S.HelpText>
                            </div>
                            <Button
                                color="primary"
                                variant="outlined"
                                onClick={() => {
                                    dispatch(openModal('transferDaoModal'))
                                }}
                            >Transfer</Button>
                        </S.Container>
                        <S.Container>
                            <div>
                                <Typography variant="h2" gutterBottom>{votes} Votes</Typography>
                                <Typography variant="h4">Voting Power</Typography>
                                <S.HelpText variant="body2">If you would like another wallet to be able to vote on your behalf, you can delegate voting authority. To do that, select "Delegate Votes".</S.HelpText>
                            </div>
                            <Button
                                color="primary"
                                variant="outlined"
                                onClick={() => {
                                    dispatch(openModal('delegateDaoModal'))
                                }}
                            >
                              Delegate Votes
                            </Button>
                        </S.Container>
                    </div>
                    <Box sx={{mt: 4}}>
                        <ProposalList />
                    </Box>
                </div>
            </div>
        </>
    )
}


export default React.memo(DAO);
