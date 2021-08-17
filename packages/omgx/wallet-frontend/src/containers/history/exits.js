import React from 'react';
import StyledTable from 'components/table'


function Exits({
    transactions,
    chainLink,
}) {
    console.log(['FROM EXITS TABS', transactions]);
    return (<>
        <StyledTable />
    </>)
}

export default Exits;