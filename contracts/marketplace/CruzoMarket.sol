//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/utils/ERC1155HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC1155/IERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";

contract CruzoMarket is
    Initializable,
    ContextUpgradeable,
    UUPSUpgradeable,
    ERC1155HolderUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
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
        uint256 amount,
        address addressee
    );

    event TradeClosed(address tokenAddress, uint256 tokenId, address seller);

    event TradePriceChanged(
        address tokenAddress,
        uint256 tokenId,
        address seller,
        uint256 price
    );

    event WithdrawalCompleted(address beneficiaryAddress, uint256 _amount);

    struct Trade {
        uint256 amount;
        uint256 price;
    }

    // tokenAddress => tokenId => seller => trade
    mapping(address => mapping(uint256 => mapping(address => Trade)))
        public trades;

    // Service fee percentage in basis point (100bp = 1%)
    uint16 public serviceFee;

    constructor() {}

    function initialize(uint16 _serviceFee) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        __Context_init();
        __ReentrancyGuard_init();
        setServiceFee(_serviceFee);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}

    function openTrade(
        address _tokenAddress,
        uint256 _tokenId,
        uint256 _amount,
        uint256 _price
    ) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(
            trades[_tokenAddress][_tokenId][_msgSender()].amount == 0,
            "Trade is already open"
        );
        IERC1155Upgradeable(_tokenAddress).safeTransferFrom(
            _msgSender(),
            address(this),
            _tokenId,
            _amount,
            ""
        );
        trades[_tokenAddress][_tokenId][_msgSender()] = Trade({
            amount: _amount,
            price: _price
        });
        emit TradeOpened(
            _tokenAddress,
            _tokenId,
            _msgSender(),
            _amount,
            _price
        );
    }

    /*
    Buyer execute trade and pass the trade number
    and an additional data parameter if you dont want to pass data set it to empty string 
    if your sending the transaction through Frontend 
    else if you are send the transaction using etherscan or using nodejs set it to 0x00 
    */

    function _executeTrade(
    uint256 _trade,
    bytes calldata data,
    uint256 amount,
    address _to
  ) internal {
    Trade memory trade = trades[_trade];
    IERC1155 itemToken = IERC1155(trade.tokenAddress);
    require(trade.status == "Open", "Error: Trade is not Open");
    require(
      msg.sender != trade.poster,
      "Error: msg.sender is zero address or the owner is trying to buy his own nft"
    );
    require(
      trade.price == amount,
      "Error: value provided is not equal to the nft price"
    );

    payable(trade.poster).transfer(amount);

    itemToken.safeTransferFrom(
      address(this),
      payable(_to),
      trade.itemId,
      trade.amount,
      data
    );
    trades[_trade].status = "Executed";
    ownerToTokenToItem[trade.poster][trade.tokenAddress][trade.itemId] = false;

    trades[_trade].poster = payable(msg.sender);

    emit TradeStatusChange(_trade, "Executed");
  }

  function buyItem(uint256 _trade, bytes calldata data) external payable {
    _executeTrade(_trade, data, msg.value, msg.sender);
  }

  function giftItem(
    uint256 _trade,
    bytes calldata data,
    address _to
  ) external payable {
    require(msg.sender != _to, "useless operation");
    require(_to != address(0), "trying to send gift to 0 address");
    require(_to != address(this), "trying to send gift to market");

    _executeTrade(_trade, data, msg.value, _to);
  }
  
    function buyItem(
        address _tokenAddress,
        uint256 _tokenId,
        address _seller,
        uint256 _amount
    ) external payable {
        _executeTrade(
            _tokenAddress,
            _tokenId,
            _seller,
            _amount,
            _msgSender(),
            msg.value
        );
    }

    function giftItem(
        address _tokenAddress,
        uint256 _tokenId,
        address _seller,
        uint256 _amount,
        address _to
    ) external payable {
        require(_msgSender() != _to, "useless operation");
        require(_to != address(0), "trying to send gift to 0 address");
        require(_to != address(this), "trying to send gift to market");

        _executeTrade(
            _tokenAddress,
            _tokenId,
            _seller,
            _amount,
            _to,
            msg.value
        );
    }

    function closeTrade(address _tokenAddress, uint256 _tokenId)
        external
        nonReentrant
    {
        Trade memory trade = trades[_tokenAddress][_tokenId][_msgSender()];
        require(trade.amount > 0, "Trade is not open");
        IERC1155Upgradeable(_tokenAddress).safeTransferFrom(
            address(this),
            _msgSender(),
            _tokenId,
            trade.amount,
            ""
        );
        delete trades[_tokenAddress][_tokenId][_msgSender()];
        emit TradeClosed(_tokenAddress, _tokenId, _msgSender());
    }

    function setServiceFee(uint16 _serviceFee) public onlyOwner {
        require(
            _serviceFee <= 10000,
            "Service fee can not exceed 10,000 basis points"
        );
        serviceFee = _serviceFee;
    }

    function withdraw(address _beneficiaryAddress, uint256 _amount)
        public
        onlyOwner
    {
        AddressUpgradeable.sendValue(payable(_beneficiaryAddress), _amount);
        emit WithdrawalCompleted(_beneficiaryAddress, _amount);
    }

    function changePrice(
        address _tokenAddress,
        uint256 _tokenId,
        uint256 _newPrice
    ) external nonReentrant {
        Trade storage trade = trades[_tokenAddress][_tokenId][_msgSender()];
        require(trade.amount > 0, "Trade is not open");
        trade.price = _newPrice;
        emit TradePriceChanged(
            _tokenAddress,
            _tokenId,
            _msgSender(),
            _newPrice
        );
    }
}
