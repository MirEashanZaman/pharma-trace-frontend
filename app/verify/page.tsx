'use client';

import React, { useState } from 'react';
import { verifyAttestation, AttestationVerification } from '@/lib/api';
import { Search, ShieldAlert, CheckCircle2, Clock, User, Link as LinkIcon, Box, AlertTriangle } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { connectMetaMask } from '@/lib/web3';

export default function VerifyPage() {
  const [hashInput, setHashInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AttestationVerification | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashInput.trim()) return;

    setLoading(true);
    try {
      const data = await verifyAttestation(hashInput.trim());
      setResult(data);
    } catch (err) {
      console.error(err);
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

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#102A43] flex flex-col font-sans">
      <Navigation walletAddress={wallet} onConnectWallet={async () => setWallet(await connectMetaMask())} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="text-center space-y-3 mb-10">
          <div className="badge badge-lg bg-[#16B8A6]/15 text-[#102A43] border border-[#16B8A6]/30 font-semibold uppercase tracking-wider py-3 px-4">
            Public Proof Explorer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#102A43]">
            Verify Attestation & Drug Custody
          </h1>
          <p className="text-[#52677A] text-sm max-w-xl mx-auto">
            Inspect on-chain cryptographic signatures, tamper-evident timestamps, and lifecycle transitions.
          </p>
        </div>

        <form onSubmit={handleVerify} className="relative mb-10">
          <input
            type="text"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="Paste SHA-256 event hash or on-chain attestation hash (0x...)"
            className="input input-bordered w-full bg-white border-slate-300 rounded-xl px-5 py-4 pl-12 text-sm text-[#102A43] font-mono shadow-sm focus:border-[#16B8A6] focus:outline-none"
          />
          <Search className="absolute left-4 top-4 h-5 w-5 text-[#52677A]" />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-sm bg-[#16B8A6] hover:bg-[#139485] text-white border-none rounded-lg absolute right-2.5 top-2.5 px-5 font-semibold text-xs tracking-wider"
          >
            {loading ? 'Verifying...' : 'Verify Hash'}
          </button>
        </form>

        {result && (
          <div
            className={`card shadow-sm rounded-2xl p-6 border ${
              result.exists && result.isValid
                ? 'bg-[#16A36A]/10 border-[#16A36A]'
                : result.exists && !result.isValid
                ? 'bg-[#DC4545]/10 border-[#DC4545]'
                : 'bg-[#D97706]/10 border-[#D97706]'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              {result.exists && result.isValid ? (
                <div className="h-12 w-12 rounded-xl bg-[#16A36A] text-white flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              ) : result.exists && !result.isValid ? (
                <div className="h-12 w-12 rounded-xl bg-[#DC4545] text-white flex items-center justify-center">
                  <ShieldAlert className="h-7 w-7" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-xl bg-[#D97706] text-white flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-[#102A43]">
                  {result.exists && result.isValid
                    ? 'Authentic Medicine (Valid & Untampered)'
                    : result.exists && !result.isValid
                    ? 'Failed Ledger Verification (Tampered / Revoked)'
                    : 'Suspicious or Unverified Medicine (Record Not Found)'}
                </h3>
                <p className="text-xs text-[#52677A] font-mono mt-0.5">
                  Hash: {hashInput}
                </p>
              </div>
            </div>

            {result.exists && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <Box className="h-5 w-5 text-[#16B8A6] shrink-0" />
                  <div>
                    <span className="text-[#52677A] block text-[10px] uppercase font-sans">Drug Serial Number</span>
                    <span className="text-[#102A43] font-semibold">{result.drugSerialNumber}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-[#16B8A6] shrink-0" />
                  <div>
                    <span className="text-[#52677A] block text-[10px] uppercase font-sans">Lifecycle Stage</span>
                    <span className="text-[#16A36A] font-bold">{result.eventType}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <User className="h-5 w-5 text-[#16B8A6] shrink-0" />
                  <div>
                    <span className="text-[#52677A] block text-[10px] uppercase font-sans">Signer Address</span>
                    <span className="text-[#102A43] truncate block max-w-[200px]">{result.signer}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-[#16B8A6] shrink-0" />
                  <div>
                    <span className="text-[#52677A] block text-[10px] uppercase font-sans">Anchored Timestamp</span>
                    <span className="text-[#102A43]">
                      {result.timestamp ? new Date(result.timestamp).toUTCString() : 'N/A'}
                    </span>
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
