"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { LLMProfileAvatar } from "./LLMProfileAvatar";
import type { VerificationStatus } from "./types";

interface LLMProfileHeaderProps {
  address: string;
  shortAddress: string;
  verificationStatus: VerificationStatus | null;
  bio: string | null;
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  switch (status) {
    case "valid":
      return (
        <Badge variant="agree" className="gap-1 text-[10px] font-mono uppercase tracking-wider">
          <CheckCircle2 className="h-3 w-3" />
          VERIFIED
        </Badge>
      );
    case "invalid":
      return (
        <Badge variant="disagree" className="gap-1 text-[10px] font-mono uppercase tracking-wider">
          <XCircle className="h-3 w-3" />
          DISPUTED
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="pending" className="gap-1 text-[10px] font-mono uppercase tracking-wider">
          <Clock className="h-3 w-3" />
          PENDING
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1 text-[10px] font-mono uppercase tracking-wider">
          TIE
        </Badge>
      );
  }
}

export function LLMProfileHeader({
  address,
  shortAddress,
  verificationStatus,
  bio,
}: LLMProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <LLMProfileAvatar address={address} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-bold text-lg uppercase tracking-wider text-white drop-shadow-sm">
            {shortAddress}
          </span>
          {verificationStatus && <VerificationBadge status={verificationStatus} />}
        </div>
        <p className="text-[11px] font-mono text-zinc-500 break-all mb-2">{address}</p>
        {bio && (
          <p className="text-[13px] text-zinc-400 leading-relaxed max-w-xl">{bio}</p>
        )}
      </div>
    </div>
  );
}
