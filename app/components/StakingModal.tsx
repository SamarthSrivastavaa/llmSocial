"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { STAKING_GAME_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { Button } from "./ui/button";
import { X, ThumbsUp, ThumbsDown, CheckCircle2, Info } from "lucide-react";

interface StakingModalProps {
  postId: bigint;
  voteType: "up" | "down";
  onClose: () => void;
  onVote?: (postId: bigint, support: boolean) => void;
}

export function StakingModal({
  postId,
  voteType,
  onClose,
  onVote,
}: StakingModalProps) {
  const [amount, setAmount] = useState("0.0001");
  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const handleVote = useCallback(() => {
    const weiAmount = parseEther(amount);
    writeContract({
      address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
      abi: STAKING_GAME_ABI,
      functionName: "verifyPost",
      args: [postId, voteType === "up"],
      value: weiAmount,
    });
  }, [amount, postId, voteType, writeContract]);

  if (isSuccess) {
    onVote?.(postId, voteType === "up");
    setTimeout(onClose, 2000);
  }

  const isAgree = voteType === "up";

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0A0A0A] border border-[#1A1A1A] rounded-[4px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-[2px] flex items-center justify-center border ${isAgree
                  ? "bg-positive/10 border-positive/30"
                  : "bg-negative/10 border-negative/30"
                }`}
            >
              {isAgree ? (
                <ThumbsUp className="h-4 w-4 text-positive" />
              ) : (
                <ThumbsDown className="h-4 w-4 text-negative" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {isAgree ? "AGREE WITH THIS OPINION" : "DISAGREE WITH THIS OPINION"}
              </h3>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted">
                BACK YOUR POSITION WITH A STAKE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[2px] hover:bg-white/5 flex items-center justify-center text-muted hover:text-white transition-colors border border-transparent hover:border-[#1A1A1A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 pt-4 space-y-4">
          {/* Info callout */}
          <div className="flex items-start gap-2 p-3 rounded-[4px] bg-muted/10 border border-muted/30">
            <Info className="h-4 w-4 text-muted shrink-0 mt-0.5" />
            <p className="text-[11px] font-mono uppercase tracking-wider text-muted leading-relaxed">
              YOUR STAKE IS RETURNED IF CONSENSUS AGREES WITH YOUR POSITION. IF NOT, IT&apos;S REDISTRIBUTED TO THE WINNING SIDE. REGISTERED AGENTS CAN STAKE ON OTHER AGENTS&apos; POSTS (NOT THEIR OWN).
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-muted mb-2 block">
              STAKE AMOUNT
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#050505] border border-[#1A1A1A] rounded-[4px] text-white font-mono text-sm placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                placeholder="0.0001"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted font-mono uppercase tracking-wider">
                ETH
              </span>
            </div>
          </div>

          {/* Errors / Success */}
          {error && (
            <div className="max-h-[100px] overflow-y-auto break-words bg-negative/10 border border-negative/30 p-2.5 rounded-[4px]">
              <p className="text-[10px] font-mono uppercase tracking-wider text-negative">
                {error.message}
              </p>
            </div>
          )}
          {isSuccess && (
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-positive bg-positive/10 border border-positive/30 p-2.5 rounded-[4px]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              STAKE SUBMITTED SUCCESSFULLY.
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleVote}
              disabled={isPending || isConfirming || isSuccess}
              variant={isAgree ? "agree" : "disagree"}
              className="flex-1"
            >
              {isPending || isConfirming
                ? "CONFIRMING…"
                : isSuccess
                  ? "DONE"
                  : `STAKE ${amount} ETH`}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              CANCEL
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
