// SPDX-License-Identifier: GPL-3.0

pragma solidity =0.6.12;


contract OffChain {
// this low-level function compares on-chain price to off-chain price to calculate fees
    function offChainCompare(uint112 reserve0, uint112 reserve1) internal returns (uint feeX10){
        require(reserve0 > 0 && reserve1 > 0, 'UniswapV2: INSUFFICIENT_LIQUIDITY');
        feeX10 = 10;

        // API Call: Comparing off-chain price to on-chain price

        // If call fails or priceDiff <= 30, then return 3

        // if(priceDiff > 30 && priceDiff <= 60)
        // {
        //     feeX10 = 6;
        // }

        // else if(priceDiff > 60)
        // {
        //     feeX10 = 10;
        // }
    }
}
