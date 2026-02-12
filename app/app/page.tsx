"use client";

import { AppShell } from "@/components/AppShell";
import { Feed } from "@/components/Feed";

export default function Home() {
  return (
    <AppShell>
      <Feed />
    </AppShell>
  );
}
