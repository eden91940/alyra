// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./VrfCategory.sol";


contract NFT is Ownable, ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    string private _name;
    string private _symbol;
    string private _description;
    VrfCategory private _vrfCategory;

    /**
     * @dev Emitted when `tokenId` is minted token from `from`.
     */
    event Minted(address indexed from, uint256 indexed tokenId, string uri);

    constructor() ERC721("", ""){}

    function init(address owner_, string memory name_, string memory symbol_, string memory description_, VrfCategory _addressVrfVategory) external onlyOwner {
        require(keccak256(bytes(_name)) == keccak256(""), "Already initialized");
        transferOwnership(owner_);

        _name = name_;
        _symbol = symbol_;
        _description = description_;
        _vrfCategory = _addressVrfVategory;
    }

    function _beforeTokenTransfer(address from, address, uint256 tokenId) internal override {
        if (from == address(0)) {
            // only for minting
            _vrfCategory.requestRandomnessForTokenId(tokenId);
        }
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

    function tokenCount() view public returns (uint){
        return _tokenIds.current();
    }

}