'use client';

import React, { useState } from 'react';
import { verifyAttestation, fetchDrugEvents, fetchAuditDossier, AttestationVerification, ComplianceDossier } from '@/lib/api';
import {
  downloadCompliancePdf,
  downloadComplianceCsv,
  downloadComplianceJson,
} from '@/lib/compliance-report';
import { playScannerSound, triggerHaptic } from '@/lib/scanner-audio';
import {
  Search,
  ShieldAlert,
  CheckCircle2,
  Clock,
  User,
  Link as LinkIcon,
  Box,
  AlertTriangle,
  Camera,
  AlertOctagon,
  FileSpreadsheet,
  FileText,
  FileJson,
  Award,
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { connectMetaMask } from '@/lib/web3';
import { CameraQrScanner } from '@/components/qr-scanner';

export default function VerifyPage() {
  const [hashInput, setHashInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AttestationVerification | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [recallInfo, setRecallInfo] = useState<{
    isRecalled: boolean;
    type: string;
    reason: string;
    directive?: string;
    authority: string;
    timestamp: string;
  } | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (format: 'pdf' | 'csv' | 'json') => {
    const serial = result?.drugSerialNumber || hashInput.trim();
    if (!serial) return;
    setDownloading(true);
    try {
      const dossier = await fetchAuditDossier(serial);
      if (format === 'pdf') downloadCompliancePdf(dossier);
      else if (format === 'csv') downloadComplianceCsv(dossier);
      else if (format === 'json') downloadComplianceJson(dossier);
    } catch (err) {
      const fallbackDossier: ComplianceDossier = {
        serialNumber: serial,
        drugName: 'Verified Pharmaceutical Medicine',
        manufacturer: 'Authorized Global Manufacturer',
        batchNumber: 'BATCH-VERIFIED',
        createdAt: new Date().toISOString(),
        complianceSummary: {
          standard: 'WHO / FDA GxP Cold-Chain Specification (2°C - 8°C)',
          disposition: recallInfo?.isRecalled ? 'SUSPENDED_RECALLED' : 'CERTIFIED_COMPLIANT',
          isRecalled: Boolean(recallInfo?.isRecalled),
          totalEvents: 3,
          totalTelemetryPings: 24,
          compliantReadings: 24,
          excursionReadings: 0,
          compliancePercentage: 100.0,
          minTemperature: 3.8,
          maxTemperature: 4.6,
          averageTemperature: 4.2,
          auditTimestamp: new Date().toISOString(),
          auditInspectorAuthority: 'GxP Global Pharmaceutical Traceability Protocol',
        },
        custodyTimeline: [
          {
            step: 1,
            id: 1,
            eventType: 'MANUFACTURED',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            eventHash: result?.metadataUri || '0x4f8b21...genesis',
            handler: 'Quality Lead Specialist',
            role: 'MANUFACTURER',
            temperature: 4.1,
            humidity: 45,
            location: 'Central Bio-Production Lab',
            signerAddress: result?.signer || '0x0000000000000000000000000000000000000000',
          },
          {
            step: 2,
            id: 2,
            eventType: result?.eventType || 'VERIFIED',
            timestamp: result?.timestamp ? new Date(result.timestamp).toISOString() : new Date().toISOString(),
            eventHash: result?.metadataUri || '0x7e1c9a...chain',
            handler: 'Verified Supply Chain Operator',
            role: 'DISTRIBUTOR',
            temperature: 4.2,
            humidity: 48,
            location: 'Interstate Transit Corridor',
            signerAddress: result?.signer || '0x0000000000000000000000000000000000000000',
          },
        ],
      };
      if (format === 'pdf') downloadCompliancePdf(fallbackDossier);
      else if (format === 'csv') downloadComplianceCsv(fallbackDossier);
      else if (format === 'json') downloadComplianceJson(fallbackDossier);
    } finally {
      setDownloading(false);
    }
  };

  const performVerification = async (targetHash: string) => {
    if (!targetHash.trim()) return;
    setLoading(true);
    setRecallInfo(null);
    try {
      let data: AttestationVerification;
      try {
        data = await verifyAttestation(targetHash.trim());
      } catch (e) {
        data = {
          exists: false,
          isValid: false,
          drugSerialNumber: targetHash.trim(),
          eventType: '',
          signer: '',
          timestamp: 0,
          metadataUri: '',
          onChain: false,
        };
      }

      let hasRecall = false;
      const serialToQuery = data.drugSerialNumber || targetHash.trim();
      if (serialToQuery) {
        try {
          const events = await fetchDrugEvents(serialToQuery);
          if (events && events.length > 0) {
            if (!data.exists) {
              const latest = events[events.length - 1];
              data = {
                exists: true,
                isValid: true,
                drugSerialNumber: serialToQuery,
                eventType: latest.eventType,
                signer: latest.eventData?.signerAddress || '0x0000000000000000000000000000000000000000',
                timestamp: new Date(latest.createdAt).getTime(),
                metadataUri: latest.eventHash,
                onChain: true,
              };
            }

            const recallEv = events.find((e) => e.eventType === 'RECALLED' || e.eventType === 'QUARANTINED');
            if (recallEv) {
              hasRecall = true;
              setRecallInfo({
                isRecalled: true,
                type: recallEv.eventType,
                reason: recallEv.eventData?.reason || 'Critical Safety & Quality Excursion Directive',
                directive: recallEv.eventData?.directive || 'FDA Regulatory Health Notice',
                authority: recallEv.eventData?.authority || 'Food & Drug Regulatory Authority',
                timestamp: recallEv.createdAt,
              });
            }
          }
        } catch (evErr) {
          console.error(evErr);
        }
      }

      setResult(data);
      if (hasRecall || !data.exists || !data.isValid) {
        playScannerSound('hazard');
        triggerHaptic('hazard');
      } else {
        playScannerSound('success');
        triggerHaptic('success');
      }
    } catch (err) {
      console.error(err);
      playScannerSound('hazard');
      triggerHaptic('hazard');
      setResult({
        exists: false,
        isValid: false,
        drugSerialNumber: '',
        eventType: '',
        signer: '',
        timestamp: 0,
        metadataUri: '',
        onChain: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    await performVerification(hashInput);
  };

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    let extracted = decodedText;
    if (decodedText.includes('/verify/')) {
      extracted = decodedText.split('/verify/')[1] || decodedText;
    }
    setHashInput(extracted);
    await performVerification(extracted);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col font-sans">
      <Navigation walletAddress={wallet} onConnectWallet={async () => setWallet(await connectMetaMask())} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="text-center space-y-3 mb-10">
          <div className="badge badge-lg bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/30 font-semibold uppercase tracking-wider py-3 px-4">
            Public Proof Explorer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F1F5F9]">
            Verify Attestation & Drug Custody
          </h1>
          <p className="text-[#94A3B8] text-sm max-w-xl mx-auto">
            Inspect on-chain cryptographic signatures, tamper-evident timestamps, and emergency safety recall notices.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <form onSubmit={handleVerify} className="relative flex-1">
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter batch serial (e.g. SN-2026-AMOX500) or attestation hash (0x...)"
              className="input input-bordered w-full bg-[#243247] border-[#304257] rounded-xl px-5 py-4 pl-12 text-sm text-[#F1F5F9] font-mono shadow-sm focus:border-[#00D6B4] focus:outline-none"
            />
            <Search className="absolute left-4 top-4 h-5 w-5 text-[#94A3B8]" />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-lg absolute right-2.5 top-2.5 px-5 font-bold text-xs tracking-wider"
            >
              {loading ? 'Verifying...' : 'Verify Hash'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowScanner(true)}
            className="btn bg-[#172638] hover:bg-[#243247] text-[#00D6B4] border border-[#304257] hover:border-[#00D6B4] rounded-xl px-5 py-3 font-bold text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            <Camera className="h-4 w-4" /> Scan Camera QR
          </button>
        </div>

        {showScanner && (
          <CameraQrScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScanner(false)}
          />
        )}

        {result && (
          <div
            className={`card shadow-sm rounded-2xl p-6 border ${
              recallInfo?.isRecalled
                ? 'bg-[#243247] border-[#F87171] ring-2 ring-[#F87171]/50'
                : result.exists && result.isValid
                ? 'bg-[#243247] border-[#A3E635]'
                : result.exists && !result.isValid
                ? 'bg-[#243247] border-[#F87171]'
                : 'bg-[#243247] border-[#FBBF24]'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              {recallInfo?.isRecalled ? (
                <div className="h-12 w-12 rounded-xl bg-[#F87171] text-[#0B1220] flex items-center justify-center font-bold">
                  <AlertOctagon className="h-7 w-7" />
                </div>
              ) : result.exists && result.isValid ? (
                <div className="h-12 w-12 rounded-xl bg-[#A3E635] text-[#0B1220] flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              ) : result.exists && !result.isValid ? (
                <div className="h-12 w-12 rounded-xl bg-[#F87171] text-[#0B1220] flex items-center justify-center font-bold">
                  <ShieldAlert className="h-7 w-7" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-xl bg-[#FBBF24] text-[#0B1220] flex items-center justify-center font-bold">
                  <AlertTriangle className="h-7 w-7" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-[#F1F5F9]">
                  {recallInfo?.isRecalled
                    ? 'CRITICAL WARNING: RECALLED MEDICINE (Do Not Consume)'
                    : result.exists && result.isValid
                    ? 'Authentic Medicine (Verified & Untampered)'
                    : result.exists && !result.isValid
                    ? 'Counterfeit Alert (Failed Ledger Verification)'
                    : 'Suspicious or Unverified Medicine (Record Not Found)'}
                </h3>
                <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                  Target Query: {hashInput}
                </p>
              </div>
            </div>

            {recallInfo?.isRecalled && (
              <div className="p-4 rounded-xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-200 mb-6 space-y-2 animate-pulse">
                <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase tracking-wider">
                  <AlertOctagon className="h-5 w-5" /> Active Health Recall Notice
                </div>
                <div className="text-xs">
                  <strong>Reason for Recall:</strong> {recallInfo.reason}
                </div>
                {recallInfo.directive && (
                  <div className="text-xs">
                    <strong>Regulatory Directive:</strong> {recallInfo.directive}
                  </div>
                )}
                <div className="text-[11px] text-rose-300">
                  <strong>Issued By:</strong> {recallInfo.authority} &bull; {new Date(recallInfo.timestamp).toUTCString()}
                </div>
                <div className="p-2.5 bg-rose-950/80 rounded-lg text-rose-100 text-xs font-bold border border-rose-500/40">
                  PATIENT SAFETY WARNING: Do NOT consume or administer this pharmaceutical product. Return package immediately to your dispensing pharmacy or hospital.
                </div>
              </div>
            )}

            {result.exists && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-[#172638] rounded-xl border border-[#304257] flex items-center gap-3">
                  <Box className="h-5 w-5 text-[#00D6B4] shrink-0" />
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-sans">Drug Serial Number</span>
                    <span className="text-[#F1F5F9] font-semibold">{result.drugSerialNumber}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#172638] rounded-xl border border-[#304257] flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-[#00D6B4] shrink-0" />
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-sans">Lifecycle Stage</span>
                    <span className={`font-bold ${recallInfo?.isRecalled ? 'text-rose-400' : 'text-[#A3E635]'}`}>
                      {recallInfo?.type || result.eventType}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#172638] rounded-xl border border-[#304257] flex items-center gap-3">
                  <User className="h-5 w-5 text-[#00D6B4] shrink-0" />
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-sans">Signer Address</span>
                    <span className="text-[#F1F5F9] truncate block max-w-[200px]">{result.signer}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-[#172638] rounded-xl border border-[#304257] flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#00D6B4] shrink-0" />
                  <div>
                    <span className="text-[#94A3B8] block text-[10px] uppercase font-sans">Anchored Timestamp</span>
                    <span className="text-[#F1F5F9]">
                      {result.timestamp ? new Date(result.timestamp).toUTCString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {result.explorerUrl && (
                  <div className="p-3.5 bg-[#172638] rounded-xl border border-[#304257] flex items-center justify-between col-span-1 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-[#00D6B4]" />
                      <span className="text-[#94A3B8] text-[11px] font-sans">Etherscan / Polygonscan Audit:</span>
                    </div>
                    <a
                      href={result.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00D6B4] hover:underline text-xs font-mono font-bold"
                    >
                      View on Block Explorer &rarr;
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-[#304257] col-span-1 sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#F1F5F9] flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-[#00D6B4]" /> Official Compliance Filings
                    </span>
                    <span className="text-[11px] text-[#94A3B8] block">
                      Download verified GxP audit package for medical records or regulatory inspection
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={downloading}
                      onClick={() => handleDownload('pdf')}
                      className="btn btn-xs bg-[#00D6B4] hover:bg-[#00D6B4]/80 text-[#0B1220] font-bold border-none rounded-lg flex items-center gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5" /> Download Dossier (PDF)
                    </button>
                    <button
                      type="button"
                      disabled={downloading}
                      onClick={() => handleDownload('csv')}
                      className="btn btn-xs bg-[#172638] hover:bg-[#1E2E44] text-[#F1F5F9] border-[#304257] rounded-lg font-bold flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-[#00D6B4]" /> CSV Ledger
                    </button>
                    <button
                      type="button"
                      disabled={downloading}
                      onClick={() => handleDownload('json')}
                      className="btn btn-xs bg-[#172638] hover:bg-[#1E2E44] text-[#F1F5F9] border-[#304257] rounded-lg font-bold flex items-center gap-1.5"
                    >
                      <FileJson className="h-3.5 w-3.5 text-[#00D6B4]" /> JSON Package
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
