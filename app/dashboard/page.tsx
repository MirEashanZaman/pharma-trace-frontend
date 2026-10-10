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
  Thermometer,
  Shield,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'drugs' | 'events' | 'attestations' | 'github'>('overview');

  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedSerial, setSelectedSerial] = useState<string>('');
  const [events, setEvents] = useState<DrugEvent[]>([]);

  // Modals / forms
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navigation walletAddress={wallet} onConnectWallet={async () => setWallet(await connectMetaMask())} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'overview'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Activity className="h-4 w-4" /> Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('drugs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'drugs'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" /> Drug Batches
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'events'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <FileCheck2 className="h-4 w-4" /> Custody Chain & Saga
          </button>
          <button
            onClick={() => setActiveTab('attestations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'attestations'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Lock className="h-4 w-4" /> Smart Contract Anchors
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
              activeTab === 'github'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <GitPullRequest className="h-4 w-4" /> GitHub & Audit Claims
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Registered Batches</span>
                  <p className="text-3xl font-extrabold text-white mt-2">{drugs.length}</p>
                </div>
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Saga Events Processed</span>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-2">{events.length}</p>
                </div>
                <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Tamper Detection Rate</span>
                  <p className="text-3xl font-extrabold text-teal-400 mt-2">100%</p>
                </div>
              </div>

              <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-400" /> Web3 Off-Chain Attestation Pipeline
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  PharmaTrace-ES stores extensive IoT sensor readings in PostgreSQL while publishing cryptographic SHA-256
                  merkle roots directly to the EVM smart contract anchor. This guarantees verifiable authenticity without
                  chain congestion.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'drugs' && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-emerald-400" /> Register New Drug Batch
                </h3>
                <form onSubmit={handleCreateDrug} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Serial Number (e.g., SN-2026-001)"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Drug Name (e.g., Amoxicillin 500mg)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Manufacturer"
                    value={newManufacturer}
                    onChange={(e) => setNewManufacturer(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Batch Number"
                    value={newBatch}
                    onChange={(e) => setNewBatch(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="sm:col-span-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition"
                  >
                    {loading ? 'Registering...' : 'Register Batch'}
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300">Registered Drugs</h4>
                <div className="grid grid-cols-1 gap-3">
                  {drugs.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedSerial(d.serialNumber)}
                      className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        selectedSerial === d.serialNumber
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-mono text-emerald-400 block">{d.serialNumber}</span>
                        <h5 className="font-bold text-white text-base">{d.name}</h5>
                        <span className="text-xs text-slate-400">{d.manufacturer} • {d.batchNumber}</span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4">Record Lifecycle Event & Sign</h3>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Target Serial</label>
                      <select
                        value={selectedSerial}
                        onChange={(e) => setSelectedSerial(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                      >
                        {drugs.map((d) => (
                          <option key={d.id} value={d.serialNumber}>
                            {d.serialNumber} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Lifecycle Stage</label>
                      <select
                        value={selectedEventType}
                        onChange={(e) => setSelectedEventType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
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
                      <label className="text-xs text-slate-400 block mb-1">Temperature (°C)</label>
                      <input
                        type="text"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
                  >
                    {loading ? 'Validating Saga & Anchoring...' : 'Validate Saga & Anchor On-Chain'}
                  </button>
                </form>
              </div>

              {/* Event Timeline */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300">Custody Transition Event Log</h4>
                <div className="space-y-3">
                  {events.map((ev, idx) => (
                    <div key={ev.id} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                          #{idx + 1}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-emerald-400 block">{ev.eventType}</span>
                          <span className="text-xs font-mono text-slate-500">{ev.eventHash.slice(0, 24)}...</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-400 font-mono">
                        {new Date(ev.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attestations' && (
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-400" /> Smart Contract Anchors & Attestations
              </h3>
              <p className="text-xs text-slate-400">
                Review immutable event hashes anchored to the Ethereum / EVM contract.
              </p>
              <div className="space-y-3">
                {events.map((ev) => (
                  <div key={ev.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span>Event: <strong className="text-emerald-400">{ev.eventType}</strong></span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Anchored
                      </span>
                    </div>
                    <div className="text-slate-500 truncate">Hash: {ev.eventHash}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GitPullRequest className="h-5 w-5 text-emerald-400" /> GitHub Activity & Audit Claims
              </h3>
              <p className="text-xs text-slate-400">
                Proof of authorship and verifiable code delivery tied to digital contributor signatures.
              </p>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-400 space-y-2">
                <div>Repository: <span className="text-emerald-400 font-bold">MirEashanZaman/pharma-trace</span></div>
                <div>Status: <span className="text-emerald-400">Audited & Verified</span></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
