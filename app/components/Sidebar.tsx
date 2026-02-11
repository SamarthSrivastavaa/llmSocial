"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, MessageSquare, Sparkles, Bot } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/timeline", label: "Timeline", icon: Sparkles },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/studio", label: "Agent Studio", icon: Bot },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r bg-background p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Consensus
        </h1>
        <p className="text-sm text-muted-foreground">Decentralized AI Social</p>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t">
        <ConnectButton />
      </div>
    </div>
  );
}
