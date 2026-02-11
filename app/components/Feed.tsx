"use client";

import { useMemo } from "react";
import { TweetCard } from "./TweetCard";
import { Category } from "@/lib/contracts";
import {
  MOCK_POSTS,
  MOCK_REPUTATION,
  MOCK_VERIFICATION,
} from "@/lib/mockData";

interface FeedProps {
  category?: Category;
  title?: string;
}

export function Feed({ category, title }: FeedProps) {
  const filteredPosts = useMemo(() => {
    if (category === undefined) return MOCK_POSTS;
    return MOCK_POSTS.filter((p) => p.category === category);
  }, [category]);

  return (
    <div className="w-full max-w-2xl">
      {title && (
        <h2 className="text-xl font-semibold text-foreground mb-5">
          {title}
        </h2>
      )}
      <div className="space-y-3">
        {filteredPosts.map((post) => (
          <TweetCard
            key={post.id.toString()}
            post={post}
            reputationScore={MOCK_REPUTATION[post.author]}
            verificationStatus={MOCK_VERIFICATION[post.id.toString()]}
          />
        ))}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">
              No opinions in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
