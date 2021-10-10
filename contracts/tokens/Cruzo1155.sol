//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./ERC1155CruzoBase.sol";

contract Cruzo1155 is ERC1155CruzoBase{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public marketAddress;

    string public name;
    string public symbol;

    /**
     *  @param _marketAddress -> address of Cruzo marketplace which has all authorization on every token
     */
    constructor(
        string memory _name,
        string memory _symbol,
        address _marketAddress
    ) ERC1155("https://somthing.something/{id}.json") {
        marketAddress = _marketAddress;
        name = _name;
        symbol = _symbol;
    }

    function setURI(string calldata _uri) public returns (bool) {
        _setURI(_uri);
        return true;
    }

    /**
     *
     * @notice This function return totalNumber of unique tokentypes
     * @dev This will only return the total number of individual unique tokentypes only
     * @dev It will not return total inluding suppply of fungible tokens
     *
     */
    function total() public view onlyOwner returns (uint256) {
        return _tokenIds.current();
    }

    /**
     *
     * @notice Internal function to mint to `_amount` of tokens of `_tokenId` to `_to` address
     * @param _tokenId - The Id of the token to be minted
     * @param _to - The to address to which the token is to be minted
     * @param _amount - The amount of tokens to be minted
     * @dev Can be used to mint any specific tokens
     *
     */
    function _mintToken(
        uint256 _tokenId,
        uint256 _amount,
        address _to,
        bytes memory _data
    ) internal returns (uint256) {
        _mint(_to, _tokenId, _amount, _data);
        setApprovalForAll(marketAddress, true);
        return _tokenId;
    }

    /**
     *
     * @notice Internal function to mint to `_amount` of tokens of new tokens to `_to` address
     * @param _to - The to address to which the token is to be minted
     * @param _amount - The amount of tokens to be minted
     * @dev Used internally to mint new tokens
     */
    function _createToken(
        uint256 _amount,
        address _to,
        bytes memory _data
    ) internal returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        creators[newItemId] = _msgSender();
        return _mintToken(newItemId, _amount, _to, _data);
    }

    /**
     *
     * @notice This function can be used to mint a new token to a specific address
     * @param _to - The to address to which the token is to be minted
     * @param _amount - The amount of tokens to be minted
     * @dev Mint a new token  to `to` address
     *
     */
    function create(
        uint256 _amount,
        address _to,
        bytes memory _data
    ) public returns (uint256) {
        return _createToken(_amount, _to, _data);
    }

    /**
     *
     * @notice Mint a specific token to `_to` address in `_amount` quantiy
     * @param _tokenId The token ID to be minted
     * @param _amount - The amount of tokens to be minted
     * @param _to - The to address to which the token is to be minted
     * Requirements-
     *     - Token ID must exist
     */
    function mintTo(
        uint256 _tokenId,
        uint256 _amount,
        address _to,
        bytes memory _data
    ) public onlyCreator(_tokenId) returns (uint256) {
        require(
            _tokenIds.current() >= _tokenId,
            "token doesn't exist; try using `mintNewTo()`"
        );
        return _mintToken(_tokenId, _amount, _to, _data);
    }
}
