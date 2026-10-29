'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck, Layers, Search, CheckCircle2, LogIn, LogOut, User, Server, RefreshCw, BookOpen, Flame, Network, Lock, Scale, Vote, Menu } from 'lucide-react';
import { getStoredUser, logoutUser, UserProfile } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  const pathname = usePathname();
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

  const navLinks = [
    { href: '/ledger', label: 'Ledger', icon: Server },
    { href: '/catalog', label: 'Catalog', icon: RefreshCw },
    { href: '/standards', label: 'Standards', icon: BookOpen },
    { href: '/provenance', label: 'Provenance', icon: Network },
    { href: '/staking', label: 'Staking', icon: Lock },
    { href: '/escrow', label: 'Escrow', icon: Scale },
    { href: '/governance', label: 'Governance', icon: Vote },
    { href: '/dashboard', label: 'Dashboard', icon: Layers },
    { href: '/dispense', label: 'Dispense', icon: Flame },
    { href: '/verify', label: 'Verify', icon: Search },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B1220]/95 backdrop-blur-md border-b border-[#304257] text-[#F1F5F9] shadow-sm">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-[#00D6B4] flex items-center justify-center text-[#0B1220] font-black shadow-sm shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight text-[#F1F5F9] whitespace-nowrap">
            PharmaTrace
          </Link>
        </div>

        <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5 shrink-0">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2 py-1.5 rounded-lg text-[11px] 2xl:text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  active
                    ? 'bg-[#172638] text-[#00D6B4] border border-[#00D6B4]/30 shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172638]/60 border border-transparent'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#00D6B4]' : 'text-[#94A3B8]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-2 shrink-0">
          {walletAddress && (
            <Badge variant="teal" size="sm" className="hidden 2xl:flex shrink-0 gap-1 py-1 px-2 font-mono">
              <CheckCircle2 className="h-3 w-3 text-[#00D6B4]" />
              <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </Badge>
          )}

          {user ? (
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 bg-[#172638] px-2.5 py-1.5 rounded-xl border border-[#304257] shrink-0">
                <User className="h-3.5 w-3.5 text-[#00D6B4] shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-[#F1F5F9] leading-tight truncate max-w-[100px] 2xl:max-w-[130px]">
                    {user.fullName || user.email}
                  </span>
                  <span className="text-[9px] text-[#94A3B8] leading-tight truncate max-w-[100px] 2xl:max-w-[130px]">
                    {user.organization || user.role}
                  </span>
                </div>
                <span className={`badge badge-xs font-bold uppercase border ml-1 shrink-0 text-[9px] py-0.5 px-1.5 ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>

              <Button
                variant="ghost"
                size="xs"
                onClick={handleLogout}
                title="Sign Out"
                className="hover:bg-rose-500/20 text-[#94A3B8] hover:text-rose-400 border border-[#304257] rounded-xl px-2.5 transition shrink-0 flex items-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs font-bold">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Button asChild size="sm" className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold shadow-sm shrink-0">
                <Link href="/login" className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Enterprise Sign In</span>
                </Link>
              </Button>
            </div>
          )}

          <div className="dropdown dropdown-end xl:hidden">
            <label tabIndex={0} className="btn btn-xs sm:btn-sm btn-ghost border border-[#304257] text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl px-2">
              <Menu className="h-4 w-4" />
            </label>
            <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-xl bg-[#172638] border border-[#304257] rounded-2xl w-48 text-xs space-y-1 mt-2">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2 rounded-lg py-2 ${
                        active ? 'bg-[#00D6B4]/15 text-[#00D6B4] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
