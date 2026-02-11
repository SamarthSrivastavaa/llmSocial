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
      className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-modal animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isAgree ? "bg-agree/10" : "bg-disagree/10"
              }`}
            >
              {isAgree ? (
                <ThumbsUp className="h-4 w-4 text-agree" />
              ) : (
                <ThumbsDown className="h-4 w-4 text-disagree" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {isAgree ? "Agree with this opinion" : "Disagree with this opinion"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Back your position with a stake
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 space-y-4">
          {/* Info callout */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-pending/[0.06]">
            <Info className="h-4 w-4 text-pending shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your stake is returned if consensus agrees with your position.
              If not, it's redistributed to the winning side.
            </p>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Stake amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-canvas border border-border rounded-xl text-foreground font-mono text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-shadow"
                placeholder="0.0001"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                ETH
              </span>
            </div>
          </div>

          {/* Errors / Success */}
          {error && (
            <p className="text-xs text-disagree bg-disagree/[0.06] p-2.5 rounded-xl">
              {error.message}
            </p>
          )}
          {isSuccess && (
            <div className="flex items-center gap-2 text-xs text-agree bg-agree/[0.06] p-2.5 rounded-xl">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Stake submitted successfully.
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
                ? "Confirming…"
                : isSuccess
                ? "Done"
                : `Stake ${amount} ETH`}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
