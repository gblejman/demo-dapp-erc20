//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IERC20.sol";
import "./IERC20Metadata.sol";

/**
 * @dev ERC20 vanilla implementation of the ERC20 standard.
 */
contract ERC20 is IERC20, IERC20Metadata {
    address private _owner;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    string private _name;
    string private _symbol;
    uint8 private _decimals;
    uint256 private _totalSupply;

    /**
     * @dev Sets the values for {name}, {symbol}, {decimals}, {totalSupply}.
     *
     * All are immutable and can only be set during construction.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 totalSupply_
    ) {
        require(bytes(name_).length > 0, "ERC20: Token name must not be empty");
        require(
            bytes(symbol_).length > 0,
            "ERC20: Token symbol must not be empty"
        );
        require(
            0 <= decimals_ && decimals_ <= 18,
            "ERC20: Token decimals must be between 0 and 18"
        );
        require(totalSupply_ > 0, "ERC20: Token total supply must be positive");

        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
        _totalSupply = totalSupply_;
        _owner = msg.sender;
        _balances[msg.sender] = totalSupply_;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view override returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token.
     */
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev Returns the decimals places of the token.

     * NOTE: This information is only used for _display_ purposes, does not affect the arithmetic of the contract.
     */
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Returns the total token supply.
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Returns the account balance of another account with address `owner`
     * @param owner the owner account.
     * @return balance the account balance.
     */
    function balanceOf(address owner) public view override returns (uint256) {
        return _balances[owner];
    }

    /**
     * @dev Transfers `value` amount of tokens to address `to`.
     * @param to the to address. Must not be the zero address.
     * @param value the amount of tokens. Caller must have a balance of at least `value`. 0 amount is valid.
     * @return success a boolean value indicating whether the operation succeeded.
     *
     * Note Emits the `Transfer` event on success.
     * Note Throws if caller’s account balance does not have enough tokens to spend.
     */
    function transfer(address to, uint256 value)
        public
        override
        returns (bool)
    {
        address from = msg.sender;
        return _transfer(from, to, value);
    }

    /**
     * @dev Transfers `value` amount of tokens from address `from` to address `to` using the allowance mechanism.
     * @param from the from address. Must not be the zero address.
     * @param to the to address. Must not be the zero address.
     * @param value the amount of tokens. Caller must have an allowance of at least `value`. 0 amount is valid.
     *
     * Note Emits the `Transfer` event on success.
     * Note Throws unless the `from` address has deliberately authorized the caller to transfer `allowance` amount.
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) public override returns (bool) {
        address spender = msg.sender;
        uint256 currentAllowance = allowance(from, spender);
        require(currentAllowance >= value, "ERC20: Insufficient allowance");

        // reduce remaining allowance first to prevent reentrancy attacks
        _approve(from, spender, currentAllowance - value);
        return _transfer(from, to, value);
    }

    /**
     * @dev Allows `spender` to withdraw from your account multiple times, up to the `value` amount. If this function is called again it overwrites the current allowance with `value`
     * @return success a boolean value indicating whether the operation succeeded.
     *
     * Note Emits the `Approval` event on success.
     * Note Beware racing condition https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     */
    function approve(address spender, uint256 value)
        public
        override
        returns (bool)
    {
        address from = msg.sender;
        return _approve(from, spender, value);
    }

    /**
     * @dev Returns the amount which `spender` is still allowed to withdraw from `owner`.
     *
     * Note This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    /**
     * @dev Internal transfer
     */
    function _transfer(
        address from,
        address to,
        uint256 value
    ) internal returns (bool) {
        require(
            from != address(0),
            "ERC20: From address can not be the zero address"
        );
        require(
            to != address(0),
            "ERC20: To address can not be the zero address"
        );

        uint256 fromBalance = _balances[from];

        require(fromBalance >= value, "ERC20: Insufficient balance");

        _balances[from] = fromBalance - value;
        _balances[to] += value;

        emit Transfer(from, to, value);

        return true;
    }

    /**
     * @dev Internal approve
     */
    function _approve(
        address owner,
        address spender,
        uint256 value
    ) internal returns (bool) {
        _allowances[owner][spender] = value;

        emit Approval(owner, spender, value);

        return true;
    }
}
