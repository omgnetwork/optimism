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
import { useDispatch,useSelector } from 'react-redux';

import { openModal } from 'actions/uiAction';

import * as styles from './Dao.module.scss';

import { Box, Typography, Fade } from '@material-ui/core'
import { useTheme } from '@emotion/react'

import Button from 'components/button/Button';
import ProposalList from './proposal/ProposalList';
import { selectDaoBalance, selectDaoVotes } from 'selectors/daoSelector';
import { selectLayer } from 'selectors/setupSelector';
import AlertIcon from 'components/icons/AlertIcon';
import LayerSwitcher from 'components/mainMenu/layerSwitcher/LayerSwitcher'
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


    if(layer === 'L1') {
        return <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    BOBA DAO
                </h2>
            </div>
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
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>
                    BOBA DAO
                </h2>
            </div>
            <div className={styles.content}>
                <div className={styles.action}>
                    <div className={styles.tranferContainer}>
                        <div className={styles.info}>
                            <h3 className={styles.title}>{balance} Comp</h3>
                            <h4 className={styles.subTitle}>Wallet Balance</h4>
                            <div className={styles.helpText}>Expanation Here - Help Text Help Text Help Text?</div>
                        </div>
                        <Button
                            type="primary"
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
                            <h3 className={styles.title}>{votes} Votes</h3>
                            <h4 className={styles.subTitle}>Voting Power</h4>
                            <div className={styles.helpText}>Expanation Here - What does it mean to delegate Votes?</div>
                        </div>
                        <Button
                            type="primary"
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
    )
}


export default React.memo(DAO);


