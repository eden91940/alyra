// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract NFT is Ownable, ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    string private _name;
    string private _symbol;
    string private _description;

    /**
     * @dev Emitted when `tokenId` is minted token from `from`.
     */
    event Minted(address indexed from, uint256 indexed tokenId, string uri);

    constructor() ERC721("", ""){}

    function init(address owner_, string memory name_, string memory symbol_, string memory description_) external onlyOwner {
        require(keccak256(bytes(_name)) == keccak256(""), "Already initialized");
        transferOwnership(owner_);

        _name = name_;
        _symbol = symbol_;
        _description = description_;
    }

    function mint(string memory _tokenURI) external returns (uint) {

        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        emit Minted(msg.sender, newItemId, _tokenURI);

        _tokenIds.increment();

        return newItemId;
    }

    /**
    * @dev See {IERC721Metadata-name}.
     */
    function name() public view override returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IERC721Metadata-symbol}.
     */
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

}