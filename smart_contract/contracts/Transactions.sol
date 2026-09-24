// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Transactions {
    uint256 private transactionCount;

    event Transfer(
        address indexed from,
        address indexed receiver,
        uint256 amount,
        string message,
        uint256 timestamp,
        string keyword
    );
  
    struct TransferStruct {
        address sender;
        address receiver;
        uint amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    TransferStruct[] transactions;

    function addToBlockchain(
        address payable receiver,
        string calldata message,
        string calldata keyword
    ) external payable {
        require(receiver != address(0), "Receiver cannot be the zero address");
        require(msg.value > 0, "Amount must be greater than zero");

        transactionCount += 1;
        transactions.push(
            TransferStruct(msg.sender, receiver, msg.value, message, block.timestamp, keyword)
        );

        emit Transfer(msg.sender, receiver, msg.value, message, block.timestamp, keyword);

        (bool sent, ) = receiver.call{value: msg.value}("");
        require(sent, "Transfer failed");
    }

    function getAllTransactions() external view returns (TransferStruct[] memory) {
        return transactions;
    }

    function getLatestTransactions(uint256 limit) external view returns (TransferStruct[] memory) {
        uint256 resultLength = limit < transactions.length ? limit : transactions.length;
        TransferStruct[] memory latest = new TransferStruct[](resultLength);

        for (uint256 i = 0; i < resultLength; i++) {
            latest[i] = transactions[transactions.length - 1 - i];
        }

        return latest;
    }

    function getTransactionCount() external view returns (uint256) {
        return transactionCount;
    }
}
