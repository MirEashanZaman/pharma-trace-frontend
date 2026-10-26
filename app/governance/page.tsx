'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import {
  Vote,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ArrowRight,
  Send,
  Building,
  KeyRound,
  FileCheck,
  Ban,
  Play,
  Users,
} from 'lucide-react';
import {
  fetchGovernanceGuardians,
  fetchGovernanceProposals,
  createGovernanceProposal,
  confirmGovernanceProposal,
  executeGovernanceProposal,
  cancelGovernanceProposal,
} from '@/lib/api';

export default function GovernancePage() {
  const [guardians, setGuardians] = useState<string[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [selectedGuardian, setSelectedGuardian] = useState('');
  
  const [description, setDescription] = useState('Emergency Recall: Contaminated Paracetamol Lot 2026-09');
  const [targetAddress, setTargetAddress] = useState('0xa2D05738825b4f81F8D50c30d783c5958EbcC1Ae');
  const [delaySeconds, setDelaySeconds] = useState('86400');
  const [callDataHex, setCallDataHex] = useState('0x6c61746368');

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadGovernanceData = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const [guardiansList, proposalsList] = await Promise.all([
        fetchGovernanceGuardians().catch(() => []),
        fetchGovernanceProposals().catch(() => []),
      ]);
      setGuardians(guardiansList);
      if (guardiansList.length > 0 && !selectedGuardian) {
        setSelectedGuardian(guardiansList[0]);
      }
      setProposals(Array.isArray(proposalsList) ? proposalsList : []);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to fetch governance ledger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGovernanceData();
  }, []);

  const handleCreateProposal = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await createGovernanceProposal({
        description: description.trim(),
        target: targetAddress.trim(),
        value: 0,
        data: callDataHex.trim(),
        delaySeconds: Number(delaySeconds),
        proposerAddress: selectedGuardian,
      });
      setStatusMessage({
        type: 'success',
        message: `Proposal ${result.proposalId || result.id} created and queued with ${delaySeconds}s timelock.`,
      });
      await loadGovernanceData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Proposal submission failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmProposal = async (proposalId: string) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await confirmGovernanceProposal(proposalId, selectedGuardian);
      setStatusMessage({
        type: 'success',
        message: `Guardian ${selectedGuardian.slice(0, 8)}... confirmed proposal. Status: ${res.status}.`,
      });
      await loadGovernanceData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Proposal confirmation failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteProposal = async (proposalId: string) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await executeGovernanceProposal(proposalId, selectedGuardian);
      setStatusMessage({
        type: 'success',
        message: `Timelock proposal executed successfully on-chain! Status: ${res.status || 'EXECUTED'}.`,
      });
      await loadGovernanceData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Proposal execution failed (Timelock ETA or quorum requirement unsatisfied)',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelProposal = async (proposalId: string) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await cancelGovernanceProposal(
        proposalId,
        selectedGuardian,
        'Regulatory veto applied by authorized agency guardian',
      );
      setStatusMessage({
        type: 'success',
        message: `Proposal ${proposalId.slice(0, 10)}... cancelled by guardian veto.`,
      });
      await loadGovernanceData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Proposal cancellation failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9]">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D6B4]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-sm bg-[#00D6B4]/20 text-[#00D6B4] border border-[#00D6B4]/30 font-mono font-bold">
                  EVM CONTRACT: PharmaTimelockController.sol
                </span>
                <span className="badge badge-sm bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
                  MULTI-SIG REGULATORY TIMELOCK
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5F9] flex items-center gap-3">
                <Vote className="h-7 w-7 text-[#00D6B4]" />
                Multi-Sig Regulatory Governance & Timelock Portal
              </h1>
              <p className="text-[#94A3B8] text-sm mt-1 max-w-3xl">
                OpenZeppelin TimelockController governance with multi-signature quorum for drug recalls, formula deprecation,
                and emergency compliance halts. Requires 2/3 regulatory guardian signatures and delay verification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadGovernanceData}
                disabled={loading}
                className="btn btn-sm bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Proposals</span>
              </button>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-semibold">{statusMessage.message}</span>
          </div>
        )}

        <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#304257] pb-4">
            <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00D6B4]" />
              Regulatory Guardian Node Quorum (FDA, EMA, WHO)
            </h2>
            <div className="text-xs font-mono text-[#00D6B4]">
              Threshold: 2 of {guardians.length || 3} Signatures Required
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {guardians.length === 0 ? (
              <div className="col-span-3 text-xs text-[#94A3B8] font-mono">
                Connecting to EVM Guardian Registry...
              </div>
            ) : (
              guardians.map((guardian, idx) => (
                <div
                  key={guardian}
                  onClick={() => setSelectedGuardian(guardian)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedGuardian === guardian
                      ? 'bg-[#00D6B4]/10 border-[#00D6B4] text-[#F1F5F9]'
                      : 'bg-[#0B1220] border-[#304257] text-[#94A3B8] hover:border-[#00D6B4]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#00D6B4]">
                      Guardian Node {idx + 1}
                    </span>
                    <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border-none font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <div className="font-mono text-xs truncate">{guardian}</div>
                  <div className="text-[11px] text-[#94A3B8] mt-2 flex items-center gap-1">
                    <KeyRound className="h-3 w-3 text-[#00D6B4]" />
                    <span>Click to activate for voting</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#304257] pb-4">
            <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-[#00D6B4]" />
              Queue Regulatory Timelock Proposal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1">Proposal Directive Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1">Target Contract Address</label>
                <input
                  type="text"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1">Calldata Payload (Hex)</label>
                <input
                  type="text"
                  value={callDataHex}
                  onChange={(e) => setCallDataHex(e.target.value)}
                  className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1">Timelock Delay (Seconds)</label>
                <input
                  type="number"
                  value={delaySeconds}
                  onChange={(e) => setDelaySeconds(e.target.value)}
                  className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleCreateProposal}
            disabled={loading}
            className="btn btn-sm w-full bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none font-bold rounded-xl h-10"
          >
            Submit Proposal with Active Guardian ({selectedGuardian ? `${selectedGuardian.slice(0, 8)}...` : 'None'})
          </button>
        </div>

        <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#304257] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#00D6B4]" />
                Timelock Proposal Ledger & Guardian Signatures
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Inspect proposals queued in timelock. Sign with guardian nodes or execute after delay expiry.
              </p>
            </div>
          </div>

          {proposals.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#304257] rounded-xl">
              <Vote className="h-10 w-10 text-[#304257] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#94A3B8]">No governance proposals currently queued</p>
              <p className="text-xs text-[#94A3B8] mt-1">Submit a proposal above to initiate regulatory timelock.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((prop) => (
                <div
                  key={prop.id || prop.proposalId}
                  className="bg-[#0B1220] border border-[#304257] rounded-xl p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#304257]/60 pb-3">
                    <div>
                      <span className="font-mono text-xs text-[#00D6B4] font-bold">
                        {prop.id || prop.proposalId}
                      </span>
                      <h3 className="text-sm font-bold text-[#F1F5F9] mt-0.5">{prop.description}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`badge badge-sm font-bold ${
                          prop.status === 'READY_FOR_EXECUTION'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : prop.status === 'EXECUTED'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : prop.status === 'CANCELLED'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[#94A3B8]">Target: </span>
                      <span className="font-mono text-[#F1F5F9]">{prop.target?.slice(0, 10)}...</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8]">Confirmations: </span>
                      <span className="font-mono text-[#00D6B4] font-bold">
                        {prop.confirmations?.length || 0} / 2 Guardians
                      </span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8]">ETA: </span>
                      <span className="font-mono text-amber-300">
                        {prop.eta ? new Date(prop.eta * 1000).toLocaleString() : 'Immediate / Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#304257]/40">
                    <button
                      onClick={() => handleConfirmProposal(prop.id || prop.proposalId)}
                      disabled={loading || prop.status === 'EXECUTED' || prop.status === 'CANCELLED'}
                      className="btn btn-xs bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-lg"
                    >
                      <KeyRound className="h-3 w-3" />
                      <span>Confirm (Guardian Sign)</span>
                    </button>

                    <button
                      onClick={() => handleExecuteProposal(prop.id || prop.proposalId)}
                      disabled={loading || prop.status === 'EXECUTED' || prop.status === 'CANCELLED'}
                      className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-[#F1F5F9] border-none rounded-lg"
                    >
                      <Play className="h-3 w-3" />
                      <span>Execute Proposal</span>
                    </button>

                    <button
                      onClick={() => handleCancelProposal(prop.id || prop.proposalId)}
                      disabled={loading || prop.status === 'EXECUTED' || prop.status === 'CANCELLED'}
                      className="btn btn-xs bg-rose-600 hover:bg-rose-700 text-[#F1F5F9] border-none rounded-lg"
                    >
                      <Ban className="h-3 w-3" />
                      <span>Guardian Veto</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
