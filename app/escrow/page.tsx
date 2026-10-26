'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import {
  Scale,
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
  Cpu,
  Zap,
  DollarSign,
  Radio,
  FileCheck,
} from 'lucide-react';
import {
  createEscrowOrder,
  getEscrowOrder,
  releaseEscrowOrder,
  evaluateEscrowWithConsensus,
  refundEscrowOrder,
  checkEscrowAutomation,
  pollEscrowAutomation,
  sponsorUserOp,
  sendUserOp,
} from '@/lib/api';

export default function EscrowPage() {
  const [serialNumber, setSerialNumber] = useState('SN-COLD-VACCINE-01');
  const [sellerAddress, setSellerAddress] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  const [buyerAddress, setBuyerAddress] = useState('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC');
  const [amountEth, setAmountEth] = useState('5.0');
  const [minTemp, setMinTemp] = useState('2.0');
  const [maxTemp, setMaxTemp] = useState('8.0');
  const [timeoutSeconds, setTimeoutSeconds] = useState('86400');

  const [searchOrderId, setSearchOrderId] = useState('');
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [upkeepStatus, setUpkeepStatus] = useState<any>(null);
  const [pollResult, setPollResult] = useState<any>(null);
  const [aaStatus, setAaStatus] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleCheckAutomation = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const data = await checkEscrowAutomation();
      setUpkeepStatus(data);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Automation upkeep check failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePollAutomation = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await pollEscrowAutomation();
      setPollResult(result);
      setStatusMessage({
        type: 'success',
        message: `Relayer executed automated upkeep. Orders processed: ${result.executedOrders?.length || 0}.`,
      });
      await handleCheckAutomation();
      if (searchOrderId) {
        await handleFetchOrder(searchOrderId);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Upkeep execution failed',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCheckAutomation();
  }, []);

  const handleCreateOrder = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await createEscrowOrder({
        serialNumber: serialNumber.trim(),
        sellerAddress: sellerAddress.trim(),
        buyerAddress: buyerAddress.trim(),
        amountEth: Number(amountEth),
        minTemp: Number(minTemp),
        maxTemp: Number(maxTemp),
        timeoutSeconds: Number(timeoutSeconds),
      });
      setActiveOrder(result);
      setSearchOrderId(result.orderId);
      setStatusMessage({
        type: 'success',
        message: `Commercial delivery escrow ${result.orderId} locked with ${amountEth} ETH collateral.`,
      });
      await handleCheckAutomation();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Escrow creation failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchOrder = async (orderIdToFetch = searchOrderId) => {
    if (!orderIdToFetch) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const data = await getEscrowOrder(orderIdToFetch.trim());
      setActiveOrder(data);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Failed to locate escrow order',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualRelease = async () => {
    if (!activeOrder?.orderId) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await releaseEscrowOrder(activeOrder.orderId, buyerAddress);
      setActiveOrder(res);
      setStatusMessage({
        type: 'success',
        message: `Escrow released manually to seller ${res.seller}. Payment finalized on-chain.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Escrow release failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConsensusRelease = async (simulateFault = false) => {
    if (!activeOrder?.orderId) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const sensorClusters = [
        {
          checkpointId: 'CHK-PHARMA-DEPOT-01',
          expectedTempRange: { min: Number(minTemp), max: Number(maxTemp) },
          readings: [
            { sensorId: 'SNS-DEPOT-01', temperature: 4.2, humidity: 50, batteryLevel: 98, rssi: -58, signature: '0x1' },
            { sensorId: 'SNS-DEPOT-02', temperature: 4.4, humidity: 51, batteryLevel: 94, rssi: -60, signature: '0x2' },
            {
              sensorId: 'SNS-DEPOT-03',
              temperature: simulateFault ? 18.5 : 4.3,
              humidity: 52,
              batteryLevel: 90,
              rssi: -65,
              signature: '0x3',
            },
          ],
        },
      ];

      const res = await evaluateEscrowWithConsensus({
        orderId: activeOrder.orderId,
        sensorClusters,
        callerAddress: buyerAddress,
      });

      setActiveOrder(res.order);
      setStatusMessage({
        type: 'success',
        message: `Multi-sensor evaluation complete. Consensus Approved: ${res.consensusResult.approved}. Faults Isolated: ${res.consensusResult.isolatedFaults}.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Consensus evaluation failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!activeOrder?.orderId) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await refundEscrowOrder(activeOrder.orderId, 'Temperature excursion violation in transit');
      setActiveOrder(res);
      setStatusMessage({
        type: 'success',
        message: `Escrow refunded to buyer ${res.buyer}. Breach penalty applied.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Escrow refund failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSponsorship = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const mockOp = {
        sender: '0x1111111111111111111111111111111111111111',
        nonce: '0x0',
        callData: '0x',
        callGasLimit: '0x50000',
        verificationGasLimit: '0x50000',
        preVerificationGas: '0x10000',
        maxFeePerGas: '0x2000000000',
        maxPriorityFeePerGas: '0x1000000000',
      };
      const sponsored = await sponsorUserOp(mockOp, 'ESCROW_SETTLEMENT');
      setAaStatus(sponsored);
      setStatusMessage({
        type: 'success',
        message: `PharmaPaymaster successfully sponsored settlement UserOp with gas validation.`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        message: err?.response?.data?.message || 'Paymaster sponsorship failed',
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
                  EVM CONTRACT: PharmaEscrow.sol
                </span>
                <span className="badge badge-sm bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                  CHAINLINK AUTOMATION 2.0
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F1F5F9] flex items-center gap-3">
                <Scale className="h-7 w-7 text-[#00D6B4]" />
                Cold-Chain Escrow & Autonomous Settlement
              </h1>
              <p className="text-[#94A3B8] text-sm mt-1 max-w-3xl">
                Multi-party commercial payment escrow locked against real-time IoT temperature criteria. Chainlink Automation Keepers
                and BFT multi-sensor consensus trigger autonomous settlement or breach refunds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCheckAutomation}
                disabled={loading}
                className="btn btn-sm bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Check Keeper</span>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#304257] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                <Radio className="h-5 w-5 text-[#00D6B4]" />
                Chainlink Automation 2.0 Relayer Daemon
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                On-chain checkUpkeep & performUpkeep simulation with automated timeout refunds and consensus settlements.
              </p>
            </div>

            <button
              onClick={handlePollAutomation}
              disabled={loading}
              className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none font-bold rounded-xl px-4"
            >
              <Zap className="h-4 w-4" />
              <span>Poll & Execute Upkeep Now</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0B1220] border border-[#304257] rounded-xl p-4">
              <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Keeper Upkeep Needed</span>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`badge badge-sm font-bold uppercase ${
                    upkeepStatus?.upkeepNeeded
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-700 text-[#94A3B8] border-transparent'
                  }`}
                >
                  {upkeepStatus?.upkeepNeeded ? 'Pending Execution' : 'Idle (Optimal)'}
                </span>
              </div>
            </div>

            <div className="bg-[#0B1220] border border-[#304257] rounded-xl p-4">
              <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Upkeep Perform Bytes</span>
              <div className="text-xs font-mono text-[#00D6B4] mt-2 truncate">
                {upkeepStatus?.performData && upkeepStatus.performData !== '0x'
                  ? upkeepStatus.performData
                  : '0x (Empty Payload)'}
              </div>
            </div>

            <div className="bg-[#0B1220] border border-[#304257] rounded-xl p-4">
              <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Last Relayer Execution</span>
              <div className="text-xs font-mono text-cyan-300 mt-2">
                {pollResult?.executedOrders?.length
                  ? `${pollResult.executedOrders.length} Order(s) Processed`
                  : 'Upkeep Synchronized'}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#304257] pb-4">
              <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#00D6B4]" />
                Lock Commercial Delivery Escrow
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1">Batch / Drug Serial Number</label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#94A3B8] block mb-1">Seller Address</label>
                  <input
                    type="text"
                    value={sellerAddress}
                    onChange={(e) => setSellerAddress(e.target.value)}
                    className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#94A3B8] block mb-1">Buyer Address</label>
                  <input
                    type="text"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#94A3B8] block mb-1">Amount (ETH)</label>
                  <input
                    type="number"
                    value={amountEth}
                    onChange={(e) => setAmountEth(e.target.value)}
                    className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#94A3B8] block mb-1">Min Temp (°C)</label>
                  <input
                    type="number"
                    value={minTemp}
                    onChange={(e) => setMinTemp(e.target.value)}
                    className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#94A3B8] block mb-1">Max Temp (°C)</label>
                  <input
                    type="number"
                    value={maxTemp}
                    onChange={(e) => setMaxTemp(e.target.value)}
                    className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#94A3B8] block mb-1">Delivery Timeout Window (Seconds)</label>
                <input
                  type="number"
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(e.target.value)}
                  className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
                />
              </div>

              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="btn btn-sm w-full bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none font-bold rounded-xl h-10 mt-2"
              >
                Deposit & Lock Escrow
              </button>
            </div>
          </div>

          <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#304257] pb-4">
              <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                <Search className="h-5 w-5 text-[#00D6B4]" />
                Inspect & Settle Escrow Order
              </h2>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escrow Order ID (0x...)"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="input input-sm w-full bg-[#0B1220] border-[#304257] text-[#F1F5F9] font-mono text-xs rounded-xl"
              />
              <button
                onClick={() => handleFetchOrder(searchOrderId)}
                disabled={loading}
                className="btn btn-sm bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-xl px-4"
              >
                Inspect
              </button>
            </div>

            {activeOrder ? (
              <div className="p-4 bg-[#0B1220] rounded-xl border border-[#304257] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Order Identifier</span>
                  <span className="font-mono text-xs text-[#00D6B4] font-bold truncate max-w-[200px]">
                    {activeOrder.orderId}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Status</span>
                  <span
                    className={`badge badge-xs font-bold ${
                      activeOrder.status === 'LOCKED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : activeOrder.status === 'RELEASED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {activeOrder.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Amount</span>
                  <span className="font-mono text-xs text-[#F1F5F9] font-bold">
                    {activeOrder.amountEth || activeOrder.amount} ETH
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">Serial</span>
                  <span className="font-mono text-xs text-[#F1F5F9]">{activeOrder.serialNumber}</span>
                </div>

                <div className="pt-2 border-t border-[#304257] space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleManualRelease}
                      disabled={loading || activeOrder.status !== 'LOCKED'}
                      className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-[#F1F5F9] border-none rounded-lg"
                    >
                      Buyer Release
                    </button>
                    <button
                      onClick={handleRefund}
                      disabled={loading || activeOrder.status !== 'LOCKED'}
                      className="btn btn-xs bg-rose-600 hover:bg-rose-700 text-[#F1F5F9] border-none rounded-lg"
                    >
                      Breach Refund
                    </button>
                  </div>

                  <button
                    onClick={() => handleConsensusRelease(false)}
                    disabled={loading || activeOrder.status !== 'LOCKED'}
                    className="btn btn-xs w-full bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none font-bold rounded-lg"
                  >
                    Sensor Consensus Auto-Release
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-[#304257] rounded-xl text-xs text-[#94A3B8]">
                Select or create an escrow order to evaluate real-time settlement criteria.
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#304257] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                <Cpu className="h-5 w-5 text-[#00D6B4]" />
                ERC-4337 Account Abstraction Gas Sponsorship Engine
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Zero-gas hospital and pharmacy transactions sponsored via enterprise PharmaPaymaster contract.
              </p>
            </div>

            <button
              onClick={handleTestSponsorship}
              disabled={loading}
              className="btn btn-sm bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-xl"
            >
              Simulate Paymaster Sponsorship
            </button>
          </div>

          {aaStatus && (
            <div className="p-4 bg-[#0B1220] rounded-xl border border-[#304257] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>PAYMASTER SPONSORSHIP STATUS</span>
                <span>SPONSORED (VALID)</span>
              </div>
              <div className="text-[#94A3B8] break-all">
                PaymasterAndData: <span className="text-[#00D6B4]">{aaStatus.paymasterAndData}</span>
              </div>
              <div className="text-[#94A3B8]">
                Sponsor Address: <span className="text-[#F1F5F9]">{aaStatus.paymasterAddress}</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
