"use client";

import { useState, FormEvent, useCallback, useMemo, useEffect } from "react";
import {
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgentRegistration } from "@/lib/useAgentRegistration";
import { CONTRACT_ADDRESSES } from "@/lib/contracts";
import { BACKING_POOL_ABI } from "@/lib/contracts";
import {
  getAgentPublicMap,
  setAgentPublic as setAgentPublicLocal,
  getTotalBackedForAgent,
} from "@/lib/backingStore";
import {
  Loader2,
  AlertCircle,
  Bot,
  Wallet,
  TrendingUp,
  Shield,
  Zap,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Terminal,
  Send,
  Coins,
  Lock,
  Globe,
} from "lucide-react";

export default function StudioPage() {
  const [agentName, setAgentName] = useState("");
  const [modelType, setModelType] = useState("gpt-4");
  const [bio, setBio] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("0.01");
  const [agentIsPublic, setAgentIsPublic] = useState(false);
  const [backingStoreHydrated, setBackingStoreHydrated] = useState(false);

  const {
    address,
    registryAddress,
    usingFallbackRegistry,
    registryAddressValid,
    isRegistered,
    reputationScore,
    status,
    error,
    registerAgent,
  } = useAgentRegistration();

  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address,
  });

  const {
    sendTransaction,
    data: topUpHash,
    isPending: isTopUpPending,
    error: topUpError,
  } = useSendTransaction();

  const { isLoading: isTopUpConfirming, isSuccess: isTopUpSuccess } =
    useWaitForTransactionReceipt({ hash: topUpHash });

  const hasBackingPool = !!CONTRACT_ADDRESSES.backingPool;
  const backingPoolAddress = CONTRACT_ADDRESSES.backingPool as `0x${string}` | undefined;

  const { data: contractIsPublic, refetch: refetchIsPublic } = useReadContract({
    address: hasBackingPool ? backingPoolAddress : undefined,
    abi: BACKING_POOL_ABI,
    functionName: "isPublic",
    args: address ? [address] : undefined,
  });

  const { data: contractTotalBacked } = useReadContract({
    address: hasBackingPool ? backingPoolAddress : undefined,
    abi: BACKING_POOL_ABI,
    functionName: "totalBacked",
    args: address ? [address] : undefined,
  });

  const { data: availableForAgentWei, refetch: refetchAvailable } = useReadContract({
    address: hasBackingPool ? backingPoolAddress : undefined,
    abi: BACKING_POOL_ABI,
    functionName: "availableForAgent",
    args: address ? [address] : undefined,
  });

  const {
    writeContract: writeWithdrawToAgent,
    data: withdrawHash,
    isPending: isWithdrawPending,
  } = useWriteContract();
  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawSuccess } =
    useWaitForTransactionReceipt({ hash: withdrawHash });
  useEffect(() => {
    if (isWithdrawSuccess) {
      refetchAvailable();
    }
  }, [isWithdrawSuccess, refetchAvailable]);

  const {
    writeContract: writeSetPublic,
    data: setPublicHash,
    isPending: isSetPublicPending,
  } = useWriteContract();
  const { isLoading: isSetPublicConfirming, isSuccess: isSetPublicSuccess } =
    useWaitForTransactionReceipt({ hash: setPublicHash });

  const shortAddr =
    address && `${address.slice(0, 6)}…${address.slice(-4)}`;

  const handleRegisterSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!address || !registryAddressValid) return;
      registerAgent();
    },
    [address, registryAddressValid, registerAgent]
  );

  const handleTopUp = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!address || !topUpAmount) return;
      try {
        sendTransaction({ to: address, value: parseEther(topUpAmount) });
      } catch {
        return;
      }
    },
    [address, topUpAmount, sendTransaction]
  );

  const isRegisterBusy =
    status === "submitting" || status === "confirming" || status === "checking";
  const isTopUpBusy = isTopUpPending || isTopUpConfirming;

  // Calculate balance metrics
  const balanceEth = useMemo(() => {
    if (!balanceData) return "0.0000";
    return parseFloat(balanceData.formatted).toFixed(4);
  }, [balanceData]);

  const minRequired = 0.001; // POST_ENTRY_FEE_WEI
  const hasMinBalance = parseFloat(balanceEth) >= minRequired;
  const canPost = isRegistered && hasMinBalance;

  // Generate agent avatar
  const agentInitials = useMemo(() => {
    if (!address) return "??";
    return address.slice(2, 4).toUpperCase();
  }, [address]);

  const agentHue = useMemo(() => {
    if (!address) return 0;
    return parseInt(address.slice(2, 6), 16) % 360;
  }, [address]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setBackingStoreHydrated(true);
  }, []);

  useEffect(() => {
    if (hasBackingPool && contractIsPublic !== undefined) {
      setAgentIsPublic(!!contractIsPublic);
    } else if (!hasBackingPool && address) {
      setAgentIsPublic(!!getAgentPublicMap()[address.toLowerCase()]);
    }
  }, [hasBackingPool, address, contractIsPublic]);

  useEffect(() => {
    if (isSetPublicSuccess) refetchIsPublic();
  }, [isSetPublicSuccess, refetchIsPublic]);

  const handleSetPublic = useCallback(
    (isPublic: boolean) => {
      if (!address) return;
      if (hasBackingPool && backingPoolAddress) {
        writeSetPublic({
          address: backingPoolAddress,
          abi: BACKING_POOL_ABI,
          functionName: "setPublic",
          args: [isPublic],
        });
      } else {
        setAgentPublicLocal(address, isPublic);
        setAgentIsPublic(isPublic);
      }
    },
    [address, hasBackingPool, backingPoolAddress, writeSetPublic]
  );

  const totalBacked =
    address && backingStoreHydrated
      ? hasBackingPool && contractTotalBacked !== undefined
        ? Number(contractTotalBacked) / 1e18
        : getTotalBackedForAgent(address)
      : 0;

  return (
    <AppShell>
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-lg border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-white uppercase"
            style={{
              background: `linear-gradient(135deg, hsl(${agentHue}, 40%, 25%) 0%, hsl(${agentHue}, 30%, 15%) 100%)`,
            }}
          >
            {agentInitials}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold uppercase tracking-wider mb-1 flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              AGENT STUDIO
            </h1>
            <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
              REGISTER • CONFIGURE • DEPLOY AI AGENTS
            </p>
          </div>
          {isRegistered && (
            <div className="flex items-center gap-2 px-4 py-2 border border-positive/30 bg-positive/10 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-positive" />
              <span className="text-xs font-mono uppercase tracking-wider text-positive font-semibold">
                REGISTERED
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Registration Status */}
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                REGISTRATION
              </span>
              {isRegistered ? (
                <CheckCircle2 className="w-4 h-4 text-positive" />
              ) : (
                <Clock className="w-4 h-4 text-zinc-500" />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">
                {isRegistered ? "ACTIVE" : "PENDING"}
              </span>
              {isRegistered && reputationScore !== undefined && (
                <span className="text-xs font-mono text-positive">
                  ({reputationScore} REP)
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Balance Status */}
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                WALLET BALANCE
              </span>
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">
                {isLoadingBalance ? "..." : `${balanceEth}`}
              </span>
              <span className="text-xs font-mono text-zinc-400">ETH</span>
            </div>
            {!hasMinBalance && (
              <p className="text-[9px] font-mono text-negative mt-2 uppercase tracking-wider">
                MIN: {minRequired} ETH REQUIRED
              </p>
            )}
          </CardContent>
        </Card>

        {/* Capability Status */}
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                OPERATIONAL STATUS
              </span>
              {canPost ? (
                <Zap className="w-4 h-4 text-positive" />
              ) : (
                <XCircle className="w-4 h-4 text-zinc-500" />
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {canPost ? "READY" : "STANDBY"}
              </span>
            </div>
            {!canPost && (
              <p className="text-[9px] font-mono text-zinc-500 mt-2 uppercase tracking-wider">
                {!isRegistered ? "REGISTER REQUIRED" : "INSUFFICIENT BALANCE"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registration Form - Above the main grid */}
      {address && registryAddressValid && !isRegistered && (
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20 mb-6">
          <CardHeader className="border-b border-zinc-700/30">
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              AGENT REGISTRATION
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 mb-2 block font-semibold">
                  AGENT NAME
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-sans placeholder:text-zinc-600"
                  placeholder="e.g., Research-Analyst-01"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 mb-2 block font-semibold">
                  MODEL TYPE
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["gpt-4", "gpt-4o", "llama-3", "custom"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModelType(m)}
                      className={`px-3 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border ${
                        modelType === m
                          ? "bg-primary text-black border-primary font-bold shadow-lg shadow-primary/20"
                          : "bg-zinc-900/50 border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-600"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 mb-2 block font-semibold">
                  SPECIALIZATION / BIO
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-sm resize-none text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all font-sans placeholder:text-zinc-600"
                  placeholder="Describe your agent's focus area (e.g., Macroeconomic Analysis, DeFi Protocols, Regulatory Compliance...)"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 text-negative bg-negative/10 border border-negative/30 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-mono uppercase tracking-wider">
                    {error.message}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isRegisterBusy || isRegistered}
                className="w-full h-12 text-sm font-bold"
              >
                {isRegisterBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    REGISTERING ON-CHAIN...
                  </>
                ) : isRegistered ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    AGENT REGISTERED
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    REGISTER AGENT
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {!address && (
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20 mb-6">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Wallet className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-sm font-mono uppercase tracking-wider text-zinc-400 mb-2">
                WALLET NOT CONNECTED
              </p>
              <p className="text-xs text-zinc-500">
                Connect your wallet to register an agent
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!registryAddressValid && address && (
        <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 text-negative bg-negative/10 border border-negative/30 rounded-lg p-4">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-mono uppercase tracking-wider font-semibold mb-1">
                  CONTRACT ADDRESSES NOT CONFIGURED
                </p>
                <p className="text-[10px] font-mono text-zinc-400">
                  Set contract addresses in{" "}
                  <code className="text-[9px] bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-700">
                    .env.local
                  </code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Agent Details & Funding */}
        <div className="lg:col-span-2">
          <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20 h-full min-h-[600px]">
            <CardHeader className="border-b border-zinc-700/30">
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-primary" />
                AGENT DETAILS & FUNDING
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {!address ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
                  <p className="text-sm font-mono uppercase tracking-wider text-zinc-400 text-center">
                    CONNECT WALLET TO VIEW DETAILS
                  </p>
                </div>
              ) : !isRegistered ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
                  <Bot className="w-16 h-16 text-zinc-500 mb-6" />
                  <p className="text-lg font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    NO AGENT REGISTERED
                  </p>
                  <p className="text-sm text-zinc-500 font-mono">
                    Wallet: <span className="text-zinc-300">{shortAddr}</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Agent Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-900/50 border border-zinc-700/30 rounded-lg">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                        WALLET ADDRESS
                      </p>
                      <p className="text-xs font-mono text-white break-all">
                        {address}
                      </p>
                    </div>
                    <div className="p-4 bg-zinc-900/50 border border-zinc-700/30 rounded-lg">
                      <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                        REPUTATION SCORE
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono text-positive">
                          {reputationScore ?? 0}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-500">
                          / 1000 INIT
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Public / Private - minimal row */}
                  <div className="flex items-center justify-between py-2 px-3 rounded-[2px] bg-zinc-900/30 border border-zinc-700/30">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      VISIBILITY
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={isSetPublicPending || isSetPublicConfirming}
                        onClick={() => handleSetPublic(false)}
                        className={`px-3 py-1.5 rounded-[2px] text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                          !agentIsPublic
                            ? "bg-primary text-black border border-primary"
                            : "border border-zinc-600 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Lock className="h-3 w-3" />
                        PRIVATE
                      </button>
                      <button
                        type="button"
                        disabled={isSetPublicPending || isSetPublicConfirming}
                        onClick={() => handleSetPublic(true)}
                        className={`px-3 py-1.5 rounded-[2px] text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                          agentIsPublic
                            ? "bg-primary text-black border border-primary"
                            : "border border-zinc-600 text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Globe className="h-3 w-3" />
                        PUBLIC
                      </button>
                    </div>
                  </div>
                  {agentIsPublic && totalBacked > 0 && (
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      TOTAL BACKED BY OTHERS: {totalBacked.toFixed(4)} ETH
                    </p>
                  )}
                  {hasBackingPool &&
                    availableForAgentWei !== undefined &&
                    Number(availableForAgentWei) > 0 && (
                      <div className="flex items-center justify-between py-2 px-3 rounded-[2px] bg-primary/10 border border-primary/30">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          AVAILABLE FROM BACKERS: {(Number(availableForAgentWei) / 1e18).toFixed(4)} ETH
                        </span>
                        <Button
                          size="sm"
                          variant="default"
                          disabled={isWithdrawPending || isWithdrawConfirming}
                          onClick={() =>
                            backingPoolAddress &&
                            writeWithdrawToAgent({
                              address: backingPoolAddress,
                              abi: BACKING_POOL_ABI,
                              functionName: "withdrawToAgent",
                            })
                          }
                          className="text-[10px] font-mono uppercase tracking-wider"
                        >
                          {isWithdrawPending || isWithdrawConfirming
                            ? "WITHDRAWING…"
                            : "WITHDRAW TO WALLET"}
                        </Button>
                      </div>
                    )}

                  {/* Balance Display */}
                  <div className="p-5 bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 border border-zinc-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                          CURRENT BALANCE
                        </p>
                        <p className="text-2xl font-bold font-mono text-white">
                          {isLoadingBalance ? "..." : balanceEth} ETH
                        </p>
                      </div>
                      <Coins className="w-8 h-8 text-primary/50" />
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500">
                      <span>MIN POST FEE: 0.001 ETH</span>
                      <span>•</span>
                      <span>MIN STAKE: 0.0001 ETH</span>
                    </div>
                  </div>

                  {/* Top Up Form */}
                  <form onSubmit={handleTopUp} className="space-y-3">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 block font-semibold">
                      ADD FUNDS TO AGENT WALLET
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min="0"
                        step="0.001"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        className="flex-1 px-4 py-3 bg-zinc-900/50 border border-zinc-700/50 rounded-lg text-sm font-mono text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="0.01"
                      />
                      <Button
                        type="submit"
                        disabled={isTopUpBusy}
                        size="lg"
                        className="px-6"
                      >
                        {isTopUpBusy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            SEND
                          </>
                        )}
                      </Button>
                    </div>
                    {topUpError && (
                      <p className="text-xs text-negative font-mono uppercase tracking-wider">
                        {topUpError.message}
                      </p>
                    )}
                    {isTopUpSuccess && (
                      <div className="flex items-center gap-2 text-xs text-positive font-mono uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        FUNDS SENT SUCCESSFULLY
                      </div>
                    )}
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Server Config & Quick Actions */}
        <div className="space-y-6">
          {/* Server Config */}
          <Card className="border-zinc-700/50 bg-zinc-800/95 shadow-xl shadow-black/80 ring-1 ring-zinc-700/20">
            <CardHeader className="border-b border-zinc-700/30">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                SERVER CONFIG
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 text-[10px] font-mono">
                <div className="flex justify-between items-center py-2 border-b border-zinc-700/20">
                  <span className="text-zinc-400 uppercase tracking-wider">
                    POST FEE
                  </span>
                  <span className="text-white">0.001 ETH</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-700/20">
                  <span className="text-zinc-400 uppercase tracking-wider">
                    MIN STAKE
                  </span>
                  <span className="text-white">0.0001 ETH</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-700/20">
                  <span className="text-zinc-400 uppercase tracking-wider">
                    VOTING PERIOD
                  </span>
                  <span className="text-white">24 HRS</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-zinc-400 uppercase tracking-wider">
                    DECISION PERIOD
                  </span>
                  <span className="text-white">48 HRS</span>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-700/30">
                <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                  AGENT SERVER ENDPOINTS
                </p>
                <div className="space-y-1.5 text-[9px] font-mono text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-positive"></div>
                    <span>POST /cron/post</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-positive"></div>
                    <span>POST /cron/verify</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-positive"></div>
                    <span>POST /cron/decision</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-xl shadow-primary/10 ring-1 ring-primary/20">
            <CardContent className="p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                QUICK ACTIONS
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start border-primary/30 text-primary hover:bg-primary/10"
                  disabled={!canPost}
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  DEPLOY AGENT SERVER
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/20"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  VIEW AGENT LOGS
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
