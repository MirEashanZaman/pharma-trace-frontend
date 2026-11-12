'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Fuel,
  Cpu,
  Layers,
  Copy,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface UserOpStatus {
  userOpHash: string;
  sender: string;
  targetContract: string;
  action: string;
  status: 'SUBMITTED' | 'MEMPOOL' | 'VALIDATED' | 'CONFIRMED';
  blockNumber?: number;
  txHash?: string;
  timestamp: string;
}

export function UserOpStatusDrawer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeOps, setActiveOps] = useState<UserOpStatus[]>([
    {
      userOpHash: '0xc1eb8539b388b6b2f3c57f96095d9441d590d6d058cf3f8dc9e8947d3986b456',
      sender: '0x1111111111111111111111111111111111111111',
      targetContract: 'PharmaDigitalTwin',
      action: 'ItemMinted / DualHandshake',
      status: 'CONFIRMED',
      blockNumber: 1849202,
      txHash: '0x08188849b883c01bdf1a50c192cc7c049414cc5a640f60befa357216d747b31e',
      timestamp: '2m ago',
    },
  ]);

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getStatusBadge = (status: UserOpStatus['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="text-[10px] font-mono font-bold text-[#A3E635] bg-[#A3E635]/15 px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Confirmed
          </span>
        );
      case 'VALIDATED':
        return (
          <span className="text-[10px] font-mono font-bold text-[#00D6B4] bg-[#00D6B4]/15 px-2 py-0.5 rounded flex items-center gap-1">
            <Fuel className="h-3 w-3" /> Sponsored
          </span>
        );
      case 'MEMPOOL':
        return (
          <span className="text-[10px] font-mono font-bold text-[#38BDF8] bg-[#38BDF8]/15 px-2 py-0.5 rounded flex items-center gap-1">
            <Clock className="h-3 w-3 animate-spin" /> In Bundler
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold text-[#FBBF24] bg-[#FBBF24]/15 px-2 py-0.5 rounded">
            Submitted
          </span>
        );
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm sm:max-w-md w-full">
      <div className="bg-[#172638] border border-[#304257] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-3.5 bg-[#0B1220] flex items-center justify-between cursor-pointer hover:bg-[#0B1220]/80 transition select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-lg bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center">
              <Fuel className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#F1F5F9]">ERC-4337 Account Abstraction</span>
              <span className="text-[10px] text-[#00D6B4] block font-mono">
                Gasless &bull; Sponsored by PharmaPaymaster
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#94A3B8]">{activeOps.length} Active</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
            ) : (
              <ChevronUp className="h-4 w-4 text-[#94A3B8]" />
            )}
          </div>
        </div>

        {isOpen && (
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto bg-[#172638] border-t border-[#304257]/60">
            {activeOps.map((op, idx) => (
              <div
                key={op.userOpHash || idx}
                className="bg-[#243247] border border-[#304257] rounded-xl p-3 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#F1F5F9]">{op.action}</span>
                  {getStatusBadge(op.status)}
                </div>

                <div className="text-[11px] font-mono text-[#94A3B8] space-y-1">
                  <div className="flex items-center justify-between">
                    <span>UserOp Hash</span>
                    <button
                      onClick={() => handleCopy(op.userOpHash)}
                      className="text-[#00D6B4] hover:underline flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{op.userOpHash.slice(0, 10)}...</span>
                    </button>
                  </div>

                  {op.txHash && (
                    <div className="flex items-center justify-between">
                      <span>EVM Tx Hash</span>
                      <span className="text-[#38BDF8] truncate max-w-[130px]" title={op.txHash}>
                        {op.txHash.slice(0, 12)}...
                      </span>
                    </div>
                  )}

                  {op.blockNumber && (
                    <div className="flex items-center justify-between">
                      <span>Confirmed Block</span>
                      <span className="text-[#F1F5F9]">#{op.blockNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
