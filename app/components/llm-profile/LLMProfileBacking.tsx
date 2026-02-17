"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { BACKING_POOL_ABI } from "@/lib/contracts";
import {
  isAgentPublic as isAgentPublicLocal,
  getTotalBackedForAgent,
  addBacking,
  getUserShare,
  getUserBackingAmount,
  addMyBackedAgent,
} from "@/lib/backingStore";
import { Coins, Loader2 } from "lucide-react";

interface LLMProfileBackingProps {
  agentAddress: string;
}

export function LLMProfileBacking({ agentAddress }: LLMProfileBackingProps) {
  const { address: userAddress } = useAccount();
  const [amount, setAmount] = useState("0.01");
  const [totalBacked, setTotalBacked] = useState(0);
  const [myBacked, setMyBacked] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  const hasBackingPool = !!CONTRACT_ADDRESSES.backingPool;
  const backingPoolAddr = CONTRACT_ADDRESSES.backingPool as `0x${string}` | undefined;

  const { data: contractIsPublic } = useReadContract({
    address: hasBackingPool ? backingPoolAddr : undefined,
    abi: BACKING_POOL_ABI,
    functionName: "isPublic",
    args: [agentAddress as `0x${string}`],
  });

  const { data: contractTotalBackedWei, refetch: refetchTotal } = useReadContract({
    address: hasBackingPool ? backingPoolAddr : undefined,
    abi: BACKING_POOL_ABI,
    functionName: "totalBacked",
    args: [agentAddress as `0x${string}`],
  });

  const { data: contractMyBackedWei, refetch: refetchMy } = useReadContract({
    address: hasBackingPool && userAddress ? backingPoolAddr : undefined,
    abi: BACKING_POOL_ABI,
    functionName: "backingAmount",
    args: [agentAddress as `0x${string}`, userAddress as `0x${string}`],
  });

  const { writeContract, data: backHash, isPending: isBackPending } = useWriteContract();
  const { isLoading: isBackConfirming, isSuccess: isBackSuccess } =
    useWaitForTransactionReceipt({ hash: backHash });

  useEffect(() => {
    if (isBackSuccess) {
      addMyBackedAgent(userAddress ?? "", agentAddress);
      refetchTotal();
      refetchMy();
      setAmount("0.01");
    }
  }, [isBackSuccess, userAddress, agentAddress, refetchTotal, refetchMy]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasBackingPool) {
      if (contractTotalBackedWei !== undefined)
        setTotalBacked(Number(contractTotalBackedWei) / 1e18);
      if (contractMyBackedWei !== undefined)
        setMyBacked(Number(contractMyBackedWei) / 1e18);
    } else {
      setTotalBacked(getTotalBackedForAgent(agentAddress));
      setMyBacked(userAddress ? getUserBackingAmount(userAddress, agentAddress) : 0);
    }
    setHydrated(true);
  }, [
    hasBackingPool,
    agentAddress,
    userAddress,
    contractTotalBackedWei,
    contractMyBackedWei,
  ]);

  const handleFund = useCallback(() => {
    if (!userAddress || !agentAddress) return;
    const eth = parseFloat(amount);
    if (Number.isNaN(eth) || eth <= 0) return;

    if (hasBackingPool && backingPoolAddr) {
      writeContract({
        address: backingPoolAddr,
        abi: BACKING_POOL_ABI,
        functionName: "back",
        args: [agentAddress as `0x${string}`],
        value: parseEther(amount),
      });
    } else {
      addBacking(userAddress, agentAddress, eth);
      setTotalBacked((t) => t + eth);
      setMyBacked((m) => m + eth);
      setAmount("0.01");
    }
  }, [userAddress, agentAddress, amount, hasBackingPool, backingPoolAddr, writeContract]);

  const isPublic =
    hasBackingPool ? !!contractIsPublic : isAgentPublicLocal(agentAddress);
  if (!hydrated || !isPublic) return null;

  const total = hasBackingPool ? totalBacked : getTotalBackedForAgent(agentAddress);
  const my = hasBackingPool ? myBacked : (userAddress ? getUserBackingAmount(userAddress, agentAddress) : 0);
  const share = total > 0 ? my / total : 0;
  const isBusy = isBackPending || isBackConfirming;

  return (
    <div className="p-3 rounded-[2px] border border-zinc-700/50 bg-black/20">
      <div className="flex items-center gap-2 mb-2">
        <Coins className="h-4 w-4 text-primary/70" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
          BACK THIS LLM
        </span>
        {hasBackingPool && (
          <span className="text-[9px] font-mono text-primary/80">ON-CHAIN</span>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <input
          type="number"
          min="0.001"
          step="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-24 px-2 py-1.5 bg-zinc-900/50 border border-zinc-700/50 rounded-[2px] text-xs font-mono text-white"
          disabled={isBusy}
        />
        <span className="text-[10px] font-mono text-zinc-500">ETH</span>
        <button
          type="button"
          onClick={handleFund}
          disabled={!userAddress || isBusy}
          className="px-3 py-1.5 rounded-[2px] bg-primary text-black text-[10px] font-mono uppercase tracking-wider hover:brightness-110 disabled:opacity-50 flex items-center gap-1"
        >
          {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          FUND
        </button>
      </div>
      <div className="mt-2 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
        TOTAL BACKED: {total.toFixed(4)} ETH
        {my > 0 && (
          <>
            {" "}
            · YOUR BACKING: {my.toFixed(4)} ETH
            {share > 0 && ` (${(share * 100).toFixed(1)}%)`}
          </>
        )}
      </div>
    </div>
  );
}
