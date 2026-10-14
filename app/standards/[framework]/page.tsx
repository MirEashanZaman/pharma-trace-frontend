import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { ShieldCheck, ArrowLeft, Award, FileText, CheckCircle2, Lock, Cpu, Database } from 'lucide-react';

interface StandardDetail {
  slug: string;
  title: string;
  authority: string;
  jurisdiction: string;
  effectiveDate: string;
  classification: string;
  summary: string;
  clauses: Array<{
    number: string;
    requirement: string;
    pharmaTraceProof: string;
  }>;
  technicalControls: string[];
}

const STANDARDS_DATA: Record<string, StandardDetail> = {
  'fda-21-cfr-part-11': {
    slug: 'fda-21-cfr-part-11',
    title: 'FDA 21 CFR Part 11 Electronic Records & Signatures',
    authority: 'US Food and Drug Administration',
    jurisdiction: 'United States',
    effectiveDate: 'August 1997 (Modernized 2024)',
    classification: 'GxP Mandatory',
    summary: 'Criteria under which FDA considers electronic records, signatures, and handwritten signatures executed to electronic records to be trustworthy, reliable, and equivalent to paper records.',
    clauses: [
      {
        number: '11.10(a)',
        requirement: 'Validation of systems to ensure accuracy, reliability, and consistent intended performance.',
        pharmaTraceProof: 'Automated CQRS transaction logs with event store verification on PostgreSQL and Hardhat test suites.',
      },
      {
        number: '11.10(b)',
        requirement: 'Ability to generate accurate and complete copies of records in both human-readable and electronic form.',
        pharmaTraceProof: 'Deterministic export of GxP compliance dossiers in PDF, CSV ledger, and signed JSON schemas.',
      },
      {
        number: '11.10(e)',
        requirement: 'Use of secure, computer-generated, time-stamped audit trails to record the date and time of operator entries.',
        pharmaTraceProof: 'Immutable SHA-256 event hashing with EVM block timestamps anchored to smart contracts.',
      },
      {
        number: '11.50',
        requirement: 'Signed electronic records shall contain information associated with the signing.',
        pharmaTraceProof: 'EIP-712 / ECDSA MetaMask cryptographic signatures bound to custody transition payloads.',
      },
    ],
    technicalControls: [
      'Role-Based Access Control (RBAC) across Manufacturer, Distributor, Pharmacy, and Regulator roles',
      'Non-repudiation via Ethereum public key cryptography',
      'Append-only immutable Event Sourcing ledger',
      'Zero-knowledge tamper-evident hash chaining',
    ],
  },
  'eu-gmp-annex-11': {
    slug: 'eu-gmp-annex-11',
    title: 'EU GMP Annex 11 Computerised Systems',
    authority: 'European Medicines Agency (EMA)',
    jurisdiction: 'European Union',
    effectiveDate: 'January 2011 (Revision 2)',
    classification: 'EU EudraLex Volume 4',
    summary: 'Rules governing medicinal products in the European Union regarding automated and computerized systems used in GxP environments.',
    clauses: [
      {
        number: 'Annex 11.4',
        requirement: 'Electronic validation and lifecycle management throughout operational lifespan.',
        pharmaTraceProof: 'Saga state machine governing strict custody transitions without allowing out-of-order handovers.',
      },
      {
        number: 'Annex 11.9',
        requirement: 'Audit trails documenting GxP-relevant changes and deletions with immutable change histories.',
        pharmaTraceProof: 'Prohibition of UPDATE or DELETE operations; all transitions are persisted as append-only events.',
      },
      {
        number: 'Annex 11.12',
        requirement: 'Electronic signatures equivalent to handwritten signatures within the European regulatory community.',
        pharmaTraceProof: 'Dual-signer pharmacist and doctor cryptographic attestation for pharmaceutical dispensing.',
      },
      {
        number: 'Annex 11.14',
        requirement: 'Data storage security and regular archiving ensuring integrity and accessibility.',
        pharmaTraceProof: 'Distributed off-chain storage with cryptographic Merkle root anchoring to EVM contracts.',
      },
    ],
    technicalControls: [
      'Cold-chain excursion circuit breaker automatically halting compromised lots',
      'Electronic audit dossier verification with cryptographic checksums',
      'Granular session authorization with JSON Web Tokens and Web3 address binding',
    ],
  },
  'who-trs-961': {
    slug: 'who-trs-961',
    title: 'WHO TRS 961 Good Distribution Practices (GDP)',
    authority: 'World Health Organization',
    jurisdiction: 'Global / International',
    effectiveDate: '2011 (WHO Expert Committee on Specifications)',
    classification: 'Global Standard',
    summary: 'Guidelines for the storage and transportation of temperature-sensitive pharmaceuticals and biological products across global supply chains.',
    clauses: [
      {
        number: 'Section 4.1',
        requirement: 'Maintenance of continuous cold-chain conditions (2C to 8C or -20C cryo bands).',
        pharmaTraceProof: 'Simulated and live IoT sensor telemetry with automated excursion alert broadcasts via WebSockets.',
      },
      {
        number: 'Section 5.3',
        requirement: 'Quarantine and recall procedures for suspect, counterfeit, or temperature-degraded medicine.',
        pharmaTraceProof: 'Emergency Batch Recall & Circuit Breaker halting counterfeit dispensing across all pharmacy nodes.',
      },
      {
        number: 'Section 8.2',
        requirement: 'Traceability and serialization of shipping containers and secondary packaging.',
        pharmaTraceProof: 'GS1-compliant 2D DataMatrix and QR code symbology with optical audio-haptic scanning.',
      },
    ],
    technicalControls: [
      'Threshold monitoring with audible and tactile alarms on thermal excursion',
      'Instant public verification without requiring authentication for field healthcare staff',
      'Inter-facility transit cartography with waypoint breadcrumbs',
    ],
  },
  'dscta-us-title-ii': {
    slug: 'dscta-us-title-ii',
    title: 'DSCSA Title II Interoperable Drug Supply Chain Security',
    authority: 'US Congress / FDA',
    jurisdiction: 'United States',
    effectiveDate: 'November 2023 (Final Enforcement 2024)',
    classification: 'Federal Law',
    summary: 'Mandates unit-level serialization, secure electronic interoperable tracing, and verifiable transaction statements (T3 information).',
    clauses: [
      {
        number: 'Sec. 582(g)(1)',
        requirement: 'Interoperable, electronic, package-level tracing across trading partners.',
        pharmaTraceProof: 'Inter-enterprise API endpoints exposing full provenance graphs and custodian signatures.',
      },
      {
        number: 'Sec. 582(g)(2)',
        requirement: 'Transaction Information (TI), Transaction History (TH), and Transaction Statement (TS) preservation.',
        pharmaTraceProof: 'Comprehensive GxP compliance dossier export encapsulating all three components in a single package.',
      },
      {
        number: 'Sec. 582(d)(4)',
        requirement: 'Rapid quarantine and investigation of suspect products within 24 hours of notification.',
        pharmaTraceProof: 'Instant network-wide QUARANTINED state emission invalidating downstream verification attempts.',
      },
    ],
    technicalControls: [
      'Package-level unique serialization (SN-2026-XXXX)',
      'Deterministic verification through public proof explorer',
      'Cryptographically signed verification responses',
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(STANDARDS_DATA).map((slug) => ({
    framework: slug,
  }));
}

export default function StandardDetailPage({
  params,
}: {
  params: { framework: string };
}) {
  const standard = STANDARDS_DATA[params.framework];

  if (!standard) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="mb-6">
          <Link
            href="/standards"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#00D6B4] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Regulatory Standards Index
          </Link>
        </div>

        <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 sm:p-8 mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#304257] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="badge badge-sm bg-[#00D6B4]/15 border border-[#00D6B4]/40 text-[#00D6B4] font-bold">
                  SSG Pre-Rendered
                </span>
                <span className="badge badge-sm bg-[#172638] border border-[#304257] text-[#94A3B8] font-mono">
                  {standard.classification}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F1F5F9] tracking-tight">
                {standard.title}
              </h1>
              <p className="text-xs text-[#94A3B8]">
                Governing Authority: <strong className="text-[#F1F5F9]">{standard.authority}</strong> &bull; Jurisdiction: <strong className="text-[#F1F5F9]">{standard.jurisdiction}</strong> &bull; Effective: <strong className="text-[#F1F5F9]">{standard.effectiveDate}</strong>
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-[#00D6B4]/15 border border-[#00D6B4]/30 flex items-center justify-center text-[#00D6B4] shrink-0">
              <Award className="h-6 w-6" />
            </div>
          </div>

          <p className="text-sm text-[#94A3B8] leading-relaxed">
            {standard.summary}
          </p>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#00D6B4]" /> Regulatory Clauses & Technical Validation
            </h2>

            <div className="space-y-3">
              {standard.clauses.map((clause) => (
                <div
                  key={clause.number}
                  className="p-4 bg-[#172638] rounded-xl border border-[#304257] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="badge badge-xs bg-[#00D6B4] text-[#0B1220] font-mono font-black">
                      Clause {clause.number}
                    </span>
                    <span className="text-[11px] text-[#A3E635] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Compliant Implementation
                    </span>
                  </div>
                  <p className="text-xs text-[#F1F5F9] font-semibold">
                    {clause.requirement}
                  </p>
                  <div className="p-2.5 bg-[#0B1220] rounded-lg border border-[#304257]/80 text-[11px] text-[#00D6B4] font-mono">
                    Proof: {clause.pharmaTraceProof}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#304257]">
            <h2 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#00D6B4]" /> Implemented Technical Controls
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {standard.technicalControls.map((ctrl, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#172638]/60 rounded-xl border border-[#304257] text-xs text-[#94A3B8] flex items-start gap-2"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#00D6B4] shrink-0 mt-0.5" />
                  <span>{ctrl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
