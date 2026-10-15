'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/navigation';
import {
  Flame,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  Cpu,
  Link2,
  Layers,
  ArrowRight,
  Activity,
  KeyRound,
  FileText,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  resolveGs1DigitalLink,
  verifyDigitalTwin,
  burnDigitalTwin,
  simulateNfcTap,
  verifyNfcTap,
  checkEscrowAutomation,
} from '@/lib/api';

export default function DispensePage() {
  const [inputGtin, setInputGtin] = useState('00844514000015');
  const [inputSerial, setInputSerial] = useState('SN-TWIN-9901');
  const [dispenserAddress, setDispenserAddress] = useState('0x90F79bf6EB2c4f870365E785982E1f101E93b906');
  const [loading, setLoading] = useState(false);
  const [twinData, setTwinData] = useState<any>(null);
  const [linksetData, setLinksetData] = useState<any>(null);
  const [burnResult, setBurnResult] = useState<any>(null);
  const [nfcState, setNfcState] = useState<{
    uid: string;
    counter: number;
    cmac: string;
    verified?: boolean;
    reason?: string;
  } | null>(null);
  const [escrowCheck, setEscrowCheck] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleResolve = async () => {
    setLoading(true);
    setErrorMessage(null);
    setBurnResult(null);
    try {
      const [linkset, twin] = await Promise.all([
        resolveGs1DigitalLink(inputGtin.trim(), inputSerial.trim()).catch(() => null),
        verifyDigitalTwin(inputSerial.trim()).catch(() => null),
      ]);
      setLinksetData(linkset);
      setTwinData(twin);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Resolution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBurn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await burnDigitalTwin(inputSerial.trim(), dispenserAddress.trim());
      setBurnResult(result);
      const updated = await verifyDigitalTwin(inputSerial.trim());
      setTwinData(updated);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Burn transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateNfc = async () => {
    try {
      const simulated = await simulateNfcTap('04a1b2c3d4e5f6');
      const verify = await verifyNfcTap('04a1b2c3d4e5f6', simulated.tapCounter, simulated.cmac);
      setNfcState({
        uid: '04a1b2c3d4e5f6',
        counter: simulated.tapCounter,
        cmac: simulated.cmac,
        verified: verify.isValid,
        reason: verify.reason,
      });
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'NFC verification error');
    }
  };

  const handleCheckEscrow = async () => {
    try {
      const check = await checkEscrowAutomation();
      setEscrowCheck(check);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'Escrow check failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] font-sans antialiased">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-[#243247] pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-sm bg-[#00D6B4]/20 text-[#00D6B4] border border-[#00D6B4]/30 font-mono font-bold">
                  FDA DSCSA 2024 / GS1 DIGITAL LINK 1.2
                </span>
                <span className="badge badge-sm bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold">
                  ANTI-RECIRCULATION BURN
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#F1F5F9]">
                Clinical Dispense & Physical-Digital Twin Portal
              </h1>
              <p className="text-sm text-[#94A3B8] mt-1 max-w-2xl">
                Inspect authentic GS1 2D DataMatrix digital linksets, verify NTAG 424 DNA dynamic NFC chips, and execute irreversible on-chain token burns upon patient dispensing to halt counterfeit reuse.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateNfc}
                className="btn btn-sm bg-[#172638] hover:bg-[#243247] text-[#00D6B4] border border-[#243247] rounded-xl font-bold flex items-center gap-1.5"
              >
                <Cpu className="h-4 w-4" />
                <span>Simulate NFC Tap</span>
              </button>
              <button
                onClick={handleCheckEscrow}
                className="btn btn-sm bg-[#172638] hover:bg-[#243247] text-[#F1F5F9] border border-[#243247] rounded-xl font-bold flex items-center gap-1.5"
              >
                <Activity className="h-4 w-4 text-[#00D6B4]" />
                <span>Check Keepers</span>
              </button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-rose-300 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span className="text-sm font-semibold">{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#172638] border border-[#243247] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[#00D6B4] mb-4">
                <Search className="h-4 w-4" />
                <span>Product Identification Keys</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                    GS1 GTIN (14 Digits - AI 01)
                  </label>
                  <input
                    type="text"
                    value={inputGtin}
                    onChange={(e) => setInputGtin(e.target.value)}
                    placeholder="00844514000015"
                    className="w-full bg-[#0B1220] border border-[#243247] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                    Serial Number (AI 21)
                  </label>
                  <input
                    type="text"
                    value={inputSerial}
                    onChange={(e) => setInputSerial(e.target.value)}
                    placeholder="SN-TWIN-9901"
                    className="w-full bg-[#0B1220] border border-[#243247] rounded-xl px-3.5 py-2.5 text-sm font-mono text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#94A3B8] block mb-1">
                    Dispenser Authorized Wallet (GLN Registered)
                  </label>
                  <input
                    type="text"
                    value={dispenserAddress}
                    onChange={(e) => setDispenserAddress(e.target.value)}
                    className="w-full bg-[#0B1220] border border-[#243247] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4]"
                  />
                </div>

                <button
                  onClick={handleResolve}
                  disabled={loading}
                  className="w-full btn bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  <span>Resolve GS1 Digital Link</span>
                </button>
              </div>
            </div>

            {nfcState && (
              <div className="bg-[#172638] border border-[#243247] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#00D6B4]">
                    <Cpu className="h-4 w-4" />
                    <span>Dynamic NFC Tag</span>
                  </div>
                  {nfcState.verified ? (
                    <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      AUTHENTIC
                    </span>
                  ) : (
                    <span className="badge badge-xs bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      REPLAY DETECTED
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs font-mono text-[#94A3B8]">
                  <div className="flex justify-between">
                    <span>UID:</span>
                    <span className="text-[#F1F5F9]">{nfcState.uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tap Counter:</span>
                    <span className="text-[#00D6B4]">#{nfcState.counter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AES-128 CMAC:</span>
                    <span className="text-[#F1F5F9]">{nfcState.cmac.slice(0, 10)}...</span>
                  </div>
                </div>
              </div>
            )}

            {escrowCheck && (
              <div className="bg-[#172638] border border-[#243247] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#00D6B4]">
                    <Activity className="h-4 w-4" />
                    <span>Chainlink Keepers</span>
                  </div>
                  <span className={`badge badge-xs ${escrowCheck.upkeepNeeded ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'}`}>
                    {escrowCheck.upkeepNeeded ? 'UPKEEP NEEDED' : 'IDLE'}
                  </span>
                </div>
                <div className="text-xs text-[#94A3B8]">
                  {escrowCheck.reason || 'No active escrow requires settlement or refund'}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#172638] border border-[#243247] rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#243247] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-[#00D6B4]" />
                  <h2 className="text-base font-bold text-[#F1F5F9]">Digital Twin State Matrix</h2>
                </div>
                {twinData?.isBurned ? (
                  <span className="badge bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold px-3 py-1 font-mono">
                    BURNED / CONSUMED
                  </span>
                ) : twinData?.exists ? (
                  <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-3 py-1 font-mono">
                    ACTIVE DIGITAL TWIN
                  </span>
                ) : (
                  <span className="badge bg-[#243247] text-[#94A3B8] font-mono">
                    AWAITING RESOLUTION
                  </span>
                )}
              </div>

              {twinData?.exists ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#0B1220] p-4 rounded-xl border border-[#243247]">
                      <div className="text-xs text-[#94A3B8] mb-1">On-Chain Token ID</div>
                      <div className="text-xs font-mono text-[#00D6B4] truncate">
                        {twinData?.details?.tokenId || '0x...'}
                      </div>
                    </div>

                    <div className="bg-[#0B1220] p-4 rounded-xl border border-[#243247]">
                      <div className="text-xs text-[#94A3B8] mb-1">Current Custodian</div>
                      <div className="text-xs font-mono text-[#F1F5F9] truncate">
                        {twinData?.holder || '0x0000000000000000000000000000000000000000'}
                      </div>
                    </div>

                    <div className="bg-[#0B1220] p-4 rounded-xl border border-[#243247]">
                      <div className="text-xs text-[#94A3B8] mb-1">Authenticity & Expiry</div>
                      <div className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-1.5">
                        {twinData?.isAuthentic ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-[#00D6B4]" />
                            <span className="text-[#00D6B4]">GxP Validated</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-rose-400" />
                            <span className="text-rose-400">Non-Authentic / Inactive</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#0B1220] p-4 rounded-xl border border-[#243247]">
                      <div className="text-xs text-[#94A3B8] mb-1">Anti-Recirculation Defense</div>
                      <div className="text-sm font-semibold flex items-center gap-1.5">
                        {twinData?.isBurned ? (
                          <span className="text-rose-400">Token Destroyed (Cannot Reuse)</span>
                        ) : (
                          <span className="text-emerald-300">Ready For Patient Handover</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#243247] pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B1220] p-4 rounded-xl border border-[#243247]">
                      <div>
                        <div className="text-sm font-bold text-[#F1F5F9]">
                          Clinical Patient Handover
                        </div>
                        <div className="text-xs text-[#94A3B8]">
                          Executing dispense destroys this unit digital twin permanently on the smart contract.
                        </div>
                      </div>

                      <button
                        onClick={handleBurn}
                        disabled={loading || twinData?.isBurned}
                        className={`btn btn-sm rounded-xl font-bold flex items-center gap-2 ${twinData?.isBurned ? 'bg-[#243247] text-[#94A3B8] cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 text-[#F1F5F9] border-none'}`}
                      >
                        <Flame className="h-4 w-4" />
                        <span>{twinData?.isBurned ? 'Already Burned' : 'Dispense & Burn Twin'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-[#94A3B8] text-sm">
                  Enter GTIN and Serial Number to inspect the digital twin and GS1 Digital Link response.
                </div>
              )}
            </div>

            {burnResult && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
                  <Flame className="h-4 w-4" />
                  <span>ANTI-RECIRCULATION PROTOCOL ENFORCED</span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed">
                  Digital twin token balance has been reduced to zero on smart contract. The drug unit serial is now permanently registered as CONSUMED. Any subsequent scan or transfer attempt will trigger an automatic counterfeit alert.
                </p>
              </div>
            )}

            {linksetData && (
              <div className="bg-[#172638] border border-[#243247] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#243247] pb-3 mb-4">
                  <Link2 className="h-4 w-4 text-[#00D6B4]" />
                  <h3 className="text-sm font-bold text-[#F1F5F9]">RFC 9264 GS1 Digital Linkset</h3>
                </div>

                <div className="text-xs font-mono text-[#00D6B4] bg-[#0B1220] p-3 rounded-xl border border-[#243247] mb-4 truncate">
                  {linksetData.anchor}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {linksetData['gs1:pip'] && (
                    <div className="bg-[#0B1220] p-3 rounded-xl border border-[#243247]">
                      <div className="text-[#00D6B4] font-bold mb-1">gs1:pip (Patient e-PIL)</div>
                      <div className="text-[#94A3B8] truncate">{linksetData['gs1:pip'][0]?.href}</div>
                    </div>
                  )}

                  {linksetData['gs1:hasBatchLot'] && (
                    <div className="bg-[#0B1220] p-3 rounded-xl border border-[#243247]">
                      <div className="text-[#00D6B4] font-bold mb-1">gs1:hasBatchLot (CoA)</div>
                      <div className="text-[#94A3B8] truncate">{linksetData['gs1:hasBatchLot'][0]?.href}</div>
                    </div>
                  )}

                  {linksetData['gs1:epcis'] && (
                    <div className="bg-[#0B1220] p-3 rounded-xl border border-[#243247]">
                      <div className="text-[#00D6B4] font-bold mb-1">gs1:epcis (EPCIS 2.0 Repository)</div>
                      <div className="text-[#94A3B8] truncate">{linksetData['gs1:epcis'][0]?.href}</div>
                    </div>
                  )}

                  {linksetData['gs1:certificationInfo'] && (
                    <div className="bg-[#0B1220] p-3 rounded-xl border border-[#243247]">
                      <div className="text-[#00D6B4] font-bold mb-1">gs1:certificationInfo (FDA DSCSA)</div>
                      <div className="text-[#94A3B8] truncate">{linksetData['gs1:certificationInfo'][0]?.href}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
