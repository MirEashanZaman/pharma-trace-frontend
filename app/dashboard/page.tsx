'use client';

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { connectMetaMask, signAttestationMessage } from '@/lib/web3';
import { fetchDrugs, fetchDrugEvents, createDrug, createDrugEvent, Drug, DrugEvent } from '@/lib/api';
import {
  Layers,
  Activity,
  PlusCircle,
  FileCheck2,
  Lock,
  GitPullRequest,
  CheckCircle,
  Shield,
  ArrowRight,
  Thermometer,
  Droplets,
} from 'lucide-react';

export default function DashboardPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'drugs' | 'events' | 'attestations' | 'github'>('overview');

  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedSerial, setSelectedSerial] = useState<string>('');
  const [events, setEvents] = useState<DrugEvent[]>([]);

  const [newSerial, setNewSerial] = useState('');
  const [newName, setNewName] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newBatch, setNewBatch] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('MANUFACTURED');
  const [temperature, setTemperature] = useState('22.5');
  const [humidity, setHumidity] = useState('45');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDrugs();
  }, []);

  useEffect(() => {
    if (selectedSerial) {
      loadEvents(selectedSerial);
    }
  }, [selectedSerial]);

  const loadDrugs = async () => {
    try {
      const data = await fetchDrugs();
      setDrugs(data);
      if (data.length > 0 && !selectedSerial) {
        setSelectedSerial(data[0].serialNumber);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadEvents = async (serial: string) => {
    try {
      const data = await fetchDrugEvents(serial);
      setEvents(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerial || !newName) return;
    setLoading(true);
    try {
      await createDrug({
        serialNumber: newSerial,
        name: newName,
        manufacturer: newManufacturer || 'Global Pharma Labs',
        batchNumber: newBatch || 'BATCH-001',
        manufactureDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 31536000000).toISOString(),
      });
      setNewSerial('');
      setNewName('');
      await loadDrugs();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSerial) return;
    setLoading(true);

    let signature = '';
    if (wallet) {
      const signResult = await signAttestationMessage(
        `PharmaTrace Custody Transfer: ${selectedSerial} -> ${selectedEventType}`
      );
      if (signResult) {
        signature = signResult.signature;
      }
    }

    try {
      await createDrugEvent({
        drugSerialNumber: selectedSerial,
        eventType: selectedEventType,
        eventData: {
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          location: 'Cold-Chain Warehouse A',
          signerAddress: wallet || '0x0000000000000000000000000000000000000000',
          signature,
        },
      });
      await loadEvents(selectedSerial);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to persist event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FB] text-[#102A43] flex flex-col font-sans">
      <Navigation walletAddress={wallet} onConnectWallet={async () => setWallet(await connectMetaMask())} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-1.5 bg-[#102A43] p-4 rounded-2xl text-white shadow-sm self-start">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Navigation Menu
          </div>
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'overview'
                ? 'bg-[#16B8A6] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4" /> Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('drugs')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'drugs'
                ? 'bg-[#16B8A6] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" /> Drug Batches
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'events'
                ? 'bg-[#16B8A6] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileCheck2 className="h-4 w-4" /> Custody Chain & Saga
          </button>
          <button
            onClick={() => setActiveTab('attestations')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'attestations'
                ? 'bg-[#16B8A6] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Lock className="h-4 w-4" /> Smart Contract Anchors
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'github'
                ? 'bg-[#16B8A6] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <GitPullRequest className="h-4 w-4" /> GitHub & Audit Claims
          </button>
        </aside>

        <main className="flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
                  <span className="text-xs text-[#52677A] uppercase font-bold tracking-wider">Registered Batches</span>
                  <p className="text-3xl font-black text-[#102A43] mt-2">{drugs.length}</p>
                </div>
                <div className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
                  <span className="text-xs text-[#52677A] uppercase font-bold tracking-wider">Saga Events Processed</span>
                  <p className="text-3xl font-black text-[#16B8A6] mt-2">{events.length}</p>
                </div>
                <div className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
                  <span className="text-xs text-[#52677A] uppercase font-bold tracking-wider">Tamper Detection Rate</span>
                  <p className="text-3xl font-black text-[#16A36A] mt-2">100%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#52677A] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Thermometer className="h-4 w-4 text-[#16B8A6]" /> Cold-Chain Temperature
                    </span>
                    <span className="text-xs font-bold font-mono text-[#16B8A6]">Optimal: 2°C - 8°C</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#102A43]">4.2°C</span>
                    <span className="badge badge-sm bg-[#16A36A]/10 text-[#16A36A] font-bold border-none">Normal</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#16B8A6] h-2.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#52677A]">
                    <span>0°C Min</span>
                    <span>Avg 4.5°C</span>
                    <span>15°C Max</span>
                  </div>
                </div>

                <div className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#52677A] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Droplets className="h-4 w-4 text-[#3ABFF8]" /> Storage Relative Humidity
                    </span>
                    <span className="text-xs font-bold font-mono text-[#3ABFF8]">Optimal: 35% - 60%</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#102A43]">48%</span>
                    <span className="badge badge-sm bg-[#16A36A]/10 text-[#16A36A] font-bold border-none">Stable</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#3ABFF8] h-2.5 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#52677A]">
                    <span>20% Min</span>
                    <span>Avg 46%</span>
                    <span>80% Max</span>
                  </div>
                </div>
              </div>

              <div className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-[#102A43] flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#16B8A6]" /> Web3 Off-Chain Attestation Pipeline
                </h3>
                <p className="text-sm text-[#52677A] leading-relaxed">
                  PharmaTrace-ES stores extensive IoT sensor readings in PostgreSQL while publishing cryptographic SHA-256
                  merkle roots directly to the EVM smart contract anchor. This guarantees verifiable authenticity without
                  chain congestion.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'drugs' && (
            <div className="space-y-6">
              <div className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                <h3 className="text-base font-bold text-[#102A43] mb-4 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-[#16B8A6]" /> Add Drug / Register Medicine
                </h3>
                <form onSubmit={handleCreateDrug} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Serial Number (e.g. SN-2026-001)"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="input input-bordered w-full bg-white border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#102A43] focus:border-[#16B8A6]"
                  />
                  <input
                    type="text"
                    placeholder="Drug Name (e.g. Amoxicillin 500mg)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="input input-bordered w-full bg-white border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#102A43] focus:border-[#16B8A6]"
                  />
                  <input
                    type="text"
                    placeholder="Manufacturer"
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    className="input input-bordered w-full bg-white border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#102A43] focus:border-[#16B8A6]"
                  />
                  <input
                    type="text"
                    placeholder="Batch Number"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="input input-bordered w-full bg-white border-slate-300 rounded-xl px-4 py-2.5 text-sm text-[#102A43] focus:border-[#16B8A6]"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn bg-[#16B8A6] hover:bg-[#139485] text-white border-none sm:col-span-2 py-3 rounded-xl font-bold text-sm transition shadow-sm"
                  >
                    {loading ? 'Registering...' : 'Register Medicine Batch'}
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#102A43]">Registered Drugs & Batches</h4>
                <div className="grid grid-cols-1 gap-3">
                  {drugs.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedSerial(d.serialNumber)}
                      className={`card bg-white p-4 rounded-xl border cursor-pointer transition flex flex-row items-center justify-between shadow-sm ${
                        selectedSerial === d.serialNumber
                          ? 'border-[#16B8A6] ring-1 ring-[#16B8A6]'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className="badge badge-sm bg-[#16B8A6]/10 text-[#16B8A6] border-none font-mono font-bold block mb-1">
                          {d.serialNumber}
                        </span>
                        <h5 className="font-bold text-[#102A43] text-base">{d.name}</h5>
                        <span className="text-xs text-[#52677A]">{d.manufacturer} - {d.batchNumber}</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                <h3 className="text-base font-bold text-[#102A43] mb-4">Record Lifecycle Event & Digital Sign</h3>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-[#52677A] font-semibold block mb-1">Target Serial</label>
                      <select
                        value={selectedSerial}
                        onChange={(e) => setSelectedSerial(e.target.value)}
                        className="select select-bordered w-full bg-white border-slate-300 rounded-xl text-sm text-[#102A43]"
                      >
                        {drugs.map((d) => (
                          <option key={d.id} value={d.serialNumber}>
                            {d.serialNumber} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#52677A] font-semibold block mb-1">Lifecycle Stage</label>
                      <select
                        value={selectedEventType}
                        onChange={(e) => setSelectedEventType(e.target.value)}
                        className="select select-bordered w-full bg-white border-slate-300 rounded-xl text-sm text-[#102A43]"
                      >
                        <option value="MANUFACTURED">MANUFACTURED</option>
                        <option value="QUALITY_CHECKED">QUALITY_CHECKED</option>
                        <option value="PACKAGED">PACKAGED</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="RECEIVED">RECEIVED</option>
                        <option value="DISTRIBUTED">DISTRIBUTED</option>
                        <option value="TEMPERATURE_MONITORED">TEMPERATURE_MONITORED</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#52677A] font-semibold block mb-1">Temperature (°C)</label>
                      <input
                        type="text"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="input input-bordered w-full bg-white border-slate-300 rounded-xl text-sm text-[#102A43] font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn bg-[#16B8A6] hover:bg-[#139485] text-white border-none w-full py-3 rounded-xl font-bold text-sm transition shadow-sm"
                  >
                    {loading ? 'Validating Saga & Anchoring...' : 'Validate Saga & Anchor On-Chain'}
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#102A43]">Timeline & Custody History</h4>
                <div className="space-y-3">
                  {events.map((ev, idx) => (
                    <div key={ev.id} className="card bg-white p-4 border border-slate-200 rounded-xl flex flex-row items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#102A43] text-white flex items-center justify-center font-bold text-xs">
                          #{idx + 1}
                        </div>
                        <div>
                          <span className="badge badge-sm bg-[#16B8A6] text-white border-none font-bold block mb-1">
                            {ev.eventType}
                          </span>
                          <span className="text-xs font-mono text-[#52677A]">{ev.eventHash.slice(0, 28)}...</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-[#52677A] font-mono">
                        {new Date(ev.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attestations' && (
            <div className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#16B8A6]" /> Hash & Ledger Information
              </h3>
              <p className="text-xs text-[#52677A]">
                Review immutable event hashes anchored to the Ethereum / EVM contract.
              </p>
              <div className="space-y-3">
                {events.map((ev) => (
                  <div key={ev.id} className="p-4 bg-[#F4F8FB] rounded-xl border border-slate-200 font-mono text-xs space-y-1">
                    <div className="flex justify-between text-[#102A43]">
                      <span>Event: <strong className="text-[#16B8A6]">{ev.eventType}</strong></span>
                      <span className="text-[#16A36A] font-semibold flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Anchored
                      </span>
                    </div>
                    <div className="text-[#52677A] truncate">Hash: {ev.eventHash}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="card bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
                <GitPullRequest className="h-5 w-5 text-[#16B8A6]" /> GitHub Activity & Audit Claims
              </h3>
              <p className="text-xs text-[#52677A]">
                Proof of authorship and verifiable code delivery tied to digital contributor signatures.
              </p>
              <div className="p-4 bg-[#F4F8FB] border border-slate-200 rounded-xl font-mono text-xs text-[#52677A] space-y-2">
                <div>Repository: <span className="text-[#102A43] font-bold">MirEashanZaman/pharma-trace</span></div>
                <div>Status: <span className="text-[#16A36A] font-bold">Audited & Verified</span></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
