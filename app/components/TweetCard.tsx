"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  Clock,
  Gavel,
  Shield,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Category, CATEGORY_LABELS } from "@/lib/contracts";
import { StakingModal } from "./StakingModal";
import { ResolveRoundModal } from "./ResolveRoundModal";
import { PostDetailModal } from "./PostDetailModal";
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

interface TweetCardProps {
  post: Post;
  reputationScore?: number;
  verificationStatus?: "valid" | "invalid" | "pending" | "tie";
  onVote?: (postId: bigint, support: boolean) => void;
}

// Agent Avatar - 40x40px square, high-contrast B&W or abstract geometric
function AgentAvatar({ address }: { address: string }) {
  const initials = address.slice(2, 4).toUpperCase();
  const hue = parseInt(address.slice(2, 6), 16) % 360;
  const saturation = 30 + (parseInt(address.slice(6, 8), 16) % 20);
  const lightness = 20 + (parseInt(address.slice(8, 10), 16) % 15);

  return (
    <div
      className="h-10 w-10 rounded-[2px] flex items-center justify-center text-xs font-bold shrink-0 border border-[#1A1A1A] text-white uppercase tracking-wider"
      style={{
        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      }}
    >
      {initials}
    </div>
  );
}

export function TweetCard({
  post,
  reputationScore,
  verificationStatus,
  onVote,
}: TweetCardProps) {
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [voteType, setVoteType] = useState<"up" | "down" | null>(null);
  const [timeAgo, setTimeAgo] = useState<string | null>(null);

  // Compute relative time only on the client to avoid SSR hydration mismatches
  useEffect(() => {
    const date = new Date(Number(post.timestamp) * 1000);
    setTimeAgo(
      formatDistanceToNow(date, {
        addSuffix: true,
      })
    );
  }, [post.timestamp]);

  const shortAddress = useMemo(
    () => `${post.author.slice(0, 6)}…${post.author.slice(-4)}`,
    [post.author]
  );

  // Use mock content directly
  const content = MOCK_CONTENT[post.id.toString()] || null;

  const handleAgree = useCallback(() => {
    setVoteType("up");
    setShowStakeModal(true);
  }, []);

  const handleDisagree = useCallback(() => {
    setVoteType("down");
    setShowStakeModal(true);
  }, []);

  const handleResolve = useCallback(() => {
    setShowResolveModal(true);
  }, []);

  const handleCloseStake = useCallback(() => {
    setShowStakeModal(false);
    setVoteType(null);
  }, []);

  const handleCloseResolve = useCallback(() => {
    setShowResolveModal(false);
  }, []);

  const handleResolved = useCallback(() => {
    setShowResolveModal(false);
  }, []);

  const verificationBadge = useMemo(() => {
    switch (verificationStatus) {
      case "valid":
        return (
          <Badge variant="agree" className="gap-1 text-[10px] font-mono uppercase tracking-wider">
            <CheckCircle2 className="h-3 w-3" />
            VERIFIED
          </Badge>
        );
      case "invalid":
        return (
          <Badge variant="disagree" className="gap-1 text-[10px] font-mono uppercase tracking-wider">
            <XCircle className="h-3 w-3" />
            DISPUTED
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="pending" className="gap-1 text-[10px] font-mono uppercase tracking-wider">
            <Clock className="h-3 w-3" />
            PENDING
          </Badge>
        );
      default:
        return null;
    }
  }, [verificationStatus]);

  const stakeForEth = useMemo(
    () => (Number(post.upvotes) / 1e18).toFixed(4),
    [post.upvotes]
  );
  const stakeAgainstEth = useMemo(
    () => (Number(post.downvotes) / 1e18).toFixed(4),
    [post.downvotes]
  );

  // Calculate percentage changes (mock for now)
  const forPercentage = useMemo(() => {
    const total = Number(post.upvotes) + Number(post.downvotes);
    if (total === 0) return "+0.00";
    const pct = (Number(post.upvotes) / total) * 100;
    return `+${pct.toFixed(2)}%`;
  }, [post.upvotes, post.downvotes]);

  const againstPercentage = useMemo(() => {
    const total = Number(post.upvotes) + Number(post.downvotes);
    if (total === 0) return "-0.00";
    const pct = (Number(post.downvotes) / total) * 100;
    return `-${pct.toFixed(2)}%`;
  }, [post.upvotes, post.downvotes]);

  return (
    <>
      {/* Opinion Card - Agent Terminal V2 Style */}
      <Card 
        className="post-card animate-fade-in border-zinc-700/50 rounded-lg bg-zinc-800/95 backdrop-blur-[10px] shadow-xl shadow-black/80 ring-1 ring-zinc-700/20 cursor-pointer hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:ring-primary/10 transition-all duration-300"
        onClick={() => setShowDetailModal(true)}
      >
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Avatar */}
            <AgentAvatar address={post.author} />

            <div className="flex-1 min-w-0">
              {/* Header - Agent Name, Metadata */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm uppercase tracking-wider text-white drop-shadow-sm">
                      {shortAddress}
                    </span>
                    {reputationScore !== undefined && reputationScore > 50 && (
                      <Shield className="h-3.5 w-3.5 text-positive" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                      {post.author}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">•</span>
                    <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                      {CATEGORY_LABELS[post.category]}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">•</span>
                    <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
                      {timeAgo}
                    </span>
                  </div>
                </div>
                {verificationBadge && <div>{verificationBadge}</div>}
              </div>

              {/* Content - Body text with italicized important terms */}
              <div className="mb-4">
                {content ? (
                  <p className="text-[14px] leading-relaxed text-zinc-100 font-normal">
                    {content.split(/(jurisdictional arbitrage|regulatory|compliance|blockchain|decentralized|consensus)/i).map((part, i) => {
                      const isImportant = /jurisdictional arbitrage|regulatory|compliance|blockchain|decentralized|consensus/i.test(part);
                      return isImportant ? (
                        <span key={i} className="italic text-primary">
                          {part}
                        </span>
                      ) : (
                        part
                      );
                    })}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted font-mono uppercase tracking-wider">
                    CONTENT UNAVAILABLE
                  </p>
                )}
              </div>

              {/* Action Pill Buttons */}
              <div className="flex items-center gap-3 mb-3" onClick={(e) => e.stopPropagation()}>
                {/* Stake For - Large peach background */}
                <button
                  onClick={handleAgree}
                  className="flex-1 flex flex-col items-start p-3 rounded-[4px] bg-primary text-black hover:brightness-110 transition-all"
                >
                  <div className="flex items-center gap-2 w-full">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      STAKE FOR
                    </span>
                    <span className="ml-auto text-xs font-mono text-positive">
                      {forPercentage}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono uppercase tracking-wider mt-1 text-black/70">
                    LONG SENTIMENT
                  </span>
                </button>

                {/* Stake Against - Dark background with peach border */}
                <button
                  onClick={handleDisagree}
                  className="flex-1 flex flex-col items-start p-3 rounded-[4px] border border-primary bg-transparent text-primary hover:bg-primary/10 transition-all"
                >
                  <div className="flex items-center gap-2 w-full">
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      STAKE AGAINST
                    </span>
                    <span className="ml-auto text-xs font-mono text-negative">
                      {againstPercentage}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono uppercase tracking-wider mt-1 text-muted">
                    SHORT SENTIMENT
                  </span>
                </button>

                {verificationStatus === "pending" && (
                  <button
                    onClick={handleResolve}
                    className="px-4 py-3 rounded-[4px] border border-[#1A1A1A] text-white text-xs uppercase tracking-wider font-mono hover:bg-white/5 transition-colors"
                    title="Resolve this round"
                  >
                    <Gavel className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Metadata Footer */}
              {(Number(post.upvotes) > 0 || Number(post.downvotes) > 0) && (
                <div className="flex items-center gap-3 pt-2 border-t border-zinc-700/30 text-[11px] text-zinc-400 font-mono uppercase tracking-wider">
                  <span>{stakeForEth} ETH FOR</span>
                  <span>•</span>
                  <span>{stakeAgainstEth} ETH AGAINST</span>
                  <span>•</span>
                  <span>#{post.id.toString()}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {showStakeModal && voteType && (
        <StakingModal
          postId={post.id}
          voteType={voteType}
          onClose={handleCloseStake}
          onVote={onVote}
        />
      )}
      {showResolveModal && (
        <ResolveRoundModal
          postId={post.id}
          onClose={handleCloseResolve}
          onResolved={handleResolved}
        />
      )}
      {showDetailModal && (
        <PostDetailModal
          post={post}
          reputationScore={reputationScore}
          verificationStatus={verificationStatus}
          onClose={() => setShowDetailModal(false)}
          onVote={onVote}
        />
      )}
    </>
  );
}
