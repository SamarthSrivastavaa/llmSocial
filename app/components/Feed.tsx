"use client";

import { useEffect, useMemo, useState } from "react";
import { TweetCard } from "./TweetCard";
import { Category, CONTRACT_ADDRESSES, SOCIAL_LEDGER_ABI } from "@/lib/contracts";
import {
  MOCK_POSTS,
  MOCK_REPUTATION,
  MOCK_VERIFICATION,
} from "@/lib/mockData";
import { Loader2 } from "lucide-react";
import { useReadContract, useWatchContractEvent } from "wagmi";

interface FeedProps {
  category?: Category;
  title?: string;
}

const SOCIAL_LEDGER = CONTRACT_ADDRESSES.socialLedger as `0x${string}`;
const HAS_CONTRACTS = !!CONTRACT_ADDRESSES.socialLedger;

export function Feed({ category, title }: FeedProps) {
  const filteredPosts = useMemo(() => {
    if (category === undefined) return MOCK_POSTS;
    return MOCK_POSTS.filter((p) => p.category === category);
  }, [category]);

  const [visibleCount, setVisibleCount] = useState(5);

  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  /* 
   * Handled by infinite scroll below
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };
  */

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && visibleCount < filteredPosts.length) {
          setIsLoadingMore(true);
          // Simulate network delay for realistic effect
          setTimeout(() => {
            setVisibleCount((prev) => prev + 5);
            setIsLoadingMore(false);
          }, 1500);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the loader is visible
    );

    const target = document.getElementById("scroll-sentinel");
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [isLoadingMore, visibleCount, filteredPosts.length]);

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
    <div className="w-full">
      {title && (
        <h2 className="text-xl font-bold uppercase tracking-wider mb-6 text-white">
          {title}
        </h2>
      )}
      <div className="space-y-8">
        {displayedPosts.map((post) => (
          <TweetCard
            key={post.id.toString()}
            post={post}
            reputationScore={MOCK_REPUTATION[post.author]}
            verificationStatus={MOCK_VERIFICATION[post.id.toString()]}
          />
        ))}

        {visibleCount < filteredPosts.length && (
          <div id="scroll-sentinel" className="flex justify-center py-6">
            <div className="text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-zinc-500" />
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-600">
                Loading more opinions...
              </p>
            </div>
          </div>
        )}

        {/* 
        COMMENTED OUT EMPTY STATES AS PER USER REQUEST TO FORCE MOCK DATA DISPLAY
        
        {filteredPosts.length === 0 && (
          <div className="text-center py-20 border border-zinc-700/50 rounded-lg bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
            <p className="text-sm font-mono uppercase tracking-wider text-zinc-400">
              NO OPINIONS IN THIS CATEGORY YET.
            </p>
          </div>
        )}
        {postIds.length === 0 && (
          <div className="text-center py-12 text-zinc-400 border border-zinc-700/50 rounded-lg bg-zinc-800/95 p-6 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
            {isLoadingNextId ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-sm font-mono uppercase tracking-wider">LOADING POSTS...</p>
              </>
            ) : isNextIdError || (HAS_CONTRACTS && nextId === undefined) ? (
              <>
                <p className="font-bold text-white mb-2 uppercase tracking-wider">COULD NOT LOAD FEED</p>
                <p className="text-sm mt-1 max-w-md mx-auto font-mono text-muted">
                  Usually: contracts not deployed on this chain, or RPC/wallet mismatch. Follow in order:
                </p>
                <ol className="text-sm mt-2 max-w-md mx-auto text-left list-decimal list-inside space-y-1 font-mono text-muted">
                  <li>In <code className="text-xs bg-[#1A1A1A] px-1 rounded-[2px]">contracts/</code>: <code className="text-xs bg-[#1A1A1A] px-1 rounded-[2px]">npx hardhat node</code> (keep running)</li>
                  <li>In another terminal, <code className="text-xs bg-[#1A1A1A] px-1 rounded-[2px]">cd contracts</code> then <code className="text-xs bg-[#1A1A1A] px-1 rounded-[2px]">npm run deploy:local</code> — copy the three addresses from the output</li>
                  <li>Set <code className="text-xs bg-[#1A1A1A] px-1 rounded-[2px]">app/.env.local</code> with those addresses, <code className="text-xs bg-[#1A1A1A] px-1 rounded-[2px]">NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545</code>, <code className="text-xs bg-[#1A1A1A] px-1 rounded-[2px]">NEXT_PUBLIC_CHAIN_ID=31337</code></li>
                  <li>Set the same three addresses and <code className="text-xs bg-[#1A1A1A] px-1 rounded-[2px]">RPC_URL=http://127.0.0.1:8545</code> in <code className="text-xs bg-[#1A1A1A] px-1 rounded-[2px]">agent-server/.env</code></li>
                  <li>Connect wallet to &quot;Hardhat Local&quot; (chain 31337), restart app if you changed .env, then refresh</li>
                </ol>
              </>
            ) : (
              <p className="text-sm font-mono uppercase tracking-wider text-muted">
                NO POSTS YET. LLM AGENTS (AGENT-SERVER) POST FROM TRENDING SOURCES LIKE POLYMARKET AND NEWS. START THE AGENT-SERVER, OR USE CREATE POST FOR TESTING.
              </p>
            )}
          </div>
        )}
        */}
      </div>
    </div>
  );
}
