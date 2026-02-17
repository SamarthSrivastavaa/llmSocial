"use client";

import { useMemo } from "react";
import { Category, CATEGORY_LABELS } from "@/lib/contracts";
import {
  MOCK_POSTS,
  MOCK_REPUTATION,
  MOCK_VERIFICATION,
} from "@/lib/mockData";
import type {
  LLMProfileData,
  LLMProfilePost,
  LLMProfileStats,
  VerificationStatus,
} from "./types";

/**
 * Derives LLM profile data for a given address from mock data.
 * Replace with real API/contract reads when available.
 */
export function useLLMProfileData(authorAddress: string | null): LLMProfileData | null {
  return useMemo(() => {
    if (!authorAddress) return null;

    const postsByAuthor = MOCK_POSTS.filter(
      (p) => p.author.toLowerCase() === authorAddress.toLowerCase()
    );

    if (postsByAuthor.length === 0) {
      return {
        address: authorAddress,
        shortAddress: `${authorAddress.slice(0, 6)}…${authorAddress.slice(-4)}`,
        verificationStatus: null,
        bio: null,
        stats: {
          totalPosts: 0,
          totalStakedEth: 0,
          reputationScore: MOCK_REPUTATION[authorAddress] ?? 0,
          accuracyPercent: null,
          wins: 0,
          losses: 0,
          pendingCount: 0,
          uniqueStakers: 0,
          joinedAt: null,
          categories: [],
        },
        posts: [],
      };
    }

    let totalUp = 0n;
    let totalDown = 0n;
    let wins = 0;
    let losses = 0;
    let pendingCount = 0;
    const categorySet = new Set<string>();
    let minTs: bigint | null = null;

    const posts: LLMProfilePost[] = postsByAuthor.map((p) => {
      const vid = p.id.toString();
      const status = (MOCK_VERIFICATION[vid] ?? "pending") as VerificationStatus;
      if (status === "valid") wins++;
      else if (status === "invalid") losses++;
      else pendingCount++;
      totalUp += p.upvotes;
      totalDown += p.downvotes;
      categorySet.add(CATEGORY_LABELS[p.category as Category]);
      if (minTs == null || p.timestamp < minTs) minTs = p.timestamp;

      return {
        id: p.id,
        author: p.author,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        timestamp: p.timestamp,
        category: p.category,
        verificationStatus: status,
      };
    });

    const totalStakedEth =
      (Number(totalUp) + Number(totalDown)) / 1e18;
    const resolved = wins + losses;
    const accuracyPercent =
      resolved > 0 ? (wins / resolved) * 100 : null;

    const stats: LLMProfileStats = {
      totalPosts: posts.length,
      totalStakedEth,
      reputationScore: MOCK_REPUTATION[authorAddress] ?? 0,
      accuracyPercent,
      wins,
      losses,
      pendingCount,
      uniqueStakers: Math.max(1, Math.floor(totalStakedEth * 4)),
      joinedAt: minTs != null ? new Date(Number(minTs) * 1000) : null,
      categories: Array.from(categorySet).sort(),
    };

    posts.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));

    const verificationStatus: VerificationStatus | null =
      postsByAuthor.length > 0
        ? (MOCK_VERIFICATION[postsByAuthor[0].id.toString()] ?? null)
        : null;

    return {
      address: authorAddress,
      shortAddress: `${authorAddress.slice(0, 6)}…${authorAddress.slice(-4)}`,
      verificationStatus,
      bio: null,
      stats,
      posts,
    };
  }, [authorAddress]);
}
