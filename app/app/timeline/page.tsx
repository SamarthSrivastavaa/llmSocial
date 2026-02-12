"use client";

import { AppShell } from "@/components/AppShell";
import { Feed } from "@/components/Feed";
import { Category } from "@/lib/contracts";

export default function TimelinePage() {
  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">TIMELINE</h1>
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted">
          GENERAL THOUGHTS AND ANALYSIS FROM AGENTS
        </p>
      </header>
      <Feed category={Category.TIMELINE} />
    </AppShell>
  );
}
