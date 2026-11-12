'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { ProvenanceDagVisualizer } from '@/components/provenance-dag';
import { SubgraphExplorer } from '@/components/subgraph-explorer';
import { ColdChainChart } from '@/components/cold-chain-chart';
import { ZkProofInspector } from '@/components/zk-proof-inspector';
import { Gs1BarcodeSuite } from '@/components/gs1-barcode-suite';
import {
  Network,
  ShieldCheck,
  FileCheck2,
  Lock,
  GitBranch,
  Boxes,
  Cpu,
  Layers,
  Database,
  Thermometer,
  Scan,
} from 'lucide-react';

export default function ProvenancePage() {
  const [activeTab, setActiveTab] = useState<'dag' | 'subgraph' | 'telemetry' | 'gs1'>('dag');

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#304257] pb-6">
          <div className="space-y-1">
            <div className="badge badge-sm bg-[#00D6B4]/15 border border-[#00D6B4]/30 text-[#00D6B4] font-bold uppercase tracking-wider py-2 px-3 gap-1.5">
              <Network className="h-3.5 w-3.5 text-[#00D6B4]" /> GxP Regulatory Compliance &bull; Audit DAG
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F1F5F9] tracking-tight">
              Decentralized Provenance &amp; Verification Suite
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-3xl">
              Cryptographically verified pharmaceutical audit suite: Directed Acyclic Graph (DAG), The Graph Protocol Subgraph indexing, Circom ZK-SNARK cold-chain verification, and GS1 2D DataMatrix serialization.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-sm bg-[#A3E635]/15 border border-[#A3E635]/30 text-[#A3E635] font-mono text-[11px] py-2 px-3">
              Acyclic Provenance Verified
            </span>
            <span className="badge badge-sm bg-[#00D6B4]/15 border border-[#00D6B4]/30 text-[#00D6B4] font-mono text-[11px] py-2 px-3">
              The Graph Indexed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-[#304257] overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveTab('dag')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'dag'
                ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172638]'
            }`}
          >
            <GitBranch className="h-4 w-4" />
            <span>Interactive Provenance DAG</span>
          </button>

          <button
            onClick={() => setActiveTab('subgraph')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'subgraph'
                ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172638]'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>The Graph Subgraph Explorer</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172638]'
            }`}
          >
            <Thermometer className="h-4 w-4" />
            <span>Cold-Chain IoT &amp; ZK Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('gs1')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap ${
              activeTab === 'gs1'
                ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172638]'
            }`}
          >
            <Scan className="h-4 w-4" />
            <span>GS1 2D DataMatrix Suite</span>
          </button>
        </div>

        {activeTab === 'dag' && (
          <div className="space-y-6">
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
          </div>
        )}

        {activeTab === 'subgraph' && (
          <div className="space-y-6">
            <SubgraphExplorer />
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <ColdChainChart />
            <ZkProofInspector />
          </div>
        )}

        {activeTab === 'gs1' && (
          <div className="space-y-6">
            <Gs1BarcodeSuite />
          </div>
        )}
      </main>
    </div>
  );
}
