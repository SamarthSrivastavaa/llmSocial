/**
 * Client-side store for agent public/private and user backings.
 * Persists to localStorage. Use only in client components.
 */

const KEY_AGENT_PUBLIC = "llmedia_agent_public";
const KEY_BACKINGS = "llmedia_backings";
const KEY_MY_BACKED_AGENTS = "llmedia_my_backed_agents";

export type BackingRecord = { agentAddress: string; amountEth: number };

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/** Map agent address -> isPublic (default false = private) */
export function getAgentPublicMap(): Record<string, boolean> {
  return readJson<Record<string, boolean>>(KEY_AGENT_PUBLIC, {});
}

export function setAgentPublic(agentAddress: string, isPublic: boolean): void {
  const m = getAgentPublicMap();
  m[agentAddress.toLowerCase()] = isPublic;
  writeJson(KEY_AGENT_PUBLIC, m);
}

export function isAgentPublic(agentAddress: string): boolean {
  return !!getAgentPublicMap()[agentAddress.toLowerCase()];
}

/** Map userAddress -> { agentAddress -> amountEth } */
function getBackingsRaw(): Record<string, Record<string, number>> {
  return readJson<Record<string, Record<string, number>>>(KEY_BACKINGS, {});
}

export function getUserBackings(userAddress: string): BackingRecord[] {
  const raw = getBackingsRaw();
  const user = raw[userAddress?.toLowerCase() ?? ""] ?? {};
  return Object.entries(user)
    .filter(([, amount]) => amount > 0)
    .map(([agentAddress, amountEth]) => ({ agentAddress, amountEth }));
}

export function getUserBackingAmount(
  userAddress: string,
  agentAddress: string
): number {
  const raw = getBackingsRaw();
  return raw[userAddress?.toLowerCase() ?? ""]?.[agentAddress.toLowerCase()] ?? 0;
}

export function addBacking(
  userAddress: string,
  agentAddress: string,
  amountEth: number
): void {
  if (!userAddress || !agentAddress || amountEth <= 0) return;
  const raw = getBackingsRaw();
  const u = userAddress.toLowerCase();
  const a = agentAddress.toLowerCase();
  if (!raw[u]) raw[u] = {};
  raw[u][a] = (raw[u][a] ?? 0) + amountEth;
  writeJson(KEY_BACKINGS, raw);
}

/** Total ETH backed for an agent (all users) */
export function getTotalBackedForAgent(agentAddress: string): number {
  const raw = getBackingsRaw();
  const a = agentAddress.toLowerCase();
  let total = 0;
  for (const user of Object.values(raw)) {
    total += user[a] ?? 0;
  }
  return total;
}

/** Deterministic mock PnL per agent (ETH) for demo. Replace with real data when available. */
export function getMockPnlForAgent(agentAddress: string): number {
  let h = 0;
  const s = agentAddress.toLowerCase();
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const t = (h % 1000) / 1000;
  return (t - 0.5) * 0.4;
}

/** User's share of an agent (0-1) based on their backing vs total backed. */
export function getUserShare(
  userAddress: string,
  agentAddress: string
): number {
  const raw = getBackingsRaw();
  const my = raw[userAddress?.toLowerCase() ?? ""]?.[agentAddress.toLowerCase()] ?? 0;
  const total = getTotalBackedForAgent(agentAddress);
  if (total <= 0) return 0;
  return my / total;
}

/** User's PnL from one agent = share * agent PnL. */
export function getUserPnlFromAgent(
  userAddress: string,
  agentAddress: string
): number {
  const share = getUserShare(userAddress, agentAddress);
  const agentPnl = getMockPnlForAgent(agentAddress);
  return share * agentPnl;
}

/** List of agent addresses this user has backed (for contract mode: dashboard queries chain for these). */
export function getMyBackedAgentList(userAddress: string): string[] {
  const key = `${KEY_MY_BACKED_AGENTS}_${userAddress?.toLowerCase() ?? ""}`;
  return readJson<string[]>(key, []);
}

export function addMyBackedAgent(userAddress: string, agentAddress: string): void {
  if (!userAddress || !agentAddress) return;
  const key = `${KEY_MY_BACKED_AGENTS}_${userAddress.toLowerCase()}`;
  const list = readJson<string[]>(key, []);
  const a = agentAddress.toLowerCase();
  if (list.includes(a)) return;
  list.push(a);
  writeJson(key, list);
}
