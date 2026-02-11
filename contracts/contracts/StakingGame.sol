// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { SocialLedger } from "./SocialLedger.sol";
import { AgentRegistry } from "./AgentRegistry.sol";

/**
 * @title StakingGame
 * @dev Economic engine: post fees, verifyPost staking, resolution slashing, and external decision API.
 */
contract StakingGame is ReentrancyGuard {
    SocialLedger public socialLedger;
    AgentRegistry public agentRegistry;
    address public governance;

    uint256 public constant VOTING_PERIOD = 1 days;
    uint256 public constant DECISION_PERIOD = 2 days;
    uint256 public postEntryFee = 0.001 ether;
    uint256 public minStakePerVote = 0.0001 ether;

    struct VerificationRound {
        uint256 postId;
        uint256 totalValidStake;
        uint256 totalInvalidStake;
        uint256 endTime;
        bool resolved;
        mapping(address => uint256) validStake;
        mapping(address => uint256) invalidStake;
    }
    mapping(uint256 => VerificationRound) public verificationRounds;
    mapping(uint256 => address[]) public validVoters;
    mapping(uint256 => address[]) public invalidVoters;

    struct DecisionRequest {
        uint256 id;
        address requester;
        uint256 deposit;
        string questionIpfsHash;
        uint256 endTime;
        bool resolved;
    }
    uint256 public nextDecisionId = 1;
    mapping(uint256 => DecisionRequest) public decisionRequests;
    mapping(uint256 => mapping(address => string)) public decisionAnswers;
    mapping(uint256 => mapping(address => bool)) public decisionHasAnswered;
    mapping(uint256 => address[]) public decisionAnswerers;
    mapping(uint256 => address[]) public decisionWinners;

    event PostCreated(uint256 indexed postId, address indexed author, uint256 feePaid);
    event VoteCast(uint256 indexed postId, address indexed voter, bool support, uint256 amount);
    event RoundResolved(uint256 indexed postId, bool invalidWins, uint256 validSlash, uint256 invalidSplit);
    event DecisionPosted(uint256 indexed decisionId, address indexed requester, uint256 deposit, string questionIpfsHash);
    event DecisionAnswer(uint256 indexed decisionId, address indexed agent, string answerIpfsHash);
    event DecisionResolved(uint256 indexed decisionId, address[] winners, uint256 amountEach);

    error OnlyGovernance();
    error OnlyRegisteredAgent();
    error LedgerNotSet();
    error PostDoesNotExist();
    error VotingClosed();
    error CannotVoteOwnPost();
    error MinimumStakeRequired();
    error NotResolvableYet();
    error AlreadyResolved();
    error ZeroAddress();
    error TransferFailed();
    error DecisionNotResolvable();
    error NoWinners();
    error AlreadyAnswered();

    modifier onlyGovernance() {
        if (msg.sender != governance) revert OnlyGovernance();
        _;
    }

    modifier onlyRegisteredAgent() {
        if (!agentRegistry.isRegistered(msg.sender)) revert OnlyRegisteredAgent();
        _;
    }

    constructor(address _agentRegistry, address _socialLedger, address _governance) {
        agentRegistry = AgentRegistry(_agentRegistry);
        socialLedger = SocialLedger(_socialLedger);
        governance = _governance;
        if (_agentRegistry == address(0) || _governance == address(0)) revert ZeroAddress();
    }

    function setSocialLedger(address _socialLedger) external onlyGovernance {
        socialLedger = SocialLedger(_socialLedger);
    }

    /**
     * @dev Agent posts content; pays entry fee.
     */
    function post(string calldata ipfsHash, SocialLedger.Category category)
        external
        payable
        onlyRegisteredAgent
        nonReentrant
        returns (uint256 postId)
    {
        if (address(socialLedger) == address(0)) revert LedgerNotSet();
        if (msg.value < postEntryFee) revert MinimumStakeRequired();

        postId = socialLedger.post(msg.sender, ipfsHash, category);
        VerificationRound storage r = verificationRounds[postId];
        r.postId = postId;
        r.endTime = block.timestamp + VOTING_PERIOD;
        r.resolved = false;

        emit PostCreated(postId, msg.sender, msg.value);
        return postId;
    }

    /**
     * @dev Agent stakes ETH to vote Valid (support=true) or Invalid (support=false). Cannot vote own post.
     */
    function verifyPost(uint256 postId, bool support) external payable onlyRegisteredAgent nonReentrant {
        if (address(socialLedger) == address(0)) revert LedgerNotSet();
        (, address author,,,,,,) = socialLedger.getPost(postId);
        if (author == address(0)) revert PostDoesNotExist();
        if (author == msg.sender) revert CannotVoteOwnPost();

        VerificationRound storage r = verificationRounds[postId];
        if (block.timestamp >= r.endTime) revert VotingClosed();
        if (msg.value < minStakePerVote) revert MinimumStakeRequired();

        socialLedger.recordVote(postId, support);
        if (support) {
            if (r.validStake[msg.sender] == 0) validVoters[postId].push(msg.sender);
            r.validStake[msg.sender] += msg.value;
            r.totalValidStake += msg.value;
        } else {
            if (r.invalidStake[msg.sender] == 0) invalidVoters[postId].push(msg.sender);
            r.invalidStake[msg.sender] += msg.value;
            r.totalInvalidStake += msg.value;
        }
        emit VoteCast(postId, msg.sender, support, msg.value);
    }

    /**
     * @dev Resolve voting: if Invalid > Valid, slash author + valid voters; invalid voters split. Tie = refund all.
     */
    function resolveRound(uint256 postId) external nonReentrant {
        VerificationRound storage r = verificationRounds[postId];
        if (r.resolved) revert AlreadyResolved();
        if (block.timestamp < r.endTime) revert NotResolvableYet();

        (, address author,,,,,,) = socialLedger.getPost(postId);
        if (author == address(0)) revert PostDoesNotExist();

        r.resolved = true;
        uint256 totalValid = r.totalValidStake;
        uint256 totalInvalid = r.totalInvalidStake;

        if (totalValid == totalInvalid) {
            _refundTie(postId, author, r);
            emit RoundResolved(postId, false, 0, 0);
            return;
        }

        bool invalidWins = totalInvalid > totalValid;
        if (invalidWins) {
            _slashAndSplit(postId, author, r);
            emit RoundResolved(postId, true, totalValid + postEntryFee, totalInvalid);
        } else {
            _refundValidAndAuthor(postId, author, r);
            emit RoundResolved(postId, false, 0, 0);
        }
    }

    function _refundTie(uint256 postId, address author, VerificationRound storage r) internal {
        (bool ok,) = author.call{ value: postEntryFee }("");
        if (!ok) revert TransferFailed();
        _refundStakers(postId, r, true);
        _refundStakers(postId, r, false);
    }

    function _refundStakers(uint256 postId, VerificationRound storage r, bool validSide) internal {
        address[] storage voters = validSide ? validVoters[postId] : invalidVoters[postId];
        for (uint256 i = 0; i < voters.length; i++) {
            address a = voters[i];
            uint256 amt = validSide ? r.validStake[a] : r.invalidStake[a];
            if (amt > 0) {
                if (validSide) r.validStake[a] = 0;
                else r.invalidStake[a] = 0;
                (bool ok,) = a.call{ value: amt }("");
                if (!ok) revert TransferFailed();
            }
        }
    }

    function _slashAndSplit(uint256 postId, address /* author */, VerificationRound storage r) internal {
        uint256 toSplit = r.totalValidStake + postEntryFee;
        uint256 invalidTotal = r.totalInvalidStake;
        if (invalidTotal == 0) return;
        address[] storage inv = invalidVoters[postId];
        for (uint256 i = 0; i < inv.length; i++) {
            address a = inv[i];
            uint256 stake = r.invalidStake[a];
            if (stake > 0) {
                uint256 share = (toSplit * stake) / invalidTotal;
                r.invalidStake[a] = 0;
                (bool ok,) = a.call{ value: share }("");
                if (!ok) revert TransferFailed();
            }
        }
        r.totalValidStake = 0;
        r.totalInvalidStake = 0;
    }

    function _refundValidAndAuthor(uint256 postId, address author, VerificationRound storage r) internal {
        (bool ok,) = author.call{ value: postEntryFee }("");
        if (!ok) revert TransferFailed();
        _refundStakers(postId, r, true);
        _refundStakers(postId, r, false);
        r.totalValidStake = 0;
        r.totalInvalidStake = 0;
    }

    // ---------- External Decision API ----------

    /**
     * @dev External address deposits ETH and posts a question (IPFS hash). Agents submit answers; winners paid by governance.
     */
    function postDecision(string calldata questionIpfsHash) external payable nonReentrant {
        if (msg.value == 0) revert MinimumStakeRequired();
        uint256 id = nextDecisionId++;
        decisionRequests[id] = DecisionRequest({
            id: id,
            requester: msg.sender,
            deposit: msg.value,
            questionIpfsHash: questionIpfsHash,
            endTime: block.timestamp + DECISION_PERIOD,
            resolved: false
        });
        emit DecisionPosted(id, msg.sender, msg.value, questionIpfsHash);
    }

    function submitDecisionAnswer(uint256 decisionId, string calldata answerIpfsHash) external onlyRegisteredAgent nonReentrant {
        DecisionRequest storage dr = decisionRequests[decisionId];
        if (dr.id == 0 || block.timestamp >= dr.endTime || dr.resolved) revert VotingClosed();
        if (decisionHasAnswered[decisionId][msg.sender]) revert AlreadyAnswered();

        decisionHasAnswered[decisionId][msg.sender] = true;
        decisionAnswers[decisionId][msg.sender] = answerIpfsHash;
        decisionAnswerers[decisionId].push(msg.sender);
        emit DecisionAnswer(decisionId, msg.sender, answerIpfsHash);
    }

    /**
     * @dev Governance sets winners (consensus determined off-chain). Splits deposit among winners.
     */
    function resolveDecision(uint256 decisionId, address[] calldata winners) external onlyGovernance nonReentrant {
        DecisionRequest storage dr = decisionRequests[decisionId];
        if (dr.id == 0 || block.timestamp < dr.endTime || dr.resolved) revert DecisionNotResolvable();
        dr.resolved = true;
        if (winners.length == 0) {
            (bool ok,) = dr.requester.call{ value: dr.deposit }("");
            if (!ok) revert TransferFailed();
            emit DecisionResolved(decisionId, winners, 0);
            return;
        }
        uint256 amountEach = dr.deposit / winners.length;
        for (uint256 i = 0; i < winners.length; i++) {
            (bool ok,) = winners[i].call{ value: amountEach }("");
            if (!ok) revert TransferFailed();
        }
        decisionWinners[decisionId] = winners;
        emit DecisionResolved(decisionId, winners, amountEach);
    }

    function getValidVoters(uint256 postId) external view returns (address[] memory) {
        return validVoters[postId];
    }

    function getInvalidVoters(uint256 postId) external view returns (address[] memory) {
        return invalidVoters[postId];
    }

    function getStake(uint256 postId, address voter, bool validSide) external view returns (uint256) {
        VerificationRound storage r = verificationRounds[postId];
        return validSide ? r.validStake[voter] : r.invalidStake[voter];
    }
}
