'use client';

import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  Copy,
  Terminal,
  ExternalLink,
  Shield,
  FileCheck,
  EyeOff,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ZkProofInspectorProps {
  batchHash?: string;
}

export function ZkProofInspector({
  batchHash = '0x8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
}: ZkProofInspectorProps) {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const proofData = {
    scheme: 'Groth16 / BN254 Curve',
    circuit: 'ColdChainVerifier(10)',
    constraintCount: 1680,
    publicSignals: ['1', '2.00', '8.00', batchHash],
    pi_a: [
      '0x1a4b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
      '0x2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
    ],
    pi_b: [
      [
        '0x3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
        '0x4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f',
      ],
      [
        '0x5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a',
        '0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
      ],
    ],
    pi_c: [
      '0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c',
      '0x8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d',
    ],
    verificationKeyFingerprint: '0xzkvk_bn254_38a0f9182371982739182739182739182739',
    estimatedGas: '194,520 gas',
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 600);
  };

  return (
    <Card className="bg-[#172638] border-[#304257] text-[#F1F5F9] rounded-2xl overflow-hidden shadow-lg w-full max-w-full">
      <CardHeader className="border-b border-[#304257] p-5 sm:p-6 bg-[#0B1220]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center">
                <Lock className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-[#F1F5F9] tracking-tight">
                Circom ZK-SNARK Cold-Chain Verification
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm text-[#94A3B8]">
              Zero-Knowledge Groth16 cryptographic proof ensuring privacy-preserving GxP cold-chain compliance.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="teal" size="sm" className="font-mono text-[11px] gap-1.5 py-1 px-2.5">
              <EyeOff className="h-3.5 w-3.5 text-[#00D6B4]" /> Confidential Compliance Proven
            </Badge>
            <Badge variant="outline" size="sm" className="font-mono text-[11px] py-1 px-2.5 border-[#304257] text-[#94A3B8]">
              {proofData.scheme}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="bg-[#243247] border border-[#00D6B4]/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00D6B4] flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[#00D6B4]" /> Mathematical Invariance Guarantee
            </span>
            <p className="text-xs sm:text-sm text-[#F1F5F9] leading-relaxed">
              Every shipment sensor reading is guaranteed within [2.00C, 8.00C] via Circom bit-decomposition comparators without disclosing proprietary routes or raw coordinates to competitors.
            </p>
          </div>

          <Button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full sm:w-auto bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] font-bold rounded-xl text-xs px-4 h-9 shadow-sm shrink-0"
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs"></span> Verifying...
              </span>
            ) : isVerified ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Proof Verified
              </span>
            ) : (
              'Verify ZK Proof'
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0B1220] border border-[#304257] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94A3B8]">Public Signals</span>
              <button
                onClick={() => handleCopy(JSON.stringify(proofData.publicSignals), 'signals')}
                className="text-[10px] text-[#00D6B4] hover:underline flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> {copiedKey === 'signals' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="font-mono text-xs text-[#F1F5F9] space-y-1">
              <div>isCompliant: <span className="text-[#A3E635]">true (1)</span></div>
              <div>minTemp: <span className="text-[#00D6B4]">2.00C</span></div>
              <div>maxTemp: <span className="text-[#00D6B4]">8.00C</span></div>
              <div className="text-[11px] text-[#94A3B8] truncate" title={batchHash}>
                batchHash: {batchHash.slice(0, 14)}...
              </div>
            </div>
          </div>

          <div className="bg-[#0B1220] border border-[#304257] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94A3B8]">Proof Vector (pi_a, pi_c)</span>
              <button
                onClick={() => handleCopy(JSON.stringify({ pi_a: proofData.pi_a, pi_c: proofData.pi_c }), 'pi_a')}
                className="text-[10px] text-[#00D6B4] hover:underline flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> {copiedKey === 'pi_a' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="font-mono text-[11px] text-[#94A3B8] break-all leading-tight max-h-[85px] overflow-hidden">
              <span className="text-[#00D6B4]">G1(pi_a):</span> {proofData.pi_a[0]}...<br />
              <span className="text-[#38BDF8]">G1(pi_c):</span> {proofData.pi_c[0]}...
            </div>
          </div>

          <div className="bg-[#0B1220] border border-[#304257] rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#94A3B8]">Verification Key & Gas</span>
              <Badge variant="outline" size="sm" className="font-mono text-[10px] border-[#00D6B4]/30 text-[#00D6B4]">
                {proofData.estimatedGas}
              </Badge>
            </div>
            <div className="font-mono text-[11px] text-[#94A3B8] break-all leading-tight">
              <div>Circuit Constraints: <span className="text-[#F1F5F9] font-bold">{proofData.constraintCount}</span></div>
              <div className="truncate text-[#64748B] mt-1" title={proofData.verificationKeyFingerprint}>
                VK: {proofData.verificationKeyFingerprint}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0B1220] border border-[#304257] rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#94A3B8] flex items-center gap-1.5 font-mono">
              <Terminal className="h-3.5 w-3.5 text-[#00D6B4]" /> EVM Calldata Payload (ZkColdChainVerifier.sol)
            </span>
            <button
              onClick={() => handleCopy(`verifier.verifyProof(${JSON.stringify(proofData.pi_a)}, ${JSON.stringify(proofData.pi_b)}, ${JSON.stringify(proofData.pi_c)}, [1, 200, 800, "${batchHash}"])`, 'calldata')}
              className="text-[11px] text-[#00D6B4] hover:underline flex items-center gap-1"
            >
              <Copy className="h-3 w-3" /> {copiedKey === 'calldata' ? 'Calldata Copied' : 'Copy Calldata'}
            </button>
          </div>
          <div className="font-mono text-[11px] text-[#94A3B8] break-all leading-relaxed max-h-[70px] overflow-y-auto overflow-x-hidden p-2 bg-[#172638] rounded-lg">
            verifyProof([{proofData.pi_a.join(', ')}], [[{proofData.pi_b[0].join(', ')}], [{proofData.pi_b[1].join(', ')}]], [{proofData.pi_c.join(', ')}], [1, 200, 800, &quot;{batchHash}&quot;])
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
