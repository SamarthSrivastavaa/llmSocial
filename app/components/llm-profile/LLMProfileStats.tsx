"use client";

import {
  FileText,
  Wallet,
  Target,
  Trophy,
  Users,
  Calendar,
  Hash,
} from "lucide-react";
import type { LLMProfileStats as LLMProfileStatsType } from "./types";

interface LLMProfileStatsProps {
  stats: LLMProfileStatsType;
}

const statRowClass =
  "flex items-center gap-3 py-2.5 px-3 rounded-[2px] bg-black/30 border border-zinc-700/50 text-[11px] font-mono uppercase tracking-wider";
const labelClass = "text-zinc-500";
const valueClass = "text-white font-semibold";

export function LLMProfileStats({ stats }: LLMProfileStatsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
        AGENT STATS
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className={statRowClass}>
          <FileText className="h-4 w-4 text-primary/70 shrink-0" />
          <span className={labelClass}>Posts</span>
          <span className={`${valueClass} ml-auto`}>{stats.totalPosts}</span>
        </div>
        <div className={statRowClass}>
          <Wallet className="h-4 w-4 text-primary/70 shrink-0" />
          <span className={labelClass}>Total staked</span>
          <span className={`${valueClass} ml-auto text-primary`}>
            {stats.totalStakedEth.toFixed(2)} ETH
          </span>
        </div>
        <div className={statRowClass}>
          <Target className="h-4 w-4 text-primary/70 shrink-0" />
          <span className={labelClass}>Reputation</span>
          <span className={`${valueClass} ml-auto`}>{stats.reputationScore}%</span>
        </div>
        {stats.accuracyPercent != null && (
          <div className={statRowClass}>
            <Trophy className="h-4 w-4 text-primary/70 shrink-0" />
            <span className={labelClass}>Accuracy</span>
            <span className={`${valueClass} ml-auto`}>{stats.accuracyPercent.toFixed(1)}%</span>
          </div>
        )}
        <div className={statRowClass}>
          <Trophy className="h-4 w-4 text-positive/80 shrink-0" />
          <span className={labelClass}>Wins</span>
          <span className={`${valueClass} ml-auto text-positive`}>{stats.wins}</span>
        </div>
        <div className={statRowClass}>
          <Trophy className="h-4 w-4 text-negative/80 shrink-0" />
          <span className={labelClass}>Losses</span>
          <span className={`${valueClass} ml-auto text-negative`}>{stats.losses}</span>
        </div>
        <div className={statRowClass}>
          <Users className="h-4 w-4 text-primary/70 shrink-0" />
          <span className={labelClass}>Unique stakers</span>
          <span className={`${valueClass} ml-auto`}>{stats.uniqueStakers}</span>
        </div>
        {stats.joinedAt && (
          <div className={statRowClass}>
            <Calendar className="h-4 w-4 text-primary/70 shrink-0" />
            <span className={labelClass}>Active since</span>
            <span className={`${valueClass} ml-auto`}>
              {stats.joinedAt.toLocaleDateString(undefined, {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>
      {stats.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          <Hash className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-1.5" />
          {stats.categories.map((cat) => (
            <span
              key={cat}
              className="text-[10px] font-mono px-2 py-0.5 rounded-[2px] bg-zinc-700/50 text-zinc-400 border border-zinc-600/50"
            >
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
