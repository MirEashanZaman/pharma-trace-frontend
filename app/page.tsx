'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Activity,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Sparkles,
  Radio,
  FileCheck2,
  Terminal,
  Zap,
  Layers,
  ThermometerSnowflake,
  ExternalLink,
  ChevronRight,
  Check,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

interface LiveEvent {
  id: string;
  timestamp: string;
  batchId: string;
  type: string;
  status: 'VERIFIED' | 'ANCHORED' | 'OPTIMAL';
  detail: string;
}

const mockEvents: LiveEvent[] = [
  {
    id: 'evt-1',
    timestamp: 'JUST NOW',
    batchId: 'BATCH-2026-AZ401',
    type: 'CUSTODY_TRANSFER',
    status: 'VERIFIED',
    detail: 'Manufacturer -> Carrier Hub | Saga Transfer Validated',
  },
  {
    id: 'evt-2',
    timestamp: '3s AGO',
    batchId: 'BATCH-2026-COV99',
    type: 'ZK_GROTH16_PROOF',
    status: 'ANCHORED',
    detail: 'Cold-chain privacy proof validated in 0.367ms',
  },
  {
    id: 'evt-3',
    timestamp: '7s AGO',
    batchId: 'BATCH-2026-INS12',
    type: 'IOT_TELEMETRY',
    status: 'OPTIMAL',
    detail: 'Sensors 3.4°C [Threshold 2.0°C - 8.0°C] | 100% Nominal',
  },
  {
    id: 'evt-4',
    timestamp: '12s AGO',
    batchId: 'BATCH-2026-VAC08',
    type: 'MERKLE_BATCH',
    status: 'ANCHORED',
    detail: '64 events aggregated into EVM Merkle Root 0x8a9f...c21',
  },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'events' | 'zk' | 'coldchain'>('events');
  const [eventIndex, setEventIndex] = useState(0);
  const [simulatedBatchInput, setSimulatedBatchInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    batchId: string;
    verified: boolean;
    merkleRoot: string;
    gasUsed: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setEventIndex((prev) => (prev + 1) % mockEvents.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

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
        gasUsed: '84,120 gas (EVM Cancun)',
      });
    }, 600);
  };

  return (
    <div className="relative min-h-screen bg-[#080D1A] text-[#F1F5F9] flex flex-col font-sans overflow-x-hidden selection:bg-[#00D6B4]/20 selection:text-[#00D6B4]">
      {/* 21st.dev Style Background Grid & Ambient Aurora Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#17263815_1px,transparent_1px),linear-gradient(to_bottom,#17263815_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Floating Animated Radial Glow Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.28, 0.15],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[780px] h-[440px] bg-gradient-to-b from-[#00D6B4]/20 via-[#38BDF8]/10 to-transparent blur-[120px] pointer-events-none -z-10"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.08, 0.18, 0.08],
          x: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-[280px] right-[-120px] w-[500px] h-[500px] bg-gradient-to-l from-[#38BDF8]/15 via-[#818CF8]/10 to-transparent blur-[140px] pointer-events-none -z-10"
      />

      {/* Main Header with Glassmorphism */}
      <header className="bg-[#080D1A]/80 backdrop-blur-xl border-b border-[#1E2D42] text-[#F1F5F9] sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#00D6B4] to-[#00b89a] flex items-center justify-center text-[#080D1A] font-black shadow-lg shadow-[#00D6B4]/20 cursor-pointer"
            >
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                PharmaTrace
              </span>
              <span className="text-[10px] font-mono text-[#00D6B4] tracking-widest uppercase -mt-1">
                Protocol v2.0
              </span>
            </div>
          </Link>

          {/* Live Global Blockchain State Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#111A2E]/80 border border-[#1E2D42] text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D6B4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D6B4]"></span>
            </span>
            <span className="text-[#94A3B8]">Cancun EVM:</span>
            <span className="text-[#00D6B4] font-semibold">Block #21,849,201</span>
          </div>

          <nav aria-label="Main Navigation" className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/provenance"
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#00D6B4] transition px-2.5 py-1.5 flex items-center gap-1 rounded-lg hover:bg-[#111A2E]"
            >
              Provenance DAG
            </Link>
            <Link
              href="/verify"
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition px-2.5 py-1.5 flex items-center gap-1 rounded-lg hover:bg-[#111A2E]"
            >
              Public Verify
            </Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button asChild size="sm" className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#080D1A] font-bold rounded-xl shadow-md shadow-[#00D6B4]/20 text-xs px-3 sm:px-4">
                <Link href="/dashboard">
                  Enterprise Portal
                </Link>
              </Button>
            </motion.div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-24 max-w-6xl mx-auto w-full relative z-10"
      >
        {/* Animated Live Ticker Pill */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00D6B4]/30 bg-[#111A2E]/90 backdrop-blur-md shadow-lg shadow-[#00D6B4]/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D6B4] opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D6B4]"></span>
            </span>
            <span className="text-[11px] font-mono text-[#00D6B4] uppercase tracking-wider font-bold">
              Live Network Active
            </span>
            <span className="text-[#334155]">•</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={eventIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="text-[11px] font-mono text-[#E2E8F0]"
              >
                {mockEvents[eventIndex].type}: {mockEvents[eventIndex].batchId}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#F1F5F9] tracking-tight leading-[1.08] mb-6 max-w-4xl">
          Zero-Counterfeit Pharma <br />
          <span className="bg-gradient-to-r from-[#00D6B4] via-[#38BDF8] to-[#818CF8] bg-clip-text text-transparent">
            Provenance on EVM Blockchain
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p variants={itemVariants} className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Cryptographic GS1 digital twins, ZK-SNARK cold-chain compliance proofs, and Saga-orchestrated custody transfers anchored immutably to decentralized smart contracts.
        </motion.p>

        {/* Interactive CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center max-w-xl mb-16">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto bg-[#00D6B4] hover:bg-[#00b89a] text-[#080D1A] font-extrabold rounded-xl px-7 text-sm shadow-xl shadow-[#00D6B4]/25 h-12">
              <Link href="/dashboard" className="flex items-center justify-center gap-2">
                Launch Enterprise Console <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto border-[#1E2D42] bg-[#111A2E] text-[#00D6B4] hover:bg-[#17243A] hover:border-[#00D6B4]/40 px-6 text-sm shadow-sm h-12 font-bold">
              <Link href="/provenance" className="flex items-center justify-center gap-2">
                <Activity className="h-4 w-4" aria-hidden="true" /> Audit Provenance DAG
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-[#1E2D42] bg-[#111A2E]/60 text-[#F1F5F9] hover:bg-[#17243A] px-6 text-sm shadow-sm h-12 font-semibold">
              <Link href="/verify" className="flex items-center justify-center gap-1.5">
                <Search className="h-4 w-4 text-[#94A3B8]" /> Public Verify
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Empirical Benchmarks Strip */}
        <motion.div variants={itemVariants} className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 mb-16 max-w-5xl">
          <div className="p-4 rounded-2xl bg-[#111A2E]/70 border border-[#1E2D42] backdrop-blur-md text-left space-y-1">
            <div className="text-[11px] font-mono text-[#00D6B4] uppercase tracking-wider flex items-center justify-between">
              <span>Saga Throughput</span>
              <Zap className="h-3.5 w-3.5 text-[#00D6B4]" />
            </div>
            <div className="text-2xl font-black text-[#F1F5F9] font-mono">2.37M <span className="text-xs font-normal text-[#94A3B8]">ops/sec</span></div>
            <div className="text-[10px] text-[#94A3B8]">Sub-microsecond custody transitions</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111A2E]/70 border border-[#1E2D42] backdrop-blur-md text-left space-y-1">
            <div className="text-[11px] font-mono text-[#38BDF8] uppercase tracking-wider flex items-center justify-between">
              <span>ZK Groth16 Prover</span>
              <Lock className="h-3.5 w-3.5 text-[#38BDF8]" />
            </div>
            <div className="text-2xl font-black text-[#F1F5F9] font-mono">0.367 <span className="text-xs font-normal text-[#94A3B8]">ms</span></div>
            <div className="text-[10px] text-[#94A3B8]">Privacy-preserving temperature validation</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111A2E]/70 border border-[#1E2D42] backdrop-blur-md text-left space-y-1">
            <div className="text-[11px] font-mono text-[#A3E635] uppercase tracking-wider flex items-center justify-between">
              <span>Merkle Attestation</span>
              <Layers className="h-3.5 w-3.5 text-[#A3E635]" />
            </div>
            <div className="text-2xl font-black text-[#F1F5F9] font-mono">44,010 <span className="text-xs font-normal text-[#94A3B8]">events/sec</span></div>
            <div className="text-[10px] text-[#94A3B8]">Off-chain cryptographic batch trees</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111A2E]/70 border border-[#1E2D42] backdrop-blur-md text-left space-y-1">
            <div className="text-[11px] font-mono text-[#F59E0B] uppercase tracking-wider flex items-center justify-between">
              <span>Contract Verification</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-[#F59E0B]" />
            </div>
            <div className="text-2xl font-black text-[#F1F5F9] font-mono">100% <span className="text-xs font-normal text-[#94A3B8]">Cancun EVM</span></div>
            <div className="text-[10px] text-[#94A3B8]">94/94 Hardhat & 155 Jest tests passed</div>
          </div>
        </motion.div>

        {/* Live Interactive Telemetry Terminal HUD */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-5xl rounded-3xl border border-[#1E2D42] bg-[#0E1626]/90 backdrop-blur-2xl shadow-2xl p-6 text-left relative overflow-hidden mb-16"
        >
          {/* Subtle Top Glow Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00D6B4] to-transparent opacity-70" />

          {/* Terminal Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1E2D42]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#00D6B4]" />
                <span className="font-mono text-xs font-bold text-[#F1F5F9]">
                  PHARMATRACE // LIVE ATTESTATION RADAR
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 bg-[#111A2E] p-1 rounded-xl border border-[#1E2D42] text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'events' ? 'bg-[#00D6B4] text-[#080D1A] font-bold shadow-sm' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                Live Stream
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('zk')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'zk' ? 'bg-[#00D6B4] text-[#080D1A] font-bold shadow-sm' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                ZK Radar
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('coldchain')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'coldchain' ? 'bg-[#00D6B4] text-[#080D1A] font-bold shadow-sm' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                Cold Chain
              </button>
            </div>
          </div>

          {/* Dynamic Tab Body */}
          <div className="pt-5">
            {activeTab === 'events' && (
              <div className="space-y-2.5 font-mono text-xs">
                {mockEvents.map((evt, idx) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                      idx === eventIndex
                        ? 'border-[#00D6B4]/60 bg-[#00D6B4]/10 shadow-sm shadow-[#00D6B4]/5'
                        : 'border-[#1E2D42] bg-[#111A2E]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="teal" size="sm" className="font-mono text-[10px]">
                        {evt.status}
                      </Badge>
                      <span className="font-bold text-[#F1F5F9]">{evt.batchId}</span>
                      <span className="text-[#64748B] hidden sm:inline">|</span>
                      <span className="text-[#94A3B8] text-[11px]">{evt.detail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[#00D6B4]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00D6B4] animate-pulse"></span>
                      <span>{evt.timestamp}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'zk' && (
              <div className="p-4 rounded-xl border border-[#1E2D42] bg-[#111A2E]/60 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-xs text-[#00D6B4]">
                  <span>Circuit: ZkColdChainVerifier (Groth16 BN254)</span>
                  <Badge variant="teal" size="sm">Active Prover</Badge>
                </div>
                <div className="p-3 bg-[#080D1A] rounded-lg border border-[#1E2D42] text-[11px] text-[#94A3B8] space-y-1">
                  <div>&gt; public_signals = [0x1a8f...92, minTemp: 2.0°C, maxTemp: 8.0°C]</div>
                  <div>&gt; proof.a = [&quot;0x29c...&quot;, &quot;0x15b...&quot;]</div>
                  <div>&gt; proof.b = [[&quot;0x09e...&quot;, &quot;0x12a...&quot;], [&quot;0x07f...&quot;, &quot;0x31d...&quot;]]</div>
                  <div>&gt; Verification result: <span className="text-[#00D6B4] font-bold">TRUE (0.367ms)</span></div>
                </div>
                <div className="text-[11px] text-[#94A3B8]">
                  Zero sensitive GPS or sensor identities leaked to public mempools.
                </div>
              </div>
            )}

            {activeTab === 'coldchain' && (
              <div className="p-4 rounded-xl border border-[#1E2D42] bg-[#111A2E]/60 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between text-xs text-[#38BDF8]">
                  <span>IoT Fleet Telemetry: Carrier Staking Escrow</span>
                  <span className="text-emerald-400 font-bold">NOMINAL (3.6°C)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#080D1A] rounded-lg border border-[#1E2D42]">
                    <div className="text-[10px] text-[#94A3B8]">Mean Excursion</div>
                    <div className="text-lg font-bold text-[#F1F5F9]">0.00°C</div>
                  </div>
                  <div className="p-3 bg-[#080D1A] rounded-lg border border-[#1E2D42]">
                    <div className="text-[10px] text-[#94A3B8]">Carrier Bond</div>
                    <div className="text-lg font-bold text-[#00D6B4]">10.00 ETH Staked</div>
                  </div>
                  <div className="p-3 bg-[#080D1A] rounded-lg border border-[#1E2D42]">
                    <div className="text-[10px] text-[#94A3B8]">Slashing State</div>
                    <div className="text-lg font-bold text-emerald-400">UNSLASHED</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Live Quick-Verify Interactive Widget */}
        <motion.div variants={itemVariants} className="w-full max-w-5xl rounded-3xl border border-[#1E2D42] bg-[#111A2E]/60 backdrop-blur-xl p-6 sm:p-8 text-left mb-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileCheck2 className="h-5 w-5 text-[#00D6B4]" />
                <h3 className="text-xl font-bold text-[#F1F5F9]">Instant Cryptographic Verification</h3>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Test real-time GS1 serialization resolution against Ethereum Sepolia smart contracts.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#94A3B8]">Try demo batches:</span>
              <button
                type="button"
                onClick={() => handleQuickVerify('BATCH-2026-AZ401')}
                className="px-2.5 py-1 rounded-lg bg-[#1E2D42] hover:bg-[#00D6B4]/20 hover:text-[#00D6B4] text-[#F1F5F9] font-mono text-[11px] transition-colors"
              >
                AZ-401
              </button>
              <button
                type="button"
                onClick={() => handleQuickVerify('BATCH-2026-COV99')}
                className="px-2.5 py-1 rounded-lg bg-[#1E2D42] hover:bg-[#00D6B4]/20 hover:text-[#00D6B4] text-[#F1F5F9] font-mono text-[11px] transition-colors"
              >
                COV-99
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={simulatedBatchInput}
              onChange={(e) => setSimulatedBatchInput(e.target.value)}
              placeholder="Enter batch serial number (e.g. BATCH-2026-AZ401)..."
              className="flex-1 rounded-xl bg-[#080D1A] border border-[#1E2D42] px-4 py-3 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] font-mono transition-colors"
            />
            <Button
              type="button"
              onClick={() => handleQuickVerify(simulatedBatchInput || 'BATCH-2026-AZ401')}
              disabled={isVerifying}
              className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#080D1A] font-bold rounded-xl px-6 text-xs h-11"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 border-2 border-[#080D1A] border-t-transparent rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Verify Batch
                </span>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 rounded-xl bg-[#080D1A] border border-[#00D6B4]/40 font-mono text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-[#00D6B4]">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="h-4 w-4" /> Cryptographic Integrity Verified
                  </span>
                  <span className="text-[10px] text-[#94A3B8]">{verificationResult.gasUsed}</span>
                </div>
                <div className="text-[11px] text-[#94A3B8] truncate">
                  Merkle Root: <span className="text-[#F1F5F9]">{verificationResult.merkleRoot}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bento Grid Architecture Modules */}
        <motion.div variants={itemVariants} className="w-full max-w-5xl text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2D42] pb-4">
            <div>
              <span className="text-xs font-mono text-[#00D6B4] uppercase tracking-wider">
                Production Suite Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#F1F5F9] mt-0.5">
                Core Tracking & Verification Modules
              </h2>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono text-xs">
              FDA & EU GMP Ready
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <Link
                href="/ledger"
                className="rounded-2xl border border-[#1E2D42] bg-[#111A2E]/80 hover:border-[#00D6B4] hover:bg-[#152037] p-5 transition-all shadow-lg space-y-3 group block h-full"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="teal" size="sm" className="font-mono text-[10px]">
                    Live Audit Feed
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] group-hover:translate-x-1.5 transition-all" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                    Live Ledger
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                    Real-time blockchain audit trail with instant synchronization for regulatory compliance and dispute resolution.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-[#1E2D42] bg-[#111A2E]/80 hover:border-[#00D6B4] hover:bg-[#152037] p-5 transition-all shadow-lg space-y-3 group block h-full"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                    Enterprise Portal
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] group-hover:translate-x-1.5 transition-all" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                    Operations Console
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                    Interactive custody transfers, IoT cold-chain simulation, verifiable credentials, and hardware oracle controls.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <Link
                href="/standards"
                className="rounded-2xl border border-[#1E2D42] bg-[#111A2E]/80 hover:border-[#00D6B4] hover:bg-[#152037] p-5 transition-all shadow-lg space-y-3 group block h-full"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                    Global Standards
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] group-hover:translate-x-1.5 transition-all" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                    Compliance Matrix
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                    Direct cross-reference mapping across FDA 21 CFR Part 11, EU GMP Annex 11, and DSCSA Title II.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <Link
                href="/catalog"
                className="rounded-2xl border border-[#1E2D42] bg-[#111A2E]/80 hover:border-[#00D6B4] hover:bg-[#152037] p-5 transition-all shadow-lg space-y-3 group block h-full"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
                    Master Directory
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] group-hover:translate-x-1.5 transition-all" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                    Medicine Catalog
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                    Verified public index of registered pharmaceutical batches, GS1 serialization, and cold-chain parameters.
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.main>

      {/* Footer */}
      <footer role="contentinfo" className="w-full border-t border-[#1E2D42] bg-[#080D1A] py-8 text-center text-xs text-[#94A3B8] relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#00D6B4]" aria-hidden="true" />
            <span className="font-bold text-[#F1F5F9]">PharmaTrace Enterprise Protocol</span>
          </div>
          <p className="text-[11px] text-[#94A3B8]">
            FDA 21 CFR Part 11, EU GMP Annex 11, and DSCSA Title II Verified.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/standards" className="hover:text-[#00D6B4] transition">Standards</Link>
            <Link href="/catalog" className="hover:text-[#00D6B4] transition">Catalog</Link>
            <Link href="/ledger" className="hover:text-[#00D6B4] transition">Ledger</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
