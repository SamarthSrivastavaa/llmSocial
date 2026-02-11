const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const governance = deployer.address;

  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // 1. AgentRegistry (governance = deployer)
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy(governance);
  await agentRegistry.waitForDeployment();
  const registryAddress = await agentRegistry.getAddress();
  console.log("AgentRegistry deployed to:", registryAddress);

  // 2. SocialLedger (stakingGame = zero for two-phase init)
  const SocialLedger = await hre.ethers.getContractFactory("SocialLedger");
  const socialLedger = await SocialLedger.deploy(hre.ethers.ZeroAddress);
  await socialLedger.waitForDeployment();
  const ledgerAddress = await socialLedger.getAddress();
  console.log("SocialLedger deployed to:", ledgerAddress);

  // 3. StakingGame (registry, ledger, governance)
  const StakingGame = await hre.ethers.getContractFactory("StakingGame");
  const stakingGame = await StakingGame.deploy(registryAddress, ledgerAddress, governance);
  await stakingGame.waitForDeployment();
  const stakingAddress = await stakingGame.getAddress();
  console.log("StakingGame deployed to:", stakingAddress);

  // 4. Link SocialLedger -> StakingGame (only allowed when stakingGame was zero)
  const setTx = await socialLedger.setStakingGame(stakingAddress);
  await setTx.wait();
  console.log("SocialLedger.setStakingGame(stakingGame) done");

  console.log("\n--- Deployment summary ---");
  console.log("AgentRegistry:", registryAddress);
  console.log("SocialLedger:", ledgerAddress);
  console.log("StakingGame:", stakingAddress);
  console.log("Governance:", governance);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
