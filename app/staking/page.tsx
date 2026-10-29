'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import {
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Coins,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Scale,
  ArrowRight,
  TrendingDown,
  Building,
} from 'lucide-react';
import {
  depositStake,
  getCarrierAccount,
  lockShipmentBond,
  getShipmentBond,
  listShipmentBonds,
  resolveShipmentBond,
  unstakeCarrier,
  getCarrierIndemnity,
} from '@/lib/api';

export default function StakingPage() {
  const [carrierAddress, setCarrierAddress] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  const [depositAmount, setDepositAmount] = useState('10000');
  const [unstakeAmount, setUnstakeAmount] = useState('2000');
  
  const [shipmentId, setShipmentId] = useState('SHIP-COLD-2026-08');
  const [bondAmount, setBondAmount] = useState('3000');
  const [manufacturerAddress, setManufacturerAddress] = useState('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');

  const [accountData, setAccountData] = useState<any>(null);
  const [bondsList, setBondsList] = useState<any[]>([]);
  const [selectedBond, setSelectedBond] = useState<any>(null);
  const [resolutionResult, setResolutionResult] = useState<any>(null);
  const [manufacturerIndemnity, setManufacturerIndemnity] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAccountAndBonds = async (targetCarrier = carrierAddress) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const [acc, bonds] = await Promise.all([
        getCarrierAccount(targetCarrier.trim()).catch(() => null),
        listShipmentBonds({ carrierAddress: targetCarrier.trim() }).catch(() => []),
      ]);
      setAccountData(acc);
      setBondsList(Array.isArray(bonds) ? bonds : []);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to fetch carrier staking records',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccountAndBonds();
  }, []);

  const handleDeposit = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await depositStake({
        carrierAddress: carrierAddress.trim(),
        amount: Number(depositAmount),
      });
      setStatusMessage({
        type: 'success',
        message: `Successfully deposited ${depositAmount} USDC collateral stake for carrier.`,
      });
      setAccountData(result);
      await loadAccountAndBonds();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Deposit failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await unstakeCarrier({
        carrierAddress: carrierAddress.trim(),
        amount: Number(unstakeAmount),
      });
      setStatusMessage({
        type: 'success',
        message: `Successfully withdrawn ${unstakeAmount} USDC unlocked collateral stake.`,
      });
      setAccountData(result);
      await loadAccountAndBonds();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Unstake withdrawal failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLockBond = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await lockShipmentBond({
        carrierAddress: carrierAddress.trim(),
        shipmentId: shipmentId.trim(),
        bondAmount: Number(bondAmount),
        manufacturerAddress: manufacturerAddress.trim(),
      });
      setStatusMessage({
        type: 'success',
        message: `Bond of ${bondAmount} USDC locked for shipment ${shipmentId}.`,
      });
      setSelectedBond(result);
      await loadAccountAndBonds();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Bond lock failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateBond = async (bondShipmentId: string, simulateFault = false) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const sensorClusters = [
        {
          checkpointId: 'CHK-BERLIN-REEFER',
          expectedTempRange: { min: 2, max: 8 },
          readings: [
            { sensorId: 'SNS-01', temperature: 4.5, humidity: 45, batteryLevel: 98, rssi: -60, signature: '0xabc1' },
            { sensorId: 'SNS-02', temperature: 4.8, humidity: 46, batteryLevel: 95, rssi: -62, signature: '0xabc2' },
            {
              sensorId: 'SNS-FAULT-03',
              temperature: simulateFault ? 15.2 : 4.4,
              humidity: 48,
              batteryLevel: 91,
              rssi: -68,
              signature: '0xabc3',
            },
          ],
        },
      ];

      const res = await resolveShipmentBond({
        shipmentId: bondShipmentId,
        sensorClusters,
        slashPercentage: simulateFault ? 100 : 0,
      });

      setResolutionResult(res);
      setStatusMessage({
        type: 'success',
        message: `Bond evaluation completed. Final Status: ${res.bond.status}.`,
      });
      await loadAccountAndBonds();
      const updatedBond = await getShipmentBond(bondShipmentId);
      setSelectedBond(updatedBond);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Bond resolution failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIndemnity = async () => {
    try {
      const data = await getCarrierIndemnity(manufacturerAddress.trim());
      setManufacturerIndemnity(data.totalIndemnified);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Indemnity check failed',
      });
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
                  EVM CONTRACT: PharmaStaking.sol
                </span>
                <span className="badge badge-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold">
                  SLA BOND COLLATERAL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5F9] flex items-center gap-3">
                <Lock className="h-7 w-7 text-[#00D6B4]" />
                Carrier Collateral Staking & Bond Portal
              </h1>
              <p className="text-[#94A3B8] text-sm mt-1 max-w-3xl">
                Cryptographic security deposits for cold-chain carriers. Automatic bond slashing triggers on consensus-verified
                temperature breaches, indemnifying manufacturers directly on-chain.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadAccountAndBonds()}
                disabled={loading}
                className="btn btn-sm bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Ledger</span>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#172638] border border-[#304257] rounded-xl p-5">
            <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Total Staked Collateral</span>
            <div className="text-2xl font-black text-[#00D6B4] mt-1 font-mono">
              {accountData?.totalStaked != null ? `${Number(accountData.totalStaked).toLocaleString()} USDC` : '0 USDC'}
            </div>
            <span className="text-[11px] text-[#94A3B8] mt-1 block">ERC-20 Staked Balance</span>
          </div>

          <div className="bg-[#172638] border border-[#304257] rounded-xl p-5">
            <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Active Locked Bonds</span>
            <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
              {accountData?.lockedInBonds != null ? `${Number(accountData.lockedInBonds).toLocaleString()} USDC` : '0 USDC'}
            </div>
            <span className="text-[11px] text-[#94A3B8] mt-1 block">Committed to Transit SLAs</span>
          </div>

          <div className="bg-[#172638] border border-[#304257] rounded-xl p-5">
            <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Available Capacity</span>
            <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
              {accountData ? `${(Number(accountData.totalStaked) - Number(accountData.lockedInBonds)).toLocaleString()} USDC` : '0 USDC'}
            </div>
            <span className="text-[11px] text-[#94A3B8] mt-1 block">Free for New Shipments</span>
          </div>

          <div className="bg-[#172638] border border-[#304257] rounded-xl p-5">
            <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Accreditation Status</span>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`badge badge-sm font-bold uppercase ${
                  accountData?.isAccredited
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {accountData?.isAccredited ? 'Accredited Carrier' : 'Unaccredited'}
              </span>
            </div>
            <span className="text-[11px] text-[#94A3B8] mt-1 block font-mono">
              Slashed: {accountData?.totalSlashed || 0} USDC
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#304257] pb-4">
              <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                <Coins className="h-5 w-5 text-[#00D6B4]" />
                Carrier Collateral Liquidity Management
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1">Carrier Wallet Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={carrierAddress}
                    onChange={(e) => setCarrierAddress(e.target.value)}
                    className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                  />
                  <button
                    onClick={() => loadAccountAndBonds(carrierAddress)}
                    disabled={loading}
                    className="btn btn-sm bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-xl px-4"
                  >
                    Query
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#0B1220] rounded-xl border border-[#304257] space-y-3">
                <span className="text-xs font-bold text-[#00D6B4] uppercase tracking-wider block">
                  Deposit Collateral Stake
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter your deposit stake amount (USDC)"
                    className="input input-sm w-full bg-[#172638] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={loading}
                    className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none font-bold rounded-xl px-5"
                  >
                    Stake
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#0B1220] rounded-xl border border-[#304257] space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  Withdraw Unlocked Collateral
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    placeholder="Enter your withdrawal amount (USDC)"
                    className="input input-sm w-full bg-[#172638] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                  />
                  <button
                    onClick={handleUnstake}
                    disabled={loading}
                    className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-[#0B1220] border-none font-bold rounded-xl px-5"
                  >
                    Unstake
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#304257] pb-4">
              <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00D6B4]" />
                Lock Shipment Cold-Chain Bond
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1">Shipment Identifier</label>
                <input
                  type="text"
                  value={shipmentId}
                  onChange={(e) => setShipmentId(e.target.value)}
                  className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1">Bond Requirement (USDC)</label>
                <input
                  type="number"
                  value={bondAmount}
                  onChange={(e) => setBondAmount(e.target.value)}
                  className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1">Manufacturer (Indemnity Beneficiary)</label>
                <input
                  type="text"
                  value={manufacturerAddress}
                  onChange={(e) => setManufacturerAddress(e.target.value)}
                  className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                />
              </div>

              <button
                onClick={handleLockBond}
                disabled={loading}
                className="btn btn-sm w-full bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none font-bold rounded-xl h-10 mt-2"
              >
                Lock Shipment Bond & Authorize Transit
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#304257] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#00D6B4]" />
                Active Carrier Shipment Bonds
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Inspect live SLA bonds, evaluate checkpoint multi-sensor telemetry consensus, and settle or slash.
              </p>
            </div>
          </div>

          {bondsList.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#304257] rounded-xl">
              <Lock className="h-10 w-10 text-[#304257] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#94A3B8]">No active shipment bonds for this carrier</p>
              <p className="text-xs text-[#94A3B8] mt-1">Lock a new shipment bond above to initiate carrier SLA escrow.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full text-xs">
                <thead>
                  <tr className="border-b border-[#304257] text-[#94A3B8]">
                    <th>Shipment ID</th>
                    <th>Bond Amount</th>
                    <th>Status</th>
                    <th>Manufacturer</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bondsList.map((bond) => (
                    <tr key={bond.shipmentId} className="border-b border-[#304257]/50 hover:bg-[#243247]/40">
                      <td className="font-mono font-bold text-[#00D6B4]">{bond.shipmentId}</td>
                      <td className="font-mono">{bond.bondAmount} USDC</td>
                      <td>
                        <span
                          className={`badge badge-xs font-bold ${
                            bond.status === 'ACTIVE'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : bond.status === 'RELEASED'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {bond.status}
                        </span>
                      </td>
                      <td className="font-mono text-[#94A3B8]">
                        {bond.manufacturerAddress.slice(0, 8)}...{bond.manufacturerAddress.slice(-6)}
                      </td>
                      <td className="text-[#94A3B8]">{new Date(bond.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEvaluateBond(bond.shipmentId, false)}
                            disabled={loading || bond.status !== 'ACTIVE'}
                            className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-[#F1F5F9] border-none rounded-lg"
                          >
                            Release (Consensus OK)
                          </button>
                          <button
                            onClick={() => handleEvaluateBond(bond.shipmentId, true)}
                            disabled={loading || bond.status !== 'ACTIVE'}
                            className="btn btn-xs bg-rose-600 hover:bg-rose-700 text-[#F1F5F9] border-none rounded-lg"
                          >
                            Slash (Fault Breach)
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#304257] pb-4">
            <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
              <Building className="h-5 w-5 text-[#00D6B4]" />
              Manufacturer Indemnity Settlement Vault
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#94A3B8] block mb-1">Manufacturer Address</label>
              <input
                type="text"
                value={manufacturerAddress}
                onChange={(e) => setManufacturerAddress(e.target.value)}
                className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-transparent block mb-1">Action</label>
              <button
                onClick={handleCheckIndemnity}
                className="btn btn-sm w-full bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-xl"
              >
                Query Indemnity Payouts
              </button>
            </div>
          </div>

          {manufacturerIndemnity != null && (
            <div className="p-4 bg-[#0B1220] rounded-xl border border-[#304257] flex items-center justify-between">
              <span className="text-xs text-[#94A3B8]">Total Indemnity Compensated to Manufacturer:</span>
              <span className="text-lg font-black text-[#00D6B4] font-mono">
                {manufacturerIndemnity.toLocaleString()} USDC
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
