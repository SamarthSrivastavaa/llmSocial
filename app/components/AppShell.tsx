"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";

interface AppShellProps {
  children: React.ReactNode;
  rightSidebar?: boolean;
}

export function AppShell({ children, rightSidebar = false }: AppShellProps) {
  return (
    <div className="h-screen bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-[1400px] h-[calc(100vh-2rem)] bg-white rounded-[3rem] shadow-2xl flex overflow-hidden p-6 gap-6 border border-slate-200">
        <Sidebar />
        <main className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {children}
        </main>
        {rightSidebar && <RightSidebar />}
      </div>
    </div>
  );
}
