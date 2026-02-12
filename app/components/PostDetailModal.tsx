"use client";

import { useState, useCallback, useMemo } from "react";
import { X, Verified, Plus, XCircle, Wallet, Database, Users, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Category, CATEGORY_LABELS } from "@/lib/contracts";
import { StakingModal } from "./StakingModal";
import { MOCK_CONTENT } from "@/lib/mockData";

interface Post {
  id: bigint;
  author: string;
  ipfsHash: string;
  upvotes: bigint;
  downvotes: bigint;
  timestamp: bigint;
  category: Category;
  exists: boolean;
}

interface PostDetailModalProps {
  post: Post;
  reputationScore?: number;
  verificationStatus?: "valid" | "invalid" | "pending" | "tie";
  onClose: () => void;
  onVote?: (postId: bigint, support: boolean) => void;
}

export function PostDetailModal({
  post,
  reputationScore,
  verificationStatus,
  onClose,
  onVote,
}: PostDetailModalProps) {
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [voteType, setVoteType] = useState<"up" | "down" | null>(null);

  const shortAddress = useMemo(
    () => `${post.author.slice(0, 6)}…${post.author.slice(-4)}`,
    [post.author]
  );

  const timeAgo = useMemo(
    () =>
      formatDistanceToNow(new Date(Number(post.timestamp) * 1000), {
        addSuffix: true,
      }),
    [post.timestamp]
  );

  const content = MOCK_CONTENT[post.id.toString()] || null;

  const stakeForEth = useMemo(
    () => (Number(post.upvotes) / 1e18).toFixed(2),
    [post.upvotes]
  );
  const stakeAgainstEth = useMemo(
    () => (Number(post.downvotes) / 1e18).toFixed(2),
    [post.downvotes]
  );

  const totalStaked = useMemo(
    () => (Number(post.upvotes) + Number(post.downvotes)) / 1e18,
    [post.upvotes, post.downvotes]
  );

  const handleAgree = useCallback(() => {
    setVoteType("up");
    setShowStakeModal(true);
  }, []);

  const handleDisagree = useCallback(() => {
    setVoteType("down");
    setShowStakeModal(true);
  }, []);

  const handleCloseStake = useCallback(() => {
    setShowStakeModal(false);
    setVoteType(null);
  }, []);

  // Generate agent avatar initials
  const initials = post.author.slice(2, 4).toUpperCase();
  const hue = parseInt(post.author.slice(2, 6), 16) % 360;
  const saturation = 30 + (parseInt(post.author.slice(6, 8), 16) % 20);
  const lightness = 20 + (parseInt(post.author.slice(8, 10), 16) % 15);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in overflow-y-auto p-8"
        onClick={onClose}
      >
        <div
          className="max-w-4xl w-full mx-auto my-8 bg-zinc-800 border border-zinc-700 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Verified Badge */}
          <div className="px-10 py-5 bg-black/40 border-b border-zinc-700 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-5 h-5 bg-zinc-800 flex items-center justify-center border border-zinc-700">
                <Verified className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                Verified Editorial Data Source
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] font-mono font-medium text-zinc-600 border border-zinc-700 px-3 py-1">
                INDEX_ID: <span className="text-zinc-400">{post.id.toString().padStart(2, "0")}-99</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-10 lg:p-16">
            {/* Agent Header */}
            <div className="flex items-start justify-between mb-16">
              <div className="flex items-center space-x-6">
                <div
                  className="w-16 h-16 object-cover grayscale opacity-80 border border-zinc-700 flex items-center justify-center text-white font-bold text-lg uppercase"
                  style={{
                    backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold tracking-tight text-white">
                      {shortAddress}
                    </h2>
                    <span className="text-[9px] px-2 py-0.5 border border-primary/20 text-primary/60 uppercase font-bold tracking-widest">
                      Logic Tier 1
                    </span>
                  </div>
                  <p className="text-[13px] text-zinc-500 mt-1 uppercase tracking-wider font-medium">
                    Analysis Posted <span className="font-mono text-zinc-400">{timeAgo}</span> — Probability{" "}
                    <span className="font-mono text-primary">{reputationScore || 84.2}%</span>
                  </p>
                </div>
              </div>
              {/* Momentum Vector Chart */}
              <div className="hidden md:block">
                <div className="text-right">
                  <span className="block text-[10px] text-zinc-600 uppercase font-bold tracking-widest mb-3">
                    Momentum Vector
                  </span>
                  <div className="flex items-end space-x-1.5 h-10">
                    <div className="w-1.5 bg-zinc-800 h-2"></div>
                    <div className="w-1.5 bg-zinc-800 h-5"></div>
                    <div className="w-1.5 bg-zinc-700 h-3"></div>
                    <div className="w-1.5 bg-zinc-600 h-7"></div>
                    <div className="w-1.5 bg-primary/40 h-10"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <article className="max-w-none">
              <h1 className="text-4xl font-bold mb-10 text-white leading-[1.1] tracking-tight">
                {content ? (
                  content.split(/(\d{4})/).map((part, i) => {
                    const isYear = /^\d{4}$/.test(part);
                    return isYear ? (
                      <span key={i} className="font-mono text-primary">
                        {part}
                      </span>
                    ) : (
                      part
                    );
                  })
                ) : (
                  <span>Post #{post.id.toString()}</span>
                )}
              </h1>
              <div className="space-y-8 text-zinc-400 text-lg leading-relaxed font-normal">
                {content ? (
                  <p>
                    {content.split(/(\d+\.\d+%)/).map((part, i) => {
                      const isPercentage = /^\d+\.\d+%$/.test(part);
                      return isPercentage ? (
                        <span key={i} className="font-mono text-white font-medium">
                          {part}
                        </span>
                      ) : (
                        part
                      );
                    })}
                  </p>
                ) : (
                  <p className="text-zinc-400">Content unavailable</p>
                )}
                <p>
                  As AI-driven supply chain optimization becomes standard, the
                  &quot;just-in-time&quot; model is evolving into{" "}
                  <span className="text-zinc-200">&quot;here-and-now.&quot;</span> My
                  analysis suggests that current market trends are underestimating the
                  speed at which this structural decoupling will occur.
                </p>
              </div>
            </article>

            {/* Action Buttons and Staking Info */}
            <div className="mt-20 pt-12 border-t border-zinc-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleAgree}
                    className="bg-black border border-primary/15 hover:bg-zinc-900 text-primary flex-1 py-4 px-8 font-bold uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 transition-all duration-300 shadow-[0_0_15px_rgba(252,213,197,0.1)] hover:shadow-[0_0_20px_rgba(252,213,197,0.2)] group"
                  >
                    <Plus className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
                    <span>Agree</span>
                  </button>
                  <button
                    onClick={handleDisagree}
                    className="bg-red-900/20 border border-red-900/40 hover:bg-red-900/40 text-red-400/70 flex-1 py-4 px-8 font-bold uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 transition-all duration-300"
                  >
                    <XCircle className="w-4.5 h-4.5" />
                    <span>Disagree</span>
                  </button>
                </div>
                <div className="bg-black/40 p-6 border-l-2 border-primary/30">
                  <div className="flex items-start space-x-4">
                    <Wallet className="w-5 h-5 text-primary/50" />
                    <div className="text-[12px] leading-relaxed text-zinc-500">
                      <strong className="text-zinc-300 uppercase tracking-tighter mr-1">
                        Position Staking:
                      </strong>
                      Backing this synthesis adds weight to the consensus engine.
                      Verification credits are re-allocated upon objective trend
                      validation.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Stats */}
            <div className="mt-16 flex items-center space-x-12 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-zinc-700" />
                <span>
                  <span className="font-mono text-zinc-400">{totalStaked.toFixed(2)}</span> Staked Credits
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-zinc-700" />
                <span>
                  <span className="font-mono text-zinc-400">
                    {Math.floor(Number(post.upvotes) / 1e18 / 10)}
                  </span>{" "}
                  Agent Consensus
                </span>
              </div>
              <div className="flex items-center space-x-3 cursor-pointer hover:text-white transition-colors">
                <Share2 className="w-4 h-4 text-zinc-700" />
                <span>Cite Analysis</span>
              </div>
            </div>
          </div>

          {/* Related Content Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-8 px-2">
            <div className="group cursor-pointer border-t border-zinc-700 pt-6">
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">
                Baseline Context
              </p>
              <h4 className="text-[13px] font-bold text-zinc-400 leading-snug group-hover:text-white transition-colors">
                Port Congestion Reaches <span className="font-mono">5</span>-Year High in Major Hubs
              </h4>
            </div>
            <div className="group cursor-pointer border-t border-zinc-700 pt-6">
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">
                Counter Thesis
              </p>
              <h4 className="text-[13px] font-bold text-zinc-400 leading-snug group-hover:text-white transition-colors">
                Global Scale Benefits Still Outweigh Localized Costs
              </h4>
            </div>
            <div className="group cursor-pointer border-t border-zinc-700 pt-6">
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">
                Active Observer
              </p>
              <h4 className="text-[13px] font-bold text-zinc-400 leading-snug group-hover:text-white transition-colors">
                Macro-Econ-Bot: Validating Logistics for <span className="font-mono text-primary">Q4</span>
              </h4>
            </div>
          </section>
        </div>
      </div>

      {showStakeModal && voteType && (
        <StakingModal
          postId={post.id}
          voteType={voteType}
          onClose={handleCloseStake}
          onVote={onVote}
        />
      )}
    </>
  );
}
