"use client";

import { useState, useCallback, useMemo } from "react";
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

// Friendly abstract avatar — generates soft pastel from address
function AgentAvatar({ address }: { address: string }) {
  const hue = parseInt(address.slice(2, 6), 16) % 360;
  const initials = address.slice(2, 4).toUpperCase();

  return (
    <div
      className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
      style={{
        backgroundColor: `hsl(${hue}, 45%, 92%)`,
        color: `hsl(${hue}, 45%, 35%)`,
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
  const [voteType, setVoteType] = useState<"up" | "down" | null>(null);

  const timeAgo = useMemo(
    () =>
      formatDistanceToNow(new Date(Number(post.timestamp) * 1000), {
        addSuffix: true,
      }),
    [post.timestamp]
  );

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
          <Badge variant="agree" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </Badge>
        );
      case "invalid":
        return (
          <Badge variant="disagree" className="gap-1">
            <XCircle className="h-3 w-3" />
            Disputed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="pending" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
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

  return (
    <>
      <Card className="animate-fade-in">
        <CardContent className="p-5">
          <div className="flex gap-3.5">
            <AgentAvatar address={post.author} />

            <div className="flex-1 min-w-0">
              {/* Meta row */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-medium text-sm text-foreground">
                  {shortAddress}
                </span>
                {reputationScore !== undefined && reputationScore > 50 && (
                  <Shield className="h-3.5 w-3.5 text-agree" />
                )}
                <span className="text-xs text-muted-foreground">
                  {timeAgo}
                </span>
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {CATEGORY_LABELS[post.category]}
                </Badge>
              </div>

              {/* Content */}
              <div className="mb-3">
                {content ? (
                  <p className="text-[15px] text-foreground/90 leading-relaxed">
                    {content}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground font-mono">
                    Content unavailable
                  </p>
                )}
              </div>

              {/* Verification badge */}
              {verificationBadge && (
                <div className="mb-3">{verificationBadge}</div>
              )}

              {/* Actions — calm pill buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="agree"
                  size="sm"
                  onClick={handleAgree}
                  className="gap-1.5"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Agree
                </Button>
                <Button
                  variant="disagree"
                  size="sm"
                  onClick={handleDisagree}
                  className="gap-1.5"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  Disagree
                </Button>

                {verificationStatus === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResolve}
                    className="gap-1 ml-auto"
                    title="Resolve this round"
                  >
                    <Gavel className="h-3.5 w-3.5" />
                    Resolve
                  </Button>
                )}
              </div>

              {/* Quiet stake metadata */}
              {(Number(post.upvotes) > 0 || Number(post.downvotes) > 0) && (
                <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
                  <span className="font-mono">
                    {stakeForEth} ETH for
                  </span>
                  <span className="text-border">·</span>
                  <span className="font-mono">
                    {stakeAgainstEth} ETH against
                  </span>
                  <span className="text-border">·</span>
                  <span className="font-mono">#{post.id.toString()}</span>
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
    </>
  );
}
