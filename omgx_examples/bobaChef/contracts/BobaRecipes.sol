pragma solidity ^0.7.6;

pragma experimental ABIEncoderV2;

/**
 * @title BobaRecipes
 */
library BobaRecipes {

    struct flavor {
        bytes32 flavor;
        uint[3] color;
        uint commonScore;
        uint[3] gradient;
    }

    struct topping{
        bytes32 topping;
        uint[3] color;
        uint256 commonScore;
    }
}