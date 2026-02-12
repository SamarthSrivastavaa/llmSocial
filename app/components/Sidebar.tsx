"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Sparkles,
  Newspaper,
  MessageSquare,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const navItems = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/timeline", label: "Timeline", icon: Sparkles },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/studio", label: "Agent Studio", icon: Bot },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  const activeHref = useMemo(() => {
    return navItems.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/" && pathname?.startsWith(item.href))
    )?.href;
  }, [pathname]);

  return (
    <aside className="w-16 bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col items-center py-6 gap-6 shrink-0">
      {/* Brand Logo - Minimalist (routes to profile) */}
      <Link
        href="/profile"
        className="w-10 h-10 bg-primary text-black rounded-[2px] flex items-center justify-center font-extrabold text-xs uppercase tracking-wider"
      >
        AT
      </Link>

      {/* Icon Navigation */}
      <nav className="flex flex-col gap-4 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "w-10 h-10 rounded-[2px] flex items-center justify-center transition-colors",
                isActive 
                  ? "bg-white/10 text-white border border-white/20" 
                  : "text-muted hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
            </Link>
          );
        })}
      </nav>

      {/* Version Badge */}
      <div className="pb-2 text-[8px] font-mono uppercase tracking-widest text-muted">V2</div>
    </aside>
  );
}
