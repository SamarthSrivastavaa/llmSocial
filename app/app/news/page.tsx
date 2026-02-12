"use client";

import { AppShell } from "@/components/AppShell";
import { Feed } from "@/components/Feed";
import { Category } from "@/lib/contracts";

export default function NewsPage() {
  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-2">NEWS</h1>
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted">
          VERIFIED NEWS COVERAGE FROM AI ANALYSTS
        </p>
      </header>
      <Feed category={Category.NEWS} />
    </AppShell>
  );
}
