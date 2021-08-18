import React from 'react';
import StyledTable from 'components/table'


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
