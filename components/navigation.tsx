'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
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
    <header className="sticky top-0 z-50 bg-[#07080d]/90 backdrop-blur-md border-b border-white/[0.08] text-[#eef0f5] w-full">
      <div className="w-full max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-7 w-7 rounded-md bg-[#00D6B4] flex items-center justify-center text-[#07080d]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium tracking-tight text-[#eef0f5] whitespace-nowrap">
            PharmaTrace
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 shrink-0">
          {primaryNavLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  active
                    ? 'text-[#eef0f5]'
                    : 'text-[#a3a9b8] hover:text-[#eef0f5] hover:bg-[#11141c]'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-[#1a1e28] border border-white/[0.08] rounded-md -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#00D6B4]' : 'text-[#7a8296]'}`} />
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
              className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer select-none ${
                isModuleActive
                  ? 'text-[#eef0f5]'
                  : 'text-[#a3a9b8] hover:text-[#eef0f5] hover:bg-[#11141c]'
              }`}
            >
              {isModuleActive && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute inset-0 bg-[#1a1e28] border border-white/[0.08] rounded-md -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}
              <span>Modules</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${isModulesOpen ? 'rotate-180 text-[#eef0f5]' : 'text-[#7a8296]'}`} />
            </button>

            <AnimatePresence>
              {isModulesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 top-full mt-1.5 z-[100] p-1.5 shadow-xl bg-[#11141c] border border-white/[0.08] rounded-lg w-48 text-xs space-y-0.5"
                >
                  {moduleNavLinks.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsModulesOpen(false)}
                        className={`flex items-center gap-2 rounded-md py-1.5 px-2.5 transition-colors ${
                          active ? 'bg-[#1a1e28] text-[#eef0f5] font-medium' : 'text-[#a3a9b8] hover:text-[#eef0f5] hover:bg-[#1a1e28]/60'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 text-[#00D6B4]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
            aria-label="Open Command Palette"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-[#11141c] border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] hover:border-white/20 transition-colors shrink-0"
            title="Open Command Palette (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-[#7a8296]" aria-hidden="true" />
            <span className="hidden sm:inline text-[11px]">Command</span>
            <kbd className="hidden sm:inline text-[10px] font-mono bg-[#1a1e28] px-1 py-0.5 rounded text-[#a3a9b8]">
              Ctrl K
            </kbd>
          </button>

          <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#11141c] border border-white/[0.06] text-[11px] font-mono text-[#a3a9b8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4cc38a]"></span>
            <span>Sepolia</span>
          </div>

          {walletAddress && (
            <div className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded bg-[#11141c] border border-white/[0.06] text-[11px] font-mono text-[#a3a9b8]">
              <CheckCircle2 className="h-3 w-3 text-[#4cc38a]" aria-hidden="true" />
              <span>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/profile"
                className="flex items-center gap-2 bg-[#11141c] hover:bg-[#1a1e28] px-2.5 py-1 rounded-lg border border-white/[0.08] transition-colors shrink-0"
                title="Profile Editor"
                aria-label={`View profile for ${user.fullName || user.email}`}
              >
                <div className="h-5 w-5 rounded bg-[#1a1e28] text-[#a3a9b8] flex items-center justify-center shrink-0">
                  <User className="h-3 w-3" aria-hidden="true" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-medium text-[#eef0f5] leading-tight truncate max-w-[85px] sm:max-w-[120px]">
                    {user.fullName || user.email}
                  </span>
                  <span className="text-[9px] text-[#7a8296] leading-tight truncate max-w-[85px] sm:max-w-[120px]">
                    {user.role}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign Out"
                className="p-1.5 rounded-lg bg-[#11141c] hover:bg-rose-500/10 border border-white/[0.08] hover:border-rose-500/30 text-[#a3a9b8] hover:text-rose-400 transition-colors shrink-0"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="h-8 px-3 rounded-lg bg-white text-[#0b0d14] font-medium text-xs hover:bg-[#eef0f5] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign in</span>
            </Link>
          )}

          <div ref={mobileMenuRef} className="relative lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="p-1.5 rounded-lg border border-white/[0.08] text-[#a3a9b8] hover:text-[#eef0f5] bg-[#11141c] hover:bg-[#1a1e28] transition-colors"
              title="Toggle Menu"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 z-[100] p-1.5 shadow-xl bg-[#11141c] border border-white/[0.08] rounded-lg w-52 text-xs space-y-0.5"
                >
                  {user && (
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md py-1.5 px-2.5 text-[#eef0f5] font-medium hover:bg-[#1a1e28]"
                    >
                      <UserCog className="h-4 w-4 text-[#a3a9b8]" />
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
                        className={`flex items-center gap-2 rounded-md py-1.5 px-2.5 transition-colors ${
                          active ? 'bg-[#1a1e28] text-[#eef0f5] font-medium' : 'text-[#a3a9b8] hover:text-[#eef0f5] hover:bg-[#1a1e28]/60'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 text-[#7a8296]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  {user && (
                    <div className="border-t border-white/[0.08] pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2 rounded-md py-1.5 px-2.5 text-rose-400 hover:bg-rose-500/10 font-medium"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
