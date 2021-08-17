import React from 'react';
import StyledTable from 'components/table'
import L2ToL1Icon from 'components/icons/L2ToL1Icon';


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
    console.log(['FROM TRANSACTIONS TABS', transactions]);
    console.log(transactions[0]);

    return (<>
        <StyledTable  
            chainLink
            tableHeadList={tableHeadList}
            isTransaction={true}
            tableData={transactions.slice(0, 10)}
        />
    </>)
}

export default Transactions;





/* 
blockHash: "0xacae9c9e92199ece44055bca7340c6df267b5aaa51c0b88eaa14b163667ef24c"
blockNumber: "9128892"
chain: "L1"
confirmations: "1186"
contractAddress: ""
cumulativeGasUsed: "140780"
from: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
gas: "21000"
gasPrice: "5147441866"
gasUsed: "21000"
hash: "0x45bea808dac6618405d5161e7ea0d3611ac8f5ee535355059c6e46a259174276"
input: "0x"
isError: "0"
nonce: "2211"
timeStamp: "1629174050"
to: "0x52270d8234b864dcac9947f510ce9275a8a116db"
transactionIndex: "2"
txreceipt_status: "1"
typeTX: "0x52270d8234b864dcac9947f510ce9275a8a116db"



*/