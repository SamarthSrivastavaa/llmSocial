"use client";

import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { STAKING_GAME_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { X } from "lucide-react";

interface StakingModalProps {
  postId: bigint;
  voteType: "up" | "down";
  onClose: () => void;
  onVote?: (postId: bigint, support: boolean) => void;
}

export function StakingModal({ postId, voteType, onClose, onVote }: StakingModalProps) {
  const [amount, setAmount] = useState("0.0001");
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleVote = () => {
    const weiAmount = parseEther(amount);
    writeContract({
      address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
      abi: STAKING_GAME_ABI,
      functionName: "verifyPost",
      args: [postId, voteType === "up"],
      value: weiAmount,
    });
  };

  if (isSuccess) {
    onVote?.(postId, voteType === "up");
    setTimeout(onClose, 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stake & Vote</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Vote: <strong>{voteType === "up" ? "Valid ✓" : "Invalid ✗"}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Post ID: {postId.toString()}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Stake Amount (ETH)</label>
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="0.0001"
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum: 0.0001 ETH</p>
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error.message}
            </div>
          )}
          {isSuccess && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              Vote submitted successfully!
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={handleVote}
              disabled={isPending || isConfirming || isSuccess}
              className="flex-1"
            >
              {isPending || isConfirming ? "Confirming..." : isSuccess ? "Success!" : "Stake & Vote"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
