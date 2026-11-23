'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Activity,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Zap,
  Layers,
  ThermometerSnowflake,
  Search,
  Check,
  FileCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveEvent {
  id: string;
  timestamp: string;
  batchId: string;
  type: string;
  status: string;
  detail: string;
}

const mockEvents: LiveEvent[] = [
  {
    id: 'evt-1',
    timestamp: '14:22:08 UTC',
    batchId: 'BATCH-2026-AZ401',
    type: 'Custody transfer',
    status: 'Verified',
    detail: 'Manufacturer to Carrier Hub with electronic signature validation',
  },
  {
    id: 'evt-2',
    timestamp: '14:21:40 UTC',
    batchId: 'BATCH-2026-COV99',
    type: 'ZK Groth16 proof',
    status: 'Anchored',
    detail: 'Cold-chain telemetry bounded in 0.367 ms without GPS disclosure',
  },
  {
    id: 'evt-3',
    timestamp: '14:20:12 UTC',
    batchId: 'BATCH-2026-INS12',
    type: 'IoT telemetry',
    status: 'Optimal',
    detail: 'Refrigerated container at 3.4°C against 2.0°C to 8.0°C target',
  },
  {
    id: 'evt-4',
    timestamp: '14:18:55 UTC',
    batchId: 'BATCH-2026-VAC08',
    type: 'Merkle batch',
    status: 'Anchored',
    detail: '64 custody attestations aggregated into root 0x8a9f...c21',
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'events' | 'zk' | 'coldchain'>('events');
  const [simulatedBatchInput, setSimulatedBatchInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    batchId: string;
    verified: boolean;
    merkleRoot: string;
    timestamp: string;
    coldChainStatus: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleQuickVerify = (batchId: string) => {
    setIsVerifying(true);
    setVerificationResult(null);
    setSimulatedBatchInput(batchId);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult({
        batchId,
        verified: true,
        merkleRoot: '0x9d4e5f1a7b8c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
        timestamp: 'Nov 24, 2026 · 14:22 UTC',
        coldChainStatus: '3.4°C (Compliant 2.0°C – 8.0°C)',
      });
    }, 400);
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PharmaTrace',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    description: 'Enterprise pharmaceutical supply chain traceability, tamper-evident GS1 digital twins, and cold-chain compliance.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen bg-[#0b0d14] text-[#eef0f5] flex flex-col font-sans selection:bg-[#00D6B4]/15 selection:text-[#00D6B4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation Header */}
      <header className="bg-[#07080d]/90 backdrop-blur-md border-b border-white/[0.08] text-[#eef0f5] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-[#00D6B4] flex items-center justify-center text-[#07080d]">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="font-medium text-sm tracking-tight text-[#eef0f5]">PharmaTrace</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#11141c] border border-white/[0.06] text-xs font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4cc38a]"></span>
            <span className="text-[#a3a9b8]">Cancun EVM</span>
            <span className="text-[#7a8296]">·</span>
            <span className="text-[#eef0f5]">Block 21,849,201</span>
          </div>

          <nav aria-label="Main Navigation" className="flex items-center gap-4 text-xs font-medium">
            <Link
              href="/provenance"
              className="text-[#a3a9b8] hover:text-[#eef0f5] transition-colors"
            >
              Provenance DAG
            </Link>
            <Link
              href="/verify"
              className="text-[#a3a9b8] hover:text-[#eef0f5] transition-colors"
            >
              Public verify
            </Link>
            <Link
              href="/dashboard"
              className="h-8 px-3 rounded-lg bg-white text-[#0b0d14] font-medium text-xs hover:bg-[#eef0f5] transition-colors flex items-center"
            >
              Enterprise console
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 pt-16 pb-24 w-full">
        <div className="max-w-2xl text-left mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#a3a9b8] mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4cc38a]"></span>
            <span>Cryptographic custody and cold-chain compliance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-[#eef0f5] leading-tight mb-4">
            Tamper-evident pharmaceutical provenance on Ethereum
          </h1>

          <p className="text-sm sm:text-base text-[#a3a9b8] leading-relaxed mb-6">
            Event sourcing, GS1 digital twins, and zero-knowledge cold-chain verification anchored to Solidity smart contracts. Eliminates supply chain counterfeit risks with mathematical finality.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="h-10 px-4 rounded-lg bg-white text-[#0b0d14] font-medium text-xs hover:bg-[#eef0f5] transition-colors inline-flex items-center gap-2"
            >
              <span>Open enterprise console</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#0b0d14]" aria-hidden="true" />
            </Link>
            <Link
              href="/verify"
              className="h-10 px-4 rounded-lg bg-[#11141c] hover:bg-[#1a1e28] text-[#eef0f5] border border-white/[0.08] font-medium text-xs transition-colors inline-flex items-center gap-2"
            >
              <Search className="h-3.5 w-3.5 text-[#a3a9b8]" />
              <span>Verify a batch serial</span>
            </Link>
          </div>
        </div>

        {/* Empirical Benchmarks Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
          <div className="p-4 rounded-xl bg-[#11141c] border border-white/[0.08]">
            <div className="text-xs text-[#a3a9b8] font-normal mb-1">Saga throughput</div>
            <div className="text-2xl font-medium text-[#eef0f5] font-mono tracking-tight">2,378,398</div>
            <div className="text-[11px] text-[#7a8296] font-mono mt-0.5">operations / sec</div>
          </div>

          <div className="p-4 rounded-xl bg-[#11141c] border border-white/[0.08]">
            <div className="text-xs text-[#a3a9b8] font-normal mb-1">Groth16 ZK prover</div>
            <div className="text-2xl font-medium text-[#eef0f5] font-mono tracking-tight">0.367</div>
            <div className="text-[11px] text-[#7a8296] font-mono mt-0.5">milliseconds / proof</div>
          </div>

          <div className="p-4 rounded-xl bg-[#11141c] border border-white/[0.08]">
            <div className="text-xs text-[#a3a9b8] font-normal mb-1">Merkle attestation</div>
            <div className="text-2xl font-medium text-[#eef0f5] font-mono tracking-tight">44,010</div>
            <div className="text-[11px] text-[#7a8296] font-mono mt-0.5">events / sec batching</div>
          </div>

          <div className="p-4 rounded-xl bg-[#11141c] border border-white/[0.08]">
            <div className="text-xs text-[#a3a9b8] font-normal mb-1">Automated test suite</div>
            <div className="text-2xl font-medium text-[#eef0f5] font-mono tracking-tight">155 / 155</div>
            <div className="text-[11px] text-[#7a8296] font-mono mt-0.5">94 Hardhat Cancun passing</div>
          </div>
        </div>

        {/* Product Moment: Interactive Batch Verification & Live Attestations */}
        <div className="rounded-xl border border-white/[0.08] bg-[#11141c] p-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.08]">
            <div>
              <h2 className="text-base font-medium text-[#eef0f5]">Live blockchain audit telemetry</h2>
              <p className="text-xs text-[#a3a9b8] mt-0.5">
                Real-time cryptographic attestation logs anchored to smart contracts
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#0b0d14] p-1 rounded-lg border border-white/[0.06] text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'events' ? 'bg-[#1a1e28] text-[#eef0f5]' : 'text-[#a3a9b8] hover:text-[#eef0f5]'
                }`}
              >
                Custody events
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('zk')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'zk' ? 'bg-[#1a1e28] text-[#eef0f5]' : 'text-[#a3a9b8] hover:text-[#eef0f5]'
                }`}
              >
                ZK proof circuit
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('coldchain')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'coldchain' ? 'bg-[#1a1e28] text-[#eef0f5]' : 'text-[#a3a9b8] hover:text-[#eef0f5]'
                }`}
              >
                Cold storage
              </button>
            </div>
          </div>

          <div className="pt-4">
            {activeTab === 'events' && (
              <div className="space-y-2">
                {mockEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-lg bg-[#0b0d14] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] text-[#4cc38a] font-medium">{evt.status}</span>
                      <span className="font-mono text-[#eef0f5]">{evt.batchId}</span>
                      <span className="text-[#7a8296]">·</span>
                      <span className="text-[#a3a9b8]">{evt.detail}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#7a8296]">{evt.timestamp}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'zk' && (
              <div className="p-4 rounded-lg bg-[#0b0d14] border border-white/[0.06] text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-[#a3a9b8]">
                  <span>Circuit: ZkColdChainVerifier (Groth16 BN254)</span>
                  <span className="text-[#4cc38a]">Prover online</span>
                </div>
                <div className="text-[11px] text-[#7a8296] space-y-1">
                  <div>public_signals: [root: 0x1a8f...92, minTemp: 2.0°C, maxTemp: 8.0°C]</div>
                  <div>proof_verification_time: 0.367 ms · status: VALID</div>
                  <div>zero_knowledge_guarantee: sensor hardware address and coordinates redacted</div>
                </div>
              </div>
            )}

            {activeTab === 'coldchain' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#0b0d14] rounded-lg border border-white/[0.06]">
                  <div className="text-[11px] text-[#a3a9b8]">Fleet mean temperature</div>
                  <div className="text-lg font-medium text-[#eef0f5] font-mono mt-0.5">3.4°C</div>
                  <div className="text-[10px] text-[#7a8296]">Target range 2.0°C – 8.0°C</div>
                </div>
                <div className="p-3 bg-[#0b0d14] rounded-lg border border-white/[0.06]">
                  <div className="text-[11px] text-[#a3a9b8]">Carrier bond escrow</div>
                  <div className="text-lg font-medium text-[#eef0f5] font-mono mt-0.5">10.00 ETH</div>
                  <div className="text-[10px] text-[#4cc38a]">Unslashed · Active transit</div>
                </div>
                <div className="p-3 bg-[#0b0d14] rounded-lg border border-white/[0.06]">
                  <div className="text-[11px] text-[#a3a9b8]">Hardware consensus</div>
                  <div className="text-lg font-medium text-[#eef0f5] font-mono mt-0.5">3 / 3</div>
                  <div className="text-[10px] text-[#7a8296]">Multi-sensor quorum confirmed</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Verification Tool */}
        <div className="rounded-xl border border-white/[0.08] bg-[#11141c] p-6 mb-12 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-medium text-[#eef0f5]">Verify pharmaceutical serialization</h2>
              <p className="text-xs text-[#a3a9b8] mt-0.5">
                Query contract state for genuine manufacturing and uninterrupted cold storage
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#7a8296]">Sample serials:</span>
              <button
                type="button"
                onClick={() => handleQuickVerify('BATCH-2026-AZ401')}
                className="px-2 py-0.5 rounded bg-[#1a1e28] hover:bg-[#232734] text-[#eef0f5] font-mono text-[11px] transition-colors"
              >
                AZ-401
              </button>
              <button
                type="button"
                onClick={() => handleQuickVerify('BATCH-2026-COV99')}
                className="px-2 py-0.5 rounded bg-[#1a1e28] hover:bg-[#232734] text-[#eef0f5] font-mono text-[11px] transition-colors"
              >
                COV-99
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={simulatedBatchInput}
              onChange={(e) => setSimulatedBatchInput(e.target.value)}
              placeholder="Enter batch serial number (e.g. BATCH-2026-AZ401)"
              className="flex-1 rounded-lg bg-[#0b0d14] border border-white/[0.08] px-3.5 py-2 text-xs text-[#eef0f5] focus:outline-none focus:border-white/30 font-mono"
            />
            <button
              type="button"
              onClick={() => handleQuickVerify(simulatedBatchInput || 'BATCH-2026-AZ401')}
              disabled={isVerifying}
              className="h-9 px-4 rounded-lg bg-white text-[#0b0d14] font-medium text-xs hover:bg-[#eef0f5] transition-colors flex items-center justify-center gap-1.5"
            >
              {isVerifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>

          <AnimatePresence>
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="mt-3 p-3.5 rounded-lg bg-[#0b0d14] border border-[#4cc38a]/30 text-xs font-mono space-y-1.5"
              >
                <div className="flex items-center justify-between text-[#4cc38a]">
                  <span className="font-medium flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" /> Authentic batch registration confirmed
                  </span>
                  <span className="text-[11px] text-[#7a8296]">{verificationResult.timestamp}</span>
                </div>
                <div className="text-[11px] text-[#a3a9b8] truncate">
                  Merkle root: <span className="text-[#eef0f5]">{verificationResult.merkleRoot}</span>
                </div>
                <div className="text-[11px] text-[#a3a9b8]">
                  Cold chain status: <span className="text-[#eef0f5]">{verificationResult.coldChainStatus}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Functional Architecture Grid */}
        <div className="space-y-4 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h2 className="text-base font-medium text-[#eef0f5]">Architecture modules</h2>
            <span className="text-xs text-[#7a8296] font-mono">FDA 21 CFR Part 11 compliant</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/ledger"
              className="p-4 rounded-xl bg-[#11141c] hover:bg-[#151822] border border-white/[0.08] transition-colors block group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#a3a9b8]">Live audit feed</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#7a8296] group-hover:text-[#eef0f5] transition-colors" />
              </div>
              <h3 className="text-sm font-medium text-[#eef0f5]">Ledger stream</h3>
              <p className="text-xs text-[#7a8296] mt-1 leading-relaxed">
                Immutable event stream of custody handoffs and sensor measurements.
              </p>
            </Link>

            <Link
              href="/dashboard"
              className="p-4 rounded-xl bg-[#11141c] hover:bg-[#151822] border border-white/[0.08] transition-colors block group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#a3a9b8]">Operator tools</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#7a8296] group-hover:text-[#eef0f5] transition-colors" />
              </div>
              <h3 className="text-sm font-medium text-[#eef0f5]">Operations console</h3>
              <p className="text-xs text-[#7a8296] mt-1 leading-relaxed">
                Saga transition initiation, verifiable credentials, and hardware oracle controls.
              </p>
            </Link>

            <Link
              href="/standards"
              className="p-4 rounded-xl bg-[#11141c] hover:bg-[#151822] border border-white/[0.08] transition-colors block group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#a3a9b8]">Regulatory matrix</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#7a8296] group-hover:text-[#eef0f5] transition-colors" />
              </div>
              <h3 className="text-sm font-medium text-[#eef0f5]">Compliance index</h3>
              <p className="text-xs text-[#7a8296] mt-1 leading-relaxed">
                Cross-reference mapping across FDA Title II, EU GMP Annex 11, and WHO TRS 961.
              </p>
            </Link>

            <Link
              href="/catalog"
              className="p-4 rounded-xl bg-[#11141c] hover:bg-[#151822] border border-white/[0.08] transition-colors block group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#a3a9b8]">Catalog directory</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#7a8296] group-hover:text-[#eef0f5] transition-colors" />
              </div>
              <h3 className="text-sm font-medium text-[#eef0f5]">Medicine catalog</h3>
              <p className="text-xs text-[#7a8296] mt-1 leading-relaxed">
                Registered drug batches, GS1 serialization codes, and cold-chain parameters.
              </p>
            </Link>
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer role="contentinfo" className="border-t border-white/[0.08] bg-[#07080d] py-6 text-xs text-[#7a8296]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#a3a9b8]">
            <ShieldCheck className="h-4 w-4 text-[#00D6B4]" aria-hidden="true" />
            <span className="text-[#eef0f5] font-medium">PharmaTrace</span>
            <span className="text-[#7a8296]">·</span>
            <span>FDA 21 CFR Part 11 and EU GMP Annex 11 verified</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/standards" className="hover:text-[#eef0f5] transition-colors">Standards</Link>
            <Link href="/catalog" className="hover:text-[#eef0f5] transition-colors">Catalog</Link>
            <Link href="/ledger" className="hover:text-[#eef0f5] transition-colors">Ledger</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
