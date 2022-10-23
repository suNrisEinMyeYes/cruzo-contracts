//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./ERC1155URI.sol";
import "@openzeppelin/contracts-upgradeable/token/common/ERC2981Upgradeable.sol"; 

contract Cruzo1155 is Initializable, ERC1155URI, ERC2981Upgradeable{
    address public marketAddress;

    string public name;
    string public symbol;
    string public contractURI;

    function initialize(
        string calldata _name,
        string calldata _symbol,
        string memory _baseMetadataURI,
        string memory _contractURI,
        address _marketAddress,
        address owner
    ) public initializer {
        __Ownable_init();
        __Context_init();
        __Pausable_init();
        __ERC1155Supply_init();
        __ERC1155_init(_baseMetadataURI);
        __ERC2981_init();
        setBaseURI(_baseMetadataURI);
        marketAddress = _marketAddress;
        name = _name;
        symbol = _symbol;
        contractURI = _contractURI;
        setURIType(1);
        _transferOwnership(owner);
    }

    function setMarketAddress(address _new) public onlyOwner {
        marketAddress = _new;
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
     * @param _uri - The token metadata uri (optional if tokenURI is set)
     * @dev Used internally to mint new tokens
     */
    function _createToken(
        uint256 _tokenId,
        uint256 _amount,
        address _to,
        string memory _uri,
        bytes memory _data
    ) internal returns (uint256) {
        require(creators[_tokenId] == address(0), "Token is already created");
        creators[_tokenId] = _msgSender();

        if (bytes(_uri).length > 0) {
            _setTokenURI(_tokenId, _uri);
        }
        return _mintToken(_tokenId, _amount, _to, _data);
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
        uint256 _tokenId,
        uint256 _amount,
        address _to,
        string memory _uri,
        bytes memory _data,
        address _royaltyReceiver,
        uint96 _royaltyFee
    ) public returns (uint256) {
        uint256 _tokenId = _createToken(_tokenId, _amount, _to, _uri, _data);
        setTokenRoyalty(_royaltyReceiver,_royaltyFee,_tokenId);
        return _tokenId;
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
            creators[_tokenId] != address(0),
            "token doesn't exist; try using `mintNewTo()`"
        );
        return _mintToken(_tokenId, _amount, _to, _data);
    }

    /**
     *
     * @notice SET Uri Type from {DEFAULT,IPFS,ID}
     * @param _uriType - The uri type selected from {DEFAULT,IPFS,ID}
     */

    function setURIType(uint256 _uriType) public onlyOwner {
        _setURIType(_uriType);
    }

    function uri(uint256 id) public view override returns (string memory) {
        require(creators[id] != address(0), "Cruzo1155:non existent tokenId");
        return _tokenURI(id);
    }

    function setTokenURI(uint256 _id, string memory _uri) public {
        require(creators[_id] != address(0), "Cruzo1155:non existent tokenId");
        _setTokenURI(_id, _uri);
    }

    function setBaseURI(string memory _baseURI) public onlyOwner {
        _setBaseURI(_baseURI);
    }

    function setContractURI(string memory _newURI) external onlyOwner {
        contractURI = _newURI;
    }
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC2981Upgradeable, ERC1155Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function setDefaultRoyaltyInfo(address _receiver, uint96 _royaltyFeesInBips)
        public
        onlyOwner
    {
        require(
            _royaltyFeesInBips <= 5000,
            "Royalty value must be between 0% and 50%"
        );
        _setDefaultRoyalty(_receiver, _royaltyFeesInBips);
    }

    function setTokenRoyalty(
        address _receiver,
        uint96 _royaltyFeesInBips,
        uint256 _tokenId
    ) internal onlyCreator(_tokenId) {
        require(
            _royaltyFeesInBips <= 5000,
            "Royalty value must be between 0% and 50%"
        );

        _setTokenRoyalty(_tokenId, _receiver, _royaltyFeesInBips);
    }
}
