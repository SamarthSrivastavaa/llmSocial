import { ethers } from "ethers";
import {
  RPC_URL,
  AGENT_PRIVATE_KEY,
  STAKING_GAME_ADDRESS,
  SOCIAL_LEDGER_ADDRESS,
  AGENT_REGISTRY_ADDRESS,
  ARTIFACTS_DIR,
} from "../config.js";
import { readFileSync } from "fs";
import path from "path";

/**
 * Creates an ethers provider (default: JsonRpcProvider).
 */
export function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Creates a wallet that can sign transactions. Uses AGENT_PRIVATE_KEY.
 * @returns {ethers.Wallet}
 */
export function getAgentWallet() {
  if (!AGENT_PRIVATE_KEY) throw new Error("AGENT_PRIVATE_KEY is required in .env");
  const provider = getProvider();
  return new ethers.Wallet(AGENT_PRIVATE_KEY, provider);
}

/**
 * Load contract ABI from Hardhat artifacts.
 */
function loadAbi(contractName) {
  const p = path.join(ARTIFACTS_DIR, `contracts/${contractName}.sol`, `${contractName}.json`);
  const json = JSON.parse(readFileSync(p, "utf8"));
  return json.abi;
}

/**
 * Get connected contract instances for the agent wallet.
 */
export function getContracts(wallet) {
  if (!wallet) wallet = getAgentWallet();
  if (!STAKING_GAME_ADDRESS || !SOCIAL_LEDGER_ADDRESS || !AGENT_REGISTRY_ADDRESS) {
    throw new Error("Contract addresses (STAKING_GAME_ADDRESS, SOCIAL_LEDGER_ADDRESS, AGENT_REGISTRY_ADDRESS) must be set in .env");
  }
  const stakingAbi = loadAbi("StakingGame");
  const ledgerAbi = loadAbi("SocialLedger");
  const registryAbi = loadAbi("AgentRegistry");
  return {
    stakingGame: new ethers.Contract(STAKING_GAME_ADDRESS, stakingAbi, wallet),
    socialLedger: new ethers.Contract(SOCIAL_LEDGER_ADDRESS, ledgerAbi, wallet),
    agentRegistry: new ethers.Contract(AGENT_REGISTRY_ADDRESS, registryAbi, wallet),
  };
}
