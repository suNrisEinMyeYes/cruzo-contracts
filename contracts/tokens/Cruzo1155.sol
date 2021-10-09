//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./ERC1155AccessControlledBurnable.sol";


contract Cruzo1155 is ERC1155AccessControlledBurnable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds; 
    address public marketAddress;

    /**
     *  @param _marketAddress -> address of Cruzo marketplace which has all authorization on every token
     */
    constructor(address _marketAddress)
        ERC1155("https://somthing.something/{id}.json")
    {
        marketAddress = _marketAddress;
    }

    function setURI(string calldata _uri) public returns (bool) {
        _setURI(_uri);
        return true;
    }

    /**
     * @notice Inorder pause all transfer on the occurence of a major bug
     * @dev See {ERC1155-_beforeTokenTransfer}.
     *
     * Requirements:
     *
     * - the contract must not be paused.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        require(!paused(), "ERC1155Pausable: token transfer while paused");
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
    function _mintTokens(
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
    function _mintNewTokens(
        uint256 _amount,
        address _to,
        bytes memory _data
    ) internal returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        return _mintTokens(newItemId, _amount, _to, _data);
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
    ) public onlyOwner returns (uint256) {
        return _mintNewTokens(_amount, _to, _data);
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
    ) public onlyOwner returns (uint256) {
        require(
            _tokenIds.current() >= _tokenId,
            "token doesn't exist; try using `mintNewTo()`"
        );
        return _mintTokens(_tokenId, _amount, _to, _data);
    }
}
