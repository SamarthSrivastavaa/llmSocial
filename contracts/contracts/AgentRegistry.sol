// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @dev Maps wallet addresses to Agent IDs, stores reputation and owner. Slashing only via Governance.
 */
contract AgentRegistry {
    struct Agent {
        bytes32 agentId;
        uint256 reputationScore;
        address owner;
        bool registered;
    }

    mapping(address => Agent) public agents;
    mapping(bytes32 => address) public agentIdToAddress;

    address public governance;

    event AgentRegistered(address indexed wallet, bytes32 indexed agentId, address indexed owner);
    event AgentSlashed(address indexed agent, uint256 amount, address indexed by);
    event GovernanceUpdated(address indexed previousGov, address indexed newGov);

    error OnlyGovernance();
    error AgentNotRegistered();
    error InsufficientReputation();
    error ZeroAddress();
    error AlreadyRegistered();

    modifier onlyGovernance() {
        if (msg.sender != governance) revert OnlyGovernance();
        _;
    }

    constructor(address _governance) {
        if (_governance == address(0)) revert ZeroAddress();
        governance = _governance;
        emit GovernanceUpdated(address(0), _governance);
    }

    function registerAgent(bytes32 _agentId, address _owner) external {
        if (agents[msg.sender].registered) revert AlreadyRegistered();
        if (_owner == address(0)) _owner = msg.sender;

        agents[msg.sender] = Agent({
            agentId: _agentId,
            reputationScore: 1000, // initial score
            owner: _owner,
            registered: true
        });
        agentIdToAddress[_agentId] = msg.sender;
        emit AgentRegistered(msg.sender, _agentId, _owner);
    }

    function getAgent(address wallet) external view returns (bytes32 agentId, uint256 reputationScore, address owner, bool registered) {
        Agent storage a = agents[wallet];
        return (a.agentId, a.reputationScore, a.owner, a.registered);
    }

    function slashAgent(address agent, uint256 amount) external onlyGovernance {
        Agent storage a = agents[agent];
        if (!a.registered) revert AgentNotRegistered();
        if (a.reputationScore < amount) revert InsufficientReputation();

        a.reputationScore -= amount;
        emit AgentSlashed(agent, amount, msg.sender);
    }

    function addReputation(address agent, uint256 amount) external onlyGovernance {
        Agent storage a = agents[agent];
        if (!a.registered) revert AgentNotRegistered();
        a.reputationScore += amount;
    }

    function setGovernance(address _governance) external onlyGovernance {
        if (_governance == address(0)) revert ZeroAddress();
        address previous = governance;
        governance = _governance;
        emit GovernanceUpdated(previous, _governance);
    }

    function isRegistered(address wallet) external view returns (bool) {
        return agents[wallet].registered;
    }
}
