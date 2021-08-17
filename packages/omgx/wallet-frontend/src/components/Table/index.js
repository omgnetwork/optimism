import {
    Box, Button, Collapse,
    Grid,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    Typography
} from '@material-ui/core';
import DownIcon from 'components/icons/DownIcon';
import L2ToL1Icon from 'components/icons/L2ToL1Icon';
import LinkIcon from 'components/icons/LinkIcon';
import SortIcon from 'components/icons/SortIcon';
import UpIcon from 'components/icons/UpIcon';
import React, { useState } from 'react';
import {
    CellSubTitle, CellTitle,
    StyledTableCell,
    StyledTableRow
} from './table.styles';

import TransactionTableRow from './TransactionTableRow';

function StyledTable({
    tableHeadList,
    isTransaction,
    tableData,
    chainLink
}) {

    return (
        <TableContainer
            sx={{
                marginTop: '30px',
                textAlign: 'left',
                width: '100%',
                background: 'linear-gradient(132.17deg, rgba(255, 255, 255, 0.019985) 0.24%, rgba(255, 255, 255, 0.03) 94.26%)',
                borderRadius: '8px',
                padding: '20px 0px'
            }}
        >
            <Table>
                <TableHead
                    sx={{
                        padding: '0px 55px',
                    }}
                >
                    <StyledTableRow
                        className="header"
                    >
                        {tableHeadList && tableHeadList.length > 0 ?
                            tableHeadList.map((head) => {
                                return (
                                    <StyledTableCell
                                        key={head.label}
                                        color="rgba(255, 255, 255, 0.7)">
                                        <Grid
                                            container
                                            direction='row'
                                            justify='space-between'
                                            alignItems='center'
                                        >
                                            <span>{head.label}</span>
                                            {head.isSort ? <SortIcon /> : null}
                                        </Grid>
                                    </StyledTableCell>)
                            })
                            : null
                        }
                    </StyledTableRow>
                </TableHead>
                <TableBody>
                    {tableData && tableData.length > 0 ?
                        tableData.map((item) => {
                            if (isTransaction) {
                                return <TransactionTableRow
                                    chainLink={chainLink}
                                    {...item} />
                            } else {
                                return null;
                            }
                        })
                        : null}
                </TableBody>

            </Table>
        </TableContainer>
    )
}

export default StyledTable;