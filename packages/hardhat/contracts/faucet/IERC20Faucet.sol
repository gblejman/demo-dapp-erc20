//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/**
 * @dev Interface for an ERC20 faucet
 */
interface IERC20Faucet {
    function request() external returns (bool success);
}
