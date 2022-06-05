//SPDX-License-Identifier: un-licensed
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract CruzoMarket is ERC1155Holder, Ownable {
    event TradeOpened(
        address tokenAddress,
        uint256 tokenId,
        address seller,
        uint256 amount,
        uint256 price
    );

    event TradeExecuted(
        address tokenAddress,
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 amount
    );

    event TradeClosed(address tokenAddress, uint256 tokenId, address seller);

    struct Trade {
        uint256 amount;
        uint256 price;
    }

    // tokenAddress => tokenId => seller => trade
    mapping(address => mapping(uint256 => mapping(address => Trade)))
        public trades;

    function openTrade(
        address _tokenAddress,
        uint256 _tokenId,
        uint256 _amount,
        uint256 _price
    ) external {
        require(
            trades[_tokenAddress][_tokenId][msg.sender].amount == 0,
            "Trade is already open"
        );
        IERC1155(_tokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            _tokenId,
            _amount,
            ""
        );
        trades[_tokenAddress][_tokenId][msg.sender] = Trade({
            amount: _amount,
            price: _price
        });
        emit TradeOpened(_tokenAddress, _tokenId, msg.sender, _amount, _price);
    }

    function executeTrade(
        address _tokenAddress,
        uint256 _tokenId,
        address _seller,
        uint256 _amount
    ) external payable {
        // TODO: add nonReentrant modifier?

        Trade storage trade = trades[_tokenAddress][_tokenId][_seller];
        require(_amount > 0, "Amount must be greater than 0");
        require(trade.amount >= _amount, "Not enough items in trade");
        require(
            msg.value == trade.price * _amount,
            "Ether value sent is incorrect"
        );
        trade.amount -= _amount;
        // TODO: add service fee
        Address.sendValue(payable(_seller), msg.value);
        IERC1155(_tokenAddress).safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId,
            _amount,
            ""
        );
        emit TradeExecuted(
            _tokenAddress,
            _tokenId,
            _seller,
            msg.sender,
            _amount
        );
    }

    function closeTrade(address _tokenAddress, uint256 _tokenId) external {
        Trade memory trade = trades[_tokenAddress][_tokenId][msg.sender];
        require(trade.amount > 0, "Trade is not open");
        IERC1155(_tokenAddress).safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId,
            trade.amount,
            ""
        );
        delete trades[_tokenAddress][_tokenId][msg.sender];
        emit TradeClosed(_tokenAddress, _tokenId, msg.sender);
    }
}
