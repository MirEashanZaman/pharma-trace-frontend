'use client';

import React, { useState } from 'react';
import { verifyAttestation, AttestationVerification } from '@/lib/api';
import { Search, ShieldAlert, CheckCircle2, Clock, User, Link as LinkIcon, Box, AlertTriangle, Camera } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { connectMetaMask } from '@/lib/web3';
import { CameraQrScanner } from '@/components/qr-scanner';

export default function VerifyPage() {
  const [hashInput, setHashInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AttestationVerification | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const performVerification = async (targetHash: string) => {
    if (!targetHash.trim()) return;
    setLoading(true);
    try {
      const data = await verifyAttestation(targetHash.trim());
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
            Inspect on-chain cryptographic signatures, tamper-evident timestamps, and lifecycle transitions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <form onSubmit={handleVerify} className="relative flex-1">
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter your hash or attestation key (0x...)"
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
              result.exists && result.isValid
                ? 'bg-[#243247] border-[#A3E635]'
                : result.exists && !result.isValid
                ? 'bg-[#243247] border-[#F87171]'
                : 'bg-[#243247] border-[#FBBF24]'
            }`}
          >
            <div className="flex items-center gap-4 mb-6">
              {result.exists && result.isValid ? (
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
                  {result.exists && result.isValid
                    ? 'Authentic Medicine (Verified & Untampered)'
                    : result.exists && !result.isValid
                    ? 'Counterfeit Alert (Failed Ledger Verification)'
                    : 'Suspicious or Unverified Medicine (Record Not Found)'}
                </h3>
                <p className="text-xs text-[#94A3B8] font-mono mt-0.5">
                  Hash: {hashInput}
                </p>
              </div>
            </div>

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
                    <span className="text-[#A3E635] font-bold">{result.eventType}</span>
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
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
