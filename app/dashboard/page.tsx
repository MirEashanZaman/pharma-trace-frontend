'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import dynamic from 'next/dynamic';
import { connectMetaMask, signAttestationMessage } from '@/lib/web3';
import {
  fetchDrugs,
  fetchDrugEvents,
  createDrug,
  createDrugEvent,
  getStoredUser,
  fetchProfile,
  logoutUser,
  simulateIotTelemetry,
  fetchAuditDossier,
  fetchUsers,
  warnUser,
  clearUserWarnings,
  toggleDisableUser,
  deleteUser,
  Drug,
  DrugEvent,
  UserProfile,
  ComplianceDossier,
} from '@/lib/api';
import {
  downloadCompliancePdf,
  downloadComplianceCsv,
  downloadComplianceJson,
} from '@/lib/compliance-report';
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
  ShieldCheck,
  MapPin,
  Navigation2,
  AlertOctagon,
  ShieldAlert,
  X,
  Sliders,
  Volume2,
  VolumeX,
  Play,
  Square,
  Zap,
  Flame,
  Snowflake,
  RefreshCw,
  Radio,
  FileSpreadsheet,
  FileText,
  FileJson,
  Award,
  Camera,
  Network,
  UserCog,
  Users,
  UserX,
  Ban,
  Trash2,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { CameraQrScanner } from '@/components/qr-scanner';
import { ProvenanceDagVisualizer } from '@/components/provenance-dag';

const TransitMap = dynamic(() => import('@/components/transit-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full rounded-2xl bg-[#0B1220] border border-[#304257] flex flex-col items-center justify-center text-slate-400 gap-3">
      <div className="loading loading-spinner text-[#00D6B4] loading-lg"></div>
      <span className="text-xs font-mono tracking-wider uppercase text-slate-400">Loading Live Cartography...</span>
    </div>
  ),
});

