// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 contract StableSwap {

    uint256 public x;
    uint256 public y;
    uint256 public k;
    uint256 public A;


    /**
     * @dev initialize x tokens, y tokens to form invariant with A = 0
     * @param _x, _y balances such that val(_x) = val(_y)
     */
    constructor(
        uint256 _x,
        uint256 _y
    )
        public
    {
        x = _x;
        y = _y;
        k = x.mul(y);
        A = 0;
    }


    // /**
    //  * @dev initialize x tokens, y tokens to form invariant with A = 0
    //  * @param _x, _y balances such that val(_x) = val(_y)
    //  */
    // function initializeLiquidity(uint256 _x, uint256 _y) public {
    //     require(_x > 0 && _y > 0);
    //     x = _x;
    //     y = _y;
    //     k = x*y;
    //     A = 0;
    // }


    /**
     * @dev add x tokens, y tokens to update invariant k with same A
     * @param x_in, y_in balances such that val(x_in) = val(y_in)
     */
    function addLiquidity(uint256 x_in, uint256 y_in) public {
        require(x_in > 0 && y_in > 0);
        x = x.add(x_in);
        y = y.add(y_in);
        k = x.mul(y);
    }

    /**
     * @dev remove x tokens, y tokens to update invariant k with same A
     * @param percOut such that percentage of liquidity removed
     */
    function removeLiquidity(uint256 percOut) public returns (uint256 x_back, uint256 y_back) {
        require(percOut > 0 && percOut <= 100);
        x_back = (x.mul(percOut)).div(100);
        y_back = (x.mul(percOut)).div(100);
        x = x.sub(x_back);
        y = y.sub(y_back);
        k = x.mul(y);
    }

    /**
     * @dev Change A for Stable Swap equation
     * @param _A dictating shape of stable swap curve
     */
    function changeA(uint256 _A) public {
        require(A >= 0);
        A = _A;
    }

    /**
     * @dev Square root function
     * @param a number to find the square root of (rounded down?)
     * Adapted from https://github.com/ethereum/dapp-bin/pull/50/files (an open PR for solidity)
     */
    function sqrt(uint a) public pure returns (uint b) {
        require(a >= 0);
        if (a == 0) return 0;
        else if (a <= 3) return 1;
        uint c = (a.add(1)).div(2);
        b = a;
        while (c < b)
        /// @why3 invariant { to_int !_a = div ((div (to_int arg_a) (to_int !_b)) + (to_int !_b)) 2 }
        /// @why3 invariant { to_int arg_a < (to_int !_b + 1) * (to_int !_b + 1) }
        /// @why3 invariant { to_int arg_a < (to_int !_c + 1) * (to_int !_c + 1) }
        /// @why3 variant { to_int !_b }
        {
            b = c;
            c = (a.div(c).add(c)).div(2);
        }
    }

    /**
     * @dev Absolute value function
     * @param d number to find the square root of (rounded down?)
     * Adapted from https://ethereum.stackexchange.com/questions/84390/absolute-value-in-solidity/
     */
    function abs(int256 d) private pure returns (int256 val) {
        val = ((d >= 0)? d : -d);
    }

    /**
     * @dev Boolean function enforcing stable swap invariant
     */
    function invariant() public view returns (bool pass){
        require(x > 0 && x <= k);
        require(y > 0 && y <= k);
        uint256 rootK = sqrt(k);
        uint256 LHS = 4.mul(A).mul(x.add(y)) + 2.mul(rootK);
        uint256 RHS = 4.mul(A).mul(2.mul(rootK)).add((2.mul((rootK).pow(3))).div(4.mul(x).mul(y)));
        pass = (LHS == RHS);
    }

    /**
     * @dev Swap x for y according to stable swap invariant
     * @param x_in to return y_out
     */
    function swap_x(uint256 x_in) public returns (uint256 y_out){
        uint256 newX = x.add(x_in);
        uint256 a = 4.mul(A);
        uint256 K = 2.mul(sqrt(k));
        uint256 newY;

        int256 alpha = int256(4.mul(a).mul(newX));
        int256 beta = int256(4.mul(a).mul(newX.pow(2))).add(int256(4.mul(newX).mul(K))).sub(int256((4.mul(a).mul(K).mul(newX))));
        int256 gamma = -(int256(K).pow(3));

        // Solving quadratic

        int256 d = (beta.mul(beta)).sub(4.mul(alpha).mul(gamma));
        int256 sqrtD = int256(sqrt(uint256(abs(d))));

        if(d >= 0){
            int256 root1 = (-beta.add(sqrtD)).div(2.mul(alpha));
            int256 root2 = (-beta.sub(sqrtD)).div(2.mul(alpha));
            newY = uint256((root1 > 0 && root1 <= int256(k))? root1 : root2);
            y_out = y.sub(newY);

            //Changing variables for future
            x = newY;
            y = newX;
            assert(invariant());
        }
        else{
            revert("Wrong swap amount provided");
        }
    }

    /**
     * @dev Swap y for x according to stable swap invariant
     * @param y_in to return x_out
     */
    function swap_y(uint256 y_in) public returns (uint256 x_out){
        uint256 newY = y.add(y_in);
        uint256 a = 4.mul(A);
        uint256 K = 2.mul(sqrt(k));
        uint256 newX;

        int256 alpha = int256(4.mul(a).mul(newY));
        int256 beta = int256(4.mul(a).mul(newY.pow(2))).add(int256(4.mul(newY).mul(K))).sub(int256((4.mul(a).mul(K).mul(newY))));
        int256 gamma = -(int256(K).pow(3));

        // Solving quadratic

        int256 d = (beta.mul(beta)).sub(4.mul(alpha).mul(gamma));
        int256 sqrtD = int256(sqrt(uint256(abs(d))));

        if(d >= 0){
            int256 root1 = (-beta.add(sqrtD)).div(2.mul(alpha));
            int256 root2 = (-beta.sub(sqrtD)).div(2.mul(alpha));
            newX = uint256((root1 > 0 && root1 <= int256(k))? root1 : root2);
            x_out = x.sub(newX);

            //Changing variables for future
            x = newY;
            y = newX;
            assert(invariant());
        }
        else{
            revert("Wrong swap amount provided");
        }
    }
}

