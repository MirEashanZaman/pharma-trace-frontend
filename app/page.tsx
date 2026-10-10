import Link from 'next/link';
import { ShieldCheck, Lock, Activity, ArrowRight, CheckCircle2, Cpu } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Hero Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-slate-950" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">PharmaTrace-ES</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/verify"
              className="text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-1.5"
            >
              Public Verify
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs tracking-wide transition shadow-lg shadow-emerald-500/20"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide mb-6">
          <Cpu className="h-4 w-4" /> Web3 & Event-Driven Architecture
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
          Anti-Counterfeit Pharma <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Track-and-Trace on Blockchain
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Event Sourcing, CQRS, and Saga-validated custody transitions anchored immutably to Ethereum/EVM smart
          contracts with zero-overhead off-chain IoT telemetry.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/verify"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2"
          >
            Verify a Drug Hash
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-20 w-full">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Smart Contract Anchor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cryptographic hashes anchored to Solidity contracts guarantee tamper-proof audit trails.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Saga Custody Validation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict state machine prevents illegitimate custody skips (Manufacturer → Distributor → Pharmacy).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">100% Tamper Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly detects payload alterations, unauthorized status modifications, and hash collisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
