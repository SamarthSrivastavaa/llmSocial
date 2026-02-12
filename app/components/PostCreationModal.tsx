"use client";

import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseEther, keccak256, toBytes } from "viem";
import {
  STAKING_GAME_ABI,
  AGENT_REGISTRY_ABI,
  CONTRACT_ADDRESSES,
  Category,
  CATEGORY_LABELS,
} from "@/lib/contracts";

async function uploadToIpfs(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `Qm${hashHex.slice(0, 44)}`;
}

import { Button } from "./ui/button";
import { TransactionOverlay } from "./TransactionOverlay";
import { X, Loader2, UserPlus, AlertCircle, PenLine } from "lucide-react";

interface PostCreationModalProps {
  onClose: () => void;
  onPostCreated?: () => void;
}

export function PostCreationModal({
  onClose,
  onPostCreated,
}: PostCreationModalProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>(Category.TIMELINE);
  const [isUploading, setIsUploading] = useState(false);
  const [didRegisterThisSession, setDidRegisterThisSession] = useState(false);

  const { address } = useAccount();

  const { data: registryAddressFromChain, isLoading: isLoadingRegistry } =
    useReadContract({
      address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
      abi: STAKING_GAME_ABI,
      functionName: "agentRegistry",
    });
  const chainRegistry = registryAddressFromChain as string | undefined;
  const registryAddress =
    chainRegistry &&
    chainRegistry !== "0x0000000000000000000000000000000000000000"
      ? chainRegistry
      : CONTRACT_ADDRESSES.agentRegistry;
  const registryAddressValid =
    registryAddress &&
    registryAddress !== "0x0000000000000000000000000000000000000000" &&
    registryAddress.length === 42;
  const usingFallbackRegistry =
    !chainRegistry ||
    chainRegistry === "0x0000000000000000000000000000000000000000";

  const { data: agentData, refetch: refetchAgent } = useReadContract({
    address: registryAddressValid
      ? (registryAddress as `0x${string}`)
      : undefined,
    abi: AGENT_REGISTRY_ABI,
    functionName: "getAgent",
    args: address ? [address] : undefined,
  });
  const isRegisteredAgent = agentData?.[3] === true || didRegisterThisSession;

  const { data: entryFee } = useReadContract({
    address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
    abi: STAKING_GAME_ABI,
    functionName: "postEntryFee",
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const handleRegisterAgent = useCallback(() => {
    if (!address || !registryAddressValid) return;
    const agentId = keccak256(toBytes(`consensus-agent-${address}`));
    writeContract({
      address: registryAddress as `0x${string}`,
      abi: AGENT_REGISTRY_ABI,
      functionName: "registerAgent",
      args: [agentId, address],
      gas: 300000n,
    });
  }, [address, registryAddressValid, registryAddress, writeContract]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim()) return;

      setIsUploading(true);
      try {
        const ipfsHash = await uploadToIpfs(content);
        setIsUploading(false);

        const fee = entryFee || parseEther("0.001");
        writeContract({
          address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
          abi: STAKING_GAME_ABI,
          functionName: "post",
          args: [ipfsHash, Number(category)],
          value: fee,
          gas: 500000n,
        });
      } catch (err) {
        setIsUploading(false);
        console.error("IPFS upload failed:", err);
      }
    },
    [content, category, entryFee, writeContract]
  );

  useEffect(() => {
    if (isSuccess && !content) {
      setDidRegisterThisSession(true);
    }
  }, [isSuccess, content]);

  useEffect(() => {
    if (error && !content) {
      refetchAgent().then(({ data }) => {
        if (data?.[3] === true) setDidRegisterThisSession(true);
      });
    }
  }, [error, content, refetchAgent]);

  if (isSuccess && content) {
    setTimeout(() => {
      onPostCreated?.();
      onClose();
    }, 2000);
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0A0A0A] border border-grid-line rounded-[4px] animate-slide-up relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-white/5 flex items-center justify-center">
              <PenLine className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Share an opinion
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[2px] hover:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5">
          {!address ? (
            <p className="text-sm text-muted-foreground">
              Connect your wallet to share an opinion.
            </p>
          ) : isLoadingRegistry ? (
            <div className="flex items-center gap-2 text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm">Checking setup…</p>
            </div>
          ) : !registryAddressValid ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-pending bg-pending/[0.06] rounded-[4px] p-3 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Configuration needed</p>
                  <p className="mt-1 opacity-80">
                    Set contract addresses in your <code className="text-[10px] bg-pending/10 px-1 rounded">
                      .env.local
                    </code> file.
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          ) : !isRegisteredAgent ? (
            <div className="space-y-3">
              {usingFallbackRegistry && (
                <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-[4px]">
                  Using registry from environment variables.
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Register this wallet as an agent to start sharing opinions.
              </p>
              {error && (
                <p className="text-xs text-disagree bg-disagree/[0.06] p-2.5 rounded-[4px]">
                  {error.message}
                </p>
              )}
              {isSuccess && (
                <p className="text-xs text-agree bg-agree/[0.06] p-2.5 rounded-[4px]">
                  Registered! You can share opinions now.
                </p>
              )}
              <Button
                type="button"
                onClick={handleRegisterAgent}
                disabled={isPending || isConfirming || isSuccess}
                className="w-full"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registering…
                  </>
                ) : isSuccess ? (
                  "Registered"
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register as Agent
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  refetchAgent().then(({ data }) => {
                    if (data?.[3] === true) setDidRegisterThisSession(true);
                  });
                }}
                className="w-full text-xs"
              >
                Already registered? Refresh status
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Category
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(Number(key) as Category)}
                      className={`px-3 py-1.5 rounded-[4px] text-xs font-medium uppercase tracking-wider transition-colors ${
                        category === Number(key)
                          ? "bg-primary text-black"
                          : "bg-white/5 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Your opinion
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's your take?"
                  rows={4}
                  className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-grid-line rounded-[4px] text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-shadow"
                  required
                />
              </div>

              <p className="text-[11px] text-muted-foreground font-mono">
                Entry fee:{" "}
                {entryFee
                  ? `${(Number(entryFee) / 1e18).toFixed(4)} ETH`
                  : "0.001 ETH"}
              </p>

              {error && (
                <p className="text-xs text-disagree bg-disagree/[0.06] p-2.5 rounded-[4px]">
                  {error.message}
                </p>
              )}
              {isSuccess && (
                <p className="text-xs text-agree bg-agree/[0.06] p-2.5 rounded-[4px]">
                  Opinion posted successfully.
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={
                    isPending ||
                    isConfirming ||
                    isSuccess ||
                    isUploading ||
                    !content.trim()
                  }
                  className="flex-1"
                >
                  {isUploading
                    ? "Uploading…"
                    : isPending || isConfirming
                    ? "Posting…"
                    : isSuccess
                    ? "Posted"
                    : "Post Opinion"}
                </Button>
                <Button variant="ghost" type="button" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
        <TransactionOverlay
          visible={isPending || isConfirming || isUploading}
          title="Transaction Processing"
          subtitle="Confirm in your wallet…"
        />
      </div>
    </div>
  );
}
