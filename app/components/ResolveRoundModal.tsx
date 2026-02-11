"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { STAKING_GAME_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { X, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface ResolveRoundModalProps {
  postId: bigint;
  onClose: () => void;
  onResolved?: () => void;
}

export function ResolveRoundModal({ postId, onClose, onResolved }: ResolveRoundModalProps) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: roundData } = useReadContract({
    address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
    abi: STAKING_GAME_ABI,
    functionName: "verificationRounds",
    args: [postId],
  });

  const handleResolve = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
      abi: STAKING_GAME_ABI,
      functionName: "resolveRound",
      args: [postId],
    });
  };

  if (isSuccess) {
    setTimeout(() => {
      onResolved?.();
      onClose();
    }, 2000);
  }

  const totalValid = roundData?.[1] ? Number(roundData[1]) : 0;
  const totalInvalid = roundData?.[2] ? Number(roundData[2]) : 0;
  const endTime = roundData?.[3] ? Number(roundData[3]) : 0;
  const resolved = roundData?.[4] || false;
  const canResolve = !resolved && endTime > 0 && Date.now() / 1000 >= endTime;

  const getOutcome = () => {
    if (totalValid > totalInvalid) return { type: "valid", icon: CheckCircle2, color: "text-green-600" };
    if (totalInvalid > totalValid) return { type: "invalid", icon: XCircle, color: "text-red-600" };
    return { type: "tie", icon: AlertCircle, color: "text-yellow-600" };
  };

  const outcome = getOutcome();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resolve Verification Round</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Post ID: {postId.toString()}</p>
            {resolved ? (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Already Resolved</p>
                <div className={`flex items-center gap-2 ${outcome.color}`}>
                  <outcome.icon className="h-4 w-4" />
                  <span className="text-sm">
                    {outcome.type === "valid" ? "Valid" : outcome.type === "invalid" ? "Invalid" : "Tie"}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 border rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Valid Stakes</p>
                    <p className="text-lg font-semibold text-green-600">
                      {(totalValid / 1e18).toFixed(4)} ETH
                    </p>
                  </div>
                  <div className="p-3 border rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Invalid Stakes</p>
                    <p className="text-lg font-semibold text-red-600">
                      {(totalInvalid / 1e18).toFixed(4)} ETH
                    </p>
                  </div>
                </div>
                {canResolve ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                    <p className="text-sm text-yellow-800">
                      Voting period has ended. You can resolve this round.
                    </p>
                    {totalValid > totalInvalid && (
                      <p className="text-xs text-yellow-700 mt-1">
                        Valid wins → Author and valid voters get refunded
                      </p>
                    )}
                    {totalInvalid > totalValid && (
                      <p className="text-xs text-yellow-700 mt-1">
                        Invalid wins → Author and valid voters get slashed, invalid voters split funds
                      </p>
                    )}
                    {totalValid === totalInvalid && (
                      <p className="text-xs text-yellow-700 mt-1">Tie → All funds refunded</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-md mb-4">
                    <p className="text-sm text-muted-foreground">
                      Voting period ends: {new Date(endTime * 1000).toLocaleString()}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error.message}
            </div>
          )}
          {isSuccess && (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              Round resolved successfully!
            </div>
          )}
          <div className="flex gap-2">
            {canResolve && !resolved && (
              <Button
                onClick={handleResolve}
                disabled={isPending || isConfirming || isSuccess}
                className="flex-1"
              >
                {isPending || isConfirming ? "Resolving..." : isSuccess ? "Resolved!" : "Resolve Round"}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              {resolved ? "Close" : "Cancel"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
