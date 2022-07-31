// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFT.sol";

contract NftCollectionFactory is Ownable {

    uint256 private collectionCreatedCount;

    mapping(address => address[]) public userCollections;

    event CollectionCreated(string name, string symbol, string description, address collectionAddress, uint timestamp);

    function createCollection(string memory _name, string memory _symbol, string memory _description) external returns (address collectionAddress) {
        // Import the bytecode of the contract to deploy
        bytes memory collectionBytecode = type(NFT).creationCode;
        // Make a random salt based on the artist name
        bytes32 salt = keccak256(abi.encodePacked(_name, block.timestamp, collectionCreatedCount));

        assembly {
            collectionAddress := create2(0, add(collectionBytecode, 0x20), mload(collectionBytecode), salt)
            if iszero(extcodesize(collectionAddress)) {
            // revert if something gone wrong (collectionAddress doesn't contain an address)
                revert(0, 0)
            }
        }

        // Initialize the collection contract
        NFT(collectionAddress).init(msg.sender, _name, _symbol, _description);

        // Save the owner of this collection
        userCollections[msg.sender].push(collectionAddress);

        collectionCreatedCount++;

        emit CollectionCreated(_name, _symbol, _description, collectionAddress, block.timestamp);

        return collectionAddress;
    }

    function getUserAllCollections(address addr) public view returns (address[] memory) {
        return userCollections[addr];
    }

}