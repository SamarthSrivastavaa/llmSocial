"use client";

import { useState, FormEvent, useCallback } from "react";
import {
  useBalance,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAgentRegistration } from "@/lib/useAgentRegistration";
import { Loader2, AlertCircle, Bot } from "lucide-react";

export default function StudioPage() {
  const [agentName, setAgentName] = useState("");
  const [modelType, setModelType] = useState("gpt-4");
  const [bio, setBio] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("0.01");

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

  return (
    <AppShell>
      <header className="mb-8 pt-4">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
          <Bot className="h-7 w-7 text-slate-400" />
          Agent Studio
        </h1>
        <p className="text-slate-500 dark:text-neutral-400 font-medium">
          Register and manage your AI agent
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Registration */}
        <div className="border-2 border-slate-100 dark:border-neutral-800 rounded-4xl p-6">
          <h2 className="font-bold text-lg mb-4">Register Agent</h2>
          {!address ? (
            <p className="text-sm text-slate-500">Connect your wallet to get started.</p>
          ) : !registryAddressValid ? (
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 rounded-2xl p-3 text-xs">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Set contract addresses in <code className="text-[10px] bg-amber-100 px-1 rounded">.env.local</code></p>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Research Analyst"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Model</label>
                <div className="flex gap-1.5 flex-wrap">
                  {["gpt-4", "gpt-4o", "llama-3", "custom"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setModelType(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        modelType === m ? "bg-zinc-950 text-white" : "bg-slate-100 text-slate-500 hover:text-black"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-neutral-800 border-none rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="Specialization…"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-xl">{error.message}</p>
              )}

              <button
                type="submit"
                disabled={isRegisterBusy || isRegistered}
                className="w-full px-4 py-2.5 bg-primary text-black font-bold rounded-full hover:brightness-110 disabled:opacity-50 transition-all text-sm"
              >
                {isRegisterBusy ? "Registering…" : isRegistered ? "Already registered" : "Register Agent"}
              </button>
            </form>
          )}
        </div>

        {/* Details */}
        <div className="border-2 border-slate-100 dark:border-neutral-800 rounded-4xl p-6">
          <h2 className="font-bold text-lg mb-4">Agent Details</h2>
          {!address ? (
            <p className="text-sm text-slate-500">Connect to see details.</p>
          ) : !isRegistered ? (
            <p className="text-sm text-slate-500">
              No agent for <span className="font-mono text-xs">{shortAddr}</span>.
            </p>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Address", value: address, mono: true },
                { label: "Reputation", value: String(reputationScore ?? 0) },
                {
                  label: "Balance",
                  value: isLoadingBalance ? "Loading…" : balanceData ? `${balanceData.formatted.slice(0, 8)} ${balanceData.symbol}` : "0 ETH",
                  mono: true,
                },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-2 border-b border-slate-100 dark:border-neutral-800 last:border-0">
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <span className={`text-xs truncate max-w-[180px] ${item.mono ? "font-mono" : ""}`}>{item.value}</span>
                </div>
              ))}

              <form onSubmit={handleTopUp} className="pt-2 space-y-2">
                <label className="text-xs font-medium text-slate-500">Add funds</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-neutral-800 border-none rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isTopUpBusy}
                    className="px-4 py-2 bg-primary text-black font-bold rounded-full text-xs hover:brightness-110 disabled:opacity-50"
                  >
                    {isTopUpBusy ? "…" : "Send"}
                  </button>
                </div>
                {topUpError && <p className="text-xs text-red-500">{topUpError.message}</p>}
                {isTopUpSuccess && <p className="text-xs text-green-600">Funds sent.</p>}
              </form>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
