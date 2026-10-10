import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Layers, Cpu, Search, CheckCircle2 } from 'lucide-react';

export function Navigation({
  walletAddress,
  onConnectWallet,
}: {
  walletAddress: string | null;
  onConnectWallet: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              PharmaTrace<span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Web3 ES</span>
            </Link>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
          <Link href="/dashboard" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Layers className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/verify" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Search className="h-4 w-4" /> Public Verification
          </Link>
          <Link href="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            Sign In
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {walletAddress ? (
            <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs tracking-wide transition shadow-lg shadow-emerald-500/25"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
