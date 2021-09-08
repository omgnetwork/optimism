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

import { Box, Typography } from '@material-ui/core'
import { useTheme } from '@emotion/react'

import PageHeader from 'components/pageHeader/PageHeader'
import Button from 'components/button/Button';
import AlertIcon from 'components/icons/AlertIcon';
import LayerSwitcher from 'components/mainMenu/layerSwitcher/LayerSwitcher'

import ProposalList from './proposal/ProposalList';

import { selectDaoBalance, selectDaoVotes } from 'selectors/daoSelector';
import { selectLayer } from 'selectors/setupSelector';
import networkService from 'services/networkService';


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
                        <div className={styles.tranferContainer}>
                            <div className={styles.info}>
                                <Typography variant="h3">{balance} Comp</Typography>
                                <Typography variant="h4">Wallet Balance</Typography>
                                <Typography variant="body2" className={styles.helpText}>Expanation Here - Help Text Help Text Help Text?</Typography>
                            </div>
                            <Button
                                color="primary"
                                variant="outlined"
                                style={{
                                    maxWidth: '180px',
                                    padding: '15px 10px',
                                    borderRadius: '8px',
                                    alignSelf: 'center'
                                }}
                                onClick={() => {
                                    dispatch(openModal('transferDaoModal'))
                                }}
                            > Transfer Governance Token</Button>
                        </div>
                        <div className={styles.delegateCotainer}>
                            <div className={styles.info}>
                                <Typography variant="h3">{votes} Votes</Typography>
                                <Typography variant="h4">Voting Power</Typography>
                                <Typography variant="body2" className={styles.helpText}>Expanation Here - What does it mean to delegate Votes?</Typography>
                            </div>
                            <Button
                                color="primary"
                                variant="outlined"
                                onClick={() => {
                                    dispatch(openModal('delegateDaoModal'))
                                }}
                                style={{
                                    width: '60%',
                                    padding: '15px 10px',
                                    borderRadius: '8px',
                                    alignSelf: 'center'
                                }}

                            > Delegate Votes</Button>
                        </div>
                    </div>
                    <div className={styles.proposal}>
                        <ProposalList />
                    </div>
                </div>
            </div>
        </>
    )
}


export default React.memo(DAO);


