"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Clock, Loader2, Gavel } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Category, CATEGORY_LABELS } from "@/lib/contracts";
import { StakingModal } from "./StakingModal";
import { ResolveRoundModal } from "./ResolveRoundModal";
import { fetchFromIpfs, formatIpfsHash } from "@/lib/ipfs";

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

export function TweetCard({ post, reputationScore, verificationStatus, onVote }: TweetCardProps) {
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [voteType, setVoteType] = useState<"up" | "down" | null>(null);
  const [ipfsContent, setIpfsContent] = useState<string | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const timeAgo = formatDistanceToNow(new Date(Number(post.timestamp) * 1000), { addSuffix: true });
  const shortAddress = `${post.author.slice(0, 6)}...${post.author.slice(-4)}`;

  useEffect(() => {
    const loadContent = async () => {
      setIsLoadingContent(true);
      const content = await fetchFromIpfs(post.ipfsHash);
      setIpfsContent(content);
      setIsLoadingContent(false);
    };
    loadContent();
  }, [post.ipfsHash]);

  const getVerificationBadge = () => {
    if (verificationStatus === "valid") {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    if (verificationStatus === "invalid") {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Disputed
        </Badge>
      );
    }
    if (verificationStatus === "pending") {
      return (
        <Badge variant="secondary">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {shortAddress.slice(2, 4).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{shortAddress}</span>
                {reputationScore !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    Rep: {reputationScore}
                  </Badge>
                )}
                {getVerificationBadge()}
                <Badge variant="outline" className="text-xs">
                  {CATEGORY_LABELS[post.category]}
                </Badge>
                <span className="text-xs text-muted-foreground">· {timeAgo}</span>
              </div>
              <div className="text-sm mb-3 whitespace-pre-wrap break-words">
                {isLoadingContent ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading content from IPFS...</span>
                  </div>
                ) : ipfsContent ? (
                  <p className="mb-2">{ipfsContent}</p>
                ) : (
                  <div className="text-muted-foreground">
                    <p className="mb-1">[IPFS: {formatIpfsHash(post.ipfsHash)}]</p>
                    <p className="text-xs italic">Content not available on IPFS gateways</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVoteType("up");
                    setShowStakeModal(true);
                  }}
                  className="gap-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {post.upvotes.toString()}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setVoteType("down");
                    setShowStakeModal(true);
                  }}
                  className="gap-1"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {post.downvotes.toString()}
                </Button>
                {verificationStatus === "pending" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResolveModal(true)}
                    className="gap-1"
                    title="Resolve round"
                  >
                    <Gavel className="h-4 w-4" />
                    Resolve
                  </Button>
                )}
                <span className="text-xs">ID: {post.id.toString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showStakeModal && voteType && (
        <StakingModal
          postId={post.id}
          voteType={voteType}
          onClose={() => {
            setShowStakeModal(false);
            setVoteType(null);
          }}
          onVote={onVote}
        />
      )}
      {showResolveModal && (
        <ResolveRoundModal
          postId={post.id}
          onClose={() => setShowResolveModal(false)}
          onResolved={() => {
            setShowResolveModal(false);
            // Refresh or update UI
          }}
        />
      )}
    </>
  );
}
