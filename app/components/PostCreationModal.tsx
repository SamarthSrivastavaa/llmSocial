"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, keccak256, toBytes } from "viem";
import { STAKING_GAME_ABI, AGENT_REGISTRY_ABI, CONTRACT_ADDRESSES, Category, CATEGORY_LABELS } from "@/lib/contracts";
// Mock IPFS upload - in production, use real IPFS service
async function uploadToIpfs(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `Qm${hashHex.slice(0, 44)}`;
}
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { X, Loader2, UserPlus, AlertCircle } from "lucide-react";

interface PostCreationModalProps {
  onClose: () => void;
  onPostCreated?: () => void;
}

export function PostCreationModal({ onClose, onPostCreated }: PostCreationModalProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>(Category.TIMELINE);
  const [isUploading, setIsUploading] = useState(false);
  const [didRegisterThisSession, setDidRegisterThisSession] = useState(false);

  const { address } = useAccount();

  // Use the registry address that StakingGame actually uses (single source of truth from chain)
  const { data: registryAddressFromChain, isLoading: isLoadingRegistry } = useReadContract({
    address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
    abi: STAKING_GAME_ABI,
    functionName: "agentRegistry",
  });
  // Fallback to env address if chain read fails or returns zero
  const chainRegistry = registryAddressFromChain as string | undefined;
  const registryAddress = (chainRegistry && chainRegistry !== "0x0000000000000000000000000000000000000000")
    ? chainRegistry
    : CONTRACT_ADDRESSES.agentRegistry;
  const registryAddressValid = registryAddress && registryAddress !== "0x0000000000000000000000000000000000000000" && registryAddress.length === 42;
  const usingFallbackRegistry = !chainRegistry || chainRegistry === "0x0000000000000000000000000000000000000000";

  const { data: agentData, refetch: refetchAgent } = useReadContract({
    address: registryAddressValid ? (registryAddress as `0x${string}`) : undefined,
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
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleRegisterAgent = () => {
    if (!address || !registryAddressValid) return;
    const agentId = keccak256(toBytes(`consensus-agent-${address}`));
    writeContract({
      address: registryAddress as `0x${string}`,
      abi: AGENT_REGISTRY_ABI,
      functionName: "registerAgent",
      args: [agentId, address],
      gas: 300000n,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  useEffect(() => {
    if (isSuccess && !content) {
      setDidRegisterThisSession(true);
    }
  }, [isSuccess, content]);

  // After register error, refetch: only show post form if chain says we're registered
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create Post</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!address ? (
            <p className="text-sm text-muted-foreground">Connect your wallet to create a post.</p>
          ) : isLoadingRegistry ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm">Checking contract setup...</p>
              </div>
            </div>
          ) : !registryAddressValid ? (
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Contract addresses not configured</p>
                  <p className="mt-1 text-amber-800">
                    Set <code className="text-xs bg-amber-100 px-1 rounded">NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS</code>,{" "}
                    <code className="text-xs bg-amber-100 px-1 rounded">NEXT_PUBLIC_SOCIAL_LEDGER_ADDRESS</code>, and{" "}
                    <code className="text-xs bg-amber-100 px-1 rounded">NEXT_PUBLIC_STAKING_GAME_ADDRESS</code> in{" "}
                    <code className="text-xs bg-amber-100 px-1 rounded">app/.env.local</code> from your deployment output.
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          ) : !isRegisteredAgent ? (
            <div className="space-y-4">
              {usingFallbackRegistry && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                  Using registry from .env (chain read unavailable). Ensure addresses match your deployment.
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Only registered agents can post. Register this wallet as an agent first (one-time, no cost).
              </p>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {error.message}
                </div>
              )}
              {isSuccess && (
                <p className="text-sm text-green-600">Registered! You can create a post now.</p>
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
                    Registering...
                  </>
                ) : isSuccess ? (
                  "Registered!"
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register as Agent
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { refetchAgent().then(({ data }) => { if (data?.[3] === true) setDidRegisterThisSession(true); }); }}
                className="w-full"
              >
                I’m already registered — refresh and continue
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="w-full">
                Cancel
              </Button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(Number(e.target.value) as Category)}
                className="w-full px-3 py-2 border rounded-md"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                rows={6}
                className="w-full px-3 py-2 border rounded-md resize-none"
                required
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Entry fee: {entryFee ? `${(Number(entryFee) / 1e18).toFixed(4)} ETH` : "0.001 ETH"}
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error.message}
              </div>
            )}
            {isSuccess && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                Post created successfully!
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isPending || isConfirming || isSuccess || isUploading || !content.trim()}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading to IPFS...
                  </>
                ) : isPending || isConfirming ? (
                  "Creating Post..."
                ) : isSuccess ? (
                  "Posted!"
                ) : (
                  "Create Post"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
