'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  const [isModulesOpen, setIsModulesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const modulesRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modulesRef.current && !modulesRef.current.contains(e.target as Node)) {
        setIsModulesOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    router.push('/login');
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
    <header className="sticky top-0 z-50 bg-[#0B1220]/95 backdrop-blur-md border-b border-[#304257] text-[#F1F5F9] shadow-sm w-full">
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

          <div ref={modulesRef} className="relative">
            <button
              type="button"
              onClick={() => setIsModulesOpen(!isModulesOpen)}
              aria-label="Toggle modules navigation menu"
              aria-expanded={isModulesOpen}
              aria-haspopup="true"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                isModuleActive
                  ? 'bg-[#172638] text-[#00D6B4] border border-[#00D6B4]/30'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172638]/60 border border-transparent'
              }`}
            >
              <span>Modules</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isModulesOpen ? 'rotate-180 text-[#00D6B4]' : ''}`} />
            </button>

            {isModulesOpen && (
              <div className="absolute left-0 top-full mt-2 z-[100] p-2 shadow-2xl bg-[#172638] border border-[#304257] rounded-xl w-52 text-xs space-y-1">
                {moduleNavLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsModulesOpen(false)}
                      className={`flex items-center gap-2 rounded-lg py-2 px-2.5 transition ${
                        active ? 'bg-[#00D6B4]/15 text-[#00D6B4] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#243247]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#00D6B4]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            aria-label="Open Command Palette"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-[#172638] border border-[#304257] text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#00D6B4]/40 transition shrink-0"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-[#00D6B4]" aria-hidden="true" />
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
              <CheckCircle2 className="h-3 w-3 text-[#00D6B4]" aria-hidden="true" />
              <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </Badge>
          )}

          {user ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/profile"
                className="flex items-center gap-2 bg-[#172638] hover:bg-[#243247] px-2.5 py-1.5 rounded-xl border border-[#304257] hover:border-[#00D6B4]/50 transition shrink-0 group cursor-pointer"
                title="Profile Editor"
                aria-label={`View profile for ${user.fullName || user.email}`}
              >
                <div className="h-6 w-6 rounded-lg bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-[#F1F5F9] leading-tight truncate max-w-[85px] sm:max-w-[120px]">
                    {user.fullName || user.email}
                  </span>
                  <span className="text-[9px] text-[#94A3B8] leading-tight truncate max-w-[85px] sm:max-w-[120px]">
                    {user.role}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign Out"
                className="flex items-center gap-1.5 p-2 rounded-xl bg-[#172638] hover:bg-rose-500/15 border border-[#304257] hover:border-rose-500/40 text-[#94A3B8] hover:text-rose-400 transition shrink-0"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden 2xl:inline text-[11px] font-semibold">Sign Out</span>
              </button>
            </div>
          ) : (
            <Button asChild size="sm" className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold shadow-sm shrink-0 text-xs px-3">
              <Link href="/login" className="flex items-center gap-1.5">
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign In</span>
              </Link>
            </Button>
          )}

          <div ref={mobileMenuRef} className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="p-1.5 rounded-xl border border-[#304257] text-[#94A3B8] hover:text-[#F1F5F9] bg-[#172638] hover:bg-[#243247] transition"
              title="Toggle Menu"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            {isMobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 z-[100] p-2 shadow-2xl bg-[#172638] border border-[#304257] rounded-2xl w-56 text-xs space-y-1">
                {user && (
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg py-2 px-2.5 text-[#00D6B4] font-bold hover:bg-[#243247]"
                  >
                    <UserCog className="h-4 w-4" />
                    <span>Profile Editor</span>
                  </Link>
                )}

                {allNavLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-lg py-2 px-2.5 transition ${
                        active ? 'bg-[#00D6B4]/15 text-[#00D6B4] font-bold' : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#243247]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#00D6B4]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {user && (
                  <div className="border-t border-[#304257] pt-1 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 rounded-lg py-2 px-2.5 text-rose-400 hover:bg-rose-500/10 font-semibold"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
