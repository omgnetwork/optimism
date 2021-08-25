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
import { useDispatch } from 'react-redux';

import { openModal } from 'actions/uiAction';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Button from 'components/button/Button';


import * as styles from './Proposal.module.scss';


function Proposal({ }) {
    const dispatch = useDispatch();

    const [dropDownBox, setDropDownBox] = useState(false);
    const [dropDownBoxInit, setDropDownBoxInit] = useState(true);


    return (<div
        className={styles.proposalCard}
        style={{
            background: `${!!dropDownBox ? 'linear-gradient(132.17deg, rgba(255, 255, 255, 0.019985) 0.24%, rgba(255, 255, 255, 0.03) 94.26%)' : 'none'}`,
            borderRadius: `${!!dropDownBox ? '12px' : ''}`
        }}
    >
        <div
            onClick={() => {
                setDropDownBox(!dropDownBox);
                setDropDownBoxInit(false);
            }}>
            <div className={styles.proposalHeader}>
                <div className={styles.title}>
                    <p>Proposal #{Math.random() * 100}</p>
                    <p className={styles.muted}>
                        signaturesignaturesignature
                    </p>
                </div>
                <ExpandMoreIcon />
            </div>
            <div className={styles.proposalContent}>
                <div>For Votes : <span>"for votes"</span> </div>
                <div>Against Votes : <span>"for votes"</span> </div>
                <div>Abstain Votes : <span>"for votes"</span> </div>
                <div>Vote Percentage : "23%" </div>
            </div>
        </div>

        <div
            className={dropDownBox ?
                styles.dropDownContainer : dropDownBoxInit ? styles.dropDownInit : styles.closeDropDown}
        >
            <Button
                type="outline"
                style={{
                    width: '60%',
                    padding: '15px 10px',
                    borderRadius: '8px',
                    alignSelf: 'center'
                }}

            > Cast Vote For</Button>
            <Button
                type="primary"
                style={{
                    width: '60%',
                    padding: '15px 10px',
                    borderRadius: '8px',
                    alignSelf: 'center'
                }}

            > Cast Vote Against</Button>
            <Button
                type="outline"
                style={{
                    width: '60%',
                    padding: '15px 10px',
                    borderRadius: '8px',
                    alignSelf: 'center'
                }}

            > Cast Vote Abstain</Button>
        </div>
        <div className={styles.divider}></div>
    </div>)
}


export default React.memo(Proposal);