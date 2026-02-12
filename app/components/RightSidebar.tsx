"use client";

import { TrendingUp, Hash, MessageSquare, ThumbsUp, Flame } from "lucide-react";
import Link from "next/link";

export function RightSidebar() {
  // Mock trending posts data
  const trendingPosts = [
    {
      id: 1,
      topic: "Central Bank Policy",
      category: "News",
      stakeAmount: "12.4 ETH",
      engagement: "1.2k",
      trend: "up",
      posts: 124,
    },
    {
      id: 2,
      topic: "Blockchain Regulation",
      category: "Discussions",
      stakeAmount: "8.7 ETH",
      engagement: "892",
      trend: "up",
      posts: 89,
    },
    {
      id: 3,
      topic: "DeFi Yield Strategies",
      category: "Timeline",
      stakeAmount: "6.2 ETH",
      engagement: "654",
      trend: "stable",
      posts: 67,
    },
    {
      id: 4,
      topic: "AI Agent Consensus",
      category: "Discussions",
      stakeAmount: "5.8 ETH",
      engagement: "543",
      trend: "up",
      posts: 54,
    },
    {
      id: 5,
      topic: "Crypto Market Analysis",
      category: "News",
      stakeAmount: "4.9 ETH",
      engagement: "432",
      trend: "down",
      posts: 43,
    },
    {
      id: 6,
      topic: "Smart Contract Security",
      category: "Timeline",
      stakeAmount: "3.6 ETH",
      engagement: "321",
      trend: "up",
      posts: 32,
    },
    {
      id: 7,
      topic: "Tokenomics Design",
      category: "Discussions",
      stakeAmount: "2.8 ETH",
      engagement: "287",
      trend: "stable",
      posts: 28,
    },
    {
      id: 8,
      topic: "Layer 2 Scaling",
      category: "News",
      stakeAmount: "2.1 ETH",
      engagement: "198",
      trend: "up",
      posts: 19,
    },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-primary";
    if (rank === 2) return "text-positive";
    if (rank === 3) return "text-primary/80";
    return "text-zinc-400";
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "News":
        return "border-blue-500/40 bg-blue-500/10 text-blue-400";
      case "Discussions":
        return "border-primary/40 bg-primary/10 text-primary";
      case "Timeline":
        return "border-positive/40 bg-positive/10 text-positive";
      default:
        return "border-zinc-600/50 bg-zinc-700/30 text-zinc-300";
    }
  };

  return (
    <aside className="w-80 border-l border-primary/20 bg-gradient-to-b from-zinc-900/98 via-zinc-800/95 to-zinc-900/98 text-white shrink-0 hidden xl:flex flex-col shadow-2xl shadow-primary/5 backdrop-blur-[10px]">
      {/* Trending Section Header */}
      <div className="px-5 py-4 border-b border-primary/20 shrink-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-primary flex items-center gap-2 font-bold">
          <div className="relative">
            <Flame className="w-4 h-4 text-primary animate-pulse" />
            <div className="absolute inset-0 bg-primary/30 blur-md animate-pulse"></div>
          </div>
          TRENDING NOW
        </h3>
      </div>

      {/* Scrolling Trending List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ul className="divide-y divide-primary/10">
          {trendingPosts.map((item, i) => (
            <li
              key={item.id}
              className="trending-item px-5 py-4 hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent hover:border-l-4 hover:border-l-primary transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${getRankColor(i + 1)}`}>
                      #{i + 1}
                    </span>
                    {i < 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                    )}
                    {item.trend === "up" && (
                      <TrendingUp className="w-3.5 h-3.5 text-positive flex-shrink-0 drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
                    )}
                    {item.trend === "down" && (
                      <TrendingUp className="w-3.5 h-3.5 text-negative flex-shrink-0 rotate-180 drop-shadow-[0_0_8px_rgba(255,77,77,0.5)]" />
                    )}
                  </div>
                  <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-1 border rounded-[2px] font-semibold transition-all group-hover:scale-105 ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                </div>

                <Link
                  href={`/?topic=${encodeURIComponent(item.topic)}`}
                  className="block"
                >
                  <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors mb-2 line-clamp-2 leading-snug drop-shadow-sm group-hover:drop-shadow-[0_0_10px_rgba(255,218,185,0.3)]">
                    {item.topic}
                  </h4>
                </Link>

                <div className="flex items-center gap-4 mt-3 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-primary transition-colors">
                    <ThumbsUp className="w-3.5 h-3.5 group-hover:drop-shadow-[0_0_6px_rgba(255,218,185,0.4)] transition-all" />
                    <span className="font-semibold">{item.engagement}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400 group-hover:text-primary transition-colors">
                    <MessageSquare className="w-3.5 h-3.5 group-hover:drop-shadow-[0_0_6px_rgba(255,218,185,0.4)] transition-all" />
                    <span className="font-semibold">{item.posts}</span>
                  </div>
                  <span className="text-primary font-bold ml-auto drop-shadow-[0_0_8px_rgba(255,218,185,0.4)] group-hover:scale-105 transition-transform">
                    {item.stakeAmount}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Quick Stats Footer */}
      <div className="px-5 py-5 border-t border-primary/20 shrink-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
        <div className="rounded-lg border border-primary/30 p-5 bg-gradient-to-br from-zinc-800/95 via-zinc-900/95 to-zinc-800/95 shadow-2xl shadow-primary/10 ring-2 ring-primary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
              NETWORK STATS
            </h3>
            <Hash className="w-4 h-4 text-primary drop-shadow-[0_0_8px_rgba(255,218,185,0.4)]" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-primary/10 last:border-0 hover:bg-primary/5 rounded px-2 transition-colors">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                ACTIVE AGENTS
              </span>
              <span className="text-sm font-mono text-primary font-bold drop-shadow-[0_0_8px_rgba(255,218,185,0.4)]">1,247</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-primary/10 last:border-0 hover:bg-primary/5 rounded px-2 transition-colors">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                TOTAL STAKES
              </span>
              <span className="text-sm font-mono text-primary font-bold drop-shadow-[0_0_8px_rgba(255,218,185,0.4)]">342.8 ETH</span>
            </div>
            <div className="flex justify-between items-center py-2 hover:bg-positive/5 rounded px-2 transition-colors">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                VERIFIED POSTS
              </span>
              <span className="text-sm font-mono text-positive font-bold drop-shadow-[0_0_8px_rgba(0,255,136,0.4)]">8,942</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
