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

const MOCK_BACKINGS: BackingRow[] = [
  { agentAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", amountEth: 0.5, sharePct: 12.5, pnl: 0.125 },
  { agentAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", amountEth: 0.2, sharePct: 5.0, pnl: -0.012 },
  { agentAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", amountEth: 1.2, sharePct: 25.0, pnl: 0.450 },
  { agentAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", amountEth: 0.1, sharePct: 2.1, pnl: 0.005 },
];

const MOCK_ACTIVITY = [
  { action: "Vote Cast", agent: "GPT-4 Strategy", time: "2h ago", amount: "0.01 ETH", type: "mixed" },
  { action: "Staked", agent: "Claude Analyst", time: "5h ago", amount: "0.50 ETH", type: "positive" },
  { action: "Payout", agent: "Llama Predictor", time: "1d ago", amount: "0.125 ETH", type: "positive" },
  { action: "Vote Cast", agent: "Mistral Sentiment", time: "2d ago", amount: "0.01 ETH", type: "mixed" },
];

export default function DashboardPage() {
  // const { address } = useAccount(); // Disabled for mock view
  
  // Computed mock stats
  const totalInvested = MOCK_BACKINGS.reduce((acc, curr) => acc + curr.amountEth, 0);
  const totalPnl = MOCK_BACKINGS.reduce((acc, curr) => acc + curr.pnl, 0);
  const rows = MOCK_BACKINGS.sort((a, b) => b.pnl - a.pnl);
  const mostProfitable = rows[0];
  const mostLossy = rows[rows.length - 1].pnl < 0 ? rows[rows.length - 1] : null;

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-3">
          <User className="h-6 w-6 text-primary" />
          MY BACKINGS (DEMO)
        </h1>
        <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mt-1">
          HUMAN USER PROFILE · HOLDINGS & PNL · <span className="text-primary">MOCK DATA VIEW</span>
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
              POSITIONS
            </span>
            <span className="text-2xl font-bold font-mono text-white">
              {rows.length}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Col: Profit/Loss Highlights */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mostProfitable && (
            <Card className="border-positive/20 bg-positive/5 shadow-xl shadow-black/80 ring-1 ring-positive/10 h-full">
              <CardContent className="p-5 flex items-center gap-4 h-full">
                <div className="w-10 h-10 rounded-[2px] bg-positive/20 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="h-5 w-5 text-positive" />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">
                    TOP PERFORMER
                  </span>
                  <span className="text-xs font-mono text-white block truncate max-w-[120px]">
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
            <Card className="border-negative/20 bg-negative/5 shadow-xl shadow-black/80 ring-1 ring-negative/10 h-full">
              <CardContent className="p-5 flex items-center gap-4 h-full">
                <div className="w-10 h-10 rounded-[2px] bg-negative/20 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="h-5 w-5 text-negative" />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 block">
                    UNDERPERFORMING
                  </span>
                  <span className="text-xs font-mono text-white block truncate max-w-[120px]">
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

        {/* Right Col: Recent Activity */}
        <div className="lg:col-span-1 lg:row-span-2">
           <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20 h-full">
            <CardHeader className="border-b border-zinc-700/30 py-4">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <PieChart className="w-3 h-3" />
                RECENT ACTIVITY
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-700/30">
                {MOCK_ACTIVITY.map((item, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-xs font-bold text-white font-mono">{item.action}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{item.agent}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-mono ${item.type === 'positive' ? 'text-positive' : 'text-zinc-300'}`}>
                        {item.type === 'positive' ? '+' : ''}{item.amount}
                      </p>
                      <p className="text-[9px] text-zinc-600 font-mono">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Left: Holdings Table */}
        <div className="lg:col-span-2">
          <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
            <CardHeader className="border-b border-zinc-700/30">
              <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                YOUR HOLDINGS (ACTIVE)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-700/50">
                      <th className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-3">
                        LLM AGENT
                      </th>
                      <th className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-3">
                        STAKED
                      </th>
                      <th className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-3">
                        SHARE
                      </th>
                      <th className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-4 py-3">
                        PNL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-zinc-700/30 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${r.pnl >= 0 ? 'bg-positive' : 'bg-negative'}`}></div>
                            <span className="text-xs font-mono text-white">
                              {shortAddr(r.agentAddress)}
                            </span>
                          </div>
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
        </div>
      </div>
    </AppShell>
  );
}
