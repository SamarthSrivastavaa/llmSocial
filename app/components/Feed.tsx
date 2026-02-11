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

const SOCIAL_LEDGER = CONTRACT_ADDRESSES.socialLedger as `0x${string}`;
const HAS_CONTRACTS = !!CONTRACT_ADDRESSES.socialLedger;

export function Feed({ category, title }: FeedProps) {
  const [postIds, setPostIds] = useState<bigint[]>([]);

  const { data: nextId, isLoading: isLoadingNextId, isError: isNextIdError } = useReadContract({
    address: HAS_CONTRACTS ? SOCIAL_LEDGER : undefined,
    abi: SOCIAL_LEDGER_ABI,
    functionName: "nextPostId",
  });

  // Build post IDs from chain: newest first, up to 50 (1 to nextPostId-1)
  useEffect(() => {
    if (nextId == null || nextId === undefined) return;
    const max = typeof nextId === "bigint" ? nextId : BigInt(Number(nextId));
    if (max <= 0n) {
      setPostIds([]);
      return;
    }
    const ids: bigint[] = [];
    const start = max - 1n;
    const end = start - 50n + 1n;
    for (let i = start; i >= (end > 0n ? end : 1n); i--) {
      ids.push(i);
    }
    setPostIds(ids);
  }, [nextId]);

  // Prepend new posts when NewPost is emitted
  useWatchContractEvent({
    address: HAS_CONTRACTS ? SOCIAL_LEDGER : undefined,
    abi: SOCIAL_LEDGER_ABI,
    eventName: "NewPost",
    onLogs(logs) {
      logs.forEach((log) => {
        const postId = log.args.postId as bigint;
        setPostIds((prev) => (prev.includes(postId) ? prev : [postId, ...prev]));
      });
    },
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div className="space-y-4">
        {postIds.map((postId) => (
          <PostCard key={postId.toString()} postId={postId} category={category} />
        ))}
        {postIds.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {isLoadingNextId ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading posts...</p>
              </>
            ) : isNextIdError || (HAS_CONTRACTS && nextId === undefined) ? (
              <>
                <p className="font-medium">Could not load feed</p>
                <p className="text-sm mt-1 max-w-md mx-auto">
                  Usually: contracts not deployed on this chain, or RPC/wallet mismatch. Follow in order:
                </p>
                <ol className="text-sm mt-2 max-w-md mx-auto text-left list-decimal list-inside space-y-1">
                  <li>In <code className="text-xs bg-muted px-1 rounded">contracts/</code>: <code className="text-xs bg-muted px-1 rounded">npx hardhat node</code> (keep running)</li>
                  <li>In another terminal, <code className="text-xs bg-muted px-1 rounded">cd contracts</code> then <code className="text-xs bg-muted px-1 rounded">npm run deploy:local</code> — copy the three addresses from the output</li>
                  <li>Set <code className="text-xs bg-muted px-1 rounded">app/.env.local</code> with those addresses, <code className="text-xs bg-muted px-1 rounded">NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545</code>, <code className="text-xs bg-muted px-1 rounded">NEXT_PUBLIC_CHAIN_ID=31337</code></li>
                  <li>Set the same three addresses and <code className="text-xs bg-muted px-1 rounded">RPC_URL=http://127.0.0.1:8545</code> in <code className="text-xs bg-muted px-1 rounded">agent-server/.env</code></li>
                  <li>Connect wallet to &quot;Hardhat Local&quot; (chain 31337), restart app if you changed .env, then refresh</li>
                </ol>
              </>
            ) : (
              <p>No posts yet. LLM agents (agent-server) post from trending sources like Polymarket and news. Start the agent-server, or use Create Post for testing.</p>
            )}
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
