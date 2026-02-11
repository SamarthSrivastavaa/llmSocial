"use client";

import { useEffect, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { keccak256, toBytes } from "viem";
import {
  STAKING_GAME_ABI,
  AGENT_REGISTRY_ABI,
  CONTRACT_ADDRESSES,
} from "./contracts";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export type AgentRegistrationStatus =
  | "idle"
  | "checking"
  | "ready"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

interface UseAgentRegistrationResult {
  address?: `0x${string}`;
  registryAddress?: `0x${string}`;
  usingFallbackRegistry: boolean;
  registryAddressValid: boolean;
  isRegistered: boolean;
  reputationScore?: number;
  status: AgentRegistrationStatus;
  error?: Error | null;
  txHash?: `0x${string}`;
  registerAgent: () => void;
  refetchAgent: () => Promise<void>;
}

export function useAgentRegistration(): UseAgentRegistrationResult {
  const { address } = useAccount();

  // Single source of truth for registry address: read from StakingGame on-chain,
  // but fall back to env if needed (e.g. local testing without full deployment).
  const {
    data: registryAddressFromChain,
    isLoading: isLoadingRegistry,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.stakingGame as `0x${string}`,
    abi: STAKING_GAME_ABI,
    functionName: "agentRegistry",
  });

  const chainRegistry = registryAddressFromChain as `0x${string}` | undefined;

  const resolvedRegistryAddress: `0x${string}` | undefined = useMemo(() => {
    if (chainRegistry && chainRegistry !== ZERO_ADDRESS) {
      return chainRegistry;
    }
    const fromEnv = CONTRACT_ADDRESSES.agentRegistry as `0x${string}` | "";
    if (!fromEnv || fromEnv === ZERO_ADDRESS || fromEnv.length !== 42) {
      return undefined;
    }
    return fromEnv;
  }, [chainRegistry]);

  const registryAddressValid =
    !!resolvedRegistryAddress && resolvedRegistryAddress !== ZERO_ADDRESS;

  const usingFallbackRegistry =
    !chainRegistry || chainRegistry === ZERO_ADDRESS;

  const {
    data: agentData,
    isLoading: isLoadingAgent,
    refetch: refetchAgentRaw,
  } = useReadContract({
    address: registryAddressValid
      ? (resolvedRegistryAddress as `0x${string}`)
      : undefined,
    abi: AGENT_REGISTRY_ABI,
    functionName: "getAgent",
    args: address && registryAddressValid ? [address] : undefined,
    query: {
      enabled: !!address && registryAddressValid,
    },
  });

  const isRegistered = !!agentData?.[3];
  const reputationScore =
    agentData && agentData[1] ? Number(agentData[1] as bigint) : undefined;

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // After successful registration confirmation, refetch on-chain state.
  useEffect(() => {
    if (isSuccess) {
      void refetchAgentRaw();
    }
  }, [isSuccess, refetchAgentRaw]);

  const registerAgent = () => {
    if (!address || !registryAddressValid || !resolvedRegistryAddress) return;

    const agentId = keccak256(toBytes(`consensus-agent-${address}`));

    writeContract({
      address: resolvedRegistryAddress,
      abi: AGENT_REGISTRY_ABI,
      functionName: "registerAgent",
      args: [agentId, address],
      gas: 300000n,
    });
  };

  const combinedError = (writeError || receiptError) as Error | undefined;

  let status: AgentRegistrationStatus = "idle";
  if (!address) {
    status = "idle";
  } else if (isLoadingRegistry || isLoadingAgent) {
    status = "checking";
  } else if (isPending) {
    status = "submitting";
  } else if (isConfirming) {
    status = "confirming";
  } else if (combinedError) {
    status = "error";
  } else if (isSuccess || isRegistered) {
    status = "success";
  } else {
    status = "ready";
  }

  const refetchAgent = async () => {
    await refetchAgentRaw();
  };

  return {
    address: address as `0x${string}` | undefined,
    registryAddress: resolvedRegistryAddress,
    usingFallbackRegistry,
    registryAddressValid,
    isRegistered,
    reputationScore,
    status,
    error: combinedError ?? null,
    txHash: txHash as `0x${string}` | undefined,
    registerAgent,
    refetchAgent,
  };
}

