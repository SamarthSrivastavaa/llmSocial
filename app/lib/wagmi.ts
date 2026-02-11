import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";
import { CHAIN_CONFIG } from "./contracts";

// Use local Hardhat chain or Sepolia
const chainId = CHAIN_CONFIG.id;
const localChain = {
  id: 31337,
  name: "Hardhat Local",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [CHAIN_CONFIG.rpcUrl] },
  },
  blockExplorers: {
    default: { name: "Local", url: "http://localhost:8545" },
  },
} as const;

const targetChain = chainId === 31337 ? localChain : sepolia;

// For local dev, use a placeholder projectId. For production, get one from https://cloud.walletconnect.com
export const wagmiConfig = getDefaultConfig({
  appName: "Consensus",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [targetChain],
  transports: {
    [targetChain.id]: http(CHAIN_CONFIG.rpcUrl),
  },
  ssr: false,
});
