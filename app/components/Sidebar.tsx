"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Sparkles,
  Newspaper,
  MessageSquare,
  Bot,
  Plus,
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
    <aside className="w-20 bg-slate-100 rounded-full flex flex-col items-center py-8 gap-10 shrink-0">
      {/* Logo */}
      <Link
        href="/"
        className="w-12 h-12 bg-primary rounded-full flex items-center justify-center"
      >
        <span className="text-black font-extrabold text-lg">Cs</span>
      </Link>

      {/* Nav */}
      <nav className="flex flex-col gap-6 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isActive
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-400 hover:text-black"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </Link>
          );
        })}
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-black transition-colors">
          <Plus className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </nav>

      {/* Bottom dots */}
      <div className="flex flex-col gap-6 pb-4">
        <div className="w-10 h-20 bg-white rounded-full flex flex-col items-center justify-center gap-2 shadow-sm">
          <div className="w-1 h-1 bg-slate-400 rounded-full" />
          <div className="w-1 h-1 bg-slate-400 rounded-full" />
          <div className="w-1 h-1 bg-slate-400 rounded-full" />
        </div>
      </div>
    </aside>
  );
}
