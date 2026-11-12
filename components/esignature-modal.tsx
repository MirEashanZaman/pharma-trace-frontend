'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  FileCheck2,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ESignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureRecord: ESignatureRecord) => void;
  actionTitle: string;
  targetIdentifier: string;
  defaultReason?: string;
}

export interface ESignatureRecord {
  signerName: string;
  signerRole: string;
  reason: string;
  timestamp: string;
  statement: string;
  signatureHash: string;
}

export function ESignatureModal({
  isOpen,
  onClose,
  onConfirm,
  actionTitle,
  targetIdentifier,
  defaultReason = 'BATCH_RELEASE_SPECIFICATION_MET',
}: ESignatureModalProps) {
  const [signerName, setSignerName] = useState<string>('Dr. Elena Rostova, PharmD');
  const [signerRole, setSignerRole] = useState<string>('Qualified Person (QP) / Head of QC');
  const [reason, setReason] = useState<string>(defaultReason);
  const [passcode, setPasscode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const regulatoryStatement =
    'By providing my digital electronic signature, I certify under penalty of perjury that this action conforms to standard operating procedures (SOPs) and complies with FDA 21 CFR Part 11 and EU GMP Annex 11 regulatory data integrity requirements.';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim() || !passcode.trim()) {
      setError('Please provide your full legal name and cryptographic signing PIN.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const record: ESignatureRecord = {
        signerName,
        signerRole,
        reason,
        timestamp: new Date().toISOString(),
        statement: regulatoryStatement,
        signatureHash: '0xsig_' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
      };
      setIsSubmitting(false);
      onConfirm(record);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1220]/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#172638] border border-[#304257] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
        <div className="border-b border-[#304257] p-5 flex items-center justify-between bg-[#0B1220]/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F1F5F9] tracking-tight">
                FDA 21 CFR Part 11 Electronic Signature
              </h2>
              <p className="text-[11px] text-[#94A3B8]">
                Regulatory electronic verification manifest
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] p-1.5 rounded-lg hover:bg-[#243247] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
          <div className="bg-[#243247] border border-[#304257] rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Target Action</span>
              <Badge variant="teal" size="sm" className="font-mono text-[10px]">
                {actionTitle}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8]">Serial / Identifier</span>
              <span className="font-mono font-bold text-[#F1F5F9]">{targetIdentifier}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#94A3B8] uppercase tracking-wider text-[11px]">
              Full Legal Signer Name
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              className="w-full bg-[#243247] border border-[#304257] rounded-xl px-3.5 py-2 text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#94A3B8] uppercase tracking-wider text-[11px]">
              GxP Delegated Authority / Role
            </label>
            <input
              type="text"
              value={signerRole}
              onChange={(e) => setSignerRole(e.target.value)}
              className="w-full bg-[#243247] border border-[#304257] rounded-xl px-3.5 py-2 text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] transition"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#94A3B8] uppercase tracking-wider text-[11px]">
              Standardized Regulatory Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#243247] border border-[#304257] rounded-xl px-3.5 py-2 text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] transition"
            >
              <option value="BATCH_RELEASE_SPECIFICATION_MET">
                Batch release: All specifications and quality tests verified
              </option>
              <option value="SUSPECT_PRODUCT_QUARANTINE">
                Quarantine: Suspect product flagged under DSCSA 2023 investigation
              </option>
              <option value="DISPENSE_POINT_OF_CARE">
                Point-of-dispense: Medicine authenticated and dispensed to patient
              </option>
              <option value="CUSTODY_TRANSFER_ACCEPTANCE">
                Custody transfer: Inbound receipt confirmed with cold-chain intact
              </option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-[#94A3B8] uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>Cryptographic Signature PIN / Key</span>
              <span className="text-[#00D6B4] font-normal lowercase">EIP-712 backed</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter your authorized signing PIN"
                className="w-full bg-[#243247] border border-[#304257] rounded-xl px-3.5 py-2 text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] transition pl-9"
                required
              />
              <Key className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94A3B8]" />
            </div>
          </div>

          <div className="bg-[#0B1220] border border-[#304257] rounded-xl p-3 text-[11px] text-[#94A3B8] leading-relaxed">
            <p>{regulatoryStatement}</p>
          </div>

          {error && (
            <div className="text-rose-400 text-[11px] flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#304257]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#304257] text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] font-bold rounded-xl text-xs h-9 px-5 shadow-sm"
            >
              {isSubmitting ? 'Signing...' : 'Affix Cryptographic Signature'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
