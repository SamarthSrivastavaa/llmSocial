// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SocialLedger
 * @dev Stores IPFS hashes of posts. Vote counts updated by StakingGame.
 */
contract SocialLedger {
    enum Category {
        TIMELINE,
        NEWS,
        DECISION
    }

    struct Post {
        uint256 id;
        address author;
        string ipfsHash;
        uint256 upvotes;
        uint256 downvotes;
        uint256 timestamp;
        Category category;
        bool exists;
    }

    uint256 public nextPostId = 1;
    mapping(uint256 => Post) public posts;

    address public stakingGame;

    event NewPost(uint256 indexed postId, address indexed author, string ipfsHash, uint256 timestamp, Category category);
    event VoteRecorded(uint256 indexed postId, bool isUpvote);

    error OnlyStakingGame();
    error PostDoesNotExist();
    error ZeroAddress();

    modifier onlyStakingGame() {
        if (msg.sender != stakingGame) revert OnlyStakingGame();
        _;
    }

    constructor(address _stakingGame) {
        stakingGame = _stakingGame;
    }

    /// @dev Set once after deploy when StakingGame is deployed (two-phase init). Callable only when stakingGame is still zero.
    function setStakingGame(address _stakingGame) external {
        if (stakingGame != address(0)) revert OnlyStakingGame();
        if (_stakingGame == address(0)) revert ZeroAddress();
        stakingGame = _stakingGame;
    }

    /**
     * @dev Called by StakingGame when an agent posts (after fee is collected).
     */
    function post(address author, string calldata ipfsHash, Category category) external onlyStakingGame returns (uint256 postId) {
        postId = nextPostId++;
        posts[postId] = Post({
            id: postId,
            author: author,
            ipfsHash: ipfsHash,
            upvotes: 0,
            downvotes: 0,
            timestamp: block.timestamp,
            category: category,
            exists: true
        });
        emit NewPost(postId, author, ipfsHash, block.timestamp, category);
        return postId;
    }

    function getPost(uint256 postId) external view returns (
        uint256 id,
        address author,
        string memory ipfsHash,
        uint256 upvotes,
        uint256 downvotes,
        uint256 timestamp,
        Category category,
        bool exists
    ) {
        Post storage p = posts[postId];
        if (!p.exists) revert PostDoesNotExist();
        return (p.id, p.author, p.ipfsHash, p.upvotes, p.downvotes, p.timestamp, p.category, p.exists);
    }

    /**
     * @dev Called by StakingGame when a vote is cast (Valid = upvote, Invalid = downvote).
     */
    function recordVote(uint256 postId, bool isUpvote) external onlyStakingGame {
        Post storage p = posts[postId];
        if (!p.exists) revert PostDoesNotExist();
        if (isUpvote) {
            p.upvotes += 1;
        } else {
            p.downvotes += 1;
        }
        emit VoteRecorded(postId, isUpvote);
    }
}
