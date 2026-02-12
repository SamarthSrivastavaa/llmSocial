"use client";

import { useMemo, useCallback } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { STAKING_GAME_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { Button } from "./ui/button";
import { TransactionOverlay } from "./TransactionOverlay";
import { X, CheckCircle2, XCircle, AlertCircle, Scale } from "lucide-react";

interface ResolveRoundModalProps {
  postId: bigint;
  onClose: () => void;
  onResolved?: () => void;
}

export function ResolveRoundModal({
  postId,
  onClose,
  onResolved,
}: ResolveRoundModalProps) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const { data: roundData } = useReadContract({
    address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
    abi: STAKING_GAME_ABI,
    functionName: "verificationRounds",
    args: [postId],
  });

  const handleResolve = useCallback(() => {
    writeContract({
      address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
      abi: STAKING_GAME_ABI,
      functionName: "resolveRound",
      args: [postId],
    });
  }, [postId, writeContract]);

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
  const canResolve =
    !resolved && endTime > 0 && Date.now() / 1000 >= endTime;

  const outcome = useMemo(() => {
    if (totalValid > totalInvalid)
      return {
        icon: CheckCircle2,
        color: "text-agree",
        bg: "bg-agree/[0.06]",
        label: "Consensus: Valid",
      };
    if (totalInvalid > totalValid)
      return {
        icon: XCircle,
        color: "text-disagree",
        bg: "bg-disagree/[0.06]",
        label: "Consensus: Disputed",
      };
    return {
      icon: AlertCircle,
      color: "text-pending",
      bg: "bg-pending/[0.06]",
      label: "Consensus: Undecided",
    };
  }, [totalValid, totalInvalid]);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#0A0A0A] border border-grid-line rounded-[4px] animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-white/5 flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Resolve Verification
              </h3>
              <p className="text-xs text-muted-foreground">
                Post #{postId.toString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[2px] hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-5 space-y-4">
          {resolved ? (
            <div className={`p-4 rounded-[4px] ${outcome.bg}`}>
              <div className={`flex items-center gap-2 ${outcome.color}`}>
                <outcome.icon className="h-5 w-5" />
                <span className="text-sm font-semibold">{outcome.label}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Stake comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[4px] bg-agree/[0.05]">
                  <p className="text-[11px] text-muted-foreground mb-0.5">
                    Valid
                  </p>
                  <p className="text-base font-semibold font-mono text-agree">
                    {(totalValid / 1e18).toFixed(4)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    ETH
                  </p>
                </div>
                <div className="p-3 rounded-[4px] bg-disagree/[0.05]">
                  <p className="text-[11px] text-muted-foreground mb-0.5">
                    Disputed
                  </p>
                  <p className="text-base font-semibold font-mono text-disagree">
                    {(totalInvalid / 1e18).toFixed(4)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    ETH
                  </p>
                </div>
              </div>

              {/* Status */}
              {canResolve ? (
                <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-[4px]">
                  Voting has ended — ready to resolve.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-[4px]">
                  Voting ends:{" "}
                  <span className="font-mono text-foreground">
                    {new Date(endTime * 1000).toLocaleString()}
                  </span>
                </p>
              )}
            </>
          )}

          {error && (
            <p className="text-xs text-disagree bg-disagree/[0.06] p-2.5 rounded-[4px]">
              {error.message}
            </p>
          )}
          {isSuccess && (
            <div className="flex items-center gap-2 text-xs text-agree bg-agree/[0.06] p-2.5 rounded-[4px]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Round resolved.
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {canResolve && !resolved && (
              <Button
                onClick={handleResolve}
                disabled={isPending || isConfirming || isSuccess}
                className="flex-1"
              >
                {isPending || isConfirming
                  ? "Resolving…"
                  : isSuccess
                  ? "Done"
                  : "Resolve Round"}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              className={!canResolve || resolved ? "flex-1" : ""}
            >
              {resolved ? "Close" : "Cancel"}
            </Button>
          </div>
        </div>
        <TransactionOverlay
          visible={isPending || isConfirming}
          title="Resolving Round"
          subtitle="Confirm in your wallet…"
        />
      </div>
    </div>
  );
}
