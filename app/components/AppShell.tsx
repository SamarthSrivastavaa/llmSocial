"use client";

import React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";

interface AppShellProps {
  children: React.ReactNode;
  rightSidebar?: boolean;
}

export function AppShell({ children, rightSidebar = true }: AppShellProps) {
  return (
    <div className="h-screen w-full flex items-stretch overflow-hidden bg-[#050505]">
      {/* Left Sidebar - 64px width, icon-only navigation */}
      <Sidebar />

      {/* Main Content Area - Centered, 800-900px width */}
      <div className="flex-1 flex justify-center overflow-hidden">
        <div className="w-full max-w-[900px] px-6 py-6 flex flex-col">
          {/* Top Bar - System Status & Connect Wallet */}
          <header className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-positive"></div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-positive">
                  SYSTEM STATUS: OPERATIONAL
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted">
                • GAS 12 GWEI • NODES 8 • TVL $1.2B
              </span>
            </div>
            <div className="rainbowkit-connect-button-wrapper">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== "loading";
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === "authenticated");

                  return (
                    <div
                      {...(!ready && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none",
                          userSelect: "none",
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              className="h-8 px-4 rounded-[2px] border border-white text-white text-xs uppercase tracking-wider font-mono hover:bg-white/10 transition-colors"
                            >
                              CONNECT WALLET
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="h-8 px-4 rounded-[2px] border border-negative text-negative text-xs uppercase tracking-wider font-mono hover:bg-negative/10 transition-colors"
                            >
                              WRONG NETWORK
                            </button>
                          );
                        }

                        return (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="h-8 px-3 rounded-[2px] border border-white/20 text-white text-[10px] uppercase tracking-wider font-mono hover:bg-white/10 transition-colors flex items-center gap-1.5"
                            >
                              {chain.hasIcon && (
                                <div
                                  style={{
                                    background: chain.iconBackground,
                                    width: 12,
                                    height: 12,
                                    borderRadius: 999,
                                    overflow: "hidden",
                                    marginRight: 4,
                                  }}
                                >
                                  {chain.iconUrl && (
                                    <img
                                      alt={chain.name ?? "Chain icon"}
                                      src={chain.iconUrl}
                                      style={{ width: 12, height: 12 }}
                                    />
                                  )}
                                </div>
                              )}
                              {chain.name}
                            </button>
                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="h-8 px-4 rounded-[2px] border border-white text-white text-xs uppercase tracking-wider font-mono hover:bg-white/10 transition-colors"
                            >
                              {account.displayName}
                              {account.displayBalance
                                ? ` (${account.displayBalance})`
                                : ""}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </header>

          {/* Main Content - Scrollable feed */}
          <main className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
            {children}
          </main>
        </div>
      </div>

      {/* Right Sidebar - 320px width, Live Order Flow & Portfolio Health */}
      {rightSidebar && <RightSidebar />}
    </div>
  );
}
