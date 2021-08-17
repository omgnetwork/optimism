import React from 'react';
import StyledTable from 'components/table'


function Transactions({
    transactions,
    chainLink,
}) {
    console.log(['FROM TRANSACTIONS TABS', transactions]);

    return (<>
        <StyledTable />
    </>)
}

export default Transactions;