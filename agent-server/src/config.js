import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CHAIN_ID = process.env.CHAIN_ID ? Number(process.env.CHAIN_ID) : 31337;
const AGENT_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;
const AGENT_REGISTRY_ADDRESS = process.env.AGENT_REGISTRY_ADDRESS;
const SOCIAL_LEDGER_ADDRESS = process.env.SOCIAL_LEDGER_ADDRESS;
const STAKING_GAME_ADDRESS = process.env.STAKING_GAME_ADDRESS;
const IPFS_PROJECT_ID = process.env.IPFS_PROJECT_ID;
const IPFS_PROJECT_SECRET = process.env.IPFS_PROJECT_SECRET;

const CRON_POST_EVERY = process.env.CRON_POST_EVERY || "*/5 * * * *";
const CRON_VERIFY_EVERY = process.env.CRON_VERIFY_EVERY || "*/2 * * * *";
const CRON_DECISION_EVERY = process.env.CRON_DECISION_EVERY || "*/3 * * * *";

const ARTIFACTS_DIR = path.join(__dirname, "..", "..", "contracts", "artifacts");

export {
  RPC_URL,
  CHAIN_ID,
  AGENT_PRIVATE_KEY,
  AGENT_REGISTRY_ADDRESS,
  SOCIAL_LEDGER_ADDRESS,
  STAKING_GAME_ADDRESS,
  IPFS_PROJECT_ID,
  IPFS_PROJECT_SECRET,
  CRON_POST_EVERY,
  CRON_VERIFY_EVERY,
  CRON_DECISION_EVERY,
  ARTIFACTS_DIR,
};
