// SPDX-License-Identifier: MIT
pragma solidity >0.5.0;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract TokenPool is Ownable {
    using SafeMath for uint256;

    mapping(address => uint256) public lastRequest;
    address public tokenAddress;

    event RequestToken (
        address _requestAddress,
        uint256 _timestamp,
        uint256 _amount
    );

    function registerTokenAddress(
        address _tokenAddress
    )
        public
        onlyOwner()
    {
        tokenAddress = _tokenAddress;
    }

    function requestToken()
        public
    {
        require(lastRequest[msg.sender].add(3600) <= block.timestamp, "Request limit");
        lastRequest[msg.sender] = block.timestamp;
        IERC20(tokenAddress).transfer(msg.sender, 10e18);

        emit RequestToken(msg.sender, block.timestamp, 10e18);
    }
}