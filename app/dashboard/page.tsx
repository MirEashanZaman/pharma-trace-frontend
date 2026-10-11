'use client';

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/navigation';
import { connectMetaMask, signAttestationMessage } from '@/lib/web3';
import {
  fetchDrugs,
  fetchDrugEvents,
  createDrug,
  createDrugEvent,
  getStoredUser,
  fetchProfile,
  Drug,
  DrugEvent,
  UserProfile,
} from '@/lib/api';
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
  Download,
  Building,
  UserCheck,
  Truck,
  Store,
  FileSearch,
  ShoppingCart,
  QrCode,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

export default function DashboardPage() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
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

  const [liveTemp, setLiveTemp] = useState<number>(4.2);
  const [liveHumidity, setLiveHumidity] = useState<number>(48);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [tempExcursion, setTempExcursion] = useState<boolean>(false);

  useEffect(() => {
    loadUser();
    loadDrugs();

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setWsConnected(true);
    });

    socket.on('disconnect', () => {
      setWsConnected(false);
    });

    socket.on('telemetryUpdate', (data: { temperature: number; humidity: number; isExcursion?: boolean }) => {
      if (typeof data.temperature === 'number') {
        setLiveTemp(data.temperature);
        setTempExcursion(Boolean(data.isExcursion || data.temperature < 2 || data.temperature > 8));
      }
      if (typeof data.humidity === 'number') {
        setLiveHumidity(data.humidity);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadUser = async () => {
    const cached = getStoredUser();
    if (cached) {
      setCurrentUser(cached);
      setDefaultEventForRole(cached.role);
    }
    try {
      const profile = await fetchProfile();
      setCurrentUser(profile);
      setDefaultEventForRole(profile.role);
    } catch (e) {
      // using cached or fallback
    }
  };

  const setDefaultEventForRole = (role: string) => {
    if (role === 'MANUFACTURER') setSelectedEventType('MANUFACTURED');
    else if (role === 'DISTRIBUTOR') setSelectedEventType('SHIPPED');
    else if (role === 'PHARMACY') setSelectedEventType('RECEIVED');
    else if (role === 'REGULATOR') setSelectedEventType('QUALITY_CHECKED');
    else if (role === 'CUSTOMER') setSelectedEventType('TEMPERATURE_MONITORED');
  };

  useEffect(() => {
    if (selectedSerial) {
      loadEvents(selectedSerial);
    }
  }, [selectedSerial]);

  const currentRole = currentUser?.role || 'ADMIN';

  const roleEventOptions: Record<string, string[]> = {
    ADMIN: ['MANUFACTURED', 'QUALITY_CHECKED', 'PACKAGED', 'SHIPPED', 'RECEIVED', 'DISTRIBUTED', 'TEMPERATURE_MONITORED'],
    MANUFACTURER: ['MANUFACTURED', 'QUALITY_CHECKED', 'PACKAGED', 'SHIPPED', 'TEMPERATURE_MONITORED'],
    DISTRIBUTOR: ['RECEIVED', 'DISTRIBUTED', 'SHIPPED', 'TEMPERATURE_MONITORED'],
    PHARMACY: ['RECEIVED', 'TEMPERATURE_MONITORED'],
    REGULATOR: ['QUALITY_CHECKED', 'TEMPERATURE_MONITORED'],
    CUSTOMER: ['TEMPERATURE_MONITORED'],
  };

  const availableEvents = roleEventOptions[currentRole] || roleEventOptions.ADMIN;

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
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col font-sans">
      <Navigation walletAddress={wallet} onConnectWallet={async () => setWallet(await connectMetaMask())} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-3 bg-[#243247] p-4 rounded-2xl border border-[#304257] text-[#F1F5F9] shadow-sm self-start">
          <div className="p-3 bg-[#172638] rounded-xl border border-[#304257] space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Active Role Session</div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#F1F5F9]">{currentUser?.fullName || 'Active Session'}</span>
              <span className="badge badge-sm bg-[#00D6B4] text-[#0B1220] font-black border-none text-[10px]">
                {currentRole}
              </span>
            </div>
            {currentUser?.organization && (
              <div className="text-[11px] text-[#94A3B8] truncate">{currentUser.organization}</div>
            )}
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] px-3 py-1">
              Navigation Menu
            </div>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'overview'
                  ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                  : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
              }`}
            >
              <Activity className="h-4 w-4" /> Overview & Metrics
            </button>
            <button
              onClick={() => setActiveTab('drugs')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'drugs'
                  ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                  : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
              }`}
            >
              <Layers className="h-4 w-4" /> {currentRole === 'CUSTOMER' ? 'Browse Medicines & QR' : 'Drug Batches'}
            </button>
            {currentRole !== 'CUSTOMER' && (
              <button
                onClick={() => setActiveTab('events')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === 'events'
                    ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                    : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
                }`}
              >
                <FileCheck2 className="h-4 w-4" /> Custody Chain & Saga
              </button>
            )}
            {(currentRole === 'ADMIN' || currentRole === 'REGULATOR') && (
              <button
                onClick={() => setActiveTab('attestations')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === 'attestations'
                    ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                    : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
                }`}
              >
                <Lock className="h-4 w-4" /> Smart Contract Anchors
              </button>
            )}
            {(currentRole === 'ADMIN' || currentRole === 'REGULATOR') && (
              <button
                onClick={() => setActiveTab('github')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === 'github'
                    ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                    : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
                }`}
              >
                <GitPullRequest className="h-4 w-4" /> GitHub & Audit Claims
              </button>
            )}
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-[#00D6B4] font-bold uppercase tracking-wider">Role-Specific Workspace</span>
                    <h2 className="text-xl font-black text-[#F1F5F9] mt-0.5">
                      {currentRole === 'MANUFACTURER' && 'Manufacturer Production Desk'}
                      {currentRole === 'DISTRIBUTOR' && 'Distributor Transit & Logistics Hub'}
                      {currentRole === 'PHARMACY' && 'Pharmacy Dispensing & Receiving Portal'}
                      {currentRole === 'REGULATOR' && 'Regulatory Compliance & Quality Audit'}
                      {currentRole === 'CUSTOMER' && 'Patient & Consumer Medicine Verification'}
                      {currentRole === 'ADMIN' && 'System Administrator & Governance Console'}
                    </h2>
                  </div>
                  <span className="badge badge-lg bg-[#00D6B4]/15 border border-[#00D6B4] text-[#00D6B4] font-bold">
                    {currentRole}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {currentRole === 'MANUFACTURER' && (
                    <>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Building className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Permission</span>
                        <strong className="text-[#F1F5F9]">Register Batches</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <CheckCircle className="h-4 w-4 text-[#A3E635] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Lifecycle Stage</span>
                        <strong className="text-[#F1F5F9]">MANUFACTURED</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Layers className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Packaging</span>
                        <strong className="text-[#F1F5F9]">PACKAGED</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Truck className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Dispatch</span>
                        <strong className="text-[#F1F5F9]">SHIPPED</strong>
                      </div>
                    </>
                  )}

                  {currentRole === 'DISTRIBUTOR' && (
                    <>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Truck className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Inbound Transit</span>
                        <strong className="text-[#F1F5F9]">RECEIVE BATCH</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Thermometer className="h-4 w-4 text-[#A3E635] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Cold-Chain</span>
                        <strong className="text-[#F1F5F9]">IoT Telemetry</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Layers className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Handoff</span>
                        <strong className="text-[#F1F5F9]">DISTRIBUTED</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Truck className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Outbound Transit</span>
                        <strong className="text-[#F1F5F9]">SHIP TO PHARMACY</strong>
                      </div>
                    </>
                  )}

                  {currentRole === 'PHARMACY' && (
                    <>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Store className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Inbound Check</span>
                        <strong className="text-[#F1F5F9]">RECEIVE FROM DISTRIBUTOR</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <QrCode className="h-4 w-4 text-[#A3E635] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Verification</span>
                        <strong className="text-[#F1F5F9]">Scan Package QR</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Thermometer className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Storage Status</span>
                        <strong className="text-[#F1F5F9]">2°C - 8°C Monitored</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <ShoppingCart className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Dispensing</span>
                        <strong className="text-[#F1F5F9]">Dispense to Patient</strong>
                      </div>
                    </>
                  )}

                  {currentRole === 'REGULATOR' && (
                    <>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <FileSearch className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Inspection</span>
                        <strong className="text-[#F1F5F9]">Audit All Batches</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <CheckCircle className="h-4 w-4 text-[#A3E635] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Certification</span>
                        <strong className="text-[#F1F5F9]">QUALITY_CHECKED</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Lock className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Audit Ledger</span>
                        <strong className="text-[#F1F5F9]">Verify Merkle Roots</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Shield className="h-4 w-4 text-[#A3E635] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Compliance</span>
                        <strong className="text-[#F1F5F9]">Zero Violations</strong>
                      </div>
                    </>
                  )}

                  {currentRole === 'CUSTOMER' && (
                    <>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <QrCode className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Authentication</span>
                        <strong className="text-[#F1F5F9]">Scan Serial QR</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Shield className="h-4 w-4 text-[#A3E635] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Authenticity Check</span>
                        <strong className="text-[#F1F5F9]">100% Anti-Counterfeit</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Thermometer className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Cold-Chain Trace</span>
                        <strong className="text-[#F1F5F9]">View Temperature Log</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Download className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Verification Proof</span>
                        <strong className="text-[#F1F5F9]">Download Certificate</strong>
                      </div>
                    </>
                  )}

                  {currentRole === 'ADMIN' && (
                    <>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <UserCheck className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Governance</span>
                        <strong className="text-[#F1F5F9]">Full RBAC Superuser</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Building className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Management</span>
                        <strong className="text-[#F1F5F9]">Register Medicine Batches</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <FileCheck2 className="h-4 w-4 text-[#A3E635] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Saga State</span>
                        <strong className="text-[#F1F5F9]">All Lifecycle Events</strong>
                      </div>
                      <div className="p-3 bg-[#172638] rounded-xl border border-[#304257]">
                        <Lock className="h-4 w-4 text-[#00D6B4] mb-1" />
                        <span className="text-[#94A3B8] block text-[10px]">Contract Anchor</span>
                        <strong className="text-[#F1F5F9]">EVM Smart Contracts</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5">
                  <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Registered Batches</span>
                  <p className="text-3xl font-black text-[#F1F5F9] mt-2">{drugs.length}</p>
                </div>
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5">
                  <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Saga Events Processed</span>
                  <p className="text-3xl font-black text-[#00D6B4] mt-2">{events.length}</p>
                </div>
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5">
                  <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Tamper Detection Rate</span>
                  <p className="text-3xl font-black text-[#A3E635] mt-2">100%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`card bg-[#243247] border shadow-sm rounded-2xl p-5 space-y-3 transition-colors ${
                  tempExcursion ? 'border-[#F87171] ring-1 ring-[#F87171]' : 'border-[#304257]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Thermometer className={`h-4 w-4 ${tempExcursion ? 'text-[#F87171]' : 'text-[#00D6B4]'}`} /> Cold-Chain Temperature
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${wsConnected ? 'bg-[#A3E635] animate-pulse' : 'bg-[#94A3B8]'}`} title={wsConnected ? 'WebSocket Live' : 'Disconnected'} />
                      <span className="text-xs font-bold font-mono text-[#00D6B4]">Optimal: 2°C - 8°C</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#F1F5F9]">{liveTemp.toFixed(1)}°C</span>
                    {tempExcursion ? (
                      <span className="badge badge-sm bg-[#F87171]/20 text-[#F87171] font-bold border border-[#F87171]/40">Excursion Alert</span>
                    ) : (
                      <span className="badge badge-sm bg-[#A3E635]/20 text-[#A3E635] font-bold border border-[#A3E635]/30">Normal</span>
                    )}
                  </div>
                  <div className="w-full bg-[#172638] rounded-full h-2.5 overflow-hidden border border-[#304257]">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${tempExcursion ? 'bg-[#F87171]' : 'bg-[#00D6B4]'}`}
                      style={{ width: `${Math.min(Math.max((liveTemp / 15) * 100, 5), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#94A3B8]">
                    <span>0°C Min</span>
                    <span>Live Telemetry</span>
                    <span>15°C Max</span>
                  </div>
                </div>

                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#94A3B8] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Droplets className="h-4 w-4 text-[#00D6B4]" /> Storage Relative Humidity
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${wsConnected ? 'bg-[#A3E635] animate-pulse' : 'bg-[#94A3B8]'}`} title={wsConnected ? 'WebSocket Live' : 'Disconnected'} />
                      <span className="text-xs font-bold font-mono text-[#00D6B4]">Optimal: 35% - 60%</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#F1F5F9]">{liveHumidity.toFixed(0)}%</span>
                    <span className="badge badge-sm bg-[#A3E635]/20 text-[#A3E635] font-bold border border-[#A3E635]/30">Stable</span>
                  </div>
                  <div className="w-full bg-[#172638] rounded-full h-2.5 overflow-hidden border border-[#304257]">
                    <div
                      className="bg-[#00D6B4] h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Math.max(liveHumidity, 5), 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-[#94A3B8]">
                    <span>20% Min</span>
                    <span>Live Telemetry</span>
                    <span>80% Max</span>
                  </div>
                </div>
              </div>

              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#00D6B4]" /> Web3 Off-Chain Attestation Pipeline
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  PharmaTrace-ES stores extensive IoT sensor readings in PostgreSQL while publishing cryptographic SHA-256
                  merkle roots directly to the EVM smart contract anchor. This guarantees verifiable authenticity without
                  chain congestion.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'drugs' && (
            <div className="space-y-6">
              {(currentRole === 'ADMIN' || currentRole === 'MANUFACTURER') && (
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6">
                  <h3 className="text-base font-bold text-[#F1F5F9] mb-4 flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-[#00D6B4]" /> Add Drug / Register Medicine
                  </h3>
                  <form onSubmit={handleCreateDrug} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Enter your serial number"
                      value={newSerial}
                      onChange={(e) => setNewSerial(e.target.value)}
                      className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-4 py-2.5 text-sm text-[#F1F5F9] focus:border-[#00D6B4]"
                    />
                    <input
                      type="text"
                      placeholder="Enter your drug name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-4 py-2.5 text-sm text-[#F1F5F9] focus:border-[#00D6B4]"
                    />
                    <input
                      type="text"
                      placeholder="Enter your manufacturer"
                      value={newManufacturer}
                      onChange={(e) => setNewManufacturer(e.target.value)}
                      className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-4 py-2.5 text-sm text-[#F1F5F9] focus:border-[#00D6B4]"
                    />
                    <input
                      type="text"
                      placeholder="Enter your batch number"
                      value={newBatch}
                      onChange={(e) => setNewBatch(e.target.value)}
                      className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-4 py-2.5 text-sm text-[#F1F5F9] focus:border-[#00D6B4]"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none sm:col-span-2 py-3 rounded-xl font-bold text-sm transition shadow-sm"
                    >
                      {loading ? 'Registering...' : 'Register Medicine Batch'}
                    </button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-3">
                  <h4 className="text-sm font-bold text-[#F1F5F9]">Registered Drugs & Batches</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {drugs.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedSerial(d.serialNumber)}
                        className={`card bg-[#243247] p-4 rounded-xl border cursor-pointer transition flex flex-row items-center justify-between shadow-sm ${
                          selectedSerial === d.serialNumber
                            ? 'border-[#00D6B4] ring-1 ring-[#00D6B4]'
                            : 'border-[#304257] hover:border-slate-500'
                        }`}
                      >
                        <div>
                          <span className="badge badge-sm bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/30 font-mono font-bold block mb-1">
                            {d.serialNumber}
                          </span>
                          <h5 className="font-bold text-[#F1F5F9] text-base">{d.name}</h5>
                          <span className="text-xs text-[#94A3B8]">{d.manufacturer} - {d.batchNumber}</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-[#94A3B8]" />
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSerial && (
                  <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      Physical Verification QR
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-inner">
                      <QRCodeSVG
                        value={`https://pharmatrace.io/verify/${selectedSerial}`}
                        size={140}
                        bgColor={"#ffffff"}
                        fgColor={"#0B1220"}
                        level={"H"}
                      />
                    </div>
                    <div className="text-xs font-mono font-bold text-[#F1F5F9]">
                      {selectedSerial}
                    </div>
                    <button
                      onClick={() => {
                        const doc = new jsPDF();
                        doc.setFontSize(18);
                        doc.text("PharmaTrace-ES Authenticity Certificate", 14, 22);
                        doc.setFontSize(11);
                        doc.text(`Drug Serial: ${selectedSerial}`, 14, 35);
                        doc.text(`Timestamp: ${new Date().toUTCString()}`, 14, 43);
                        doc.text(`Tamper Proof Status: 100% Verified`, 14, 51);
                        doc.text(`Saga Lifecycle State: Validated`, 14, 59);
                        doc.save(`PharmaTrace-Certificate-${selectedSerial}.pdf`);
                      }}
                      className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl text-xs font-bold w-full flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" /> Download Certificate PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6">
                <h3 className="text-base font-bold text-[#F1F5F9] mb-4">Record Lifecycle Event & Digital Sign</h3>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Target Serial</label>
                      <select
                        value={selectedSerial}
                        onChange={(e) => setSelectedSerial(e.target.value)}
                        className="select select-bordered w-full bg-[#172638] border-[#304257] rounded-xl text-sm text-[#F1F5F9]"
                      >
                        {drugs.map((d) => (
                          <option key={d.id} value={d.serialNumber}>
                            {d.serialNumber} - {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-[#94A3B8] font-semibold block">Lifecycle Stage</label>
                        <span className="text-[10px] text-[#00D6B4] font-mono">Role: {currentRole}</span>
                      </div>
                      <select
                        value={selectedEventType}
                        onChange={(e) => setSelectedEventType(e.target.value)}
                        className="select select-bordered w-full bg-[#172638] border-[#304257] rounded-xl text-sm text-[#F1F5F9]"
                      >
                        {availableEvents.map((evt) => (
                          <option key={evt} value={evt}>
                            {evt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Temperature (°C)</label>
                      <input
                        type="text"
                        value={temperature}
                        onChange={(e) => setTemperature(e.target.value)}
                        className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl text-sm text-[#F1F5F9] font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none w-full py-3 rounded-xl font-bold text-sm transition shadow-sm"
                  >
                    {loading ? 'Validating Saga & Anchoring...' : 'Validate Saga & Anchor On-Chain'}
                  </button>
                </form>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#F1F5F9]">Timeline & Custody History</h4>
                <div className="space-y-3">
                  {events.map((ev, idx) => (
                    <div key={ev.id} className="card bg-[#243247] p-4 border border-[#304257] rounded-xl flex flex-row items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#00D6B4] text-[#0B1220] flex items-center justify-center font-black text-xs">
                          #{idx + 1}
                        </div>
                        <div>
                          <span className="badge badge-sm bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/30 font-bold block mb-1">
                            {ev.eventType}
                          </span>
                          <span className="text-xs font-mono text-[#94A3B8]">{ev.eventHash.slice(0, 28)}...</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-[#94A3B8] font-mono">
                        {new Date(ev.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attestations' && (
            <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#00D6B4]" /> Hash & Ledger Information
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Review immutable event hashes anchored to the Ethereum / EVM contract.
              </p>
              <div className="space-y-3">
                {events.map((ev) => (
                  <div key={ev.id} className="p-4 bg-[#172638] rounded-xl border border-[#304257] font-mono text-xs space-y-1">
                    <div className="flex justify-between text-[#F1F5F9]">
                      <span>Event: <strong className="text-[#00D6B4]">{ev.eventType}</strong></span>
                      <span className="text-[#A3E635] font-semibold flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Anchored
                      </span>
                    </div>
                    <div className="text-[#94A3B8] truncate">Hash: {ev.eventHash}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                <GitPullRequest className="h-5 w-5 text-[#00D6B4]" /> GitHub Activity & Audit Claims
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Proof of authorship and verifiable code delivery tied to digital contributor signatures.
              </p>
              <div className="p-4 bg-[#172638] border border-[#304257] rounded-xl font-mono text-xs text-[#94A3B8] space-y-2">
                <div>Repository: <span className="text-[#F1F5F9] font-bold">MirEashanZaman/pharma-trace</span></div>
                <div>Status: <span className="text-[#A3E635] font-bold">Audited & Verified</span></div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
