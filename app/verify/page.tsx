'use client';

import React, { useState } from 'react';
import { verifyAttestation, AttestationVerification } from '@/lib/api';
import { Search, ShieldAlert, CheckCircle2, Clock, User, Link as LinkIcon, Box } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navigation walletAddress={wallet} onConnectWallet={async () => setWallet(await connectMetaMask())} />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Public Proof Explorer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Verify Attestation & Drug Custody
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Inspect on-chain cryptographic signatures, tamper-evident timestamps, and lifecycle transitions.
          </p>
        </div>

        <form onSubmit={handleVerify} className="relative mb-10">
          <input
            type="text"
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="Paste SHA-256 event hash or on-chain attestation hash (0x...)"
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-5 py-4 pl-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono placeholder:font-sans placeholder:text-slate-500 shadow-xl"
          />
          <Search className="absolute left-4 top-4.5 h-5 w-5 text-slate-400" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2.5 top-2.5 px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs tracking-wider transition disabled:opacity-50 shadow-md"
          >
            {loading ? 'Verifying...' : 'Verify Hash'}
          </button>
        </form>

        {result && (
          <div
            className={`rounded-2xl border p-6 backdrop-blur-xl transition-all ${
              result.exists && result.isValid
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-red-950/20 border-red-500/30'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              {result.exists && result.isValid ? (
                <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/40">
                  <ShieldAlert className="h-7 w-7" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white">
                  {result.exists && result.isValid
                    ? 'Valid & Untampered Attestation'
                    : result.exists && !result.isValid
                    ? 'Tampered / Revoked Attestation Detected'
                    : 'Attestation Record Not Found'}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Hash: {hashInput}
                </p>
              </div>
            </div>

            {result.exists && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Box className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Drug Serial Number</span>
                    <span className="text-slate-200 font-semibold">{result.drugSerialNumber}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Lifecycle Stage</span>
                    <span className="text-emerald-400 font-semibold">{result.eventType}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
                  <User className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Signer Address</span>
                    <span className="text-slate-200 truncate block max-w-[200px]">{result.signer}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
                  <Clock className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-sans">Anchored Timestamp</span>
                    <span className="text-slate-200">
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
