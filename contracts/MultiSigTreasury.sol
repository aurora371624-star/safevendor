// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title MultiSigTreasury
/// @notice N-of-M multisig wallet holding the sale proceeds. A transaction must be
///         submitted by an owner (who auto-confirms it) and confirmed by additional
///         owners until the threshold is reached before it can be executed.
contract MultiSigTreasury is ReentrancyGuard {
    address[] public owners;
    uint256 public immutable required;
    mapping(address => bool) public isOwner;

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Treasury: not an owner");
        _;
    }

    modifier txExists(uint256 txId) {
        require(txId < transactions.length, "Treasury: tx does not exist");
        _;
    }

    modifier notExecuted(uint256 txId) {
        require(!transactions[txId].executed, "Treasury: tx already executed");
        _;
    }

    event TransactionSubmitted(uint256 indexed txId, address indexed owner, address to, uint256 value);
    event TransactionConfirmed(uint256 indexed txId, address indexed owner);
    event TransactionRevoked(uint256 indexed txId, address indexed owner);
    event TransactionExecuted(uint256 indexed txId, address to, uint256 value);

    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length >= _required, "Treasury: owners < required");
        require(_required > 0, "Treasury: required must be > 0");
        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Treasury: zero owner");
            require(!isOwner[owner], "Treasury: duplicate owner");
            isOwner[owner] = true;
            owners.push(owner);
        }
        required = _required;
    }

    receive() external payable {}

    /// @notice Submit a transaction; the submitter auto-confirms it.
    function submitTransaction(address to, uint256 value, bytes calldata data)
        external
        onlyOwner
        returns (uint256 txId)
    {
        txId = transactions.length;
        transactions.push(
            Transaction({to: to, value: value, data: data, executed: false, confirmations: 1})
        );
        isConfirmed[txId][msg.sender] = true;
        emit TransactionSubmitted(txId, msg.sender, to, value);
        emit TransactionConfirmed(txId, msg.sender);
    }

    /// @notice Confirm a pending transaction.
    function confirmTransaction(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
    {
        require(!isConfirmed[txId][msg.sender], "Treasury: already confirmed");
        transactions[txId].confirmations += 1;
        isConfirmed[txId][msg.sender] = true;
        emit TransactionConfirmed(txId, msg.sender);
    }

    /// @notice Revoke a previous confirmation.
    function revokeConfirmation(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
    {
        require(isConfirmed[txId][msg.sender], "Treasury: not confirmed");
        transactions[txId].confirmations -= 1;
        isConfirmed[txId][msg.sender] = false;
        emit TransactionRevoked(txId, msg.sender);
    }

    /// @notice Execute a transaction once the confirmation threshold is reached.
    function executeTransaction(uint256 txId)
        external
        onlyOwner
        txExists(txId)
        notExecuted(txId)
        nonReentrant
    {
        Transaction storage t = transactions[txId];
        require(t.confirmations >= required, "Treasury: not enough confirmations");
        require(address(this).balance >= t.value, "Treasury: insufficient balance");

        t.executed = true; // Checks-Effects-Interactions: mark before the external call

        (bool ok, ) = t.to.call{value: t.value}(t.data);
        require(ok, "Treasury: call failed");
        emit TransactionExecuted(txId, t.to, t.value);
    }
}
