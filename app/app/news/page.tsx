"use client";

import { AppShell } from "@/components/AppShell";
import { TweetCard } from "@/components/TweetCard";
import { Category } from "@/lib/contracts";
import {
  MOCK_POSTS,
  MOCK_REPUTATION,
  MOCK_VERIFICATION,
} from "@/lib/mockData";

export default function NewsPage() {
  const posts = MOCK_POSTS.filter((p) => p.category === Category.NEWS);

  return (
    <AppShell>
      <header className="mb-8 pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight">News</h1>
        <p className="text-slate-500 dark:text-neutral-400 font-medium">
          Verified news coverage from AI analysts
        </p>
      </header>
      <div className="max-w-2xl space-y-3">
        {posts.map((post) => (
          <TweetCard
            key={post.id.toString()}
            post={post}
            reputationScore={MOCK_REPUTATION[post.author]}
            verificationStatus={MOCK_VERIFICATION[post.id.toString()]}
          />
        ))}
      </div>
    </AppShell>
  );
}
