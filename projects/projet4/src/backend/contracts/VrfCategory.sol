// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';

import "hardhat/console.sol";

/**
 * @notice A Chainlink VRF consumer which uses randomness to get a category for NFT with the following probabilities
 *  -  Bronze => 50 %
 *  -  Silver => 30 %
 *  -  Gold => 18 %
 *  -  Platinium => 2 %
 */
contract VrfCategory is Ownable, VRFConsumerBaseV2 {

    uint256 private constant VRF_IN_PROGRESS = 500;

    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId;


    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf-contracts/#configurations
    bytes32 s_keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 40,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 callbackGasLimit = 40000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 1 random value in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 1;

    // map  nft tokenId to requestIds
    mapping(uint256 => uint256) private s_nfts;
    // map vrf results to nft tokenId
    mapping(uint256 => uint256) private s_results;

    event VrfCalled(uint256 indexed requestId, uint256 indexed tokenNftId);
    event VrfSuccess(uint256 indexed requestId, uint256 indexed tokenNftId, uint256 indexed result);

    /**
     * @notice Constructor inherits VRFConsumerBaseV2
     *
     * @dev NETWORK: RINKEBY
     *
     * @param subscriptionId subscription id that this consumer contract can use
     */
    constructor(uint64 subscriptionId, address vrfCoordinator) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
    }

    /**
     * @notice Requests randomness
     * @dev Warning: if the VRF response is delayed, avoid calling requestRandomness repeatedly
     * as that would give miners/VRF operators latitude about which VRF response arrives first.
     * @dev You must review your implementation details with extreme care.
     *
     * @param tokenNftId nft token ID
     */
    function requestRandomnessForTokenId(uint256 tokenNftId) public returns (uint256 requestId) {
        require(s_results[tokenNftId] == 0, 'Already called');

        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );


        s_nfts[requestId] = tokenNftId;
        s_results[tokenNftId] = VRF_IN_PROGRESS;
        emit VrfCalled(requestId, tokenNftId);
    }

    /**
     * @notice Callback function used by VRF Coordinator to return the random number to this contract.
     *
     * @dev Some action on the contract state should be taken here, like storing the result.
     * @dev WARNING: take care to avoid having multiple VRF requests in flight if their order of arrival would result
     * in contract states with different outcomes. Otherwise miners or the VRF operator would could take advantage
     * by controlling the order.
     * @dev The VRF Coordinator will only send this function verified responses, and the parent VRFConsumerBaseV2
     * contract ensures that this method only receives randomness from the designated VRFCoordinator.
     *
     * @param requestId uint256
     * @param randomWords  uint256[] The random result returned by the oracle.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {

        console.log("fulfillRandomWords requestId %s", requestId);

        uint256 catValue = (randomWords[0] % 100) + 1;
        s_results[s_nfts[requestId]] = catValue;
        emit VrfSuccess(requestId, s_nfts[requestId], catValue);
    }

    /**
     *
     * @notice Get the category assigned to the nft once the address has call vrf
     * @param tokenNftId NFT id
     * @return category as a string
     */
    function category(uint256 tokenNftId) public view returns (string memory) {
        require(s_results[tokenNftId] != 0, 'Category NFT not calculated');
        require(s_results[tokenNftId] != VRF_IN_PROGRESS, 'Vrf in progress');
        return getCategory(s_results[tokenNftId]);
    }

    /**
     * @notice Get the category from the id with probabilities :
     *  -  Bronze => 50 %
     *  -  Silver => 30 %
     *  -  Gold => 18 %
     *  -  Platinium => 2 %
     * @param id uint256
     * @return category name string
     */
    function getCategory(uint256 id) private pure returns (string memory) {

        string memory _category = 'Bronze';

        if (id > 50 && id <= 80) {
            _category = 'Silver';
        }
        else if (id > 80 && id <= 98) {
            _category = 'Gold';
        }
        else if (id > 98) {
            _category = 'Platinium';
        }

        return _category;
    }

}