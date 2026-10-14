import React from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { ShieldCheck, Award, ArrowRight, CheckCircle2, Lock, FileText, Cpu, BookOpen } from 'lucide-react';

interface StandardSummary {
  slug: string;
  title: string;
  authority: string;
  jurisdiction: string;
  classification: string;
  highlights: string[];
}

const STANDARDS_LIST: StandardSummary[] = [
  {
    slug: 'fda-21-cfr-part-11',
    title: 'FDA 21 CFR Part 11',
    authority: 'US Food and Drug Administration',
    jurisdiction: 'United States',
    classification: 'GxP Mandatory',
    highlights: [
      'Electronic records and electronic signatures validation',
      'Computer-generated time-stamped audit trails',
      'Protection against record modification or deletion',
    ],
  },
  {
    slug: 'eu-gmp-annex-11',
    title: 'EU GMP Annex 11',
    authority: 'European Medicines Agency (EMA)',
    jurisdiction: 'European Union',
    classification: 'EU EudraLex Vol 4',
    highlights: [
      'Validated computerized systems lifecycle',
      'Cryptographic signatures equivalent to handwritten signatures',
      'Electronic audit trails with immutable change history',
    ],
  },
  {
    slug: 'who-trs-961',
    title: 'WHO TRS 961 Good Distribution Practices',
    authority: 'World Health Organization',
    jurisdiction: 'International',
    classification: 'Global Standard',
    highlights: [
      'Continuous cold-chain temperature monitoring',
      'Suspect and counterfeit product quarantine protocols',
      'GS1 DataMatrix and QR code package serialization',
    ],
  },
  {
    slug: 'dscta-us-title-ii',
    title: 'DSCSA Title II',
    authority: 'US Congress / FDA',
    jurisdiction: 'United States',
    classification: 'Federal Law',
    highlights: [
      'Interoperable unit-level package tracing',
      'Transaction Information, History, and Statement verification',
      'Rapid suspect product quarantine within 24 hours',
    ],
  },
];

export default function StandardsIndexPage() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 badge badge-lg bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/30 font-semibold uppercase tracking-wider py-3 px-4">
            <BookOpen className="h-4 w-4 text-[#00D6B4]" /> SSG &bull; Static Site Generation
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F1F5F9]">
            Regulatory Standards & GxP Compliance
          </h1>
          <p className="text-[#94A3B8] text-sm max-w-2xl mx-auto">
            These compliance guides are fully pre-rendered at build time via Next.js Static Site Generation (SSG), guaranteeing sub-millisecond edge CDN delivery for worldwide healthcare regulators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {STANDARDS_LIST.map((std) => (
            <div
              key={std.slug}
              className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:border-[#00D6B4]/50 transition group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="badge badge-xs bg-[#00D6B4]/20 text-[#00D6B4] border border-[#00D6B4]/30 font-bold">
                      {std.classification}
                    </span>
                    <h2 className="text-xl font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition">
                      {std.title}
                    </h2>
                    <p className="text-xs text-[#94A3B8]">
                      {std.authority} &bull; {std.jurisdiction}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#172638] border border-[#304257] flex items-center justify-center text-[#00D6B4] shrink-0">
                    <Award className="h-5 w-5" />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#304257]">
                  {std.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#94A3B8]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#00D6B4] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-[#304257]/60">
                <Link
                  href={`/standards/${std.slug}`}
                  className="btn btn-sm w-full bg-[#172638] hover:bg-[#1E2E44] text-[#00D6B4] border border-[#00D6B4]/30 hover:border-[#00D6B4] rounded-xl font-bold flex items-center justify-center gap-2 transition"
                >
                  Inspect Static Proof Dossier <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#00D6B4] text-xs font-bold uppercase tracking-wider">
            <Cpu className="h-4 w-4" /> Technical Architecture Note
          </div>
          <h3 className="text-base font-bold text-[#F1F5F9]">
            Build-Time Deterministic Compilation (SSG)
          </h3>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            The regulatory documentation routes are compiled to static HTML during `next build` using `generateStaticParams`. Because the legal definitions of FDA 21 CFR Part 11, EU Annex 11, and DSCSA Title II are static statutes, generating static pages eliminates runtime latency, bypasses server load, and allows offline distribution in field inspections.
          </p>
        </div>
      </main>
    </div>
  );
}
