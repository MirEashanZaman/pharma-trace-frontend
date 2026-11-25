'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Printer, Network, Search, ArrowRight } from 'lucide-react';

export function VerifyActions({ serialNumber }: { serialNumber: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.08]">
      <button
        type="button"
        onClick={handleCopy}
        className="h-9 px-3.5 rounded-lg bg-[#1a1e28] hover:bg-[#232734] border border-white/[0.08] text-xs font-medium text-[#eef0f5] transition-colors inline-flex items-center gap-2 cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-[#4cc38a]" />
            <span>Audit link copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-[#a3a9b8]" />
            <span>Copy audit link</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="h-9 px-3.5 rounded-lg bg-[#1a1e28] hover:bg-[#232734] border border-white/[0.08] text-xs font-medium text-[#eef0f5] transition-colors inline-flex items-center gap-2 cursor-pointer"
      >
        <Printer className="h-3.5 w-3.5 text-[#a3a9b8]" />
        <span>Print certificate</span>
      </button>

      <Link
        href={`/provenance?serial=${encodeURIComponent(serialNumber)}`}
        className="h-9 px-3.5 rounded-lg bg-[#1a1e28] hover:bg-[#232734] border border-white/[0.08] text-xs font-medium text-[#eef0f5] transition-colors inline-flex items-center gap-2"
      >
        <Network className="h-3.5 w-3.5 text-[#00D6B4]" />
        <span>Inspect DAG</span>
      </Link>

      <Link
        href="/verify"
        className="h-9 px-4 rounded-lg bg-white text-[#0b0d14] font-medium text-xs hover:bg-[#eef0f5] transition-colors inline-flex items-center gap-2 ms-auto"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Verify another medicine</span>
      </Link>
    </div>
  );
}
