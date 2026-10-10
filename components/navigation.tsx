import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Layers, Search, CheckCircle2, LogIn } from 'lucide-react';

export function Navigation({
  walletAddress,
  onConnectWallet,
}: {
  walletAddress: string | null;
  onConnectWallet: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#102A43] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-[#16B8A6] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              PharmaTrace<span className="badge badge-sm bg-[#16B8A6] border-none text-white font-mono">ES</span>
            </Link>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-200">
          <Link href="/dashboard" className="hover:text-[#16B8A6] transition-colors flex items-center gap-1.5">
            <Layers className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/verify" className="hover:text-[#16B8A6] transition-colors flex items-center gap-1.5">
            <Search className="h-4 w-4" /> Public Verification
          </Link>
          <Link href="/login" className="hover:text-[#16B8A6] transition-colors flex items-center gap-1.5">
            <LogIn className="h-4 w-4" /> Sign In
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {walletAddress ? (
            <div className="badge badge-lg bg-[#16B8A6]/20 border border-[#16B8A6] text-[#16B8A6] font-mono gap-1.5 py-3">
              <CheckCircle2 className="h-4 w-4 text-[#16B8A6]" />
              <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              className="btn btn-sm bg-[#16B8A6] hover:bg-[#139485] text-white border-none shadow-sm rounded-lg font-semibold"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
