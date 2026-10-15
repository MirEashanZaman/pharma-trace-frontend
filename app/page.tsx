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
              href="/provenance"
              className="text-xs font-semibold text-[#00D6B4] hover:text-[#00b89a] transition px-3 py-1.5 flex items-center gap-1"
            >
              Provenance DAG
            </Link>
            <Link
              href="/verify"
              className="text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition px-3 py-1.5 flex items-center gap-1"
            >
              Public Verify
            </Link>
            <Link
              href="/dashboard"
              className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold shadow-sm"
            >
              Enterprise Portal
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
            Enterprise Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/provenance"
            className="btn bg-[#172638] hover:bg-[#243247] text-[#00D6B4] border border-[#00D6B4]/40 rounded-xl px-8 font-bold text-sm shadow-sm flex items-center gap-2"
          >
            Audit Provenance DAG
          </Link>
          <Link
            href="/verify"
            className="btn bg-[#243247] hover:bg-[#172638] text-[#F1F5F9] border border-[#304257] rounded-xl px-8 font-semibold text-sm shadow-sm"
          >
            Public Medicine Verification
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-16 w-full">
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

        <div className="w-full mt-16 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#304257] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00D6B4]">
                Next.js App Router Architecture
              </span>
              <h2 className="text-2xl font-black text-[#F1F5F9] mt-0.5">
                Full-Spectrum Rendering Paradigms (SSR, CSR, SSG, ISR)
              </h2>
            </div>
            <span className="badge badge-sm bg-[#172638] border border-[#304257] text-[#94A3B8] font-mono text-[10px]">
              Hybrid Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/ledger"
              className="card bg-[#243247] border border-[#304257] hover:border-[#00D6B4] p-5 rounded-2xl transition shadow-sm space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-sm bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/40 font-mono font-bold">
                  SSR &bull; Dynamic
                </span>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] transition" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition">
                  Live Ledger
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Dynamic server-side rendering per request with `force-dynamic` for real-time blockchain and database query.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="card bg-[#243247] border border-[#304257] hover:border-[#00D6B4] p-5 rounded-2xl transition shadow-sm space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-sm bg-purple-500/15 text-purple-300 border border-purple-500/40 font-mono font-bold">
                  CSR &bull; Client
                </span>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] transition" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition">
                  Enterprise Portal
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Interactive client component with WebSockets, Web Audio feedback, haptic pulses, and MetaMask wallet.
                </p>
              </div>
            </Link>

            <Link
              href="/standards"
              className="card bg-[#243247] border border-[#304257] hover:border-[#00D6B4] p-5 rounded-2xl transition shadow-sm space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-sm bg-blue-500/15 text-blue-300 border border-blue-500/40 font-mono font-bold">
                  SSG &bull; Static
                </span>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] transition" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition">
                  Standards Directory
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Pre-rendered at build time with `generateStaticParams` for sub-millisecond edge CDN delivery.
                </p>
              </div>
            </Link>

            <Link
              href="/catalog"
              className="card bg-[#243247] border border-[#304257] hover:border-[#00D6B4] p-5 rounded-2xl transition shadow-sm space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-sm bg-amber-500/15 text-amber-300 border border-amber-500/40 font-mono font-bold">
                  ISR &bull; 60s Reval
                </span>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] transition" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition">
                  Medicine Catalog
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Statically cached public directory with background regeneration every 60 seconds without redeploying.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
