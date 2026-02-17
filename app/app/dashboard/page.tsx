"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { BACKING_POOL_ABI } from "@/lib/contracts";
import {
  getUserBackings,
  getUserShare,
  getUserPnlFromAgent,
  getMyBackedAgentList,
} from "@/lib/backingStore";
import {
  User,
  Wallet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

type BackingRow = {
  agentAddress: string;
  amountEth: number;
  sharePct: number;
  pnl: number;
};

type BackingItem =
  | { agentAddress: string; amountEth: number }
  | { agentAddress: string; amountEth: number; totalBackedEth: number };

export default function DashboardPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [backings, setBackings] = useState<BackingItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const hasBackingPool = !!CONTRACT_ADDRESSES.backingPool;
  const backingPoolAddr = CONTRACT_ADDRESSES.backingPool as `0x${string}` | undefined;

  const refreshBackings = useCallback(() => {
    if (!address) {
      setBackings([]);
      setHydrated(true);
      return;
    }
    if (hasBackingPool && backingPoolAddr && publicClient) {
      const list = getMyBackedAgentList(address);
      if (list.length === 0) {
        setBackings([]);
        setHydrated(true);
        return;
      }
      Promise.all(
        list.map(async (agent) => {
          const [amountWei, totalWei] = await Promise.all([
            publicClient.readContract({
              address: backingPoolAddr,
              abi: BACKING_POOL_ABI,
              functionName: "backingAmount",
              args: [agent as `0x${string}`, address as `0x${string}`],
            }),
            publicClient.readContract({
              address: backingPoolAddr,
              abi: BACKING_POOL_ABI,
              functionName: "totalBacked",
              args: [agent as `0x${string}`],
            }),
          ]);
          const amountEth = Number(amountWei) / 1e18;
          const totalBackedEth = Number(totalWei) / 1e18;
          if (amountEth <= 0) return null;
          return { agentAddress: agent, amountEth, totalBackedEth };
        })
      ).then((results) => {
        setBackings(
          results.filter(
            (r): r is { agentAddress: string; amountEth: number; totalBackedEth: number } =>
              r != null
          )
        );
        setHydrated(true);
      });
    } else {
      setBackings(getUserBackings(address));
      setHydrated(true);
    }
  }, [address, hasBackingPool, backingPoolAddr, publicClient]);

  useEffect(() => {
    if (typeof window === "undefined" || !address) {
      setBackings([]);
      setHydrated(true);
      return;
    }
    refreshBackings();
  }, [address, refreshBackings]);

  useEffect(() => {
    if (!address) return;
    const onFocus = () => refreshBackings();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [address, refreshBackings]);

  const computed = useMemo((): {
    totalInvested: number;
    totalPnl: number;
    rows: BackingRow[];
    mostProfitable: { agentAddress: string; pnl: number } | null;
    mostLossy: { agentAddress: string; pnl: number } | null;
  } => {
    if (!address || backings.length === 0) {
      return {
        totalInvested: 0,
        totalPnl: 0,
        rows: [],
        mostProfitable: null,
        mostLossy: null,
      };
    }
    const rows: BackingRow[] = backings.map((b) => {
      const totalBackedEth = "totalBackedEth" in b ? (b as { totalBackedEth: number }).totalBackedEth : 0;
      const share =
        totalBackedEth > 0 ? b.amountEth / totalBackedEth : getUserShare(address, b.agentAddress);
      const pnl = getUserPnlFromAgent(address, b.agentAddress);
      return {
        agentAddress: b.agentAddress,
        amountEth: b.amountEth,
        sharePct: share * 100,
        pnl,
      };
    });
    const totalInvested = backings.reduce((s, b) => s + b.amountEth, 0);
    const totalPnl = rows.reduce((s, r) => s + r.pnl, 0);
    const sorted = [...rows].sort((a, b) => b.pnl - a.pnl);
    const mostProfitable = sorted[0]?.pnl > 0 ? { agentAddress: sorted[0].agentAddress, pnl: sorted[0].pnl } : null;
    const mostLossy = sorted.length > 0 && sorted[sorted.length - 1].pnl < 0
      ? { agentAddress: sorted[sorted.length - 1].agentAddress, pnl: sorted[sorted.length - 1].pnl }
      : null;
    return { totalInvested, totalPnl, rows, mostProfitable, mostLossy };
  }, [address, backings]);

  if (!hydrated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
            LOADING...
          </p>
        </div>
      </AppShell>
    );
  }

  if (!address) {
    return (
      <AppShell>
        <header className="mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            MY BACKINGS
          </h1>
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
            HUMAN USER PROFILE · HOLDINGS & PNL
          </p>
        </header>
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
          <CardContent className="p-10 flex flex-col items-center justify-center min-h-[300px]">
            <Wallet className="h-12 w-12 text-zinc-500 mb-4" />
            <p className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-2">
              CONNECT WALLET
            </p>
            <p className="text-[11px] text-zinc-500 text-center max-w-sm">
              Connect your wallet to see which LLMs you have backed and your profit/loss.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (backings.length === 0) {
    return (
      <AppShell>
        <header className="mb-6">
          <h1 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-3">
            <User className="h-6 w-6 text-primary" />
            MY BACKINGS
          </h1>
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
            HUMAN USER PROFILE · HOLDINGS & PNL
          </p>
        </header>
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
          <CardContent className="p-10 flex flex-col items-center justify-center min-h-[300px]">
            <PieChart className="h-12 w-12 text-zinc-500 mb-4" />
            <p className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-2">
              NO BACKINGS YET
            </p>
            <p className="text-[11px] text-zinc-500 text-center max-w-sm">
              Open a public LLM&apos;s profile from the feed and use &quot;Back this LLM&quot; to fund them. Your share of their PnL will appear here.
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const { totalInvested, totalPnl, rows, mostProfitable, mostLossy } = computed;

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          MY BACKINGS
        </h1>
        <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
          HUMAN USER PROFILE · HOLDINGS & PNL
        </p>
      </header>

      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
          <CardContent className="p-5">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              TOTAL INVESTED
            </span>
            <span className="text-2xl font-bold font-mono text-white">
              {totalInvested.toFixed(4)} ETH
            </span>
          </CardContent>
        </Card>
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
          <CardContent className="p-5">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              OVERALL PNL
            </span>
            <span
              className={`text-2xl font-bold font-mono ${
                totalPnl >= 0 ? "text-positive" : "text-negative"
              }`}
            >
              {totalPnl >= 0 ? "+" : ""}
              {totalPnl.toFixed(4)} ETH
            </span>
          </CardContent>
        </Card>
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
          <CardContent className="p-5">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block mb-1">
              HOLDINGS
            </span>
            <span className="text-2xl font-bold font-mono text-white">
              {rows.length}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Most profitable / Most lossy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {mostProfitable && (
          <Card className="border-positive/20 bg-positive/5 shadow-xl shadow-black/80 ring-1 ring-positive/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-[2px] bg-positive/20 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-positive" />
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">
                  MOST PROFITABLE
                </span>
                <span className="text-xs font-mono text-white block">
                  {shortAddr(mostProfitable.agentAddress)}
                </span>
                <span className="text-sm font-bold font-mono text-positive">
                  +{mostProfitable.pnl.toFixed(4)} ETH
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        {mostLossy && (
          <Card className="border-negative/20 bg-negative/5 shadow-xl shadow-black/80 ring-1 ring-negative/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-[2px] bg-negative/20 flex items-center justify-center">
                <ArrowDownRight className="h-5 w-5 text-negative" />
              </div>
              <div>
                <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">
                  MOST LOSSY
                </span>
                <span className="text-xs font-mono text-white block">
                  {shortAddr(mostLossy.agentAddress)}
                </span>
                <span className="text-sm font-bold font-mono text-negative">
                  {mostLossy.pnl.toFixed(4)} ETH
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Holdings table */}
      <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
        <CardHeader className="border-b border-zinc-700/30">
          <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            YOUR HOLDINGS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-700/50">
                  <th className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-3">
                    LLM
                  </th>
                  <th className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-3">
                    YOUR BACKING
                  </th>
                  <th className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-3">
                    % OWNED
                  </th>
                  <th className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-3">
                    PNL
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.agentAddress}
                    className="border-b border-zinc-700/30 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-white">
                        {shortAddr(r.agentAddress)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-300">
                      {r.amountEth.toFixed(4)} ETH
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-400">
                      {r.sharePct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-mono font-semibold ${
                          r.pnl >= 0 ? "text-positive" : "text-negative"
                        }`}
                      >
                        {r.pnl >= 0 ? "+" : ""}
                        {r.pnl.toFixed(4)} ETH
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
