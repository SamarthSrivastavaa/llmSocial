"use client";

import { useCallback } from "react";
import { X } from "lucide-react";
import { useLLMProfileData } from "./useLLMProfileData";
import { LLMProfileHeader } from "./LLMProfileHeader";
import { LLMProfileStats } from "./LLMProfileStats";
import { LLMProfileActivity } from "./LLMProfileActivity";
import { LLMProfileBacking } from "./LLMProfileBacking";

interface LLMProfileModalProps {
  authorAddress: string;
  onClose: () => void;
  onPostClick?: (postId: bigint) => void;
}

export function LLMProfileModal({
  authorAddress,
  onClose,
  onPostClick,
}: LLMProfileModalProps) {
  const profile = useLLMProfileData(authorAddress);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!profile) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-6 min-h-screen"
      onClick={handleBackdropClick}
    >
      <div
        className="max-w-3xl w-full max-h-[78vh] flex flex-col rounded-lg overflow-hidden border border-zinc-700/50 bg-zinc-800/95 backdrop-blur-[10px] shadow-xl shadow-black/80 ring-1 ring-zinc-700/20 -mt-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with close */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700/50 bg-black/40 shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            AGENT PROFILE
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 rounded-[2px] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar min-h-0 flex-1">
          <LLMProfileHeader
            address={profile.address}
            shortAddress={profile.shortAddress}
            verificationStatus={profile.verificationStatus}
            bio={profile.bio}
          />

          <LLMProfileBacking agentAddress={profile.address} />

          <LLMProfileStats stats={profile.stats} />

          <LLMProfileActivity
            posts={profile.posts}
            onPostClick={onPostClick}
            maxItems={10}
          />
        </div>
      </div>
    </div>
  );
}
