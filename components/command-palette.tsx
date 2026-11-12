'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Network,
  Lock,
  Scale,
  ShieldCheck,
  BookOpen,
  FileCheck2,
  Scan,
  Database,
  Thermometer,
  Zap,
  ArrowRight,
  Command,
  X,
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  badge?: string;
}

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: PaletteItem[] = [
    {
      id: 'dash',
      title: 'Enterprise Portal & Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'prov',
      title: 'Provenance Audit DAG & Subgraph',
      category: 'Navigation',
      icon: Network,
      href: '/provenance',
      badge: 'GxP',
    },
    {
      id: 'verify',
      title: 'Public Medicine Verification',
      category: 'Navigation',
      icon: ShieldCheck,
      href: '/verify',
    },
    {
      id: 'escrow',
      title: 'Commercial Escrow & Staking',
      category: 'Navigation',
      icon: Lock,
      href: '/escrow',
    },
    {
      id: 'staking',
      title: 'Carrier Collateral Staking Pool',
      category: 'Navigation',
      icon: Scale,
      href: '/staking',
    },
    {
      id: 'dispense',
      title: 'Point of Dispense & Token Burn',
      category: 'Navigation',
      icon: Zap,
      href: '/dispense',
    },
    {
      id: 'gov',
      title: 'Regulatory Governance Timelock',
      category: 'Navigation',
      icon: FileCheck2,
      href: '/governance',
      badge: 'FDA/EMA',
    },
    {
      id: 'standards',
      title: 'Regulatory Compliance Standards (21 CFR Part 11)',
      category: 'Navigation',
      icon: BookOpen,
      href: '/standards',
    },
    {
      id: 'act-prov',
      title: 'Query The Graph Protocol Subgraph',
      category: 'Quick Action',
      icon: Database,
      href: '/provenance',
      badge: 'GraphQL',
    },
    {
      id: 'act-scan',
      title: 'Scan GS1 2D DataMatrix Serial',
      category: 'Quick Action',
      icon: Scan,
      href: '/verify',
    },
    {
      id: 'act-telemetry',
      title: 'Inspect Cold Chain IoT Telemetry',
      category: 'Quick Action',
      icon: Thermometer,
      href: '/dashboard',
      badge: 'Live',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: PaletteItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#0B1220]/80 backdrop-blur-sm">
      <div className="bg-[#172638] border border-[#304257] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#304257] flex items-center gap-3 bg-[#0B1220]/60">
          <Search className="h-5 w-5 text-[#00D6B4] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search commands, pages, batches, or actions..."
            className="w-full bg-transparent text-[#F1F5F9] text-sm focus:outline-none placeholder-[#64748B]"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 rounded-md transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94A3B8]">
              No matching commands or navigation targets found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition text-xs ${
                    isSelected ? 'bg-[#243247] text-[#00D6B4]' : 'text-[#F1F5F9] hover:bg-[#243247]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-[#00D6B4]/20 text-[#00D6B4]' : 'bg-[#0B1220] text-[#94A3B8]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-[10px] text-[#94A3B8]">{item.category}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[10px] font-mono font-bold bg-[#00D6B4]/15 border border-[#00D6B4]/30 text-[#00D6B4] px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight className={`h-3 w-3 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-[#304257] bg-[#0B1220]/40 flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-[#243247] px-1.5 py-0.5 rounded border border-[#304257]">Up</kbd>{' '}
              <kbd className="bg-[#243247] px-1.5 py-0.5 rounded border border-[#304257]">Down</kbd> Navigate
            </span>
            <span>
              <kbd className="bg-[#243247] px-1.5 py-0.5 rounded border border-[#304257]">Enter</kbd> Open
            </span>
          </div>
          <span>
            <kbd className="bg-[#243247] px-1.5 py-0.5 rounded border border-[#304257]">Esc</kbd> Close
          </span>
        </div>
      </div>
    </div>
  );
}
