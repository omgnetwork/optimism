import { useTheme } from '@emotion/react';
import {
  Box,
    Grid,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    Typography,
    useMediaQuery
} from '@material-ui/core';
import SortIcon from 'components/icons/SortIcon';
import React from 'react';
import {
    StyledTableCell,
    StyledTableRow
} from './table.styles';
import TransactionTableRow from './TransactionTableRow';


function StyledTable({
    tableHeadList,
    isTransaction,
    tableData,
    chainLink,
    metaData
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <TableContainer
      sx={{
        marginTop: '20px',
        textAlign: 'left',
        width: '100%',
        background: {sx:'none', md:'#0D182A'},
        borderRadius: '8px',
        padding: '0px 0px 20px',
        height: 'calc(100vh - 250px)'
      }}
    >
      <Table stickyHeader>
        {!isMobile ? (
          <TableHead sx={{ padding: '0px 55px'}}>
            <StyledTableRow className="header">
              {tableHeadList && tableHeadList.length > 0 ?
                tableHeadList.map((head) => {
                  return (
                    <StyledTableCell key={head.label} sx={{backgroundColor: '#0D182A', color: 'rgba(255, 255, 255, 0.7) !important'}} width={head.width}>
                      <Box sx={{display: "flex", justifyContent: head.isSort ? "flex-start" : "space-between", alignItems: "center", gap: "10px"}}>
                        <Typography variant="body2" component="span">{head.label}</Typography>
                        {head.isSort ? <SortIcon /> : null}
                      </Box>
                    </StyledTableCell>
                  )
                })
              : null}
            </StyledTableRow>
          </TableHead>
        ) : (null)}

        <TableBody sx={{mb: 1}}>
          {tableData && tableData.length > 0 ?
            tableData.map((item,index) => {
              if (isTransaction) {
                return (
                  <TransactionTableRow
                    index={index}
                    chainLink={chainLink}
                    key={index}
                    metaData={metaData}
                    {...item}
                  />
                )}
            })
          : null}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default StyledTable;
