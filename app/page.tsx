import Link from 'next/link';
import { ShieldCheck, Lock, Activity, ArrowRight, CheckCircle2, Cpu } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col font-sans">
      <header className="bg-[#0B1220] border-b border-[#304257] text-[#F1F5F9] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#00D6B4] flex items-center justify-center text-[#0B1220]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-[#F1F5F9]">PharmaTrace-ES</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/verify"
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition px-3 py-1.5"
            >
              Public Verify
            </Link>
            <Link
              href="/dashboard"
              className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-lg font-bold shadow-sm"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-5xl mx-auto">
        <div className="badge badge-lg bg-[#00D6B4]/15 border border-[#00D6B4]/30 text-[#00D6B4] font-semibold tracking-wide mb-6 py-3 px-4 gap-2">
          <Cpu className="h-4 w-4 text-[#00D6B4]" /> Event-Driven & Web3 Traceability Architecture
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#F1F5F9] tracking-tight leading-tight mb-6">
          Anti-Counterfeit Pharma <br />
          <span className="text-[#00D6B4]">Track-and-Trace on Blockchain</span>
        </h1>

        <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
          Event Sourcing, CQRS, and Saga-validated custody transitions anchored immutably to Ethereum/EVM smart contracts with zero-overhead off-chain IoT telemetry.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Link
            href="/dashboard"
            className="btn bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl px-8 font-bold text-sm shadow-md flex items-center gap-2"
          >
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/verify"
            className="btn bg-[#243247] hover:bg-[#172638] text-[#F1F5F9] border border-[#304257] rounded-xl px-8 font-semibold text-sm shadow-sm"
          >
            Verify a Drug Hash
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-20 w-full">
          <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6">
            <div className="h-11 w-11 rounded-xl bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-[#F1F5F9] text-base mb-2">Smart Contract Anchor</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Cryptographic hashes anchored to Solidity contracts guarantee tamper-proof audit trails.
            </p>
          </div>

          <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6">
            <div className="h-11 w-11 rounded-xl bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-[#F1F5F9] text-base mb-2">Saga Custody Validation</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Strict state machine prevents illegitimate custody skips (Manufacturer to Distributor to Pharmacy).
            </p>
          </div>

          <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6">
            <div className="h-11 w-11 rounded-xl bg-[#A3E635]/15 text-[#A3E635] flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-[#F1F5F9] text-base mb-2">100% Tamper Detection</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Instantly detects payload alterations, unauthorized status modifications, and hash collisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
