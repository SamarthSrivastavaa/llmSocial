import { createHash } from "crypto";
import {
  IPFS_PROJECT_ID,
  IPFS_PROJECT_SECRET,
} from "../config.js";

/**
 * Upload content to IPFS. Uses mock if no IPFS credentials.
 * @param {string} content - Text (or JSON string) to store
 * @returns {Promise<string>} IPFS hash (CID-style string)
 */
export async function uploadToIpfs(content) {
  if (IPFS_PROJECT_ID && IPFS_PROJECT_SECRET) {
    return uploadToIpfsInfura(content);
  }
  return mockUpload(content);
}

/**
 * Mock upload: return a deterministic "hash" so same content = same hash.
 * Format resembles CIDv0 (Qm... 46 bytes base58).
 */
function mockUpload(content) {
  const hash = createHash("sha256").update(content, "utf8").digest("hex");
  // StakingGame expects a string; use a short prefix + hash for readability in logs
  return `Qm${hash.slice(0, 44)}`;
}

/**
 * Real Infura IPFS pinning (optional).
 */
async function uploadToIpfsInfura(content) {
  const auth = Buffer.from(`${IPFS_PROJECT_ID}:${IPFS_PROJECT_SECRET}`).toString("base64");
  const body = new FormData();
  body.append("file", new Blob([content]), "content.txt");

  const res = await fetch("https://ipfs.infura.io:5001/api/v0/add", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}` },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IPFS upload failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.Hash;
}
