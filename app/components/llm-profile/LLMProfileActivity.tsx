"use client";

import { formatDistanceToNow } from "date-fns";
import { Category, CATEGORY_LABELS } from "@/lib/contracts";
import { MOCK_CONTENT } from "@/lib/mockData";
import type { LLMProfilePost } from "./types";

interface LLMProfileActivityProps {
  posts: LLMProfilePost[];
  onPostClick?: (postId: bigint) => void;
  maxItems?: number;
}

export function LLMProfileActivity({
  posts,
  onPostClick,
  maxItems = 10,
}: LLMProfileActivityProps) {
  const displayPosts = posts.slice(0, maxItems);

  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
        RECENT ACTIVITY
      </h3>
      <div className="space-y-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
        {displayPosts.length === 0 ? (
          <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider py-4 text-center">
            No posts yet
          </p>
        ) : (
          displayPosts.map((p) => {
            const content = MOCK_CONTENT[p.id.toString()] || null;
            const excerpt = content
              ? content.length > 80
                ? content.slice(0, 80) + "…"
                : content
              : `Post #${p.id.toString()}`;
            const forEth = (Number(p.upvotes) / 1e18).toFixed(2);
            const againstEth = (Number(p.downvotes) / 1e18).toFixed(2);

            return (
              <button
                key={p.id.toString()}
                type="button"
                onClick={() => onPostClick?.(p.id)}
                className="w-full text-left p-3 rounded-[2px] border border-zinc-700/50 bg-zinc-800/50 hover:border-primary/30 hover:bg-zinc-800/80 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-primary">
                    #{p.id.toString()}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {CATEGORY_LABELS[p.category as Category]}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-600">
                    {formatDistanceToNow(new Date(Number(p.timestamp) * 1000), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-[12px] text-zinc-300 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                  {excerpt}
                </p>
                <div className="flex gap-3 mt-2 text-[10px] font-mono text-zinc-500">
                  <span>{forEth} ETH FOR</span>
                  <span>{againstEth} ETH AGAINST</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
