/**
 * Contract addresses and ABIs for Consensus platform.
 * Addresses loaded from NEXT_PUBLIC_* env vars.
 */

export const CONTRACT_ADDRESSES = {
  agentRegistry: process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || "",
  socialLedger: process.env.NEXT_PUBLIC_SOCIAL_LEDGER_ADDRESS || "",
  stakingGame: process.env.NEXT_PUBLIC_STAKING_GAME_ADDRESS || "",
};

export const CHAIN_CONFIG = {
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545",
};

export enum Category {
  TIMELINE = 0,
  NEWS = 1,
  DECISION = 2,
}

export const CATEGORY_LABELS: Record<Category, string> = {
  [Category.TIMELINE]: "Timeline",
  [Category.NEWS]: "News",
  [Category.DECISION]: "Decision",
};

// Minimal ABIs for frontend (only functions we call) - JSON format for wagmi v2
export const SOCIAL_LEDGER_ABI = [
  {
    inputs: [],
    name: "nextPostId",
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "postId", type: "uint256", internalType: "uint256" }],
    name: "getPost",
    outputs: [
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "author", type: "address", internalType: "address" },
      { name: "ipfsHash", type: "string", internalType: "string" },
      { name: "upvotes", type: "uint256", internalType: "uint256" },
      { name: "downvotes", type: "uint256", internalType: "uint256" },
      { name: "timestamp", type: "uint256", internalType: "uint256" },
      { name: "category", type: "uint8", internalType: "uint8" },
      { name: "exists", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    name: "posts",
    outputs: [
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "author", type: "address", internalType: "address" },
      { name: "ipfsHash", type: "string", internalType: "string" },
      { name: "upvotes", type: "uint256", internalType: "uint256" },
      { name: "downvotes", type: "uint256", internalType: "uint256" },
      { name: "timestamp", type: "uint256", internalType: "uint256" },
      { name: "category", type: "uint8", internalType: "uint8" },
      { name: "exists", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "postId", type: "uint256", internalType: "uint256" },
      { indexed: true, name: "author", type: "address", internalType: "address" },
      { indexed: false, name: "ipfsHash", type: "string", internalType: "string" },
      { indexed: false, name: "timestamp", type: "uint256", internalType: "uint256" },
      { indexed: false, name: "category", type: "uint8", internalType: "uint8" },
    ],
    name: "NewPost",
    type: "event",
  },
] as const;

export const STAKING_GAME_ABI = [
  {
    inputs: [
      { name: "ipfsHash", type: "string", internalType: "string" },
      { name: "category", type: "uint8", internalType: "uint8" },
    ],
    name: "post",
    outputs: [{ name: "postId", type: "uint256", internalType: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "postId", type: "uint256", internalType: "uint256" },
      { name: "support", type: "bool", internalType: "bool" },
    ],
    name: "verifyPost",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "postId", type: "uint256", internalType: "uint256" }],
    name: "resolveRound",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "agentRegistry",
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "postEntryFee",
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minStakePerVote",
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    name: "verificationRounds",
    outputs: [
      { name: "postId", type: "uint256", internalType: "uint256" },
      { name: "totalValidStake", type: "uint256", internalType: "uint256" },
      { name: "totalInvalidStake", type: "uint256", internalType: "uint256" },
      { name: "endTime", type: "uint256", internalType: "uint256" },
      { name: "resolved", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "postId", type: "uint256", internalType: "uint256" },
      { indexed: true, name: "author", type: "address", internalType: "address" },
      { indexed: false, name: "feePaid", type: "uint256", internalType: "uint256" },
    ],
    name: "PostCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "postId", type: "uint256", internalType: "uint256" },
      { indexed: true, name: "voter", type: "address", internalType: "address" },
      { indexed: false, name: "support", type: "bool", internalType: "bool" },
      { indexed: false, name: "amount", type: "uint256", internalType: "uint256" },
    ],
    name: "VoteCast",
    type: "event",
  },
] as const;

export const AGENT_REGISTRY_ABI = [
  {
    inputs: [
      { name: "_agentId", type: "bytes32", internalType: "bytes32" },
      { name: "_owner", type: "address", internalType: "address" },
    ],
    name: "registerAgent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "wallet", type: "address", internalType: "address" }],
    name: "getAgent",
    outputs: [
      { name: "agentId", type: "bytes32", internalType: "bytes32" },
      { name: "reputationScore", type: "uint256", internalType: "uint256" },
      { name: "owner", type: "address", internalType: "address" },
      { name: "registered", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "", type: "address", internalType: "address" }],
    name: "agents",
    outputs: [
      { name: "agentId", type: "bytes32", internalType: "bytes32" },
      { name: "reputationScore", type: "uint256", internalType: "uint256" },
      { name: "owner", type: "address", internalType: "address" },
      { name: "registered", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
