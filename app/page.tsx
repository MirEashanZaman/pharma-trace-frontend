'use client';

import Link from 'next/link';
import { motion, type Variants } from 'motion/react';
import { ShieldCheck, Lock, Activity, ArrowRight, CheckCircle2, Cpu, Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

export default function HomePage() {
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
    <div className="relative min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col font-sans overflow-x-hidden selection:bg-[#00D6B4]/20 selection:text-[#00D6B4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-[#00D6B4]/15 via-[#00D6B4]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <header className="bg-[#0B1220]/90 backdrop-blur-md border-b border-[#304257] text-[#F1F5F9] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 6 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="h-9 w-9 rounded-xl bg-[#00D6B4] flex items-center justify-center text-[#0B1220] shadow-sm cursor-pointer"
            >
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </motion.div>
            <span className="font-extrabold text-lg tracking-tight text-[#F1F5F9]">PharmaTrace-ES</span>
          </div>

          <nav aria-label="Main Navigation" className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/provenance"
              className="text-xs font-semibold text-[#00D6B4] hover:text-[#00b89a] transition px-2 sm:px-3 py-1.5 flex items-center gap-1"
            >
              Provenance DAG
            </Link>
            <Link
              href="/verify"
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition px-2 sm:px-3 py-1.5 flex items-center gap-1"
            >
              Public Verify
            </Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Button asChild size="sm" className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] font-bold rounded-xl shadow-sm text-xs px-3 sm:px-4">
                <Link href="/dashboard">
                  Enterprise Portal
                </Link>
              </Button>
            </motion.div>
          </nav>
        </div>
      </header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-5xl mx-auto w-full"
      >
        <motion.div variants={itemVariants}>
          <Badge variant="teal" size="lg" className="mb-6 py-1.5 px-3.5 gap-2 text-xs font-medium backdrop-blur-sm border border-[#00D6B4]/30 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#00D6B4]" aria-hidden="true" /> Event-driven & Web3 traceability architecture
          </Badge>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl font-black text-[#F1F5F9] tracking-tight leading-tight mb-6">
          Anti-Counterfeit Pharma <br />
          <span className="bg-gradient-to-r from-[#00D6B4] to-[#38BDF8] bg-clip-text text-transparent">
            Track-and-Trace on Blockchain
          </span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
          Event Sourcing, CQRS, and Saga-validated custody transitions anchored immutably to Ethereum/EVM smart contracts with zero-overhead off-chain IoT telemetry.
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-2xl">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] font-bold rounded-xl px-8 text-sm shadow-md shadow-[#00D6B4]/15">
              <Link href="/dashboard" className="flex items-center justify-center gap-2">
                Enterprise Dashboard <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto border-[#00D6B4]/40 text-[#00D6B4] hover:bg-[#243247] px-8 text-sm shadow-sm">
              <Link href="/provenance" className="flex items-center justify-center gap-2">
                Audit Provenance DAG
              </Link>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto border-[#304257] bg-[#243247] text-[#F1F5F9] hover:bg-[#172638] px-8 font-semibold text-sm shadow-sm">
              <Link href="/verify" className="flex items-center justify-center">
                Public Medicine Verification
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-16 w-full">
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          >
            <Card className="p-6 h-full border-[#304257] hover:border-[#00D6B4]/50 bg-[#172638]/60 backdrop-blur-md transition-colors shadow-sm">
              <div className="h-11 w-11 rounded-xl bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center mb-4">
                <Lock className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-base mb-2">Smart Contract Anchor</CardTitle>
              <CardDescription className="leading-relaxed">
                Cryptographic hashes anchored to Solidity contracts guarantee tamper-proof audit trails.
              </CardDescription>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          >
            <Card className="p-6 h-full border-[#304257] hover:border-[#00D6B4]/50 bg-[#172638]/60 backdrop-blur-md transition-colors shadow-sm">
              <div className="h-11 w-11 rounded-xl bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center mb-4">
                <Activity className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-base mb-2">Saga Custody Validation</CardTitle>
              <CardDescription className="leading-relaxed">
                Strict state machine prevents illegitimate custody skips (Manufacturer to Distributor to Pharmacy).
              </CardDescription>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          >
            <Card className="p-6 h-full border-[#304257] hover:border-[#A3E635]/50 bg-[#172638]/60 backdrop-blur-md transition-colors shadow-sm">
              <div className="h-11 w-11 rounded-xl bg-[#A3E635]/15 text-[#A3E635] flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-base mb-2">100% Tamper Detection</CardTitle>
              <CardDescription className="leading-relaxed">
                Instantly detects payload alterations, unauthorized status modifications, and hash collisions.
              </CardDescription>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="w-full mt-16 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#304257] pb-4">
            <div>
              <span className="text-xs font-medium text-[#00D6B4]">
                Enterprise supply chain architecture
              </span>
              <h2 className="text-2xl font-black text-[#F1F5F9] mt-0.5">
                Core Tracking & Verification Modules
              </h2>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono text-xs">
              Production Suite
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
              <Link
                href="/ledger"
                className="rounded-2xl border border-[#304257] bg-[#243247]/70 hover:border-[#00D6B4] hover:bg-[#243247] p-5 transition shadow-sm space-y-3 group block h-full"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="teal" size="sm" className="font-medium text-xs">
                    Live Audit Feed
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] group-hover:translate-x-1 transition-all" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                    Live Ledger
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Real-time blockchain audit trail with instant synchronization for regulatory compliance and dispute resolution.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-[#304257] bg-[#243247]/70 hover:border-[#00D6B4] hover:bg-[#243247] p-5 transition shadow-sm space-y-3 group block h-full"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" size="sm" className="font-mono font-medium text-xs">
                    Enterprise Portal
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] group-hover:translate-x-1 transition-all" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                    Operations Console
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Interactive custody transfers, IoT cold-chain simulation, verifiable credentials, and hardware oracle controls.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
              <Link
                href="/standards"
                className="rounded-2xl border border-[#304257] bg-[#243247]/70 hover:border-[#00D6B4] hover:bg-[#243247] p-5 transition shadow-sm space-y-3 group block h-full"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" size="sm" className="font-mono font-medium text-xs">
                    Global Standards
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] group-hover:translate-x-1 transition-all" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                    Compliance Matrix
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Direct cross-reference mapping across FDA 21 CFR Part 11, EU GMP Annex 11, and DSCSA Title II.
                  </p>
                </div>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
              <Link
                href="/catalog"
                className="rounded-2xl border border-[#304257] bg-[#243247]/70 hover:border-[#00D6B4] hover:bg-[#243247] p-5 transition shadow-sm space-y-3 group block h-full"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" size="sm" className="font-mono font-medium text-xs">
                    Master Directory
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] group-hover:translate-x-1 transition-all" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                    Medicine Catalog
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Verified public index of registered pharmaceutical batches, GS1 serialization, and cold-chain parameters.
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.main>

      <footer role="contentinfo" className="w-full border-t border-[#304257] bg-[#0B1220] py-8 text-center text-xs text-[#94A3B8]">
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
