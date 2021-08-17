import StyledTable from 'components/table';
import React from 'react';

const tableHeadList = [
    {
        label: 'Transactions',
        isSort: false,
    },
    {
        label: 'Result',
        isSort: false,
    },
    {
        label: 'My Deposits',
        isSort: false,
    },
    {
        label: 'Eternal Information',
        isSort: false,
    },
    {
        label: 'More',
        isSort: false,
    },
]


function Transactions({
    transactions,
    chainLink,
}) {

    return (
        <>
            <StyledTable
                chainLink={chainLink}
                tableHeadList={tableHeadList}
                isTransaction={true}
                tableData={transactions.slice(0, 100)} /// TODO: implement the scroll pagination.
            />
        </>)
}

export default Transactions;
