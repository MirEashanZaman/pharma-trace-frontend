'use client';

import React from 'react';
import { Navigation } from '@/components/navigation';
import { ProvenanceDagVisualizer } from '@/components/provenance-dag';
import {
  Network,
  ShieldCheck,
  FileCheck2,
  Lock,
  GitBranch,
  Boxes,
  Cpu,
  Layers,
} from 'lucide-react';

export default function ProvenancePage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#304257] pb-6">
          <div className="space-y-1">
            <div className="badge badge-sm bg-[#00D6B4]/15 border border-[#00D6B4]/30 text-[#00D6B4] font-bold uppercase tracking-wider py-2 px-3 gap-1.5">
              <Network className="h-3.5 w-3.5 text-[#00D6B4]" /> GxP Regulatory Compliance &bull; Audit DAG
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F1F5F9] tracking-tight">
              Interactive Provenance DAG Visualizer
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl">
              Cryptographically verified Directed Acyclic Graph (DAG) for health authorities, quality auditors, and supply chain partners. Traces end-to-end custody handovers, EIP-712 Dual Handshake signatures, Merkle batch roots, and EPCIS 2.0 packaging aggregations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge badge-sm bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] font-mono text-[11px] py-2 px-3">
              Acyclic Provenance Verified
            </span>
          </div>
        </div>

        <ProvenanceDagVisualizer />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="card bg-[#243247] border border-[#304257] rounded-2xl p-5 space-y-2">
            <div className="h-9 w-9 rounded-xl bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center font-bold">
              <GitBranch className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#F1F5F9]">
              Strict Acyclic State Machine
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Every custody handover enforces unidirectional progression across Manufacturer, Distributor, and Pharmacy roles, preventing illegitimate skips and duplicate state loops.
            </p>
          </div>

          <div className="card bg-[#243247] border border-[#304257] rounded-2xl p-5 space-y-2">
            <div className="h-9 w-9 rounded-xl bg-[#38BDF8]/15 text-[#38BDF8] flex items-center justify-center font-bold">
              <Boxes className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#F1F5F9]">
              EPCIS 2.0 Hierarchy Tracking
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Maps primary items (SGTIN) through secondary carton bundles into shipping cases (SSCC) and intermodal reefer pallets with recursive custody inheritance.
            </p>
          </div>

          <div className="card bg-[#243247] border border-[#304257] rounded-2xl p-5 space-y-2">
            <div className="h-9 w-9 rounded-xl bg-[#A3E635]/15 text-[#A3E635] flex items-center justify-center font-bold">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm text-[#F1F5F9]">
              Hardware KMS Cryptographic Anchors
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Attestations are signed via FIPS 140-2 Level 3 Hardware Security Modules and anchored to EVM contracts with Merkle inclusion proofs and IPFS dossiers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
