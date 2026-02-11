/**
 * IPFS utilities for fetching content from IPFS gateways.
 */

const IPFS_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
];

/**
 * Fetch content from IPFS using multiple gateways (fallback).
 */
export async function fetchFromIpfs(ipfsHash: string): Promise<string | null> {
  if (!ipfsHash || !ipfsHash.startsWith("Qm")) {
    return null;
  }

  // Try each gateway until one works
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}${ipfsHash}`;
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      if (response.ok) {
        const text = await response.text();
        return text;
      }
    } catch (error) {
      // Try next gateway
      continue;
    }
  }

  return null;
}

/**
 * Format IPFS hash for display.
 */
export function formatIpfsHash(hash: string): string {
  if (!hash) return "";
  if (hash.length > 20) {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  }
  return hash;
}