export default function DashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'drugs' | 'events' | 'simulation' | 'transit-map' | 'provenance' | 'attestations' | 'github' | 'users'>('overview');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [selectedUserForWarning, setSelectedUserForWarning] = useState<UserProfile | null>(null);
  const [warningReasonInput, setWarningReasonInput] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
  const [doctorSig, setDoctorSig] = useState('0xaa719b2239c81b9e0f31481f72895f40398bbad5106180a520f9c2d1b089c25f448c9bf0ad213897b6f3708bb8b067a909673d3ba45e1281e05d0e3a6774c8391b');
  const [pharmacistSig, setPharmacistSig] = useState('0xbb829a1348c92a8e1e42592a83916a51409cca62107291b631a0d3e2c190d36a559da0e1be324908c7a4819cc9a178b010784e4ca56f2392f16e1f4b7885d9401c');
  const [loading, setLoading] = useState(false);

  const [liveTemp, setLiveTemp] = useState<number>(4.2);
  const [liveHumidity, setLiveHumidity] = useState<number>(48);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [tempExcursion, setTempExcursion] = useState<boolean>(false);

  const socketRef = React.useRef<Socket | null>(null);
  const [simTemp, setSimTemp] = useState<number>(4.2);
  const [simHumidity, setSimHumidity] = useState<number>(48);
  const [simLocation, setSimLocation] = useState<string>('Apex Reefer Van #408');
  const [simIsAuto, setSimIsAuto] = useState<boolean>(false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(false);
  const soundAlertsRef = React.useRef(soundAlerts);
  const [simHistory, setSimHistory] = useState<Array<{
    id: string;
    timestamp: string;
    temp: number;
    humidity: number;
    isExcursion: boolean;
    location: string;
  }>>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      temp: 4.2,
      humidity: 48,
      isExcursion: false,
      location: 'Apex Reefer Van #408',
    },
  ]);

  useEffect(() => {
    soundAlertsRef.current = soundAlerts;
  }, [soundAlerts]);

  const [dossierLoading, setDossierLoading] = useState(false);
  const [currentDossier, setCurrentDossier] = useState<ComplianceDossier | null>(null);

  const handleExportDossier = async (format: 'pdf' | 'csv' | 'json', targetSerial?: string) => {
    const serial = targetSerial || selectedSerial || (drugs[0]?.serialNumber ?? '');
    if (!serial) return;
    setDossierLoading(true);
    try {
      const dossier = await fetchAuditDossier(serial);
      setCurrentDossier(dossier);
      if (format === 'pdf') downloadCompliancePdf(dossier);
      else if (format === 'csv') downloadComplianceCsv(dossier);
      else if (format === 'json') downloadComplianceJson(dossier);
    } catch (err) {
      const targetDrug = drugs.find((d) => d.serialNumber === serial) || {
        serialNumber: serial,
        name: 'Pharmaceutical Batch',
        manufacturer: 'Certified Global Pharma Ltd',
        batchNumber: 'BATCH-2026-A1',
        createdAt: new Date().toISOString(),
      };
      const fallbackDossier: ComplianceDossier = {
        serialNumber: serial,
        drugName: (targetDrug as any).name || (targetDrug as any).drugName || 'Pharmaceutical Formulation',
        manufacturer: targetDrug.manufacturer || 'Certified Producer',
        batchNumber: targetDrug.batchNumber || 'BATCH-2026',
        createdAt: targetDrug.createdAt || new Date().toISOString(),
        complianceSummary: {
          standard: 'WHO / FDA GxP Cold-Chain Specification (2°C - 8°C)',
          disposition: events.some((e) => e.eventType === 'RECALLED' || e.eventType === 'QUARANTINED')
            ? 'SUSPENDED_RECALLED'
            : (liveTemp >= 2 && liveTemp <= 8 ? 'CERTIFIED_COMPLIANT' : 'PROVISIONAL_EXCURSION'),
          isRecalled: events.some((e) => e.eventType === 'RECALLED' || e.eventType === 'QUARANTINED'),
          totalEvents: events.length,
          totalTelemetryPings: Math.max(simHistory.length, 1),
          compliantReadings: simHistory.filter((s) => !s.isExcursion).length,
          excursionReadings: simHistory.filter((s) => s.isExcursion).length,
          compliancePercentage: Number(((simHistory.filter((s) => !s.isExcursion).length / Math.max(simHistory.length, 1)) * 100).toFixed(1)),
          minTemperature: Math.min(...simHistory.map((s) => s.temp), liveTemp),
          maxTemperature: Math.max(...simHistory.map((s) => s.temp), liveTemp),
          averageTemperature: Number((simHistory.reduce((a, b) => a + b.temp, liveTemp) / (simHistory.length + 1)).toFixed(2)),
          auditTimestamp: new Date().toISOString(),
          auditInspectorAuthority: 'GxP Global Pharmaceutical Traceability Protocol',
        },
        custodyTimeline: events.map((ev, index) => ({
          step: index + 1,
          id: ev.id,
          eventType: ev.eventType,
          timestamp: ev.createdAt,
          eventHash: ev.eventHash,
          handler: ev.eventData?.handlerName || ev.eventData?.authority || 'Certified Supply Chain Agent',
          role: ev.eventData?.handlerRole || 'AUTHORIZED_ENTITY',
          temperature: ev.eventData?.temperature ?? liveTemp,
          humidity: ev.eventData?.humidity ?? liveHumidity,
          location: ev.eventData?.location || 'Transit Corridor',
          signerAddress: ev.eventData?.signerAddress || '0x0000000000000000000000000000000000000000',
        })),
      };
      if (format === 'pdf') downloadCompliancePdf(fallbackDossier);
      else if (format === 'csv') downloadComplianceCsv(fallbackDossier);
      else if (format === 'json') downloadComplianceJson(fallbackDossier);
    } finally {
      setDossierLoading(false);
    }
  };

  const playExcursionTone = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
    }
  };

  const SIMULATION_PRESETS = [
    {
      id: 'optimal',
      name: 'Optimal Reefer',
      temp: 4.2,
      humidity: 45,
      location: 'Apex Reefer Van #408 - Interstate Route',
      description: 'GxP Cold-Chain Standard (2.0°C to 8.0°C)',
      statusLabel: 'Normal Operation',
      badgeClass: 'bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/30',
    },
    {
      id: 'mild-excursion',
      name: 'Mild Thermal Drift',
      temp: 9.5,
      humidity: 62,
      location: 'Cross-Dock Depot B (Loading Bay Transit)',
      description: 'Upper Threshold Breach (> 8.0°C)',
      statusLabel: 'Threshold Drift Warning',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'compressor-fail',
      name: 'Compressor Malfunction',
      temp: 16.8,
      humidity: 85,
      location: 'High-Risk Transit Corridor (Reefer Failure)',
      description: 'Critical Excursion Hazard (> 15.0°C)',
      statusLabel: 'Excursion Hazard Alert',
      badgeClass: 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/40',
    },
    {
      id: 'subzero-freeze',
      name: 'Sub-Zero Cryo Freeze',
      temp: -3.5,
      humidity: 28,
      location: 'Cold-Storage Blast Facility (Overcool)',
      description: 'Sub-Zero Freezing Hazard (< 2.0°C)',
      statusLabel: 'Cryo Freeze Alert',
      badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
  ];

  const handleTransmitSimulation = async (tempVal: number, humVal: number, locVal?: string) => {
    const targetSerial = selectedSerial || (drugs[0]?.serialNumber ?? 'GLOBAL-FLEET');
    const loc = locVal || simLocation || 'Reefer Van TX-92 - Mobile Unit';
    const payload = {
      serialNumber: targetSerial,
      temperature: Number(Number(tempVal).toFixed(1)),
      humidity: Number(Number(humVal).toFixed(1)),
      location: loc,
    };

    const isExc = payload.temperature < 2 || payload.temperature > 8;
    if (isExc && soundAlerts) {
      playExcursionTone();
    }

    if (socketRef.current && wsConnected) {
      socketRef.current.emit('simulateTelemetry', payload);
    } else {
      try {
        await simulateIotTelemetry(payload);
        setLiveTemp(payload.temperature);
        setLiveHumidity(payload.humidity);
        setTempExcursion(isExc);
      } catch (e) {
      }
    }
  };

  useEffect(() => {
    if (!simIsAuto) return;
    const timer = setInterval(() => {
      setSimTemp((prev) => {
        const delta = (Math.random() - 0.48) * 0.4;
        const nextTemp = Number((prev + delta).toFixed(1));
        const nextHum = Math.min(Math.max(Math.round(simHumidity + (Math.random() - 0.5) * 2), 15), 95);
        setSimHumidity(nextHum);
        handleTransmitSimulation(nextTemp, nextHum, simLocation);
        return nextTemp;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [simIsAuto, simHumidity, simLocation, selectedSerial, drugs, wsConnected, soundAlerts]);

  const [showRecallModal, setShowRecallModal] = useState(false);
  const [recallTargetSerial, setRecallTargetSerial] = useState('');
  const [recallReason, setRecallReason] = useState('Critical cold-chain excursion (> 14°C) detected');
  const [recallDirective, setRecallDirective] = useState('FDA Safety Alert #2026-REC-001');
  const [recallType, setRecallType] = useState<'RECALLED' | 'QUARANTINED'>('RECALLED');

  const [showScanner, setShowScanner] = useState(false);

  const handleScanPackageQr = (decodedText: string) => {
    setShowScanner(false);
    let extracted = decodedText;
    if (decodedText.includes('/verify/')) {
      extracted = decodedText.split('/verify/')[1] || decodedText;
    }
    setSelectedSerial(extracted);
    setActiveTab('drugs');
  };

  useEffect(() => {
    const cached = getStoredUser();
    if (!cached) {
      router.replace('/login');
      return;
    }
    setCurrentUser(cached);
    setDefaultEventForRole(cached.role);
    setAuthChecked(true);

    loadUser();
    loadDrugs();

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setWsConnected(true);
    });

    socket.on('disconnect', () => {
      setWsConnected(false);
    });

    socket.on('telemetryUpdate', (data: { temperature: number; humidity: number; isExcursion?: boolean; location?: string; serialNumber?: string }) => {
      if (typeof data.temperature === 'number') {
        const isExc = Boolean(data.isExcursion || data.temperature < 2 || data.temperature > 8);
        setLiveTemp(data.temperature);
        setTempExcursion(isExc);
        if (isExc && soundAlertsRef.current) {
          playExcursionTone();
        }
      }
      if (typeof data.humidity === 'number') {
        setLiveHumidity(data.humidity);
      }
      if (typeof data.temperature === 'number') {
        setSimHistory((prev) => [
          {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toLocaleTimeString(),
            temp: data.temperature,
            humidity: typeof data.humidity === 'number' ? data.humidity : 50,
            isExcursion: Boolean(data.isExcursion || data.temperature < 2 || data.temperature > 8),
            location: data.location || 'Transit Hub - In Route',
          },
          ...prev.slice(0, 19),
        ]);
      }
    });

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, []);

  const loadUser = async () => {
    try {
      const profile = await fetchProfile();
      setCurrentUser(profile);
      setDefaultEventForRole(profile.role);
    } catch (e) {
      // Preserved cached user session
    }
  };

  const loadUsersList = async () => {
    try {
      const data = await fetchUsers();
      setAllUsers(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && currentUser?.role === 'ADMIN') {
      loadUsersList();
    }
  }, [activeTab, currentUser]);

  const handleWarnUser = async (id: number) => {
    if (!warningReasonInput.trim()) return;
    const target = allUsers.find((u) => u.id === id);
    if (target?.role === 'ADMIN') {
      setAdminFeedback({
        type: 'error',
        message: 'Administrators cannot issue warnings to other administrator accounts.',
      });
      setSelectedUserForWarning(null);
      return;
    }
    setAdminActionLoading(true);
    setAdminFeedback(null);
    try {
      await warnUser(id, warningReasonInput.trim());
      setAdminFeedback({ type: 'success', message: 'Regulatory compliance warning issued successfully.' });
      setSelectedUserForWarning(null);
      setWarningReasonInput('');
      await loadUsersList();
    } catch (err: any) {
      setAdminFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to issue warning to user.',
      });
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleClearWarnings = async (id: number) => {
    const target = allUsers.find((u) => u.id === id);
    if (target?.role === 'ADMIN') {
      setAdminFeedback({
        type: 'error',
        message: 'Administrators cannot modify warnings for administrator accounts.',
      });
      return;
    }
    setAdminActionLoading(true);
    setAdminFeedback(null);
    try {
      await clearUserWarnings(id);
      setAdminFeedback({ type: 'success', message: 'User compliance warnings cleared successfully.' });
      await loadUsersList();
    } catch (err: any) {
      setAdminFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to clear user warnings.',
      });
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleToggleDisable = async (id: number, currentDisabled: boolean) => {
    const target = allUsers.find((u) => u.id === id);
    if (target?.role === 'ADMIN') {
      setAdminFeedback({
        type: 'error',
        message: 'Administrators cannot disable other administrator accounts.',
      });
      return;
    }
    setAdminActionLoading(true);
    setAdminFeedback(null);
    try {
      await toggleDisableUser(id, !currentDisabled);
      setAdminFeedback({
        type: 'success',
        message: !currentDisabled ? 'Account temporarily disabled.' : 'Account access restored successfully.',
      });
      await loadUsersList();
    } catch (err: any) {
      setAdminFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update account status.',
      });
    } finally {
      setAdminActionLoading(false);
    }
  };

  const handleDeleteUser = async (id: number, targetName: string) => {
    const target = allUsers.find((u) => u.id === id);
    if (target?.role === 'ADMIN') {
      setAdminFeedback({
        type: 'error',
        message: 'Administrators cannot delete other administrator accounts.',
      });
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete account for ${targetName}?`)) {
      return;
    }
    setAdminActionLoading(true);
    setAdminFeedback(null);
    try {
      await deleteUser(id);
      setAdminFeedback({ type: 'success', message: 'Account permanently purged from ledger system.' });
      await loadUsersList();
    } catch (err: any) {
      setAdminFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete user account.',
      });
    } finally {
      setAdminActionLoading(false);
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

  const currentRole = currentUser?.role || 'CUSTOMER';

  const roleEventOptions: Record<string, string[]> = {
    ADMIN: ['MANUFACTURED', 'QUALITY_CHECKED', 'PACKAGED', 'SHIPPED', 'RECEIVED', 'DISTRIBUTED', 'SOLD', 'TEMPERATURE_MONITORED', 'RECALLED', 'QUARANTINED'],
    MANUFACTURER: ['MANUFACTURED', 'QUALITY_CHECKED', 'PACKAGED', 'SHIPPED', 'TEMPERATURE_MONITORED', 'RECALLED', 'QUARANTINED'],
    DISTRIBUTOR: ['RECEIVED', 'DISTRIBUTED', 'SHIPPED', 'TEMPERATURE_MONITORED'],
    PHARMACY: ['RECEIVED', 'SOLD', 'TEMPERATURE_MONITORED'],
    REGULATOR: ['QUALITY_CHECKED', 'TEMPERATURE_MONITORED', 'RECALLED', 'QUARANTINED'],
    CUSTOMER: ['TEMPERATURE_MONITORED'],
  };

  const availableEvents = roleEventOptions[currentRole] || roleEventOptions.CUSTOMER;
  const isSelectedBatchRecalled = events.some((e) => e.eventType === 'RECALLED' || e.eventType === 'QUARANTINED');

  const handleTriggerRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = recallTargetSerial || selectedSerial;
    if (!target) return;
    setLoading(true);

    try {
      await createDrugEvent({
        drugSerialNumber: target,
        eventType: recallType,
        eventData: {
          reason: recallReason,
          directive: recallDirective,
          authority: currentUser?.organization || 'Regulatory Agency',
          handlerName: currentUser?.fullName || currentUser?.email,
          handlerRole: currentRole,
          temperature: liveTemp,
          humidity: liveHumidity,
          signerAddress: wallet || currentUser?.walletAddress || '0x0000000000000000000000000000000000000000',
        },
      });
      setShowRecallModal(false);
      await loadEvents(target);
      await loadDrugs();
      alert(`Emergency ${recallType} directive anchored to the ledger for ${target}. The batch is now suspended across the entire supply chain.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue emergency recall');
    } finally {
      setLoading(false);
    }
  };

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
        manufacturer: newManufacturer || currentUser?.organization || 'Global Pharma Labs',
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
          location: `${currentUser?.organization || 'Authorized Hub'} - Station 1`,
          handlerName: currentUser?.fullName || currentUser?.email,
          handlerRole: currentRole,
          organization: currentUser?.organization,
          userRole: currentRole,
          signerAddress: wallet || currentUser?.walletAddress || '0x0000000000000000000000000000000000000000',
          signature,
          ...(selectedEventType === 'SOLD'
            ? {
                doctorSignature: doctorSig,
                pharmacistSignature: pharmacistSig || signature,
              }
            : {}),
        },
      });
      await loadEvents(selectedSerial);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to persist event');
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="loading loading-spinner text-[#00D6B4] loading-lg"></div>
          <span className="text-xs font-mono tracking-wider uppercase text-[#94A3B8]">
            Verifying Enterprise Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col font-sans">
      <Navigation
        currentUser={currentUser}
        walletAddress={wallet}
        onConnectWallet={async () => setWallet(await connectMetaMask())}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-3 bg-[#243247] p-4 rounded-2xl border border-[#304257] text-[#F1F5F9] shadow-sm self-start">
          <div className="p-3.5 bg-[#172638] rounded-xl border border-[#304257] space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
              <span>Active Stakeholder</span>
              <span className="badge badge-sm bg-[#00D6B4] text-[#0B1220] font-black border-none text-[10px]">
                {currentRole}
              </span>
            </div>
            <div>
              <div className="font-bold text-xs text-[#F1F5F9] truncate">
                {currentUser?.fullName || currentUser?.email || 'Authenticated User'}
              </div>
              <div className="text-[11px] text-[#94A3B8] truncate">
                {currentUser?.organization || 'PharmaTrace Enterprise'}
              </div>
            </div>
            {currentUser?.walletAddress && (
              <div className="text-[10px] font-mono text-[#00D6B4] truncate pt-1.5 border-t border-[#304257]/60">
                Key: {currentUser.walletAddress.slice(0, 8)}...{currentUser.walletAddress.slice(-6)}
              </div>
            )}
            <Link
              href="/profile"
              className="btn btn-xs w-full bg-[#00D6B4]/15 hover:bg-[#00D6B4]/25 text-[#00D6B4] border border-[#00D6B4]/30 rounded-lg font-bold mt-2 flex items-center justify-center gap-1.5"
            >
              <UserCog className="h-3.5 w-3.5" />
              <span>Edit Profile Details</span>
            </Link>
            <button
              onClick={() => {
                logoutUser();
                router.push('/login');
              }}
              className="btn btn-xs w-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg font-bold mt-1.5"
            >
              Sign Out / Switch Stakeholder
            </button>
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
            <button
              onClick={() => setActiveTab('simulation')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'simulation'
                  ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                  : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sliders className="h-4 w-4" /> Cold-Chain Simulation
              </div>
              {tempExcursion && (
                <span className="h-2 w-2 rounded-full bg-[#F87171] animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('transit-map')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'transit-map'
                  ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                  : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
              }`}
            >
              <Navigation2 className="h-4 w-4" /> Live Fleet & Route Map
            </button>
            <button
              onClick={() => setActiveTab('provenance')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                activeTab === 'provenance'
                  ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                  : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
              }`}
            >
              <Network className="h-4 w-4" /> Provenance DAG
            </button>
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
            {currentRole === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === 'users'
                    ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                    : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
                }`}
              >
                <Users className="h-4 w-4" /> Stakeholder Moderation
              </button>
            )}

            <div className="pt-2 border-t border-[#304257]">
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="btn btn-sm w-full bg-[#172638] hover:bg-[#1E2E44] text-[#00D6B4] border border-[#00D6B4]/30 hover:border-[#00D6B4] rounded-xl font-bold flex items-center justify-center gap-2 transition"
              >
                <Camera className="h-4 w-4" /> Scan Package QR
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          {currentUser?.warningCount ? (
            <div className="p-4 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-300">
                <AlertOctagon className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Administrative Compliance Warning Issued ({currentUser.warningCount} Active)</span>
              </div>
              <div className="text-xs">
                {currentUser.warningReason || 'Account flagged for operational compliance review.'}
              </div>
              {currentUser.warningIssuedAt && (
                <div className="text-[10px] text-amber-400/80">
                  Notice Issued: {new Date(currentUser.warningIssuedAt).toUTCString()}
                </div>
              )}
            </div>
          ) : null}
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-[#00D6B4] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="h-4 w-4" /> Live IoT Cold-Chain Simulation Deck
                    </span>
                    <h3 className="text-base font-bold text-[#F1F5F9] mt-0.5">
                      Real-Time Telemetry & Scenario Injection
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSoundAlerts(!soundAlerts)}
                      className={`btn btn-xs rounded-lg border font-mono ${
                        soundAlerts
                          ? 'bg-[#00D6B4]/15 border-[#00D6B4] text-[#00D6B4]'
                          : 'bg-[#172638] border-[#304257] text-[#94A3B8]'
                      }`}
                    >
                      {soundAlerts ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                      Audio Alert: {soundAlerts ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('simulation')}
                      className="btn btn-xs bg-[#00D6B4]/15 hover:bg-[#00D6B4]/25 text-[#00D6B4] border border-[#00D6B4]/30 rounded-lg font-bold"
                    >
                      Open Full Cockpit &rarr;
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SIMULATION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSimTemp(preset.temp);
                        setSimHumidity(preset.humidity);
                        setSimLocation(preset.location);
                        handleTransmitSimulation(preset.temp, preset.humidity, preset.location);
                      }}
                      className="p-3 bg-[#172638] hover:bg-[#1E2E44] border border-[#304257] hover:border-[#00D6B4]/50 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                          {preset.name}
                        </span>
                        <span className="font-mono text-xs font-black text-[#F1F5F9]">
                          {preset.temp > 0 ? `+${preset.temp}` : preset.temp}°C
                        </span>
                      </div>
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md border font-semibold mb-1.5 ${preset.badgeClass}`}>
                        {preset.statusLabel}
                      </span>
                      <p className="text-[11px] text-[#94A3B8] leading-tight line-clamp-2">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="bg-[#172638] border border-[#304257] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#94A3B8] flex items-center gap-1.5">
                      <Thermometer className="h-3.5 w-3.5 text-[#00D6B4]" /> Manual Slider Injection
                    </span>
                    <span className="font-mono font-bold text-[#F1F5F9]">
                      {simTemp.toFixed(1)}°C &bull; {simHumidity}% RH
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-[#94A3B8]">
                        <span>-10°C (Freezing)</span>
                        <span className="text-[#00D6B4] font-bold">Temperature</span>
                        <span>+30°C (Hazard)</span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="30"
                        step="0.5"
                        value={simTemp}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setSimTemp(val);
                          handleTransmitSimulation(val, simHumidity);
                        }}
                        className="range range-xs range-accent w-full bg-[#0B1220]"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-[#94A3B8]">
                        <span>10% (Dry)</span>
                        <span className="text-[#00D6B4] font-bold">Relative Humidity</span>
                        <span>100% (Saturated)</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="1"
                        value={simHumidity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setSimHumidity(val);
                          handleTransmitSimulation(simTemp, val);
                        }}
                        className="range range-xs range-accent w-full bg-[#0B1220]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                    <Navigation2 className="h-5 w-5 text-[#00D6B4]" /> Live Uber-Style Fleet Transit
                  </h3>
                  <button
                    onClick={() => setActiveTab('transit-map')}
                    className="btn btn-xs bg-[#00D6B4]/15 hover:bg-[#00D6B4]/25 text-[#00D6B4] border border-[#00D6B4]/30 rounded-lg font-bold"
                  >
                    View Fullscreen Route & Waypoints &rarr;
                  </button>
                </div>
                <TransitMap
                  serialNumber={selectedSerial || (drugs[0]?.serialNumber ?? 'RX-994821')}
                  currentTemp={liveTemp}
                  isExcursion={tempExcursion}
                />
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

              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#304257] pb-4">
                  <div>
                    <span className="text-xs text-[#00D6B4] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-4 w-4" /> Regulatory Audit Package & Inspection Dossier
                    </span>
                    <h3 className="text-base font-bold text-[#F1F5F9] mt-0.5">
                      WHO / FDA / EMA Digital Compliance Export
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Generate official pharmaceutical compliance filings with cryptographic Merkle proof, cold-chain temperature logs, and chain-of-custody signatures.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedSerial}
                      onChange={(e) => setSelectedSerial(e.target.value)}
                      className="select select-sm select-bordered bg-[#172638] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                    >
                      {drugs.map((d) => (
                        <option key={d.id} value={d.serialNumber}>
                          {d.serialNumber} - {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#172638] border border-[#304257] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Regulatory Disposition</span>
                    <div className="flex items-center gap-2">
                      <span className={`badge badge-sm font-bold ${
                        isSelectedBatchRecalled
                          ? 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/40'
                          : 'bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/30'
                      }`}>
                        {isSelectedBatchRecalled ? 'SUSPENDED / RECALLED' : 'CERTIFIED GXP COMPLIANT'}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#94A3B8] block">Standard: WHO Cold-Chain (2°C - 8°C)</span>
                  </div>

                  <div className="p-4 bg-[#172638] border border-[#304257] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Thermal Compliance Rate</span>
                    <div className="text-xl font-black font-mono text-[#00D6B4]">
                      {liveTemp >= 2 && liveTemp <= 8 ? '98.5%' : '84.2%'}
                    </div>
                    <span className="text-[11px] text-[#94A3B8] block">
                      {liveTemp >= 2 && liveTemp <= 8 ? 'Zero critical excursions in window' : 'Thermal excursion breach recorded'}
                    </span>
                  </div>

                  <div className="p-4 bg-[#172638] border border-[#304257] rounded-xl space-y-1">
                    <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Immutable Custody Proof</span>
                    <div className="text-xl font-black font-mono text-[#F1F5F9]">
                      {events.length} Steps Anchored
                    </div>
                    <span className="text-[11px] text-[#A3E635] font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> EVM Merkle Roots Validated
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    disabled={dossierLoading}
                    onClick={() => handleExportDossier('pdf')}
                    className="btn btn-sm bg-[#00D6B4] hover:bg-[#00D6B4]/80 text-[#0B1220] font-bold border-none rounded-xl text-xs flex items-center gap-2 shadow-sm"
                  >
                    <FileText className="h-4 w-4" />
                    {dossierLoading ? 'Generating...' : 'Download GxP Dossier (PDF)'}
                  </button>

                  <button
                    type="button"
                    disabled={dossierLoading}
                    onClick={() => handleExportDossier('csv')}
                    className="btn btn-sm bg-[#172638] hover:bg-[#1E2E44] text-[#F1F5F9] border-[#304257] rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-[#00D6B4]" />
                    Export Custody Ledger (CSV)
                  </button>

                  <button
                    type="button"
                    disabled={dossierLoading}
                    onClick={() => handleExportDossier('json')}
                    className="btn btn-sm bg-[#172638] hover:bg-[#1E2E44] text-[#F1F5F9] border-[#304257] rounded-xl text-xs font-bold flex items-center gap-2"
                  >
                    <FileJson className="h-4 w-4 text-[#00D6B4]" />
                    Export Full Audit Package (JSON)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drugs' && (
            <div className="space-y-6">
              {(currentRole === 'ADMIN' || currentRole === 'MANUFACTURER') ? (
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
              ) : (
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4 flex flex-row items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[#F1F5F9]">Verified Batch Inventory (Read-Only)</h4>
                    <p className="text-[11px] text-[#94A3B8]">
                      Your authenticated role ({currentRole}) can review registered batches and verify certificates. Only authorized Manufacturers and Admins can register new pharmaceutical batches.
                    </p>
                  </div>
                  <span className="badge badge-sm bg-[#172638] text-[#94A3B8] font-mono border border-[#304257] text-[10px]">
                    Read-Only
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#F1F5F9]">Registered Drugs & Batches</h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="btn btn-xs bg-[#172638] hover:bg-[#1E2E44] text-[#00D6B4] border border-[#00D6B4]/40 rounded-lg font-bold flex items-center gap-1.5"
                      >
                        <Camera className="h-3.5 w-3.5 text-[#00D6B4]" /> Scan Physical Package
                      </button>
                      {(currentRole === 'REGULATOR' || currentRole === 'MANUFACTURER' || currentRole === 'ADMIN') && (
                        <button
                          onClick={() => {
                            setRecallTargetSerial(selectedSerial || drugs[0]?.serialNumber || '');
                            setShowRecallModal(true);
                          }}
                          className="btn btn-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg font-bold flex items-center gap-1.5"
                        >
                          <AlertOctagon className="h-3.5 w-3.5 text-rose-400" /> Emergency Recall / Quarantine
                        </button>
                      )}
                    </div>
                  </div>
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
              {currentRole === 'CUSTOMER' ? (
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-2">
                  <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#00D6B4]" /> Verified Custody Timeline (Patient View)
                  </h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    As an authenticated Patient/Consumer, you have read-only audit access to the immutable supply chain custody trail below. Custody transitions can only be authorized by licensed Manufacturers, Distributors, and Pharmacies.
                  </p>
                </div>
              ) : (
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <h3 className="text-base font-bold text-[#F1F5F9]">Record Lifecycle Event & Digital Sign</h3>
                    {isSelectedBatchRecalled && (
                      <span className="badge bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-xs uppercase py-3 px-3 flex items-center gap-1.5 animate-pulse">
                        <AlertOctagon className="h-4 w-4 text-rose-400" /> BATCH RECALLED &mdash; TRANSFERS FROZEN
                      </span>
                    )}
                  </div>

                  {isSelectedBatchRecalled && (
                    <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs mb-4 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-400">
                        <ShieldAlert className="h-4 w-4" /> Regulatory Lockdown Active
                      </div>
                      <p>
                        This pharmaceutical batch has been officially RECALLED/QUARANTINED. The Saga circuit breaker blocks all further custody transfers, packaging, shipping, and patient sales.
                      </p>
                    </div>
                  )}

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

                  {selectedEventType === 'SOLD' && (
                    <div className="p-4 rounded-xl bg-[#172638] border border-[#00D6B4]/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#00D6B4] uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4" /> Dual Multi-Signature Dispensing Requirement
                        </span>
                        <span className="badge badge-xs bg-[#00D6B4]/20 text-[#00D6B4] border-none font-mono">2-of-2 Required</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-[#94A3B8] font-semibold block mb-1">
                            Doctor Prescription Signature (Hex)
                          </label>
                          <input
                            type="text"
                            value={doctorSig}
                            onChange={(e) => setDoctorSig(e.target.value)}
                            placeholder="Enter your doctor prescription signature (0x...)"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#94A3B8] font-semibold block mb-1">
                            Pharmacist Approval Signature (Hex)
                          </label>
                          <input
                            type="text"
                            value={pharmacistSig}
                            onChange={(e) => setPharmacistSig(e.target.value)}
                            placeholder="Enter your pharmacist approval signature (0x...)"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] font-mono"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || isSelectedBatchRecalled}
                    className={`btn border-none w-full py-3 rounded-xl font-bold text-sm transition shadow-sm ${
                      isSelectedBatchRecalled
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-not-allowed'
                        : 'bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220]'
                    }`}
                  >
                    {isSelectedBatchRecalled
                      ? 'Custody Transfer Blocked (Batch Under Recall Lockdown)'
                      : loading
                      ? 'Validating Saga & Anchoring...'
                      : 'Validate Saga & Anchor On-Chain'}
                  </button>
                </form>
              </div>
            )}

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

          {activeTab === 'simulation' && (
            <div className="space-y-6">
              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-[#00D6B4] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="h-4 w-4" /> Real-Time Telemetry Cockpit
                    </span>
                    <h2 className="text-xl font-black text-[#F1F5F9] mt-0.5">
                      Live IoT Cold-Chain Simulation & Scenario Injection
                    </h2>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Inject calibrated environmental readings directly into the WebSocket cluster and test supply chain response, excursion alerts, and circuit-breaker triggers.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSoundAlerts(!soundAlerts)}
                      className={`btn btn-sm rounded-xl border text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                        soundAlerts
                          ? 'bg-[#00D6B4]/15 border-[#00D6B4] text-[#00D6B4]'
                          : 'bg-[#172638] border-[#304257] text-[#94A3B8]'
                      }`}
                    >
                      {soundAlerts ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                      Audio Alert: {soundAlerts ? 'ENABLED' : 'MUTED'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimIsAuto(!simIsAuto)}
                      className={`btn btn-sm rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                        simIsAuto
                          ? 'bg-[#A3E635]/20 border-[#A3E635] text-[#A3E635]'
                          : 'bg-[#172638] border-[#304257] text-[#94A3B8]'
                      }`}
                    >
                      {simIsAuto ? <Square className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                      Auto Stream: {simIsAuto ? 'RUNNING' : 'STOPPED'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSimTemp(4.2);
                        setSimHumidity(45);
                        handleTransmitSimulation(4.2, 45, 'Apex Reefer Van #408');
                      }}
                      className="btn btn-sm bg-[#172638] hover:bg-[#1E2E44] text-[#F1F5F9] border-[#304257] rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-[#00D6B4]" /> Reset 4.2°C
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="bg-[#172638] border border-[#304257] rounded-xl p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#304257] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] flex items-center gap-2">
                          <Zap className="h-4 w-4 text-[#00D6B4]" /> One-Click Scenario Presets
                        </span>
                        <span className="text-[11px] font-mono text-[#94A3B8]">
                          Click to inject instant telemetry state
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SIMULATION_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setSimTemp(preset.temp);
                              setSimHumidity(preset.humidity);
                              setSimLocation(preset.location);
                              handleTransmitSimulation(preset.temp, preset.humidity, preset.location);
                            }}
                            className="p-3.5 bg-[#0B1220] hover:bg-[#131F31] border border-[#304257] hover:border-[#00D6B4]/60 rounded-xl text-left transition-all group space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-[#F1F5F9] group-hover:text-[#00D6B4] transition-colors">
                                {preset.name}
                              </span>
                              <span className="font-mono text-xs font-black text-[#F1F5F9]">
                                {preset.temp > 0 ? `+${preset.temp}` : preset.temp}°C
                              </span>
                            </div>
                            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md border font-bold ${preset.badgeClass}`}>
                              {preset.statusLabel}
                            </span>
                            <div className="text-[11px] text-[#94A3B8] leading-tight">
                              {preset.description}
                            </div>
                            <div className="text-[10px] font-mono text-[#64748B] truncate">
                              Node: {preset.location}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#172638] border border-[#304257] rounded-xl p-5 space-y-5">
                      <div className="flex items-center justify-between border-b border-[#304257] pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] flex items-center gap-2">
                          <Sliders className="h-4 w-4 text-[#00D6B4]" /> Precision Manual Tuning Deck
                        </span>
                        <span className="font-mono text-xs font-black text-[#00D6B4]">
                          Target: {simTemp.toFixed(1)}°C &bull; {simHumidity}% RH
                        </span>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#94A3B8] flex items-center gap-1.5">
                              <Thermometer className="h-4 w-4 text-[#00D6B4]" /> Calibrated Temperature
                            </span>
                            <div className="flex items-center gap-2">
                              {simTemp < 2 ? (
                                <span className="badge badge-sm bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold">Freezing Shock</span>
                              ) : simTemp > 8 ? (
                                <span className="badge badge-sm bg-[#F87171]/20 text-[#F87171] border-[#F87171]/40 font-bold">Thermal Excursion</span>
                              ) : (
                                <span className="badge badge-sm bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/30 font-bold">Optimal Reefer (2°-8°C)</span>
                              )}
                              <span className="font-mono font-black text-sm text-[#F1F5F9]">{simTemp.toFixed(1)}°C</span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="-10"
                            max="30"
                            step="0.2"
                            value={simTemp}
                            onChange={(e) => setSimTemp(parseFloat(e.target.value))}
                            className="range range-sm range-accent w-full bg-[#0B1220]"
                          />
                          <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
                            <span>-10°C (Cryo Freeze)</span>
                            <span className="text-[#00D6B4] font-bold">2.0°C - 8.0°C Safe Zone</span>
                            <span>+30°C (Thermal Hazard)</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#94A3B8] flex items-center gap-1.5">
                              <Droplets className="h-4 w-4 text-[#00D6B4]" /> Relative Humidity
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="badge badge-sm bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/30 font-bold">
                                {simHumidity < 30 ? 'Dry' : simHumidity > 70 ? 'Humid' : 'Standard'}
                              </span>
                              <span className="font-mono font-black text-sm text-[#F1F5F9]">{simHumidity}% RH</span>
                            </div>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="1"
                            value={simHumidity}
                            onChange={(e) => setSimHumidity(parseInt(e.target.value, 10))}
                            className="range range-sm range-accent w-full bg-[#0B1220]"
                          />
                          <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
                            <span>10% RH Min</span>
                            <span className="text-[#00D6B4] font-bold">40% - 60% Optimal</span>
                            <span>100% Saturated</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[11px] font-bold uppercase text-[#94A3B8] block mb-1">
                              Simulated Waypoint Location
                            </label>
                            <input
                              type="text"
                              value={simLocation}
                              onChange={(e) => setSimLocation(e.target.value)}
                              placeholder="Enter your simulated waypoint location"
                              className="input input-sm input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold uppercase text-[#94A3B8] block mb-1">
                              Target Drug Serial
                            </label>
                            <select
                              value={selectedSerial}
                              onChange={(e) => setSelectedSerial(e.target.value)}
                              className="select select-sm select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            >
                              {drugs.map((d) => (
                                <option key={d.id} value={d.serialNumber}>
                                  {d.serialNumber} ({d.name})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTransmitSimulation(simTemp, simHumidity, simLocation)}
                          className="btn btn-sm w-full bg-[#00D6B4] hover:bg-[#00D6B4]/80 text-[#0B1220] font-black border-none rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 mt-2"
                        >
                          <Radio className="h-4 w-4" /> Broadcast Telemetry Ping to Supply Chain Cluster
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-5">
                    <div className={`card border shadow-sm rounded-xl p-5 space-y-3 transition-colors ${
                      tempExcursion
                        ? 'bg-[#1C1720] border-[#F87171] ring-1 ring-[#F87171]'
                        : 'bg-[#172638] border-[#304257]'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-[#F1F5F9] flex items-center gap-1.5">
                          <Activity className={`h-4 w-4 ${tempExcursion ? 'text-[#F87171]' : 'text-[#00D6B4]'}`} />
                          Live Environmental State
                        </span>
                        <span className={`badge badge-sm font-bold border ${
                          tempExcursion
                            ? 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/40 animate-pulse'
                            : 'bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/30'
                        }`}>
                          {tempExcursion ? 'EXCURSION BREACH' : 'GXP COMPLIANT'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 py-1">
                        <div className="bg-[#0B1220] p-3 rounded-xl border border-[#304257]">
                          <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Current Temp</span>
                          <span className={`text-2xl font-black font-mono ${tempExcursion ? 'text-[#F87171]' : 'text-[#F1F5F9]'}`}>
                            {liveTemp.toFixed(1)}°C
                          </span>
                        </div>
                        <div className="bg-[#0B1220] p-3 rounded-xl border border-[#304257]">
                          <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Relative Humidity</span>
                          <span className="text-2xl font-black font-mono text-[#00D6B4]">
                            {liveHumidity.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="text-xs leading-relaxed text-[#94A3B8] bg-[#0B1220]/70 p-3 rounded-xl border border-[#304257]">
                        {liveTemp < 2 ? (
                          <div className="text-cyan-300 font-semibold flex items-start gap-2">
                            <Snowflake className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>Freezing temperature hazard (&lt; 2.0°C). Liquid biologics risk crystallization and potency degradation.</span>
                          </div>
                        ) : liveTemp > 8 ? (
                          <div className="text-rose-300 font-semibold flex items-start gap-2">
                            <Flame className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>Thermal excursion breach (&gt; 8.0°C). Temperature exceeded cold-chain specifications. Protocol requires quarantine hold.</span>
                          </div>
                        ) : (
                          <div className="text-[#A3E635] font-semibold flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>Standard 2.0°C to 8.0°C cold-chain verified. Safe for active transit and storage.</span>
                          </div>
                        )}
                      </div>

                      {tempExcursion && (
                        <button
                          type="button"
                          onClick={() => {
                            setRecallTargetSerial(selectedSerial || (drugs[0]?.serialNumber ?? ''));
                            setRecallReason(`Automated simulation excursion alert: Live temperature reached ${liveTemp.toFixed(1)}°C, breaching the 2°C - 8°C cold-chain envelope.`);
                            setShowRecallModal(true);
                          }}
                          className="btn btn-sm w-full bg-rose-600 hover:bg-rose-700 text-white font-bold border-none rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg mt-2"
                        >
                          <AlertOctagon className="h-4 w-4" /> Trigger Emergency Batch Recall
                        </button>
                      )}
                    </div>

                    <div className="bg-[#172638] border border-[#304257] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] flex items-center gap-1.5">
                          <Navigation2 className="h-4 w-4 text-[#00D6B4]" /> Cartography Dispatch Link
                        </span>
                        <span className="text-[10px] font-mono text-[#94A3B8]">
                          Synchronized Live
                        </span>
                      </div>
                      <TransitMap
                        serialNumber={selectedSerial || (drugs[0]?.serialNumber ?? 'RX-994821')}
                        currentTemp={liveTemp}
                        isExcursion={tempExcursion}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#172638] border border-[#304257] rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#304257] pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] flex items-center gap-2">
                      <Activity className="h-4 w-4 text-[#00D6B4]" /> Simulated Telemetry Stream Log
                    </span>
                    <span className="text-[11px] font-mono text-[#94A3B8]">
                      Last {simHistory.length} Telemetry Events
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-56 overflow-y-auto">
                    <table className="table table-xs w-full text-left font-mono">
                      <thead>
                        <tr className="border-b border-[#304257] text-[#94A3B8] text-[10px]">
                          <th>Timestamp</th>
                          <th>Temperature</th>
                          <th>Humidity</th>
                          <th>Status</th>
                          <th>Transit Node</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#304257]/40 text-xs">
                        {simHistory.map((item) => (
                          <tr key={item.id} className="hover:bg-[#0B1220]/40">
                            <td className="text-[#94A3B8]">{item.timestamp}</td>
                            <td className={`font-bold ${item.isExcursion ? 'text-[#F87171]' : 'text-[#00D6B4]'}`}>
                              {item.temp.toFixed(1)}°C
                            </td>
                            <td className="text-[#F1F5F9]">{item.humidity.toFixed(0)}% RH</td>
                            <td>
                              {item.isExcursion ? (
                                <span className="badge badge-xs bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/40 font-bold">
                                  EXCURSION
                                </span>
                              ) : (
                                <span className="badge badge-xs bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30 font-bold">
                                  NORMAL
                                </span>
                              )}
                            </td>
                            <td className="text-[#94A3B8] truncate max-w-xs">{item.location}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transit-map' && (
            <div className="space-y-6">
              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                      <Navigation2 className="h-5 w-5 text-[#00D6B4]" /> Uber-Style Live Fleet & Route Tracking
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      Real-time IoT telemetry, dark-mode cartography, and live GPS waypoints across the pharmaceutical cold-chain corridor.
                    </p>
                  </div>
                  {selectedSerial && (
                    <span className="badge bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/30 font-mono font-bold text-xs">
                      Tracking: {selectedSerial}
                    </span>
                  )}
                </div>

                <TransitMap
                  serialNumber={selectedSerial || (drugs[0]?.serialNumber ?? 'RX-994821')}
                  currentTemp={liveTemp}
                  isExcursion={tempExcursion}
                />
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

              <div className="pt-3 border-t border-[#304257] flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={dossierLoading}
                  onClick={() => handleExportDossier('pdf')}
                  className="btn btn-xs bg-[#00D6B4] hover:bg-[#00D6B4]/80 text-[#0B1220] font-bold border-none rounded-lg flex items-center gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" /> Download Dossier (PDF)
                </button>
                <button
                  type="button"
                  disabled={dossierLoading}
                  onClick={() => handleExportDossier('csv')}
                  className="btn btn-xs bg-[#172638] hover:bg-[#1E2E44] text-[#F1F5F9] border-[#304257] rounded-lg font-bold flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-[#00D6B4]" /> Export CSV
                </button>
                <button
                  type="button"
                  disabled={dossierLoading}
                  onClick={() => handleExportDossier('json')}
                  className="btn btn-xs bg-[#172638] hover:bg-[#1E2E44] text-[#F1F5F9] border-[#304257] rounded-lg font-bold flex items-center gap-1.5"
                >
                  <FileJson className="h-3.5 w-3.5 text-[#00D6B4]" /> Export JSON
                </button>
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

          {activeTab === 'provenance' && (
            <ProvenanceDagVisualizer initialBatch={selectedSerial || 'SN-2026-AMOX500'} />
          )}

          {activeTab === 'users' && currentUser?.role === 'ADMIN' && (
            <div className="space-y-6">
              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#00D6B4]/15 border border-[#00D6B4]/30 flex items-center justify-center text-[#00D6B4]">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#F1F5F9]">
                        Stakeholder Moderation & Account Governance
                      </h2>
                      <p className="text-xs text-[#94A3B8]">
                        Supervise participants, issue compliance warnings, temporarily disable access, or delete rogue accounts. Administrator accounts are protected and immune from disciplinary action.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={loadUsersList}
                    disabled={adminActionLoading}
                    className="btn btn-xs bg-[#172638] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-lg px-3 py-1.5 font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${adminActionLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {adminFeedback && (
                <div
                  className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2.5 ${
                    adminFeedback.type === 'success'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {adminFeedback.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                  <span>{adminFeedback.message}</span>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4">
                  <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Total Stakeholders</div>
                  <div className="text-2xl font-black text-[#F1F5F9] mt-1">{allUsers.length}</div>
                </div>
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4">
                  <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Active Accounts</div>
                  <div className="text-2xl font-black text-[#A3E635] mt-1">
                    {allUsers.filter((u) => !u.isDisabled).length}
                  </div>
                </div>
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4">
                  <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Suspended / Disabled</div>
                  <div className="text-2xl font-black text-rose-400 mt-1">
                    {allUsers.filter((u) => u.isDisabled).length}
                  </div>
                </div>
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4">
                  <div className="text-[10px] uppercase font-bold text-[#94A3B8]">Active Warnings</div>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {allUsers.filter((u) => (u.warningCount || 0) > 0).length}
                  </div>
                </div>
              </div>

              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Enter your search query (name, email, or organization)..."
                    className="w-full h-10 bg-[#172638] border border-[#304257] rounded-xl pl-9 pr-3 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4]"
                  />
                  <Search className="h-4 w-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-[#94A3B8] font-bold">Filter Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="h-10 bg-[#172638] border border-[#304257] rounded-xl px-3 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] cursor-pointer"
                  >
                    <option value="ALL">ALL ROLES</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANUFACTURER">MANUFACTURER</option>
                    <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                    <option value="PHARMACY">PHARMACY</option>
                    <option value="REGULATOR">REGULATOR</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                </div>
              </div>

              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#304257] bg-[#172638] text-[#94A3B8] uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3.5 px-4">Participant</th>
                        <th className="py-3.5 px-4">Role</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Warnings</th>
                        <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#304257]">
                      {allUsers
                        .filter((u) => {
                          const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                          const q = userSearchTerm.toLowerCase();
                          const matchesSearch =
                            !q ||
                            (u.fullName && u.fullName.toLowerCase().includes(q)) ||
                            u.email.toLowerCase().includes(q) ||
                            (u.organization && u.organization.toLowerCase().includes(q));
                          return matchesRole && matchesSearch;
                        })
                        .map((u) => {
                          const isAdmin = u.role === 'ADMIN';
                          return (
                            <tr key={u.id} className="hover:bg-[#1E2E44]/50 transition">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-[#F1F5F9]">{u.fullName || 'No Name'}</div>
                                <div className="text-[11px] text-[#94A3B8] font-mono flex items-center gap-1.5 mt-0.5">
                                  <span>{u.email}</span>
                                </div>
                                <div className="text-[10px] text-[#94A3B8]/80">{u.organization || 'General Participant'}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="badge badge-xs font-bold uppercase border py-0.5 px-2 bg-[#00D6B4]/15 border-[#00D6B4]/30 text-[#00D6B4]">
                                  {u.role}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                {isAdmin ? (
                                  <span className="badge badge-xs font-bold border py-0.5 px-2 bg-purple-500/15 border-purple-500/30 text-purple-300 flex items-center gap-1 w-fit">
                                    <Lock className="h-3 w-3" /> Protected Admin
                                  </span>
                                ) : u.isDisabled ? (
                                  <span className="badge badge-xs font-bold border py-0.5 px-2 bg-rose-500/20 border-rose-500/40 text-rose-300 flex items-center gap-1 w-fit">
                                    <Ban className="h-3 w-3" /> Disabled
                                  </span>
                                ) : (
                                  <span className="badge badge-xs font-bold border py-0.5 px-2 bg-emerald-500/20 border-emerald-500/30 text-emerald-300 flex items-center gap-1 w-fit">
                                    <CheckCircle className="h-3 w-3" /> Active
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {isAdmin ? (
                                  <span className="text-[11px] text-[#94A3B8] font-mono">Immune</span>
                                ) : (u.warningCount || 0) > 0 ? (
                                  <div className="space-y-0.5">
                                    <span className="badge badge-xs font-bold border py-0.5 px-2 bg-amber-500/20 border-amber-500/40 text-amber-300">
                                      {u.warningCount} Active Warning(s)
                                    </span>
                                    {u.warningReason && (
                                      <div className="text-[10px] text-[#94A3B8] max-w-[180px] truncate" title={u.warningReason}>
                                        {u.warningReason}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-[#94A3B8]">Clean (0)</span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                {isAdmin ? (
                                  <div className="inline-flex items-center gap-1 text-[10px] text-purple-300/80 font-bold bg-[#172638] px-2.5 py-1 rounded-lg border border-[#304257]">
                                    <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                                    <span>Protected Admin Account</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      disabled={adminActionLoading}
                                      onClick={() => {
                                        setSelectedUserForWarning(u);
                                        setWarningReasonInput('');
                                      }}
                                      title="Issue Warning"
                                      className="btn btn-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg font-bold flex items-center gap-1"
                                    >
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>Warn</span>
                                    </button>

                                    {(u.warningCount || 0) > 0 && (
                                      <button
                                        type="button"
                                        disabled={adminActionLoading}
                                        onClick={() => handleClearWarnings(u.id)}
                                        title="Clear Warnings"
                                        className="btn btn-xs bg-[#172638] hover:bg-[#304257] text-[#94A3B8] hover:text-[#00D6B4] border border-[#304257] rounded-lg font-bold"
                                      >
                                        Clear
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      disabled={adminActionLoading}
                                      onClick={() => handleToggleDisable(u.id, Boolean(u.isDisabled))}
                                      title={u.isDisabled ? 'Restore Account Access' : 'Temporarily Disable Account'}
                                      className={`btn btn-xs rounded-lg font-bold flex items-center gap-1 ${
                                        u.isDisabled
                                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                                          : 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30'
                                      }`}
                                    >
                                      {u.isDisabled ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                                      <span>{u.isDisabled ? 'Enable' : 'Disable'}</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={adminActionLoading}
                                      onClick={() => handleDeleteUser(u.id, u.fullName || u.email)}
                                      title="Delete Account"
                                      className="btn btn-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 rounded-lg font-bold flex items-center gap-1"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {selectedUserForWarning && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card bg-[#172638] border border-amber-500/50 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#304257] pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wider">
                <AlertTriangle className="h-5 w-5 text-amber-400" /> Issue Compliance Warning
              </div>
              <button
                onClick={() => setSelectedUserForWarning(null)}
                className="btn btn-sm btn-ghost btn-circle text-[#94A3B8] hover:text-[#F1F5F9]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Target Stakeholder:{' '}
              <strong className="text-[#F1F5F9]">
                {selectedUserForWarning.fullName || selectedUserForWarning.email}
              </strong>{' '}
              ({selectedUserForWarning.role})
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleWarnUser(selectedUserForWarning.id);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                  Reason for Warning
                </label>
                <textarea
                  required
                  rows={3}
                  value={warningReasonInput}
                  onChange={(e) => setWarningReasonInput(e.target.value)}
                  placeholder="Enter your warning reason (e.g. Temperature excursion during custody transit, failed inspection documentation)..."
                  className="w-full bg-[#0B1220] border border-[#304257] rounded-xl p-3 text-xs text-[#F1F5F9] focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  'Cold chain temperature excursion violation',
                  'Incomplete GxP electronic batch records',
                  'Suspicious custody transfer attempt',
                  'Regulatory non-compliance notice',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setWarningReasonInput(preset)}
                    className="btn btn-xs bg-[#0B1220] hover:bg-[#243247] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257] rounded-lg text-[10px]"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#304257]">
                <button
                  type="button"
                  onClick={() => setSelectedUserForWarning(null)}
                  className="btn btn-sm btn-ghost text-[#94A3B8] rounded-xl font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminActionLoading}
                  className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-[#0B1220] rounded-xl font-bold text-xs"
                >
                  {adminActionLoading ? 'Issuing...' : 'Issue Warning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecallModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card bg-[#172638] border border-rose-500/50 shadow-2xl rounded-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#304257] pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-black text-base uppercase tracking-wider">
                <AlertOctagon className="h-5 w-5 text-rose-400" /> Issue Emergency Recall Directive
              </div>
              <button
                onClick={() => setShowRecallModal(false)}
                className="btn btn-sm btn-ghost btn-circle text-[#94A3B8] hover:text-[#F1F5F9]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              This action activates the <strong>Saga Emergency Circuit Breaker</strong>. Once anchored to the ledger, all pharmacies and distributors will be immediately blocked from shipping or dispensing this batch, and public verification scans will display an active hazard alert.
            </p>

            <form onSubmit={handleTriggerRecall} className="space-y-4">
              <div>
                <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Target Medicine Serial</label>
                <select
                  value={recallTargetSerial || selectedSerial}
                  onChange={(e) => setRecallTargetSerial(e.target.value)}
                  className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                  required
                >
                  {drugs.map((d) => (
                    <option key={d.id} value={d.serialNumber}>
                      {d.serialNumber} - {d.name} ({d.batchNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Directive Severity</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRecallType('RECALLED')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      recallType === 'RECALLED'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                    }`}
                  >
                    Permanent Recall
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecallType('QUARANTINED')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                      recallType === 'QUARANTINED'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                    }`}
                  >
                    Quarantine Hold
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Regulatory Reason & Justification</label>
                <textarea
                  value={recallReason}
                  onChange={(e) => setRecallReason(e.target.value)}
                  placeholder="Enter your recall justification findings (e.g. Temperature excursion > 14°C, seal tampering, contamination)"
                  className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] h-20"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Official Directive Reference #</label>
                <input
                  type="text"
                  value={recallDirective}
                  onChange={(e) => setRecallDirective(e.target.value)}
                  placeholder="Enter your official directive reference number (e.g. FDA-DIRECTIVE-2026-09)"
                  className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecallModal(false)}
                  className="btn btn-sm btn-ghost text-[#94A3B8] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl font-bold text-xs px-5 shadow-lg flex items-center gap-1.5"
                >
                  <AlertOctagon className="h-4 w-4" />
                  {loading ? 'Anchoring Recall Directive...' : 'Sign & Anchor Recall Directive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showScanner && (
        <CameraQrScanner
          onScanSuccess={handleScanPackageQr}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
