// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AgentRegistry } from "./AgentRegistry.sol";

/**
 * @title BackingPool
 * @dev Lets users back public agents with ETH. Agent can withdraw backed ETH to their wallet to post/stake.
 * No changes to StakingGame, SocialLedger, or AgentRegistry.
 */
contract BackingPool {
    AgentRegistry public agentRegistry;

    mapping(address => bool) public isPublic;
    mapping(address => mapping(address => uint256)) public backingAmount;
    mapping(address => uint256) public totalBacked;
    mapping(address => uint256) public totalWithdrawnByAgent;

    event SetPublic(address indexed agent, bool isPublic);
    event Backed(address indexed agent, address indexed backer, uint256 amount);
    event WithdrawnToAgent(address indexed agent, uint256 amount);

    error OnlyRegisteredAgent();
    error AgentNotPublic();
    error CannotBackSelf();
    error ZeroAmount();
    error TransferFailed();

    constructor(address _agentRegistry) {
        require(_agentRegistry != address(0), "ZeroAddress");
        agentRegistry = AgentRegistry(_agentRegistry);
    }

    /**
     * @dev Agent sets themselves as public (others can back) or private.
     */
    function setPublic(bool _isPublic) external {
        if (!agentRegistry.isRegistered(msg.sender)) revert OnlyRegisteredAgent();
        isPublic[msg.sender] = _isPublic;
        emit SetPublic(msg.sender, _isPublic);
    }

    /**
     * @dev Back an agent with ETH. Records your stake; agent can later withdraw to their wallet.
     */
    function back(address agent) external payable {
        if (msg.value == 0) revert ZeroAmount();
        if (!agentRegistry.isRegistered(agent)) revert OnlyRegisteredAgent();
        if (!isPublic[agent]) revert AgentNotPublic();
        if (agent == msg.sender) revert CannotBackSelf();

        backingAmount[agent][msg.sender] += msg.value;
        totalBacked[agent] += msg.value;
        emit Backed(agent, msg.sender, msg.value);
    }

    /**
     * @dev Agent withdraws all backed ETH to their wallet (to post/stake).
     */
    function withdrawToAgent() external {
        address agent = msg.sender;
        if (!agentRegistry.isRegistered(agent)) revert OnlyRegisteredAgent();

        uint256 available = totalBacked[agent] - totalWithdrawnByAgent[agent];
        if (available == 0) return;

        totalWithdrawnByAgent[agent] += available;
        (bool ok, ) = agent.call{ value: available }("");
        if (!ok) revert TransferFailed();
        emit WithdrawnToAgent(agent, available);
    }

    /**
     * @dev How much ETH is still held for this agent (not yet withdrawn).
     */
    function availableForAgent(address agent) external view returns (uint256) {
        return totalBacked[agent] - totalWithdrawnByAgent[agent];
    }
}
