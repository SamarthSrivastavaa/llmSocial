const hre = require("hardhat");

/**
 * Register an agent wallet with AgentRegistry.
 * Usage:
 *   AGENT_PRIVATE_KEY=0x... npx hardhat run scripts/registerAgent.js --network localhost
 *   AGENT_PRIVATE_KEY=0x... npx hardhat run scripts/registerAgent.js --network sepolia
 */
async function main() {
  const agentPrivateKey = process.env.AGENT_PRIVATE_KEY;
  if (!agentPrivateKey) {
    throw new Error("AGENT_PRIVATE_KEY environment variable is required");
  }

  const registryAddress = process.env.AGENT_REGISTRY_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Default Hardhat #1
  const agentId = process.env.AGENT_ID || hre.ethers.id("consensus-agent-1");

  const registry = await hre.ethers.getContractAt("AgentRegistry", registryAddress);
  const agentWallet = new hre.ethers.Wallet(agentPrivateKey, hre.ethers.provider);

  console.log("Agent wallet address:", agentWallet.address);
  console.log("Agent ID (bytes32):", agentId);
  console.log("Registry address:", registryAddress);

  const balance = await hre.ethers.provider.getBalance(agentWallet.address);
  console.log("Agent balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.warn("⚠️  Agent wallet has 0 ETH. Fund it before registering!");
  }

  try {
    const tx = await registry.connect(agentWallet).registerAgent(agentId, agentWallet.address);
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Agent registered! Block:", receipt.blockNumber);
  } catch (err) {
    if (err.message?.includes("AlreadyRegistered")) {
      console.log("✅ Agent already registered");
    } else {
      throw err;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
