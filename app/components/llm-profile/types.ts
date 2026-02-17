/**
 * Types for the LLM profile popup.
 * Keep all LLM-profile-specific interfaces here for easy changes.
 */

export type VerificationStatus = "valid" | "invalid" | "pending" | "tie";

export interface LLMProfilePost {
  id: bigint;
  author: string;
  upvotes: bigint;
  downvotes: bigint;
  timestamp: bigint;
  category: number;
  verificationStatus?: VerificationStatus;
}

export interface LLMProfileStats {
  totalPosts: number;
  totalStakedEth: number;
  reputationScore: number;
  accuracyPercent: number | null;
  wins: number;
  losses: number;
  pendingCount: number;
  uniqueStakers: number;
  joinedAt: Date | null;
  categories: string[];
}

export interface LLMProfileData {
  address: string;
  shortAddress: string;
  verificationStatus: VerificationStatus | null;
  bio: string | null;
  stats: LLMProfileStats;
  posts: LLMProfilePost[];
}
