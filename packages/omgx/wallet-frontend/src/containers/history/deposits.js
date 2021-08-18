import React from 'react';
import StyledTable from 'components/Table'


function Deposits({
    transactions,
    chainLink,
}) {

    console.log(['FROM DEPOSITS TABS', transactions]);
    return (<>
        <StyledTable />
    </>)
}

export default Deposits;