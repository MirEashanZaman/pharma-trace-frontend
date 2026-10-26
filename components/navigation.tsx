'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Layers, Search, CheckCircle2, LogIn, LogOut, User, Server, RefreshCw, BookOpen, Flame, Network, Lock, Scale, Vote } from 'lucide-react';
import { getStoredUser, logoutUser, UserProfile } from '@/lib/api';

export function Navigation({
  walletAddress,
  onConnectWallet,
  currentUser: propUser,
}: {
  walletAddress?: string | null;
  onConnectWallet?: () => void;
  currentUser?: UserProfile | null;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(propUser || null);

  useEffect(() => {
    if (propUser !== undefined) {
      setUser(propUser);
    } else {
      setUser(getStoredUser());
    }
  }, [propUser]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push('/login');
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'MANUFACTURER':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'DISTRIBUTOR':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'PHARMACY':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'REGULATOR':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-[#00D6B4]/20 text-[#00D6B4] border-[#00D6B4]/30';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B1220]/95 backdrop-blur-md border-b border-[#304257] text-[#F1F5F9] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-[#00D6B4] flex items-center justify-center text-[#0B1220] font-black shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <Link href="/" className="text-xl font-bold tracking-tight text-[#F1F5F9] flex items-center gap-2">
              PharmaTrace<span className="badge badge-sm bg-[#00D6B4] text-[#0B1220] font-bold border-none">ES</span>
            </Link>
          </div>
        </div>

        <nav className="hidden xl:flex items-center space-x-4 text-xs font-semibold text-[#94A3B8]">
          <Link href="/ledger" className="hover:text-[#00D6B4] transition-colors flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span>Ledger</span>
            <span className="badge badge-xs bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/30 font-mono">SSR</span>
          </Link>
          <Link href="/catalog" className="hover:text-[#00D6B4] transition-colors flex items-center gap-1.5">
            <RefreshCw className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span>Catalog</span>
            <span className="badge badge-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">ISR</span>
          </Link>
          <Link href="/standards" className="hover:text-[#00D6B4] transition-colors flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span>Standards</span>
            <span className="badge badge-xs bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">SSG</span>
          </Link>
          <Link href="/provenance" className="hover:text-[#00D6B4] transition-colors flex items-center gap-1.5">
            <Network className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span>Provenance</span>
            <span className="badge badge-xs bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/30 font-mono">DAG</span>
          </Link>
          <Link href="/staking" className="hover:text-[#00D6B4] transition-colors flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span>Staking</span>
            <span className="badge badge-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">BOND</span>
          </Link>
          <Link href="/escrow" className="hover:text-[#00D6B4] transition-colors flex items-center gap-1.5">
            <Scale className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span>Escrow</span>
            <span className="badge badge-xs bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono">KEEPER</span>
          </Link>
          <Link href="/governance" className="hover:text-[#00D6B4] transition-colors flex items-center gap-1.5">
            <Vote className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span>Governance</span>
            <span className="badge badge-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">TIMELOCK</span>
          </Link>
          <Link href="/dashboard" className="hover:text-[#00D6B4] transition-colors flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span>Dashboard</span>
            <span className="badge badge-xs bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">CSR</span>
          </Link>
          <Link href="/dispense" className="hover:text-[#00D6B4] transition-colors flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span>Dispense</span>
            <span className="badge badge-xs bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono">Burn</span>
          </Link>
          <Link href="/verify" className="hover:text-[#00D6B4] transition-colors flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span>Verify</span>
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          {walletAddress && (
            <div className="badge badge-sm bg-[#00D6B4]/15 border border-[#00D6B4]/40 text-[#00D6B4] font-mono gap-1 py-2 text-[11px] hidden sm:flex">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00D6B4]" />
              <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#172638] px-3 py-1.5 rounded-xl border border-[#304257]">
                <User className="h-3.5 w-3.5 text-[#00D6B4]" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-[#F1F5F9] leading-tight truncate max-w-[130px]">
                    {user.fullName || user.email}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] leading-tight">
                    {user.organization || user.role}
                  </span>
                </div>
                <span className={`badge badge-xs font-bold uppercase border ml-1 ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="btn btn-sm btn-ghost hover:bg-rose-500/20 text-[#94A3B8] hover:text-rose-400 border border-[#304257] rounded-xl px-2.5 transition"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-xs font-bold">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold shadow-sm flex items-center gap-1.5"
              >
                <LogIn className="h-4 w-4" />
                <span>Enterprise Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
