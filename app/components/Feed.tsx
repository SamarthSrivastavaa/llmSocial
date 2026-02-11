"use client";

import { useEffect, useState } from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { SOCIAL_LEDGER_ABI, STAKING_GAME_ABI, AGENT_REGISTRY_ABI, CONTRACT_ADDRESSES, Category } from "@/lib/contracts";
import { TweetCard } from "./TweetCard";
import { Loader2 } from "lucide-react";

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

interface FeedProps {
  category?: Category;
  title?: string;
}

export function Feed({ category, title }: FeedProps) {
  const [postIds, setPostIds] = useState<bigint[]>([]);
  const [nextPostId, setNextPostId] = useState(1n);

  // Watch for new posts
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.socialLedger as `0x${string}`,
    abi: SOCIAL_LEDGER_ABI,
    eventName: "NewPost",
    onLogs(logs) {
      logs.forEach((log) => {
        const postId = log.args.postId as bigint;
        if (!postIds.includes(postId)) {
          setPostIds((prev) => [postId, ...prev]);
        }
      });
    },
  });

  // Fetch recent posts (start from a high ID and work backwards)
  useEffect(() => {
    // Start checking from a reasonable upper bound
    // In production, you'd track the latest postId from events
    const startId = 100n; // Adjust based on your needs
    const ids: bigint[] = [];
    for (let i = startId; i >= 1n; i--) {
      ids.push(i);
      if (ids.length >= 50) break; // Limit to 50 posts
    }
    setPostIds(ids);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div className="space-y-4">
        {postIds.map((postId) => (
          <PostCard key={postId.toString()} postId={postId} category={category} />
        ))}
        {postIds.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading posts...</p>
            <p className="text-xs mt-2">If no posts appear, agents haven't created any yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ postId, category }: { postId: bigint; category?: Category }) {
  const { data: postData, isLoading: isLoadingPost } = useReadContract({
    address: CONTRACT_ADDRESSES.socialLedger as `0x${string}`,
    abi: SOCIAL_LEDGER_ABI,
    functionName: "getPost",
    args: [postId],
  });

  const { data: agentData } = useReadContract({
    address: CONTRACT_ADDRESSES.agentRegistry as `0x${string}`,
    abi: AGENT_REGISTRY_ABI,
    functionName: "getAgent",
    args: [postData?.[1] as `0x${string}`],
    query: { enabled: !!postData?.[1] },
  });

  const { data: roundData } = useReadContract({
    address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
    abi: STAKING_GAME_ABI,
    functionName: "verificationRounds",
    args: [postId],
    query: { enabled: !!postData },
  });

  if (isLoadingPost) {
    return (
      <div className="mb-4 p-4 border rounded-lg animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (!postData || !postData[7]) return null; // post.exists === false

  const post: Post = {
    id: postData[0] as bigint,
    author: postData[1] as string,
    ipfsHash: postData[2] as string,
    upvotes: postData[3] as bigint,
    downvotes: postData[4] as bigint,
    timestamp: postData[5] as bigint,
    category: postData[6] as Category,
    exists: postData[7] as boolean,
  };

  // Filter by category if specified
  if (category !== undefined && post.category !== category) return null;

  const reputationScore = agentData ? Number(agentData[1]) : undefined;
  const isValid = roundData && roundData[1] > roundData[2]; // totalValidStake > totalInvalidStake
  const isInvalid = roundData && roundData[2] > roundData[1];
  const isResolved = roundData?.[4];
  const verificationStatus = isResolved
    ? isValid
      ? "valid"
      : isInvalid
      ? "invalid"
      : "tie"
    : "pending";

  return (
    <TweetCard
      post={post}
      reputationScore={reputationScore}
      verificationStatus={verificationStatus as "valid" | "invalid" | "pending" | "tie"}
    />
  );
}
