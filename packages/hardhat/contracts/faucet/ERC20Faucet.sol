//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IERC20Faucet.sol";
import "../erc20/IERC20.sol";

/**
 * @dev vanilla implementation of a faucet.
 */
contract ERC20Faucet is IERC20Faucet {
    // The address of the faucet owner
    address private _owner;

    // The mapping of addresses to last request time
    mapping(address => uint256) private _requestTime;

    // The address of the underlying erc20 token to interact with
    address private _token;

    // The amount of tokens to send when requested
    uint256 private _drip;

    // The time to await until next allowed request
    uint256 private _waitTime = 1 minutes;

    /**
     * @dev Sets the erc20 token address to interact with and the drip
     */
    constructor(address token_, uint256 drip_) {
        require(
            token_ != address(0),
            "ERC20Faucet: Token address can not be the zero address"
        );
        require(drip_ > 0, "ERC20Faucet: Drip must be positive");

        _owner = msg.sender;
        _token = token_;
        _drip = drip_;
    }

    function token() public view returns (address) {
        return _token;
    }

    function drip() public view returns (uint256) {
        return _drip;
    }

    function waitTime() public view returns (uint256) {
        return _waitTime;
    }

    function request() public override returns (bool) {
        address requestor = msg.sender;
        require(_canRequest(requestor), "ERC20Faucet: Wait 1 minute");

        _requestTime[requestor] = block.timestamp;

        return IERC20(_token).transfer(requestor, _drip);
    }

    function _canRequest(address requestor) internal view returns (bool) {
        uint256 requestTime = _requestTime[requestor];

        // first time requests are allowed
        if (requestTime == 0) return true;

        return (block.timestamp >= requestTime + _waitTime);
    }
}
