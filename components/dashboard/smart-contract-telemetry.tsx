'use client';

import React from 'react';
import { Radio, Network, Activity, FileCheck2 } from 'lucide-react';

export function SmartContractTelemetry() {
  return (
    <>
      <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Chainlink Automation</span>
          <span className="badge badge-xs bg-[#00D6B4] text-[#0B1220] font-bold border-none">AutomationOracle</span>
        </div>
        <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
          <Radio className="h-4 w-4 text-[#00D6B4]" /> Automated Sensor Excursion Upkeep
        </div>
        <div className="text-xs text-[#94A3B8] space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span>Upkeep Check:</span>
            <span className="text-[#F1F5F9]">Decentralized DON Logic</span>
          </div>
          <div className="flex justify-between">
            <span>Slashing Trigger:</span>
            <span className="text-[#F1F5F9]">Excursion Duration Exceeded</span>
          </div>
          <div className="flex justify-between">
            <span>Automation State:</span>
            <span className="text-[#A3E635]">Autonomous On-Chain Active</span>
          </div>
        </div>
      </div>

      <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Cross-Chain Bridge</span>
          <span className="badge badge-xs bg-[#00D6B4] text-[#0B1220] font-bold border-none">CCIP / L2</span>
        </div>
        <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
          <Network className="h-4 w-4 text-[#00D6B4]" /> Digital Twin Token Messenger
        </div>
        <div className="text-xs text-[#94A3B8] space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span>Bridging Model:</span>
            <span className="text-[#F1F5F9]">Lock-and-Mint Protocol</span>
          </div>
          <div className="flex justify-between">
            <span>Anti-Duplication:</span>
            <span className="text-[#A3E635]">Strict Global Single-Carton</span>
          </div>
          <div className="flex justify-between">
            <span>Supported L2s:</span>
            <span className="text-[#00D6B4]">Base, Arbitrum, Amoy</span>
          </div>
        </div>
      </div>

      <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Sparse Merkle Tree</span>
          <span className="badge badge-xs bg-[#00D6B4] text-[#0B1220] font-bold border-none">BatchRollup</span>
        </div>
        <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#00D6B4]" /> O(log N) Cryptographic Inclusion
        </div>
        <div className="text-xs text-[#94A3B8] space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span>Compression:</span>
            <span className="text-[#F1F5F9]">100k Units / 32-Byte Root</span>
          </div>
          <div className="flex justify-between">
            <span>Proof Verification:</span>
            <span className="text-[#A3E635]">On-Chain / Offline Verified</span>
          </div>
          <div className="flex justify-between">
            <span>Gas Efficiency:</span>
            <span className="text-[#00D6B4]">99.8% Storage Cost Reduction</span>
          </div>
        </div>
      </div>

      <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">W3C DIDs & VCs</span>
          <span className="badge badge-xs bg-[#A3E635] text-[#0B1220] font-bold border-none">did:ethr</span>
        </div>
        <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-[#A3E635]" /> Verifiable Credentials & GLN
        </div>
        <div className="text-xs text-[#94A3B8] space-y-1.5 font-mono">
          <div className="flex justify-between">
            <span>Identity Anchor:</span>
            <span className="text-[#F1F5F9]">GS1 GLN + FDA FEI Validated</span>
          </div>
          <div className="flex justify-between">
            <span>Revocation List:</span>
            <span className="text-[#A3E635]">StatusList2021 Dynamic Bitstring</span>
          </div>
          <div className="flex justify-between">
            <span>Handover Rule:</span>
            <span className="text-[#00D6B4]">Strict GxP Enforced</span>
          </div>
        </div>
      </div>
    </>
  );
}
