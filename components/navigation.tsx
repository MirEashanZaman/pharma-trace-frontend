'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Layers,
  Search,
  CheckCircle2,
  LogIn,
  LogOut,
  User,
  Server,
  RefreshCw,
  BookOpen,
  Flame,
  Network,
  Lock,
  Scale,
  Vote,
  Menu,
  ChevronDown,
  UserCog,
  Command,
} from 'lucide-react';
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

    const handleProfileUpdate = () => {
      setUser(getStoredUser());
    };
    window.addEventListener('pharma_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('pharma_profile_updated', handleProfileUpdate);
    };
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

  const primaryNavLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Layers },
    { href: '/provenance', label: 'Provenance', icon: Network },
    { href: '/verify', label: 'Verify', icon: Search },
    { href: '/ledger', label: 'Ledger', icon: Server },
  ];

  const moduleNavLinks = [
    { href: '/catalog', label: 'Catalog', icon: RefreshCw },
    { href: '/dispense', label: 'Dispense', icon: Flame },
    { href: '/escrow', label: 'Escrow', icon: Scale },
    { href: '/staking', label: 'Staking', icon: Lock },
    { href: '/governance', label: 'Governance', icon: Vote },
    { href: '/standards', label: 'Standards', icon: BookOpen },
  ];

  const allNavLinks = [...primaryNavLinks, ...moduleNavLinks];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const isModuleActive = moduleNavLinks.some((item) => isActive(item.href));

  return (
    <header className="sticky top-0 z-50 bg-[#0B1220]/95 backdrop-blur-md border-b border-[#304257] text-[#F1F5F9] shadow-sm w-full overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-[#00D6B4] flex items-center justify-center text-[#0B1220] font-black shadow-sm shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight text-[#F1F5F9] whitespace-nowrap">
            PharmaTrace
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1 shrink-0">
          {primaryNavLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
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

          <div className="dropdown dropdown-bottom dropdown-end">
            <label
              tabIndex={0}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                isModuleActive
                  ? 'bg-[#172638] text-[#00D6B4] border border-[#00D6B4]/30'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172638]/60 border border-transparent'
              }`}
            >
              <span>Modules</span>
              <ChevronDown className="h-3 w-3" />
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content z-[100] menu p-2 shadow-2xl bg-[#172638] border border-[#304257] rounded-xl w-52 text-xs space-y-1 mt-2"
            >
              {moduleNavLinks.map((item) => {
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
                      <Icon className="h-3.5 w-3.5 text-[#00D6B4]" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-[#172638] border border-[#304257] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#00D6B4]/40 transition shrink-0"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-[#00D6B4]" />
            <span className="hidden sm:inline text-[11px]">Command</span>
            <kbd className="hidden sm:inline text-[10px] font-mono bg-[#243247] px-1 py-0.5 rounded text-[#94A3B8]">
              Ctrl K
            </kbd>
          </button>

          <Badge variant="teal" size="sm" className="hidden md:flex shrink-0 gap-1.5 py-1 px-2 font-mono text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D6B4] animate-pulse"></span>
            <span>Sepolia</span>
          </Badge>

          {walletAddress && (
            <Badge variant="teal" size="sm" className="hidden xl:flex shrink-0 gap-1 py-1 px-2 font-mono text-[10px]">
              <CheckCircle2 className="h-3 w-3 text-[#00D6B4]" />
              <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </Badge>
          )}

          {user ? (
            <div className="dropdown dropdown-bottom dropdown-end shrink-0">
              <label
                tabIndex={0}
                className="flex items-center gap-2 bg-[#172638] hover:bg-[#243247] px-2.5 py-1.5 rounded-xl border border-[#304257] hover:border-[#00D6B4]/50 transition shrink-0 cursor-pointer select-none"
              >
                <div className="h-6 w-6 rounded-lg bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center shrink-0">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-[#F1F5F9] leading-tight truncate max-w-[90px] sm:max-w-[120px]">
                    {user.fullName || user.email}
                  </span>
                  <span className="text-[9px] text-[#94A3B8] leading-tight truncate max-w-[90px] sm:max-w-[120px]">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 text-[#94A3B8] shrink-0" />
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content z-[100] menu p-3 shadow-2xl bg-[#172638] border border-[#304257] rounded-2xl w-64 text-xs space-y-2 mt-2"
              >
                <li className="menu-title px-2 py-1 text-[#94A3B8] border-b border-[#304257] pb-2">
                  <div className="font-bold text-[#F1F5F9] text-xs">{user.fullName || 'Enterprise User'}</div>
                  <div className="font-mono text-[10px] text-[#94A3B8] truncate">{user.email}</div>
                  {user.organization && (
                    <div className="text-[10px] text-[#00D6B4] mt-0.5">{user.organization}</div>
                  )}
                  <div className="mt-1">
                    <span className={`badge badge-xs font-bold uppercase border text-[9px] py-0.5 px-1.5 ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </li>

                <li>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-xl py-2 text-[#F1F5F9] hover:bg-[#243247] hover:text-[#00D6B4]"
                  >
                    <UserCog className="h-4 w-4 text-[#00D6B4]" />
                    <span>Manage User Profile</span>
                  </Link>
                </li>

                <li className="border-t border-[#304257] pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl py-2 text-rose-400 hover:bg-rose-500/15 font-semibold"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Button asChild size="sm" className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold shadow-sm shrink-0 text-xs px-3">
              <Link href="/login" className="flex items-center gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}

          <div className="dropdown dropdown-bottom dropdown-end lg:hidden">
            <label tabIndex={0} className="btn btn-xs sm:btn-sm btn-ghost border border-[#304257] text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl px-2">
              <Menu className="h-4 w-4" />
            </label>
            <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-2xl bg-[#172638] border border-[#304257] rounded-2xl w-52 text-xs space-y-1 mt-2">
              {allNavLinks.map((item) => {
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
                      <Icon className="h-3.5 w-3.5 text-[#00D6B4]" />
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
