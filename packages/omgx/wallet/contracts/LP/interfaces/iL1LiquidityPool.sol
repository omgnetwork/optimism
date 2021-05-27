// SPDX-License-Identifier: MIT
pragma solidity >0.5.0;
pragma experimental ABIEncoderV2;

/**
 * @title iL1LiquidityPool
 */
interface iL1LiquidityPool {

    /********************
     *       Events     *
     ********************/

    event addLiquidity_EVENT(
        address sender,
        uint256 amount,
        address tokenAddress
    );

    event ownerRecoverFee_EVENT(
        address sender,
        address receiver,
        address tokenAddress,
        uint256 amount
    );

    event clientDepositL1_EVENT(
        address sender,
        uint256 receivedAmount,
        uint256 userRewardFee,
        uint256 ownerRewardFee,
        uint256 totalFee,
        address tokenAddress
    );

    event clientPayL1_EVENT(
        address sender,
        uint256 receivedAmount,
        uint256 userRewardFee,
        uint256 ownerRewardFee,
        uint256 totalFee,
        address tokenAddress
    );

    event withdrawLiqudiity_EVENT(
        address sender,
        address receiver,
        uint256 pendingAmount,
        uint256 requestAmount,
        uint256 withdrawAmount,
        address tokenAddress
    );

    /*************************
     * Cross-chain Functions *
     *************************/

    function clientPayL1(
        address payable _to,
        uint256 _amount,
        address _tokenAddress
    )
        external;
}
