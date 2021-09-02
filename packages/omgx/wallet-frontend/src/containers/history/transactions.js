import { Box } from '@material-ui/core';
import StyledTable from 'components/table';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectLoading } from 'selectors/loadingSelector';

const tableHeadList = [
    {
        label: 'Transactions',
        isSort: false,
        width: "20%"
    },
    {
        label: 'Result',
        isSort: true,
        width: "40%"
    },
    {
        label: 'My Deposits',
        isSort: false,
        width: "20%"
    },
    {
        label: 'External Information',
        isSort: false,
        width: "20%"
    },
    // {
    //     label: 'More',
    //     isSort: false,
    // },
]


function Transactions({
    transactions,
    chainLink,
}) {
  // const loading = useSelector(selectLoading(['EXIT/GETALL']));
  const transactionsData = transactions.slice(0, 100);

  return (
    <>
      <Box>
        {/* {!transactionsData.length && !loading && (
          <div>Scanning for transactions...</div>
        )}
        {!transactionsData.length && loading && (
          <div>Loading...</div>
        )}
        {transactionsData.map((i, index) => {
          const metaData = typeof (i.typeTX) === 'undefined' ? '' : i.typeTX */}

          {/* return ( */}
            <StyledTable
                chainLink={chainLink}
                tableHeadList={tableHeadList}
                isTransaction={true}
                tableData={transactionsData}
                // metaData={metaData} /// TODO: implement the scroll pagination.
            />
          {/* ) */}
        {/* })} */}
        </Box>
    </>
  )
}

export default Transactions;
