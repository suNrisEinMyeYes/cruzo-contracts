//SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../tokens/Cruzo1155.sol";

contract Cruzo1155Factory is Ownable {
    address private immutable beacon;
    address[] private tokens;

    event Cruzo1155Deployed(address tokenAddress);

    constructor(address _beacon) {
        beacon = address(_beacon);
    }

    function createToken(
        string memory _baseMetadataURI,
        string memory _marketAddress
    ) external returns (address) {
        BeaconProxy proxy = new BeaconProxy(
            beacon,
            abi.encodeWithSelector(Cruzo1155.initialize.selector, _baseMetadataURI, _marketAddress)
        );
        Cruzo1155 token = Cruzo1155(address(proxy));
        token.transferOwnership(_msgSender());
        tokens.push(address(proxy));
        emit Cruzo1155Deployed(address(proxy));
        return address(proxy);
    }

    function getTokenByIndex(uint32 index) external view returns (address) {
        return tokens[index];
    }
}