import Link from 'next/link';
import { ShieldCheck, Lock, Activity, ArrowRight, CheckCircle2, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
            <Button asChild size="sm" className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] font-bold rounded-xl shadow-sm">
              <Link href="/dashboard">
                Enterprise Portal
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-5xl mx-auto">
        <Badge variant="teal" size="lg" className="tracking-wide mb-6 py-2 px-4 gap-2">
          <Cpu className="h-4 w-4 text-[#00D6B4]" /> Event-Driven & Web3 Traceability Architecture
        </Badge>

        <h1 className="text-4xl sm:text-6xl font-black text-[#F1F5F9] tracking-tight leading-tight mb-6">
          Anti-Counterfeit Pharma <br />
          <span className="text-[#00D6B4]">Track-and-Trace on Blockchain</span>
        </h1>

        <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
          Event Sourcing, CQRS, and Saga-validated custody transitions anchored immutably to Ethereum/EVM smart contracts with zero-overhead off-chain IoT telemetry.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Button asChild size="lg" className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] font-bold rounded-xl px-8 text-sm shadow-md">
            <Link href="/dashboard" className="flex items-center gap-2">
              Enterprise Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="border-[#00D6B4]/40 text-[#00D6B4] hover:bg-[#243247] px-8 text-sm shadow-sm">
            <Link href="/provenance" className="flex items-center gap-2">
              Audit Provenance DAG
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-[#304257] bg-[#243247] text-[#F1F5F9] hover:bg-[#172638] px-8 font-semibold text-sm shadow-sm">
            <Link href="/verify">
              Public Medicine Verification
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-16 w-full">
          <Card className="p-6">
            <div className="h-11 w-11 rounded-xl bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="text-base mb-2">Smart Contract Anchor</CardTitle>
            <CardDescription className="leading-relaxed">
              Cryptographic hashes anchored to Solidity contracts guarantee tamper-proof audit trails.
            </CardDescription>
          </Card>

          <Card className="p-6">
            <div className="h-11 w-11 rounded-xl bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <CardTitle className="text-base mb-2">Saga Custody Validation</CardTitle>
            <CardDescription className="leading-relaxed">
              Strict state machine prevents illegitimate custody skips (Manufacturer to Distributor to Pharmacy).
            </CardDescription>
          </Card>

          <Card className="p-6">
            <div className="h-11 w-11 rounded-xl bg-[#A3E635]/15 text-[#A3E635] flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-base mb-2">100% Tamper Detection</CardTitle>
            <CardDescription className="leading-relaxed">
              Instantly detects payload alterations, unauthorized status modifications, and hash collisions.
            </CardDescription>
          </Card>
        </div>

        <div className="w-full mt-16 space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#304257] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#00D6B4]">
                Enterprise Supply Chain Architecture
              </span>
              <h2 className="text-2xl font-black text-[#F1F5F9] mt-0.5">
                Core Tracking & Verification Modules
              </h2>
            </div>
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              Production Suite
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/ledger"
              className="rounded-2xl border border-[#304257] bg-[#243247] hover:border-[#00D6B4] p-5 transition shadow-sm space-y-3 group block"
            >
              <div className="flex items-center justify-between">
                <Badge variant="teal" size="sm" className="font-bold">
                  Live Audit Feed
                </Badge>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] transition" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition">
                  Live Ledger
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Real-time blockchain audit trail with instant synchronization for regulatory compliance and dispute resolution.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="rounded-2xl border border-[#304257] bg-[#243247] hover:border-[#00D6B4] p-5 transition shadow-sm space-y-3 group block"
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary" size="sm" className="bg-purple-500/15 text-purple-300 border-purple-500/40 font-mono font-bold">
                  Enterprise Portal
                </Badge>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] transition" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition">
                  Operations Console
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Interactive custody transfers, IoT cold-chain simulation, verifiable credentials, and hardware oracle controls.
                </p>
              </div>
            </Link>

            <Link
              href="/standards"
              className="rounded-2xl border border-[#304257] bg-[#243247] hover:border-[#00D6B4] p-5 transition shadow-sm space-y-3 group block"
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary" size="sm" className="bg-blue-500/15 text-blue-300 border-blue-500/40 font-mono font-bold">
                  Global Standards
                </Badge>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] transition" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition">
                  Compliance Matrix
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Direct cross-reference mapping across FDA 21 CFR Part 11, EU GMP Annex 11, and DSCSA Title II.
                </p>
              </div>
            </Link>

            <Link
              href="/catalog"
              className="rounded-2xl border border-[#304257] bg-[#243247] hover:border-[#00D6B4] p-5 transition shadow-sm space-y-3 group block"
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary" size="sm" className="bg-amber-500/15 text-amber-300 border-amber-500/40 font-mono font-bold">
                  Master Directory
                </Badge>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#00D6B4] transition" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition">
                  Medicine Catalog
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  Verified public index of registered pharmaceutical batches, GS1 serialization, and cold-chain parameters.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
