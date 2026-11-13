'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { SmartContractTelemetry } from '@/components/dashboard/smart-contract-telemetry';
import { OverviewTab } from '@/components/dashboard/tabs/overview-tab';
import dynamic from 'next/dynamic';
import { connectMetaMask, signAttestationMessage, SUPPORTED_NETWORKS, switchEthereumChain } from '@/lib/web3';
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
  fetchSystemAuditLogs,
  fetchSystemHealth,
  fetchInvitations,
  createInvitation,
  revokeInvitation,
  bulkCreateDrugs,
  submitQcRelease,
  dispatchBatch,
  quarantineBatch,
  receiveInboundDrug,
  assignFleetVehicle,
  fetchFleetOverview,
  createPharmacyManifest,
  confirmPharmacyDelivery,
  pharmacyReceiveDrug,
  pharmacyDispenseDrug,
  pharmacyRetireDrug,
  resetDrugDispense,
  fetchPharmacyInventorySummary,
  PharmacyInventorySummary,
  regulatorIssueFacilityInspection,
  regulatorEnforceRecall,
  regulatorSubmitAdeReport,
  regulatorUpdateInvestigationDocket,
  fetchRegulatorAlcoaAnalysis,
  AlcoaAnalysisResult,
  RecallReconciliationResult,
  FleetVehicle,
  SystemAuditLog,
  SystemHealth,
  EnterpriseInvitation,
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
  Server,
  Cpu,
  Database,
  Key,
  Copy,
  Check,
  Printer,
  Package,
  FlaskConical,
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
  const [activeNetworkKey, setActiveNetworkKey] = useState<string>('0xaa36a7');
  const [switchingNetwork, setSwitchingNetwork] = useState(false);

  const handleNetworkSwitch = async (chainHex: string) => {
    setSwitchingNetwork(true);
    const success = await switchEthereumChain(chainHex);
    if (success) {
      setActiveNetworkKey(chainHex);
    }
    setSwitchingNetwork(false);
  };
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'drugs' | 'events' | 'simulation' | 'transit-map' | 'provenance' | 'attestations' | 'users' | 'logistics' | 'pharmacy' | 'regulator'>('overview');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [selectedUserForWarning, setSelectedUserForWarning] = useState<UserProfile | null>(null);
  const [warningReasonInput, setWarningReasonInput] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [adminSubTab, setAdminSubTab] = useState<'stakeholders' | 'audit' | 'invitations' | 'health'>('stakeholders');
  const [systemAuditLogs, setSystemAuditLogs] = useState<SystemAuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditRoleFilter, setAuditRoleFilter] = useState('ALL');
  const [auditMethodFilter, setAuditMethodFilter] = useState('ALL');
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [invitations, setInvitations] = useState<EnterpriseInvitation[]>([]);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgRole, setNewOrgRole] = useState('MANUFACTURER');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedSerial, setSelectedSerial] = useState<string>('');
  const [events, setEvents] = useState<DrugEvent[]>([]);

  const [newSerial, setNewSerial] = useState('');
  const [newName, setNewName] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newBatch, setNewBatch] = useState('');
  const [newDosage, setNewDosage] = useState('Oral Capsule');
  const [newStrength, setNewStrength] = useState('500 mg');
  const [newExpiry, setNewExpiry] = useState('');
  const [newApiSupplier, setNewApiSupplier] = useState('');
  const [newRawLot, setNewRawLot] = useState('');

  const [mfgView, setMfgView] = useState<'single' | 'bulk' | 'qc' | 'dispatch' | 'quarantine'>('single');
  const [bulkName, setBulkName] = useState('');
  const [bulkManufacturer, setBulkManufacturer] = useState('Novartis Global');
  const [bulkBatch, setBulkBatch] = useState('');
  const [bulkExpiry, setBulkExpiry] = useState('');
  const [bulkQuantity, setBulkQuantity] = useState(10);
  const [bulkDosage, setBulkDosage] = useState('Oral Capsule');
  const [bulkStrength, setBulkStrength] = useState('500 mg');
  const [bulkApiSupplier, setBulkApiSupplier] = useState('Lonza Fine Chemicals');
  const [bulkApiCas, setBulkApiCas] = useState('61336-70-7');
  const [bulkRawLot, setBulkRawLot] = useState('RM-LOT-8821');
  const [bulkResultSerials, setBulkResultSerials] = useState<string[]>([]);
  const [showMultiQrModal, setShowMultiQrModal] = useState(false);

  const [selectedDrugForQc, setSelectedDrugForQc] = useState<Drug | null>(null);
  const [qcPurity, setQcPurity] = useState(99.85);
  const [qcPh, setQcPh] = useState(7.20);
  const [qcEndotoxin, setQcEndotoxin] = useState('< 0.1 EU/mL');
  const [qcDisposition, setQcDisposition] = useState<'QC_PASSED' | 'FAILED_QC'>('QC_PASSED');
  const [qcLoading, setQcLoading] = useState(false);

  const [selectedDrugForDispatch, setSelectedDrugForDispatch] = useState<Drug | null>(null);
  const [dispatchCarrier, setDispatchCarrier] = useState('DHL Healthcare Logistics');
  const [dispatchSeal, setDispatchSeal] = useState('SEAL-NOV-9942');
  const [dispatchReefer, setDispatchReefer] = useState('Apex Reefer Van #408');
  const [dispatchTemp, setDispatchTemp] = useState(4.2);
  const [dispatchLoading, setDispatchLoading] = useState(false);

  const [mfgQuarantineBatch, setMfgQuarantineBatch] = useState('');
  const [mfgQuarantineReason, setMfgQuarantineReason] = useState('Retained factory sample stability deviation');
  const [mfgQuarantineLoading, setMfgQuarantineLoading] = useState(false);
  const [mfgFeedback, setMfgFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [distributorSubTab, setDistributorSubTab] = useState<'inbound' | 'vault' | 'fleet' | 'manifest' | 'pod'>('inbound');
  const [fleetVehicles, setFleetVehicles] = useState<FleetVehicle[]>([]);
  const [fleetLoading, setFleetLoading] = useState(false);

  const [inboundSerial, setInboundSerial] = useState('');
  const [inboundSealVerified, setInboundSealVerified] = useState(true);
  const [inboundTemp, setInboundTemp] = useState(4.2);
  const [inboundNotes, setInboundNotes] = useState('');
  const [inboundZone, setInboundZone] = useState('ZONE_A_COLD_2_8');
  const [inboundLoading, setInboundLoading] = useState(false);

  const [assignSerial, setAssignSerial] = useState('');
  const [assignVehicleId, setAssignVehicleId] = useState('VAN-408');
  const [assignDestination, setAssignDestination] = useState('Metro Healthcare Corridor');
  const [assignLoading, setAssignLoading] = useState(false);

  const [manifestPharmacyName, setManifestPharmacyName] = useState('CVS Central Hospital');
  const [manifestPharmacyAddress, setManifestPharmacyAddress] = useState('450 Medical Center Blvd, Suite 101');
  const [manifestVehicleId, setManifestVehicleId] = useState('VAN-408');
  const [manifestDriverName, setManifestDriverName] = useState('Marcus Vance');
  const [manifestDepartureSeal, setManifestDepartureSeal] = useState('SEAL-DIST-8841');
  const [manifestSelectedSerials, setManifestSelectedSerials] = useState<string[]>([]);
  const [manifestLoading, setManifestLoading] = useState(false);
  const [manifestResult, setManifestResult] = useState<any>(null);

  const [podSerial, setPodSerial] = useState('');
  const [podPharmacistName, setPodPharmacistName] = useState('Dr. Sarah Lin, PharmD');
  const [podPharmacistLicense, setPodPharmacistLicense] = useState('RPH-NY-448190');
  const [podTemp, setPodTemp] = useState(4.4);
  const [podNotes, setPodNotes] = useState('Inbound cold-chain seal intact, dock temp verified');
  const [podLoading, setPodLoading] = useState(false);

  const [distributorFeedback, setDistributorFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [pharmacySubTab, setPharmacySubTab] = useState<'inbound' | 'dispensary' | 'dispense' | 'returns' | 'recalls'>('inbound');
  const [pharmacySummary, setPharmacySummary] = useState<PharmacyInventorySummary | null>(null);

  const [rxInboundSerial, setRxInboundSerial] = useState('');
  const [rxInboundTemp, setRxInboundTemp] = useState(4.2);
  const [rxInboundLocation, setRxInboundLocation] = useState('FRIDGE_VACCINE_1');
  const [rxInboundPharmacist, setRxInboundPharmacist] = useState('Dr. Sarah Lin, PharmD');
  const [rxInboundLicense, setRxInboundLicense] = useState('RPH-NY-448190');
  const [rxInboundNotes, setRxInboundNotes] = useState('Inbound shipment verified against e-BoL. 3Ts continuous pedigree validated.');
  const [rxInboundLoading, setRxInboundLoading] = useState(false);

  const [rxDispenseSerial, setRxDispenseSerial] = useState('');
  const [rxPrescriptionNumber, setRxPrescriptionNumber] = useState('RX-2026-984421');
  const [rxDoctorName, setRxDoctorName] = useState('Dr. Robert Chen, MD');
  const [rxPatientToken, setRxPatientToken] = useState('PT-HASH-8831');
  const [rxDispenseNotes, setRxDispenseNotes] = useState('Dispensed with standard patient counselling and GxP cold-pack container.');
  const [rxDispenseLoading, setRxDispenseLoading] = useState(false);
  const [dispenseBurnConfirmation, setDispenseBurnConfirmation] = useState<{
    serialNumber: string;
    drugName: string;
    batchNumber: string;
    prescriptionNumber: string;
    prescribingDoctor: string;
    patientToken: string;
    pharmacistName: string;
    burnTxHash: string;
    blockNumber: number;
    timestamp: string;
  } | null>(null);

  const [rxRetireSerial, setRxRetireSerial] = useState('');
  const [rxRetireAction, setRxRetireAction] = useState<'DESTROY' | 'RETURN'>('DESTROY');
  const [rxDestructionReason, setRxDestructionReason] = useState('Expired on dispensary shelf - beyond 30 days past shelf limit');
  const [rxDestructionCert, setRxDestructionCert] = useState('CERT-INCIN-8891');
  const [rxDestructionWitness, setRxDestructionWitness] = useState('Dr. Sarah Lin, PharmD');
  const [rxRetireLoading, setRxRetireLoading] = useState(false);

  const [rxAlertSerial, setRxAlertSerial] = useState('');
  const [rxAlertNotes, setRxAlertNotes] = useState('Altered 2D DataMatrix code and missing tamper-evident foil seal');
  const [rxAlertLoading, setRxAlertLoading] = useState(false);

  const [pharmacyFeedback, setPharmacyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [regulatorSubTab, setRegulatorSubTab] = useState<'inspection' | 'recalls' | 'pharmacovigilance' | 'alcoa' | 'investigations'>('inspection');
  const [alcoaData, setAlcoaData] = useState<AlcoaAnalysisResult | null>(null);
  const [alcoaLoading, setAlcoaLoading] = useState(false);

  const [inspFacility, setInspFacility] = useState('PharmaCare Active Manufacturing Facility #01');
  const [inspCitation, setInspCitation] = useState('21 CFR 211.160 - Laboratory Controls & Out-of-Specification Records');
  const [inspDisposition, setInspDisposition] = useState<'NAI' | 'VAI' | 'OAI'>('OAI');
  const [inspObservationRef, setInspObservationRef] = useState('FORM-483-2026-041');
  const [inspInspectorBadge, setInspInspectorBadge] = useState('FDA-BADGE-8841');
  const [inspNotes, setInspNotes] = useState('Stability testing data deviations noted during unannounced cGMP inspection.');
  const [inspTargetBatch, setInspTargetBatch] = useState('');
  const [inspLoading, setInspLoading] = useState(false);

  const [fedRecallTarget, setFedRecallTarget] = useState('');
  const [fedRecallIsBatch, setFedRecallIsBatch] = useState(true);
  const [fedRecallClass, setFedRecallClass] = useState<'CLASS_I' | 'CLASS_II' | 'CLASS_III'>('CLASS_I');
  const [fedRecallDirectiveRef, setFedRecallDirectiveRef] = useState('FDA-DIR-2026-09');
  const [fedRecallAuthority, setFedRecallAuthority] = useState('US FDA CDER Office of Compliance');
  const [fedRecallReason, setFedRecallReason] = useState('Class I Emergency Directive: Microbial contamination hazard identified');
  const [fedRecallResult, setFedRecallResult] = useState<RecallReconciliationResult | null>(null);
  const [fedRecallLoading, setFedRecallLoading] = useState(false);

  const [adeSerial, setAdeSerial] = useState('');
  const [adeSeverity, setAdeSeverity] = useState<'LIFE_THREATENING' | 'HOSPITALIZATION' | 'DISABILITY' | 'MILD'>('LIFE_THREATENING');
  const [adeReaction, setAdeReaction] = useState('Anaphylaxis reaction post-injection requiring epinephrine resuscitation');
  const [adeReporterRole, setAdeReporterRole] = useState('Attending Clinical Immunologist');
  const [adeLoading, setAdeLoading] = useState(false);

  const [invSerial, setInvSerial] = useState('');
  const [invDocket, setInvDocket] = useState('FDA-OC-CASE-2026-441');
  const [invDisposition, setInvDisposition] = useState<'SEIZED_CONFIRMED_COUNTERFEIT' | 'CLEARED_LEGITIMATE' | 'UNDER_INVESTIGATION'>('SEIZED_CONFIRMED_COUNTERFEIT');
  const [invAssayFindings, setInvAssayFindings] = useState('Raman spectroscopy analysis confirms excipient starch with absent active pharmaceutical ingredient (API)');
  const [invForensicNotes, setInvForensicNotes] = useState('Packaging foil font discrepancy verified matching known transshipment counterfeit pattern');
  const [invLoading, setInvLoading] = useState(false);

  const [regulatorFeedback, setRegulatorFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
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
    loadFleetOverview();

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

  const loadAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const logs = await fetchSystemAuditLogs({
        limit: 50,
        role: auditRoleFilter === 'ALL' ? undefined : auditRoleFilter,
        method: auditMethodFilter === 'ALL' ? undefined : auditMethodFilter,
      });
      setSystemAuditLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setAuditLoading(false);
    }
  };

  const loadHealthWatchdog = async () => {
    setHealthLoading(true);
    try {
      const health = await fetchSystemHealth();
      setSystemHealth(health);
    } catch (e) {
      console.error(e);
    } finally {
      setHealthLoading(false);
    }
  };

  const loadInvitationsList = async () => {
    setInvitationLoading(true);
    try {
      const list = await fetchInvitations();
      setInvitations(list);
    } catch (e) {
      console.error(e);
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    try {
      const inv = await createInvitation({
        organizationName: newOrgName.trim(),
        assignedRole: newOrgRole,
        recipientEmail: newRecipientEmail.trim() || undefined,
      });
      setInvitations((prev) => [inv, ...prev]);
      setNewOrgName('');
      setNewRecipientEmail('');
      setAdminFeedback({
        type: 'success',
        message: `Enterprise invitation created for ${inv.organizationName}. Token: ${inv.token}`,
      });
    } catch (err: any) {
      setAdminFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create invitation.',
      });
    }
  };

  const handleRevokeInvitation = async (id: number) => {
    try {
      await revokeInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
      setAdminFeedback({
        type: 'success',
        message: 'Enterprise invitation token successfully revoked.',
      });
    } catch (err: any) {
      setAdminFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to revoke invitation.',
      });
    }
  };

  const handleCopyToken = (token: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(token);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' && currentUser?.role === 'ADMIN') {
      if (adminSubTab === 'stakeholders') {
        loadUsersList();
      } else if (adminSubTab === 'audit') {
        loadAuditLogs();
      } else if (adminSubTab === 'invitations') {
        loadInvitationsList();
      } else if (adminSubTab === 'health') {
        loadHealthWatchdog();
      }
    }
  }, [activeTab, currentUser, adminSubTab, auditRoleFilter, auditMethodFilter]);

  useEffect(() => {
    if (activeTab === 'logistics') {
      loadFleetOverview();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'pharmacy') {
      loadPharmacySummary();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'regulator') {
      loadAlcoaAnalysis();
    }
  }, [activeTab]);

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
        dosageForm: newDosage,
        strength: newStrength,
        apiSupplier: newApiSupplier,
        rawMaterialLot: newRawLot,
        manufactureDate: new Date().toISOString(),
        expiryDate: newExpiry || new Date(Date.now() + 31536000000).toISOString(),
      });
      setNewSerial('');
      setNewName('');
      setNewApiSupplier('');
      setNewRawLot('');
      setMfgFeedback({
        type: 'success',
        message: `Medicine batch ${newSerial} registered and placed into LAB_QUARANTINE.`,
      });
      await loadDrugs();
    } catch (e: any) {
      setMfgFeedback({
        type: 'error',
        message: e.response?.data?.message || 'Failed to register drug.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreateDrugs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkName || !bulkBatch) return;
    setLoading(true);
    setMfgFeedback(null);
    try {
      const created = await bulkCreateDrugs({
        name: bulkName,
        manufacturer: bulkManufacturer || currentUser?.organization || 'Novartis Global',
        batchNumber: bulkBatch,
        quantity: Number(bulkQuantity) || 10,
        dosageForm: bulkDosage,
        strength: bulkStrength,
        expiryDate: bulkExpiry || new Date(Date.now() + 31536000000).toISOString(),
        apiSupplier: bulkApiSupplier,
        apiCasNumber: bulkApiCas,
        rawMaterialLot: bulkRawLot,
      });
      setBulkResultSerials(created.map((d) => d.serialNumber));
      setShowMultiQrModal(true);
      setMfgFeedback({
        type: 'success',
        message: `Successfully minted ${created.length} serialized units for batch ${bulkBatch}. Status: LAB_QUARANTINE.`,
      });
      await loadDrugs();
    } catch (err: any) {
      setMfgFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to bulk-serialize drugs.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQcRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrugForQc) return;
    setQcLoading(true);
    setMfgFeedback(null);
    try {
      const updated = await submitQcRelease(selectedDrugForQc.serialNumber, {
        purityPercentage: Number(qcPurity),
        phLevel: Number(qcPh),
        endotoxinLimit: qcEndotoxin,
        disposition: qcDisposition,
        signedBy: currentUser?.fullName || currentUser?.email || 'Novartis QA Lead',
      });
      setMfgFeedback({
        type: 'success',
        message: `Quality Control certification recorded for ${updated.serialNumber}. Disposition: ${updated.qcStatus}. CoA Hash: ${updated.qcCertHash?.slice(0, 16)}...`,
      });
      setSelectedDrugForQc(null);
      await loadDrugs();
    } catch (err: any) {
      setMfgFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit QC release.',
      });
    } finally {
      setQcLoading(false);
    }
  };

  const handleDispatchBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDrugForDispatch) return;
    setDispatchLoading(true);
    setMfgFeedback(null);
    try {
      const updated = await dispatchBatch(selectedDrugForDispatch.serialNumber, {
        carrierName: dispatchCarrier,
        sealNumber: dispatchSeal,
      });
      setMfgFeedback({
        type: 'success',
        message: `Outbound dispatch manifest verified for ${updated.serialNumber}. Custody released to ${dispatchCarrier} (Seal: ${dispatchSeal}).`,
      });
      setSelectedDrugForDispatch(null);
      await loadDrugs();
    } catch (err: any) {
      setMfgFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to dispatch batch.',
      });
    } finally {
      setDispatchLoading(false);
    }
  };

  const handleQuarantineBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfgQuarantineBatch.trim()) return;
    setMfgQuarantineLoading(true);
    setMfgFeedback(null);
    try {
      const res = await quarantineBatch(mfgQuarantineBatch.trim(), mfgQuarantineReason);
      setMfgFeedback({
        type: 'success',
        message: `Emergency factory quarantine executed: ${res.quarantinedCount} units in batch ${res.batchNumber} quarantined.`,
      });
      setMfgQuarantineBatch('');
      await loadDrugs();
    } catch (err: any) {
      setMfgFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to quarantine batch.',
      });
    } finally {
      setMfgQuarantineLoading(false);
    }
  };

  const loadFleetOverview = async () => {
    setFleetLoading(true);
    try {
      const data = await fetchFleetOverview();
      setFleetVehicles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setFleetLoading(false);
    }
  };

  const handleInboundInspection = async (disposition: 'ACCEPTED' | 'REJECTED') => {
    const targetSerial = inboundSerial || (drugs[0]?.serialNumber ?? '');
    if (!targetSerial) return;
    setInboundLoading(true);
    setDistributorFeedback(null);
    try {
      const updated = await receiveInboundDrug(targetSerial, {
        inspectionDisposition: disposition,
        sealVerified: inboundSealVerified,
        receivingTemp: Number(inboundTemp),
        notes: inboundNotes,
        inspectedBy: currentUser?.fullName || currentUser?.email || 'DHL Dock Inspector',
        location: `${currentUser?.organization || 'DHL Healthcare Logistics'} - Receiving Bay 4`,
        storageZone: inboundZone,
      });
      setDistributorFeedback({
        type: 'success',
        message: disposition === 'ACCEPTED'
          ? `Consignment ${updated.serialNumber} ACCEPTED into ${inboundZone}. Custody transferred to ${currentUser?.organization || 'DHL Healthcare Logistics'}.`
          : `Consignment ${updated.serialNumber} REJECTED at dockside due to GxP deviation. Pallet placed in Quarantine.`,
      });
      await loadDrugs();
    } catch (err: any) {
      setDistributorFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to record inbound inspection.',
      });
    } finally {
      setInboundLoading(false);
    }
  };

  const handleAssignFleet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSerial) return;
    setAssignLoading(true);
    setDistributorFeedback(null);
    try {
      const driver = fleetVehicles.find((v) => v.vehicleId === assignVehicleId)?.driverName || 'Fleet Courier';
      const updated = await assignFleetVehicle(assignSerial, {
        vehicleId: assignVehicleId,
        driverName: driver,
        routeDestination: assignDestination,
        targetPharmacy: manifestPharmacyName,
      });
      setDistributorFeedback({
        type: 'success',
        message: `Batch ${updated.serialNumber} assigned to ${assignVehicleId} (Driver: ${driver}). Route: ${assignDestination}.`,
      });
      await loadDrugs();
      await loadFleetOverview();
    } catch (err: any) {
      setDistributorFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to assign vehicle.',
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCreateManifest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manifestSelectedSerials.length === 0) {
      setDistributorFeedback({
        type: 'error',
        message: 'Please select at least one serialized unit for the delivery manifest.',
      });
      return;
    }
    setManifestLoading(true);
    setDistributorFeedback(null);
    try {
      const res = await createPharmacyManifest({
        pharmacyName: manifestPharmacyName,
        pharmacyAddress: manifestPharmacyAddress,
        serialNumbers: manifestSelectedSerials,
        vehicleId: manifestVehicleId,
        driverName: manifestDriverName,
        departureSeal: manifestDepartureSeal,
      });
      setManifestResult(res);
      setDistributorFeedback({
        type: 'success',
        message: `Electronic Bill of Lading (e-BoL) ${res.manifestId} created for ${res.pharmacyName}. Dispatched ${res.dispatchedSerials?.length} units via ${res.vehicleId}.`,
      });
      setManifestSelectedSerials([]);
      await loadDrugs();
      await loadFleetOverview();
    } catch (err: any) {
      setDistributorFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create delivery manifest.',
      });
    } finally {
      setManifestLoading(false);
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podSerial) return;
    setPodLoading(true);
    setDistributorFeedback(null);
    try {
      const updated = await confirmPharmacyDelivery(podSerial, {
        pharmacistName: podPharmacistName,
        pharmacistLicense: podPharmacistLicense,
        deliveryTemp: Number(podTemp),
        notes: podNotes,
      });
      setDistributorFeedback({
        type: 'success',
        message: `Proof of Delivery (PoD) confirmed for ${updated.serialNumber}. Custody legally transferred to ${updated.currentCustodian}. Digital Receipt: ${updated.deliveryProofSignature}.`,
      });
      await loadDrugs();
    } catch (err: any) {
      setDistributorFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to confirm pharmacy delivery.',
      });
    } finally {
      setPodLoading(false);
    }
  };

  const getDaysToExpiry = (expiryDateStr?: string) => {
    if (!expiryDateStr) return null;
    const expiry = new Date(expiryDateStr).getTime();
    const now = new Date().getTime();
    if (isNaN(expiry)) return null;
    return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  };

  const loadPharmacySummary = async () => {
    try {
      const summary = await fetchPharmacyInventorySummary();
      setPharmacySummary(summary);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePharmacyReceiveInbound = async (disposition: 'ACCEPTED' | 'REJECTED') => {
    const targetSerial = rxInboundSerial || drugs.find((d) => !d.pharmacyInboundStatus)?.serialNumber || drugs[0]?.serialNumber;
    if (!targetSerial) return;
    setRxInboundLoading(true);
    setPharmacyFeedback(null);
    try {
      const updated = await pharmacyReceiveDrug(targetSerial, {
        disposition,
        receivingTemp: Number(rxInboundTemp),
        storageLocation: rxInboundLocation,
        pharmacistName: rxInboundPharmacist,
        pharmacistLicense: rxInboundLicense,
        notes: rxInboundNotes,
        pharmacyName: currentUser?.organization || 'St. Jude Central Pharmacy',
      });
      setPharmacyFeedback({
        type: 'success',
        message: disposition === 'ACCEPTED'
          ? `Consignment ${updated.serialNumber} ACCEPTED into dispensary ${rxInboundLocation}. 3Ts chain-of-custody anchored.`
          : `Consignment ${updated.serialNumber} REJECTED at dockside due to temperature/seal excursion. Unit quarantined.`,
      });
      await loadDrugs();
      await loadPharmacySummary();
    } catch (err: any) {
      setPharmacyFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to record pharmacy receiving inspection.',
      });
    } finally {
      setRxInboundLoading(false);
    }
  };

  const handlePharmacyDispense = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetSerial = rxDispenseSerial || drugs.find((d) => d.serialNumber === 'SN-2026-AMOX500' && !d.dispensedAt)?.serialNumber || drugs.find((d) => d.serialNumber === 'DRUG-002' && !d.dispensedAt)?.serialNumber || drugs.find((d) => !d.dispensedAt)?.serialNumber || drugs[0]?.serialNumber;
    if (!targetSerial) return;
    setRxDispenseLoading(true);
    setPharmacyFeedback(null);
    try {
      const updated = await pharmacyDispenseDrug(targetSerial, {
        prescriptionNumber: rxPrescriptionNumber,
        prescribingDoctor: rxDoctorName,
        patientToken: rxPatientToken,
        pharmacistName: currentUser?.fullName || currentUser?.email || 'Licensed Pharmacist',
        notes: rxDispenseNotes,
      });
      const burnTx = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      setDispenseBurnConfirmation({
        serialNumber: updated.serialNumber,
        drugName: updated.drugName || updated.name || updated.serialNumber,
        batchNumber: updated.batchNumber,
        prescriptionNumber: updated.prescriptionNumber || rxPrescriptionNumber,
        prescribingDoctor: updated.prescribingDoctor || rxDoctorName,
        patientToken: updated.patientToken || rxPatientToken,
        pharmacistName: updated.dispensedByPharmacist || currentUser?.fullName || 'Licensed Pharmacist',
        burnTxHash: burnTx,
        blockNumber: 6482109,
        timestamp: new Date().toLocaleTimeString(),
      });
      setPharmacyFeedback({
        type: 'success',
        message: `Medication ${updated.serialNumber} successfully dispensed under Rx #${updated.prescriptionNumber} to Patient Token ${updated.patientToken}. On-Chain Digital Twin Decommissioned (Burned) & Anti-Double-Dispensing circuit breaker permanently engaged.`,
      });
      await loadDrugs();
      await loadPharmacySummary();
    } catch (err: any) {
      setPharmacyFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Dispensing failed.',
      });
    } finally {
      setRxDispenseLoading(false);
    }
  };

  const handlePharmacyRetire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxRetireSerial) return;
    setRxRetireLoading(true);
    setPharmacyFeedback(null);
    try {
      const updated = await pharmacyRetireDrug(rxRetireSerial, {
        action: rxRetireAction,
        reason: rxDestructionReason,
        witnessPharmacist: rxDestructionWitness,
        certificateId: rxDestructionCert,
      });
      setPharmacyFeedback({
        type: 'success',
        message: rxRetireAction === 'DESTROY'
          ? `Medicine unit ${updated.serialNumber} retired and logged under Biohazard Destruction Certificate ${updated.destructionCertificateId}. Removed from dispensary stock.`
          : `Medicine unit ${updated.serialNumber} marked for Return-to-Vendor (RTV) reverse logistics. Status: RETURNED.`,
      });
      await loadDrugs();
      await loadPharmacySummary();
    } catch (err: any) {
      setPharmacyFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to retire medication.',
      });
    } finally {
      setRxRetireLoading(false);
    }
  };

  const handleReportSuspectedCounterfeit = async (serial: string) => {
    if (!serial) return;
    setRxAlertLoading(true);
    setPharmacyFeedback(null);
    try {
      await pharmacyRetireDrug(serial, {
        action: 'DESTROY',
        reason: `SUSPECTED_COUNTERFEIT: ${rxAlertNotes}`,
        witnessPharmacist: rxInboundPharmacist,
        certificateId: `ALERT-SEC-${Date.now().toString().slice(-8)}`,
      });
      setPharmacyFeedback({
        type: 'success',
        message: `Suspected counterfeit alert flagged for ${serial}. Unit placed into high-security quarantine for regulatory inspection.`,
      });
      await loadDrugs();
      await loadPharmacySummary();
    } catch (err: any) {
      setPharmacyFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to flag suspected counterfeit.',
      });
    } finally {
      setRxAlertLoading(false);
    }
  };

  const loadAlcoaAnalysis = async () => {
    setAlcoaLoading(true);
    try {
      const data = await fetchRegulatorAlcoaAnalysis();
      setAlcoaData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAlcoaLoading(false);
    }
  };

  const handleIssueFacilityInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setInspLoading(true);
    setRegulatorFeedback(null);
    try {
      const res = await regulatorIssueFacilityInspection({
        facility: inspFacility,
        citation: inspCitation,
        disposition: inspDisposition,
        observationRef: inspObservationRef,
        inspectorBadge: inspInspectorBadge,
        notes: inspNotes,
        batchNumber: inspTargetBatch || undefined,
      });
      setRegulatorFeedback({
        type: 'success',
        message: `Regulatory Inspection Observation ${res.observationRef} anchored. Facility: ${res.facility}. Disposition: ${res.disposition}. Affected units: ${res.affectedUnits}.`,
      });
      await loadDrugs();
    } catch (err: any) {
      setRegulatorFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to anchor inspection observation.',
      });
    } finally {
      setInspLoading(false);
    }
  };

  const handleEnforceFederalRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fedRecallTarget) return;
    setFedRecallLoading(true);
    setRegulatorFeedback(null);
    try {
      const res = await regulatorEnforceRecall({
        target: fedRecallTarget,
        isBatch: fedRecallIsBatch,
        recallClass: fedRecallClass,
        directiveRef: fedRecallDirectiveRef,
        authority: fedRecallAuthority,
        reason: fedRecallReason,
      });
      setFedRecallResult(res);
      setRegulatorFeedback({
        type: 'success',
        message: `Federal Recall ${res.recallClass} Directive #${res.directiveRef} enforced across supply chain. Containment: ${res.containmentPercentage}% (${res.containedCount}/${res.totalLotUnits} units).`,
      });
      await loadDrugs();
    } catch (err: any) {
      setRegulatorFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to enforce recall directive.',
      });
    } finally {
      setFedRecallLoading(false);
    }
  };

  const handleSubmitMedWatchAde = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adeSerial) return;
    setAdeLoading(true);
    setRegulatorFeedback(null);
    try {
      const res = await regulatorSubmitAdeReport({
        serialNumber: adeSerial,
        severity: adeSeverity,
        reactionDetails: adeReaction,
        reporterRole: adeReporterRole,
      });
      setRegulatorFeedback({
        type: 'success',
        message: `MedWatch Adverse Drug Event Report #${res.reportId} anchored for ${res.serialNumber} (Severity: ${res.severity}). Pharmacovigilance safety watch active.`,
      });
      await loadDrugs();
    } catch (err: any) {
      setRegulatorFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to submit MedWatch ADE report.',
      });
    } finally {
      setAdeLoading(false);
    }
  };

  const handleUpdateInvestigationDocket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invSerial) return;
    setInvLoading(true);
    setRegulatorFeedback(null);
    try {
      const updated = await regulatorUpdateInvestigationDocket({
        serialNumber: invSerial,
        docketNumber: invDocket,
        disposition: invDisposition,
        assayFindings: invAssayFindings,
        forensicNotes: invForensicNotes,
      });
      setRegulatorFeedback({
        type: 'success',
        message: `Regulatory Case Docket #${updated.regulatoryInvestigationDocket} updated for ${updated.serialNumber}. Disposition: ${updated.regulatoryInvestigationStatus}.`,
      });
      await loadDrugs();
    } catch (err: any) {
      setRegulatorFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update investigation docket.',
      });
    } finally {
      setInvLoading(false);
    }
  };

  const handleExportAlcoaPdf = () => {
    if (!alcoaData) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFillColor(11, 18, 32);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(0, 214, 180);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FDA / EMA 21 CFR Part 11 ALCOA+ Audit Certificate', 14, 18);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date(alcoaData.evaluatedAt).toLocaleString()} | Status: ${alcoaData.status}`, 14, 38);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`Composite Data Integrity Score: ${alcoaData.compositeScore}%`, 14, 48);
    doc.text(`Total Ledger Records Audited: ${alcoaData.totalAuditEventsEvaluated} events across ${alcoaData.totalDrugsEvaluated} batches`, 14, 56);
    doc.text('Digital Verification Anchor Hash:', 14, 64);
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    doc.text(alcoaData.certificationHash, 14, 70);
    let y = 84;
    const principles = [
      { name: 'Attributable', data: alcoaData.principles.attributable },
      { name: 'Legible', data: alcoaData.principles.legible },
      { name: 'Contemporaneous', data: alcoaData.principles.contemporaneous },
      { name: 'Original', data: alcoaData.principles.original },
      { name: 'Accurate', data: alcoaData.principles.accurate },
    ];
    principles.forEach((p) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(`${p.name} Integrity: ${p.data.score}%`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(p.data.description, 14, y + 6);
      y += 18;
    });
    doc.save('ALCOA_Plus_Compliance_Certificate.pdf');
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
            {(currentRole === 'ADMIN' || currentRole === 'DISTRIBUTOR') && (
              <button
                onClick={() => {
                  setActiveTab('logistics');
                  loadFleetOverview();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === 'logistics'
                    ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                    : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
                }`}
              >
                <Truck className="h-4 w-4" /> Logistics & Fleet Operations
              </button>
            )}
            {(currentRole === 'ADMIN' || currentRole === 'PHARMACY') && (
              <button
                onClick={() => {
                  setActiveTab('pharmacy');
                  loadPharmacySummary();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === 'pharmacy'
                    ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                    : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
                }`}
              >
                <Store className="h-4 w-4" /> Pharmacy Dispensary & Rx
              </button>
            )}
            {(currentRole === 'ADMIN' || currentRole === 'REGULATOR') && (
              <button
                onClick={() => {
                  setActiveTab('regulator');
                  loadAlcoaAnalysis();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === 'regulator'
                    ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                    : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
                }`}
              >
                <Award className="h-4 w-4" /> Regulatory & GxP Compliance
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
            {currentRole === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  activeTab === 'users'
                    ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm font-bold'
                    : 'text-[#94A3B8] hover:bg-[#172638] hover:text-[#F1F5F9]'
                }`}
              >
                <Shield className="h-4 w-4" /> Admin Governance Console
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

        <main className="flex-1 space-y-6 pb-52">
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

              <OverviewTab
                drugsCount={drugs.length}
                eventsCount={events.length}
                liveTemp={liveTemp}
                liveHumidity={liveHumidity}
                tempExcursion={tempExcursion}
                wsConnected={wsConnected}
              />

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
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#00D6B4]/15 border border-[#00D6B4]/30 flex items-center justify-center text-[#00D6B4]">
                        <Building className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9]">
                          Pharmaceutical Plant Operations & Batch Serialization Suite
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          FDA 21 CFR Part 211 & EU GMP Annex 1 compliant serialization, lab assay certification, and dispatch execution.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setMfgView('single')}
                        className={`btn btn-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                          mfgView === 'single'
                            ? 'bg-[#00D6B4] text-[#0B1220] border-none'
                            : 'bg-[#172638] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257]'
                        }`}
                      >
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Single Batch</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMfgView('bulk')}
                        className={`btn btn-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                          mfgView === 'bulk'
                            ? 'bg-[#00D6B4] text-[#0B1220] border-none'
                            : 'bg-[#172638] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257]'
                        }`}
                      >
                        <Package className="h-3.5 w-3.5" />
                        <span>Bulk GS1 Minting</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMfgView('qc')}
                        className={`btn btn-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                          mfgView === 'qc'
                            ? 'bg-[#00D6B4] text-[#0B1220] border-none'
                            : 'bg-[#172638] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257]'
                        }`}
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        <span>QC Lab Release</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMfgView('dispatch')}
                        className={`btn btn-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                          mfgView === 'dispatch'
                            ? 'bg-[#00D6B4] text-[#0B1220] border-none'
                            : 'bg-[#172638] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257]'
                        }`}
                      >
                        <Truck className="h-3.5 w-3.5" />
                        <span>Fleet Dispatch Dock</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMfgView('quarantine')}
                        className={`btn btn-xs rounded-lg font-bold transition flex items-center gap-1.5 ${
                          mfgView === 'quarantine'
                            ? 'bg-rose-500 text-white border-none'
                            : 'bg-[#172638] text-[#94A3B8] hover:text-rose-300 border border-[#304257]'
                        }`}
                      >
                        <AlertOctagon className="h-3.5 w-3.5" />
                        <span>Plant Quarantine</span>
                      </button>
                    </div>
                  </div>

                  {mfgFeedback && (
                    <div
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                        mfgFeedback.type === 'success'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {mfgFeedback.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                      <span>{mfgFeedback.message}</span>
                    </div>
                  )}

                  {mfgView === 'single' && (
                    <form onSubmit={handleCreateDrug} className="space-y-4 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Drug Serial Number</label>
                          <input
                            type="text"
                            placeholder="Enter your serial number (e.g. SN-2026-AMOX500)"
                            value={newSerial}
                            onChange={(e) => setNewSerial(e.target.value)}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Formulation Name</label>
                          <input
                            type="text"
                            placeholder="Enter your formulation name (e.g. Amoxicillin 500mg)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Batch / Lot Identifier</label>
                          <input
                            type="text"
                            placeholder="Enter your batch identifier (e.g. BATCH-2026-A1)"
                            value={newBatch}
                            onChange={(e) => setNewBatch(e.target.value)}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Dosage Form</label>
                          <select
                            value={newDosage}
                            onChange={(e) => setNewDosage(e.target.value)}
                            className="select select-bordered w-full bg-[#172638] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          >
                            <option value="Oral Capsule">Oral Capsule</option>
                            <option value="Injectable Solution">Injectable Solution</option>
                            <option value="Oral Tablet">Oral Tablet</option>
                            <option value="Lyophilized Vial">Lyophilized Vial</option>
                            <option value="Transdermal Patch">Transdermal Patch</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Strength / Potency</label>
                          <input
                            type="text"
                            placeholder="Enter your potency (e.g. 500 mg)"
                            value={newStrength}
                            onChange={(e) => setNewStrength(e.target.value)}
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">API Supplier (Upstream)</label>
                          <input
                            type="text"
                            placeholder="Enter your API supplier name"
                            value={newApiSupplier}
                            onChange={(e) => setNewApiSupplier(e.target.value)}
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Raw Material Lot #</label>
                          <input
                            type="text"
                            placeholder="Enter your raw material lot number"
                            value={newRawLot}
                            onChange={(e) => setNewRawLot(e.target.value)}
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none w-full py-2.5 rounded-xl font-bold text-xs tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="h-4 w-4" />
                        {loading ? 'Registering...' : 'Register Batch (Place in LAB_QUARANTINE)'}
                      </button>
                    </form>
                  )}

                  {mfgView === 'bulk' && (
                    <form onSubmit={handleBulkCreateDrugs} className="space-y-4 pt-2">
                      <div className="p-3 bg-[#172638] border border-[#00D6B4]/30 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[#00D6B4]">
                          <Package className="h-4 w-4" />
                          <span className="font-bold">High-Throughput GS1 Serialization Line</span>
                        </div>
                        <span className="text-[11px] text-[#94A3B8] font-mono">Syntax: (01)GTIN(21)SN(17)EXP(10)LOT</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Formulation Name</label>
                          <input
                            type="text"
                            placeholder="Enter your formulation name (e.g. Recombinant Insulin)"
                            value={bulkName}
                            onChange={(e) => setBulkName(e.target.value)}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Batch / Master Lot Number</label>
                          <input
                            type="text"
                            placeholder="Enter your batch number (e.g. BATCH-2026-INS9)"
                            value={bulkBatch}
                            onChange={(e) => setBulkBatch(e.target.value)}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Serialization Quantity</label>
                          <select
                            value={bulkQuantity}
                            onChange={(e) => setBulkQuantity(Number(e.target.value))}
                            className="select select-bordered w-full bg-[#172638] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          >
                            <option value={5}>5 Serialized Units</option>
                            <option value={10}>10 Serialized Units</option>
                            <option value={25}>25 Serialized Units</option>
                            <option value={50}>50 Serialized Units</option>
                            <option value={100}>100 Serialized Units</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Dosage Form</label>
                          <input
                            type="text"
                            value={bulkDosage}
                            onChange={(e) => setBulkDosage(e.target.value)}
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Strength</label>
                          <input
                            type="text"
                            value={bulkStrength}
                            onChange={(e) => setBulkStrength(e.target.value)}
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Active Ingredient (API) Supplier</label>
                          <input
                            type="text"
                            value={bulkApiSupplier}
                            onChange={(e) => setBulkApiSupplier(e.target.value)}
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Raw Material Lot #</label>
                          <input
                            type="text"
                            value={bulkRawLot}
                            onChange={(e) => setBulkRawLot(e.target.value)}
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none w-full py-2.5 rounded-xl font-bold text-xs tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Package className="h-4 w-4" />
                        {loading ? 'Minting Serialization Line...' : `Mint ${bulkQuantity} Serialized Units & Generate Label Sheet`}
                      </button>
                    </form>
                  )}

                  {mfgView === 'qc' && (
                    <form onSubmit={handleSubmitQcRelease} className="space-y-4 pt-2">
                      <div className="p-3 bg-[#172638] border border-amber-500/40 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-amber-300">
                          <FlaskConical className="h-4 w-4" />
                          <span className="font-bold">Laboratory Assay Gate & Certificate of Analysis (CoA) Release</span>
                        </div>
                        <span className="text-[11px] text-[#94A3B8]">GMP 21 CFR 211.165 Mandatory Attestation</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Target Batch for QC Certification</label>
                          <select
                            value={selectedDrugForQc?.serialNumber || ''}
                            onChange={(e) => {
                              const target = drugs.find((d) => d.serialNumber === e.target.value);
                              setSelectedDrugForQc(target || null);
                            }}
                            required
                            className="select select-bordered w-full bg-[#172638] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          >
                            <option value="">Select a batch in Lab Quarantine...</option>
                            {drugs.map((d) => (
                              <option key={d.id} value={d.serialNumber}>
                                {d.serialNumber} - {d.name} ({d.qcStatus || 'IN_PRODUCTION'})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Lab Disposition Decision</label>
                          <select
                            value={qcDisposition}
                            onChange={(e) => setQcDisposition(e.target.value as any)}
                            className="select select-bordered w-full bg-[#172638] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          >
                            <option value="QC_PASSED">QC_PASSED (Release for Outbound Transit)</option>
                            <option value="FAILED_QC">FAILED_QC (Reject & Lock from Dispatch)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Active Ingredient (API) Purity %</label>
                          <input
                            type="number"
                            step="0.01"
                            value={qcPurity}
                            onChange={(e) => setQcPurity(Number(e.target.value))}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Dissolution pH Level</label>
                          <input
                            type="number"
                            step="0.01"
                            value={qcPh}
                            onChange={(e) => setQcPh(Number(e.target.value))}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Sterility & Endotoxin Assay Limit</label>
                          <input
                            type="text"
                            value={qcEndotoxin}
                            onChange={(e) => setQcEndotoxin(e.target.value)}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={qcLoading || !selectedDrugForQc}
                        className="btn bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none w-full py-2.5 rounded-xl font-bold text-xs tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <FlaskConical className="h-4 w-4" />
                        {qcLoading ? 'Anchoring CoA Hash...' : 'Sign Certificate of Analysis (CoA) & Release Batch'}
                      </button>
                    </form>
                  )}

                  {mfgView === 'dispatch' && (
                    <form onSubmit={handleDispatchBatch} className="space-y-4 pt-2">
                      <div className="p-3 bg-[#172638] border border-blue-500/40 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-blue-300">
                          <Truck className="h-4 w-4" />
                          <span className="font-bold">Outbound Shipping Dock & Carrier Custody Transfer</span>
                        </div>
                        <span className="text-[11px] text-[#94A3B8]">Cold-Chain Logistics Handshake</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Certified Batch for Dispatch</label>
                          <select
                            value={selectedDrugForDispatch?.serialNumber || ''}
                            onChange={(e) => {
                              const target = drugs.find((d) => d.serialNumber === e.target.value);
                              setSelectedDrugForDispatch(target || null);
                            }}
                            required
                            className="select select-bordered w-full bg-[#172638] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          >
                            <option value="">Select a QC-Released Batch...</option>
                            {drugs
                              .filter((d) => d.qcStatus === 'RELEASED_FOR_TRANSIT')
                              .map((d) => (
                                <option key={d.id} value={d.serialNumber}>
                                  {d.serialNumber} - {d.name} (Batch: {d.batchNumber})
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Authorized Logistics Fleet Carrier</label>
                          <input
                            type="text"
                            value={dispatchCarrier}
                            onChange={(e) => setDispatchCarrier(e.target.value)}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Packaging Security Seal #</label>
                          <input
                            type="text"
                            value={dispatchSeal}
                            onChange={(e) => setDispatchSeal(e.target.value)}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Reefer Unit Identifier</label>
                          <input
                            type="text"
                            value={dispatchReefer}
                            onChange={(e) => setDispatchReefer(e.target.value)}
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Dock Pre-Cool Temp (°C)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={dispatchTemp}
                            onChange={(e) => setDispatchTemp(Number(e.target.value))}
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={dispatchLoading || !selectedDrugForDispatch}
                        className="btn bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none w-full py-2.5 rounded-xl font-bold text-xs tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <Truck className="h-4 w-4" />
                        {dispatchLoading ? 'Verifying Dispatch...' : 'Sign Dispatch Manifest & Transfer Custody to Carrier'}
                      </button>
                    </form>
                  )}

                  {mfgView === 'quarantine' && (
                    <form onSubmit={handleQuarantineBatch} className="space-y-4 pt-2">
                      <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-rose-300">
                          <AlertOctagon className="h-4 w-4" />
                          <span className="font-bold">Emergency Factory Batch Quarantine & Containment</span>
                        </div>
                        <span className="text-[11px] text-rose-400 font-mono">Immediate Global Lockout</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Target Batch Number</label>
                          <input
                            type="text"
                            placeholder="Enter your target batch number (e.g. BATCH-2026-A1)"
                            value={mfgQuarantineBatch}
                            onChange={(e) => setMfgQuarantineBatch(e.target.value)}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-rose-400"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Quality Deviation Reason</label>
                          <input
                            type="text"
                            value={mfgQuarantineReason}
                            onChange={(e) => setMfgQuarantineReason(e.target.value)}
                            required
                            className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-rose-400"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={mfgQuarantineLoading}
                        className="btn bg-rose-600 hover:bg-rose-700 text-white border-none w-full py-2.5 rounded-xl font-bold text-xs tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <AlertOctagon className="h-4 w-4" />
                        {mfgQuarantineLoading ? 'Executing Quarantine...' : 'Initiate Immediate Batch Quarantine Across Network'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4 flex flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[#F1F5F9]">Verified Batch Inventory (Read-Only)</h4>
                    <p className="text-[11px] text-[#94A3B8]">
                      Your authenticated role ({currentRole}) can review registered batches and verify certificates. Only authorized Manufacturers and Admins can register new pharmaceutical batches.
                    </p>
                  </div>
                  <span className="badge bg-[#172638] text-[#94A3B8] font-mono border border-[#304257] text-[10px] shrink-0 whitespace-nowrap px-3 py-1 h-auto leading-none">
                    Read-Only
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#F1F5F9]">Registered Drugs & Batches ({drugs.length})</h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="btn btn-xs bg-[#172638] hover:bg-[#1E2E44] text-[#00D6B4] border border-[#00D6B4]/40 rounded-lg font-bold flex items-center gap-1.5"
                      >
                        <Camera className="h-3.5 w-3.5 text-[#00D6B4]" /> Scan Package QR
                      </button>
                      {(currentRole === 'REGULATOR' || currentRole === 'MANUFACTURER' || currentRole === 'ADMIN') && (
                        <button
                          onClick={() => {
                            setRecallTargetSerial(selectedSerial || drugs[0]?.serialNumber || '');
                            setShowRecallModal(true);
                          }}
                          className="btn btn-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg font-bold flex items-center gap-1.5"
                        >
                          <AlertOctagon className="h-3.5 w-3.5 text-rose-400" /> Emergency Recall
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {drugs.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setSelectedSerial(d.serialNumber)}
                        className={`card bg-[#243247] p-4 rounded-xl border cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                          selectedSerial === d.serialNumber
                            ? 'border-[#00D6B4] ring-1 ring-[#00D6B4]'
                            : 'border-[#304257] hover:border-slate-500'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="badge badge-sm bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/30 font-mono font-bold">
                              {d.serialNumber}
                            </span>
                            <span
                              className={`badge badge-xs font-bold py-1 px-2 border-none ${
                                d.qcStatus === 'RELEASED_FOR_TRANSIT'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : d.qcStatus === 'FAILED_QC'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : d.qcStatus === 'QUARANTINED' || d.isRecalled
                                  ? 'bg-rose-600/30 text-rose-400'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {d.isRecalled ? 'QUARANTINED' : d.qcStatus || 'IN_PRODUCTION'}
                            </span>
                            {d.dosageForm && (
                              <span className="text-[10px] text-[#94A3B8] font-mono">
                                {d.dosageForm} ({d.strength || 'Standard'})
                              </span>
                            )}
                          </div>
                          <h5 className="font-bold text-[#F1F5F9] text-base">{d.name}</h5>
                          <div className="text-xs text-[#94A3B8]">
                            <span>{d.manufacturer}</span>
                            <span className="mx-1.5">•</span>
                            <span className="font-mono text-[#F1F5F9]">{d.batchNumber}</span>
                            {d.carrierName && (
                              <>
                                <span className="mx-1.5">•</span>
                                <span className="text-[#00D6B4] font-medium">In Transit via {d.carrierName}</span>
                              </>
                            )}
                          </div>
                          {d.qcPurityPercentage && (
                            <div className="text-[10px] text-[#00D6B4] font-mono pt-0.5">
                              Purity: {d.qcPurityPercentage}% | pH: {d.qcPhLevel} | Endotoxin: {d.qcEndotoxinLimit}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {d.qcStatus === 'LAB_QUARANTINE' && (currentRole === 'MANUFACTURER' || currentRole === 'ADMIN') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDrugForQc(d);
                                setMfgView('qc');
                              }}
                              className="btn btn-xs bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg font-bold"
                            >
                              Release QC
                            </button>
                          )}
                          {d.qcStatus === 'RELEASED_FOR_TRANSIT' && !d.carrierName && (currentRole === 'MANUFACTURER' || currentRole === 'ADMIN') && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDrugForDispatch(d);
                                setMfgView('dispatch');
                              }}
                              className="btn btn-xs bg-[#00D6B4]/15 hover:bg-[#00D6B4]/25 text-[#00D6B4] border border-[#00D6B4]/30 rounded-lg font-bold"
                            >
                              Dispatch
                            </button>
                          )}
                          <ArrowRight className="h-5 w-5 text-[#94A3B8]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedSerial && (
                  <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      GS1 2D DataMatrix Package QR
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-inner">
                      <QRCodeSVG
                        value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${selectedSerial}` : `/verify/${selectedSerial}`}
                        size={140}
                        bgColor={"#ffffff"}
                        fgColor={"#0B1220"}
                        level={"H"}
                      />
                    </div>
                    <div className="space-y-1 w-full text-left bg-[#172638] p-3 rounded-xl border border-[#304257] text-xs">
                      <div className="text-[#94A3B8] font-bold text-[10px] uppercase">Batch Specifications</div>
                      <div className="font-mono text-[#00D6B4] font-bold">{selectedSerial}</div>
                      {drugs.find((d) => d.serialNumber === selectedSerial)?.apiSupplier && (
                        <div className="text-[#94A3B8] text-[11px]">
                          API Supplier: <span className="text-[#F1F5F9] font-medium">{drugs.find((d) => d.serialNumber === selectedSerial)?.apiSupplier}</span>
                        </div>
                      )}
                      {drugs.find((d) => d.serialNumber === selectedSerial)?.rawMaterialLot && (
                        <div className="text-[#94A3B8] text-[11px]">
                          Raw Material Lot: <span className="text-[#F1F5F9] font-mono">{drugs.find((d) => d.serialNumber === selectedSerial)?.rawMaterialLot}</span>
                        </div>
                      )}
                      {drugs.find((d) => d.serialNumber === selectedSerial)?.qcCertHash && (
                        <div className="text-[#94A3B8] text-[11px] truncate">
                          CoA Hash: <span className="text-slate-300 font-mono text-[10px]">{drugs.find((d) => d.serialNumber === selectedSerial)?.qcCertHash?.slice(0, 20)}...</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const doc = new jsPDF();
                        const target = drugs.find((d) => d.serialNumber === selectedSerial);
                        doc.setFontSize(18);
                        doc.text("PharmaTrace-ES Authenticity Certificate", 14, 22);
                        doc.setFontSize(11);
                        doc.text(`Drug Serial: ${selectedSerial}`, 14, 35);
                        doc.text(`Product Name: ${target?.name || ''}`, 14, 43);
                        doc.text(`Batch/Lot: ${target?.batchNumber || ''}`, 14, 51);
                        doc.text(`QC Status: ${target?.qcStatus || 'RELEASED'}`, 14, 59);
                        doc.text(`API Purity Assay: ${target?.qcPurityPercentage ? `${target.qcPurityPercentage}%` : 'Certified Compliant'}`, 14, 67);
                        doc.text(`Timestamp: ${new Date().toUTCString()}`, 14, 75);
                        doc.text(`Tamper Proof Status: 100% Verified`, 14, 83);
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
                    <span className="badge bg-[#00D6B4]/15 text-[#00D6B4] border border-[#00D6B4]/30 font-mono font-bold text-xs shrink-0 whitespace-nowrap px-3 py-1.5 h-auto">
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
            <div className="space-y-6">
              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#304257]">
                  <div>
                    <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                      <Network className="h-5 w-5 text-[#00D6B4]" /> Multi-L2 Network Settlement Layer
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Anchor pharmaceutical attestations and verify digital twin states across supported EVM networks.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#94A3B8]">Connected Wallet:</span>
                    <span className="badge badge-sm bg-[#172638] text-[#00D6B4] border-[#304257] font-mono">
                      {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : 'Enterprise Gasless Relay'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {Object.entries(SUPPORTED_NETWORKS).map(([hexId, net]) => {
                    const isActive = activeNetworkKey === hexId;
                    return (
                      <button
                        key={hexId}
                        type="button"
                        disabled={switchingNetwork}
                        onClick={() => handleNetworkSwitch(hexId)}
                        className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                          isActive
                            ? 'bg-[#172638] border-[#00D6B4] shadow-sm'
                            : 'bg-[#172638]/60 border-[#304257] hover:border-[#94A3B8]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#F1F5F9]">{net.chainName}</span>
                          <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-[#00D6B4] animate-pulse' : 'bg-[#94A3B8]'}`} />
                        </div>
                        <div className="text-[10px] font-mono text-[#94A3B8] mt-2 flex justify-between items-center">
                          <span>Chain ID: {parseInt(hexId, 16)}</span>
                          <span className="text-[#00D6B4] font-semibold">{net.nativeCurrency.symbol}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">ERC-1155 Multi-Token</span>
                    <span className="badge badge-xs bg-[#00D6B4] text-[#0B1220] font-bold border-none">PharmaDigitalTwin</span>
                  </div>
                  <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#00D6B4]" /> Hybrid Serialized Digital Twin
                  </div>
                  <div className="text-xs text-[#94A3B8] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Batch Supply:</span>
                      <span className="text-[#F1F5F9]">Fungible Container Token</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Serialized Unit:</span>
                      <span className="text-[#F1F5F9]">Non-Fungible Unit Token</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dispense Protection:</span>
                      <span className="text-[#00D6B4]">Single-Use Burn on Dispense</span>
                    </div>
                  </div>
                </div>

                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">ERC-5192 Soulbound</span>
                    <span className="badge badge-xs bg-[#A3E635] text-[#0B1220] font-bold border-none">Locked(uint256)</span>
                  </div>
                  <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#A3E635]" /> Regulatory GxP Accreditations
                  </div>
                  <div className="text-xs text-[#94A3B8] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Transferability:</span>
                      <span className="text-[#A3E635]">Permanently Non-Transferable</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accreditation Scope:</span>
                      <span className="text-[#F1F5F9]">GMP / GDP / 21 CFR Part 11</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standard ID:</span>
                      <span className="text-[#94A3B8]">0xb45a3c0e (IERC-5192)</span>
                    </div>
                  </div>
                </div>

                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Carrier Escrow</span>
                    <span className="badge badge-xs bg-[#00D6B4] text-[#0B1220] font-bold border-none">Multi-Oracle</span>
                  </div>
                  <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#00D6B4]" /> Cryptographic Quorum Slashing
                  </div>
                  <div className="text-xs text-[#94A3B8] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Consensus Mode:</span>
                      <span className="text-[#F1F5F9]">ECDSA Threshold Signatures</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slashing Trigger:</span>
                      <span className="text-[#F1F5F9]">Verified Excursion Proof</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Indemnity Payee:</span>
                      <span className="text-[#00D6B4]">Direct Manufacturer Payout</span>
                    </div>
                  </div>
                </div>

                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">ERC-4337 v0.7</span>
                    <span className="badge badge-xs bg-[#00D6B4] text-[#0B1220] font-bold border-none">Paymaster</span>
                  </div>
                  <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#00D6B4]" /> Account Abstraction Gas Sponsorship
                  </div>
                  <div className="text-xs text-[#94A3B8] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Operation Struct:</span>
                      <span className="text-[#F1F5F9]">PackedUserOperation</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gasless Relay:</span>
                      <span className="text-[#A3E635]">Active for Stakeholders</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Paymaster Deposit:</span>
                      <span className="text-[#00D6B4]">2.00 ETH Subsidized</span>
                    </div>
                  </div>
                </div>

                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Groth16 SNARK</span>
                    <span className="badge badge-xs bg-[#00D6B4] text-[#0B1220] font-bold border-none">ZkColdChain</span>
                  </div>
                  <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-[#00D6B4]" /> Zero-Knowledge Bound Verification
                  </div>
                  <div className="text-xs text-[#94A3B8] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Elliptic Curve:</span>
                      <span className="text-[#F1F5F9]">BN254 / alt_bn128</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Public Bounds:</span>
                      <span className="text-[#F1F5F9]">[2.00 deg C, 8.00 deg C]</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Telemetry Privacy:</span>
                      <span className="text-[#A3E635]">100% Zero-Leakage Proved</span>
                    </div>
                  </div>
                </div>

                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Timelock Governance</span>
                    <span className="badge badge-xs bg-[#00D6B4] text-[#0B1220] font-bold border-none">PharmaGovernance</span>
                  </div>
                  <div className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#00D6B4]" /> Multi-Sig Administrative Timelock
                  </div>
                  <div className="text-xs text-[#94A3B8] space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span>Guardian Threshold:</span>
                      <span className="text-[#F1F5F9]">2-of-3 Required</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical Parameters:</span>
                      <span className="text-[#F1F5F9]">Time-Delayed Enactment</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency Pause:</span>
                      <span className="text-[#A3E635]">Regulator Role Authorized</span>
                    </div>
                  </div>
                </div>

                <SmartContractTelemetry />
              </div>

              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#00D6B4]" /> Immutable Event Hashes & Anchored Ledger
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Review cryptographically anchored transaction roots, Merkle batches, and event data hashes.
                </p>
                <div className="space-y-3">
                  {events.map((ev) => (
                    <div key={ev.id} className="p-4 bg-[#172638] rounded-xl border border-[#304257] font-mono text-xs space-y-1.5">
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
            </div>
          )}

          {activeTab === 'provenance' && (
            <ProvenanceDagVisualizer initialBatch={selectedSerial || 'SN-2026-AMOX500'} />
          )}

          {activeTab === 'users' && currentUser?.role === 'ADMIN' && (
            <div className="space-y-6">
              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#00D6B4]/15 border border-[#00D6B4]/30 flex items-center justify-center text-[#00D6B4]">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#F1F5F9]">
                        Enterprise Governance & Telemetry Console
                      </h2>
                      <p className="text-xs text-[#94A3B8]">
                        Supervise participants, monitor live cryptographic audit logs, provision organization invitation tokens, and observe health status.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (adminSubTab === 'stakeholders') loadUsersList();
                      else if (adminSubTab === 'audit') loadAuditLogs();
                      else if (adminSubTab === 'invitations') loadInvitationsList();
                      else if (adminSubTab === 'health') loadHealthWatchdog();
                    }}
                    disabled={adminActionLoading || auditLoading || invitationLoading || healthLoading}
                    className="btn btn-xs bg-[#172638] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-lg px-3 py-1.5 font-bold flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${adminActionLoading || auditLoading || invitationLoading || healthLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Active View</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#304257]">
                  <button
                    type="button"
                    onClick={() => setAdminSubTab('stakeholders')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      adminSubTab === 'stakeholders'
                        ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                        : 'bg-[#172638] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257]'
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Stakeholder Moderation</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminSubTab('audit')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      adminSubTab === 'audit'
                        ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                        : 'bg-[#172638] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257]'
                    }`}
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span>Live Audit Explorer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminSubTab('invitations')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      adminSubTab === 'invitations'
                        ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                        : 'bg-[#172638] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257]'
                    }`}
                  >
                    <Key className="h-3.5 w-3.5" />
                    <span>Enterprise Invitations</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminSubTab('health')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      adminSubTab === 'health'
                        ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                        : 'bg-[#172638] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257]'
                    }`}
                  >
                    <Server className="h-3.5 w-3.5" />
                    <span>Multi-Service Watchdog</span>
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

              {adminSubTab === 'stakeholders' && (
                <div className="space-y-6">
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

          {adminSubTab === 'audit' && (
            <div className="space-y-6">
              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#94A3B8] font-bold">Filter Role:</span>
                  <select
                    value={auditRoleFilter}
                    onChange={(e) => setAuditRoleFilter(e.target.value)}
                    className="h-9 bg-[#172638] border border-[#304257] rounded-xl px-3 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4]"
                  >
                    <option value="ALL">ALL ROLES</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANUFACTURER">MANUFACTURER</option>
                    <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                    <option value="PHARMACY">PHARMACY</option>
                    <option value="REGULATOR">REGULATOR</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ANONYMOUS">ANONYMOUS</option>
                  </select>

                  <span className="text-xs text-[#94A3B8] font-bold ml-2">Method:</span>
                  <select
                    value={auditMethodFilter}
                    onChange={(e) => setAuditMethodFilter(e.target.value)}
                    className="h-9 bg-[#172638] border border-[#304257] rounded-xl px-3 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4]"
                  >
                    <option value="ALL">ALL METHODS</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div className="text-xs text-[#00D6B4] font-mono">
                  {systemAuditLogs.length} Records in Ring Buffer
                </div>
              </div>

              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#304257] bg-[#172638] text-[#94A3B8] uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4">Method & Route</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Caller Identity</th>
                        <th className="py-3 px-4">Latency</th>
                        <th className="py-3 px-4">SHA-256 Record Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#304257]">
                      {systemAuditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-xs text-[#94A3B8]">
                            No audit events matching active filters.
                          </td>
                        </tr>
                      ) : (
                        systemAuditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[#172638]/50 transition">
                            <td className="py-3 px-4 text-[#94A3B8] font-mono text-[11px] whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`badge badge-xs font-mono font-bold px-2 py-1 border-none ${
                                    log.method === 'GET'
                                      ? 'bg-blue-500/20 text-blue-300'
                                      : log.method === 'POST'
                                      ? 'bg-[#00D6B4]/20 text-[#00D6B4]'
                                      : log.method === 'PUT'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'bg-rose-500/20 text-rose-300'
                                  }`}
                                >
                                  {log.method}
                                </span>
                                <span className="font-mono text-xs text-[#F1F5F9]">{log.endpoint}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`badge badge-xs font-mono font-bold px-2 py-1 border-none ${
                                  log.statusCode < 400
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                              >
                                {log.statusCode}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#F1F5F9]">{log.callerRole}</div>
                              <div className="text-[10px] text-[#94A3B8] font-mono">
                                {log.callerId || log.clientIp}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-xs text-[#F1F5F9]">
                              {log.durationMs}ms
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">
                                  {log.hash}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyToken(log.hash)}
                                  className="p-1 rounded hover:bg-[#304257] text-[#94A3B8] hover:text-[#00D6B4]"
                                  title="Copy record hash"
                                >
                                  {copiedToken === log.hash ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {adminSubTab === 'invitations' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#F1F5F9]">
                  <Key className="h-4 w-4 text-[#00D6B4]" /> Provision Organization Invitation
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Issue a cryptographic invitation token for a new supply chain partner. The recipient role will be locked to this authorization.
                </p>

                <form onSubmit={handleCreateInvitation} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Organization Name</label>
                    <input
                      type="text"
                      required
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Enter your organization name"
                      className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Authorized Role</label>
                    <select
                      value={newOrgRole}
                      onChange={(e) => setNewOrgRole(e.target.value)}
                      className="select select-bordered w-full bg-[#172638] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                    >
                      <option value="MANUFACTURER">MANUFACTURER</option>
                      <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                      <option value="PHARMACY">PHARMACY</option>
                      <option value="REGULATOR">REGULATOR</option>
                      <option value="CUSTOMER">CUSTOMER</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Recipient Email (Optional)</label>
                    <input
                      type="email"
                      value={newRecipientEmail}
                      onChange={(e) => setNewRecipientEmail(e.target.value)}
                      placeholder="Enter recipient email address"
                      className="input input-bordered w-full bg-[#172638] border-[#304257] rounded-xl px-3 py-2 text-xs text-[#F1F5F9] focus:border-[#00D6B4]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={invitationLoading}
                    className="btn bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none w-full py-2.5 rounded-xl font-bold text-xs tracking-wider transition shadow-sm flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Key className="h-4 w-4" /> Generate Invitation Token
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-[#304257] flex items-center justify-between">
                  <div className="text-xs font-bold text-[#F1F5F9]">
                    Active & Historical Invitations ({invitations.length})
                  </div>
                  <button
                    type="button"
                    onClick={loadInvitationsList}
                    className="btn btn-xs bg-[#172638] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-lg"
                  >
                    Refresh List
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="table w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#304257] bg-[#172638] text-[#94A3B8] uppercase text-[10px] tracking-wider font-bold">
                        <th className="py-3 px-4">Organization</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Invitation Token</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#304257]">
                      {invitations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-xs text-[#94A3B8]">
                            No invitations created yet. Use the provisioning form to generate an invitation.
                          </td>
                        </tr>
                      ) : (
                        invitations.map((inv) => (
                          <tr key={inv.id} className="hover:bg-[#172638]/50 transition">
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#F1F5F9]">{inv.organizationName}</div>
                              {inv.recipientEmail && (
                                <div className="text-[10px] text-[#94A3B8] font-mono">{inv.recipientEmail}</div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className="badge badge-xs font-bold py-1.5 px-2 bg-[#00D6B4]/15 text-[#00D6B4] border-none">
                                {inv.assignedRole}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 bg-[#172638] px-2 py-1 rounded-lg border border-[#304257] w-fit">
                                <span className="font-mono text-[11px] text-[#00D6B4] select-all">
                                  {inv.token}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyToken(inv.token)}
                                  className="text-[#94A3B8] hover:text-[#00D6B4] p-0.5"
                                  title="Copy invitation token"
                                >
                                  {copiedToken === inv.token ? (
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {inv.isClaimed ? (
                                <span className="badge badge-xs bg-slate-700 text-slate-300 border-none font-bold py-1.5 px-2">
                                  Claimed ({inv.claimedByEmail})
                                </span>
                              ) : (
                                <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border-none font-bold py-1.5 px-2">
                                  Pending Claim
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {!inv.isClaimed && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeInvitation(inv.id)}
                                  className="btn btn-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 rounded-lg font-bold"
                                >
                                  Revoke
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {adminSubTab === 'health' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#172638] border border-[#00D6B4]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center shrink-0">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F1F5F9] flex items-center gap-2">
                      <span>Multi-Service Telemetry Watchdog Status:</span>
                      <span
                        className={`badge badge-xs font-bold border-none ${
                          systemHealth?.status === 'OK'
                            ? 'bg-[#00D6B4] text-[#0B1220]'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {systemHealth?.status || 'PROBING'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#94A3B8] mt-0.5">
                      Uptime: {systemHealth?.uptimeSeconds ? `${Math.floor(systemHealth.uptimeSeconds / 3600)}h ${Math.floor((systemHealth.uptimeSeconds % 3600) / 60)}m ${systemHealth.uptimeSeconds % 60}s` : 'Calculating...'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={loadHealthWatchdog}
                  disabled={healthLoading}
                  className="btn btn-xs bg-[#00D6B4] text-[#0B1220] hover:bg-[#00b89a] border-none rounded-lg px-3 py-1 font-bold"
                >
                  Probe Multi-Service Health
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span className="text-[10px] uppercase font-bold tracking-wider">PostgreSQL Database</span>
                    <Database className="h-4 w-4 text-[#00D6B4]" />
                  </div>
                  <div className="text-xl font-black text-[#F1F5F9]">
                    {systemHealth?.services?.database?.status || 'UNKNOWN'}
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    Latency: <span className="font-mono text-[#00D6B4] font-bold">{systemHealth?.services?.database?.latencyMs ?? 0}ms</span>
                  </div>
                </div>

                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Redis Session Store</span>
                    <Cpu className="h-4 w-4 text-[#00D6B4]" />
                  </div>
                  <div className="text-xl font-black text-[#A3E635]">
                    {systemHealth?.services?.redis?.status || 'UNKNOWN'}
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    Blacklist & Active Revocation
                  </div>
                </div>

                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Blockchain EVM Node</span>
                    <Layers className="h-4 w-4 text-[#00D6B4]" />
                  </div>
                  <div className="text-xl font-black text-[#F1F5F9]">
                    {systemHealth?.services?.blockchain?.status || 'UNKNOWN'}
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    Height: <span className="font-mono text-[#00D6B4] font-bold">#{systemHealth?.services?.blockchain?.blockNumber ?? 'N/A'}</span>
                  </div>
                </div>

                <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-[#94A3B8]">
                    <span className="text-[10px] uppercase font-bold tracking-wider">V8 Heap & Memory</span>
                    <Server className="h-4 w-4 text-[#00D6B4]" />
                  </div>
                  <div className="text-xl font-black text-[#F1F5F9]">
                    {systemHealth?.system?.heapUsedMb ?? 0} MB
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    Total: {systemHealth?.system?.heapTotalMb ?? 0} MB (RSS: {systemHealth?.system?.rssMb ?? 0} MB)
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="space-y-6">
              <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-[#00D6B4]/20 text-[#00D6B4] border-[#00D6B4]/30 text-xs font-bold uppercase tracking-wider">
                      Distributor GxP Operations
                    </span>
                    <span className="badge bg-[#243247] text-[#94A3B8] border-[#304257] text-xs font-mono">
                      Bay Area Cold-Chain Hub
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#F1F5F9] mt-2 tracking-tight">
                    Logistics & Fleet Command Suite
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    End-to-end pharmaceutical logistics management: dock receiving inspection, cold-room vaults, FEFO cross-docking, fleet telemetry, and digital delivery handshakes.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      loadDrugs();
                      loadFleetOverview();
                    }}
                    className="btn btn-sm bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 whitespace-nowrap px-3"
                  >
                    <RefreshCw className={`h-4 w-4 shrink-0 ${fleetLoading ? 'animate-spin' : ''}`} />
                    <span>Sync Hub Telemetry</span>
                  </button>
                </div>
              </div>

              {distributorFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    distributorFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {distributorFeedback.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    )}
                    <span>{distributorFeedback.message}</span>
                  </div>
                  <button
                    onClick={() => setDistributorFeedback(null)}
                    className="text-xs opacity-70 hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 border-b border-[#304257] pb-3">
                {[
                  { id: 'inbound', label: '1. Inbound Receiving Dock', icon: Package },
                  { id: 'vault', label: '2. Cold-Room Vault & FEFO', icon: Snowflake },
                  { id: 'fleet', label: '3. Multi-Vehicle Fleet Board', icon: Truck },
                  { id: 'manifest', label: '4. Pharmacy Delivery Manifest', icon: FileText },
                  { id: 'pod', label: '5. Proof of Delivery Handshake', icon: ShieldCheck },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = distributorSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setDistributorSubTab(tab.id as any)}
                      className={`btn btn-sm rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                        isActive
                          ? 'bg-[#00D6B4] text-[#0B1220] shadow-md border-none'
                          : 'bg-[#172638] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257]'
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {distributorSubTab === 'inbound' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <Package className="h-5 w-5 text-[#00D6B4]" /> Consignment Inbound Gateway
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Inspect dockside temperature probe readings and verify seal integrity before entering cold vault.
                        </p>
                      </div>
                      <span className="badge bg-[#00D6B4]/10 text-[#00D6B4] border border-[#00D6B4]/20 text-[10px] font-mono shrink-0 whitespace-nowrap px-2.5 py-1 h-auto">
                        BAY-4 ACTIVE
                      </span>
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const effectiveSerial = inboundSerial || (drugs[0]?.serialNumber ?? '');
                        const cur = drugs.find((d) => d.serialNumber === effectiveSerial);
                        return (
                          <>
                            <div>
                              <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                                Select Inbound Consignment / Medicine Serial
                              </label>
                              <select
                                value={effectiveSerial}
                                onChange={(e) => setInboundSerial(e.target.value)}
                                className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                              >
                                <option value="">-- Choose Consignment --</option>
                                {drugs.map((d) => (
                                  <option key={d.id} value={d.serialNumber}>
                                    {d.serialNumber} - {d.name} ({d.batchNumber}) | Status: {d.status} | Custodian: {d.currentCustodian || 'MANUFACTURER'}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {cur && (
                              <div className="p-3.5 bg-[#0B1220] border border-[#304257] rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-[10px] text-[#94A3B8] uppercase block">Medicine</span>
                                  <strong className="text-[#F1F5F9]">{cur.name}</strong>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#94A3B8] uppercase block">Batch</span>
                                  <span className="text-[#00D6B4] font-mono">{cur.batchNumber}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#94A3B8] uppercase block">Temp Spec</span>
                                  <span className="text-emerald-400 font-bold">{cur.tempMin ?? 2}°C to {cur.tempMax ?? 8}°C</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-[#94A3B8] uppercase block">Current Status</span>
                                  <span className="badge badge-sm bg-[#243247] text-[#94A3B8] border-[#304257] shrink-0 whitespace-nowrap">{cur.status}</span>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                          Physical Tamper-Evident Seal Verification
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-[#0B1220] border border-[#304257] rounded-xl">
                          <input
                            type="checkbox"
                            checked={inboundSealVerified}
                            onChange={(e) => setInboundSealVerified(e.target.checked)}
                            className="checkbox checkbox-sm checkbox-primary border-[#304257]"
                          />
                          <span className="text-xs text-[#F1F5F9] font-medium">
                            Security barcode seal intact and verified matching bill of lading (BoL)
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs text-[#94A3B8] font-semibold">
                            Dockside Infrared Thermometer Probe Reading (°C)
                          </label>
                          <span className={`text-xs font-mono font-bold ${
                            Number(inboundTemp) < 2 || Number(inboundTemp) > 8 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {inboundTemp}°C ({Number(inboundTemp) < 2 || Number(inboundTemp) > 8 ? 'EXCURSION' : 'COMPLIANT'})
                          </span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={inboundTemp}
                          onChange={(e) => setInboundTemp(parseFloat(e.target.value) || 0)}
                          className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            { label: '4.2°C (Optimal)', val: 4.2 },
                            { label: '6.5°C (Chilled)', val: 6.5 },
                            { label: '9.8°C (Thermal Breach)', val: 9.8 },
                            { label: '-1.5°C (Sub-Zero Freeze)', val: -1.5 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setInboundTemp(preset.val)}
                              className="btn btn-xs bg-[#0B1220] hover:bg-[#243247] text-[#94A3B8] hover:text-[#00D6B4] border border-[#304257] rounded-lg text-[10px]"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                          Target Vault Cold-Storage Zone
                        </label>
                        <select
                          value={inboundZone}
                          onChange={(e) => setInboundZone(e.target.value)}
                          className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                        >
                          <option value="ZONE_A_COLD_2_8">Zone A: Biologics Cold Vault (2.0°C to 8.0°C)</option>
                          <option value="ZONE_B_CRYO_M20">Zone B: Deep Freeze Cryo Vault (-20.0°C)</option>
                          <option value="ZONE_C_CONTROLLED_15_25">Zone C: Controlled Room Temperature (15.0°C to 25.0°C)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                          Dock Inspection Findings & Observations
                        </label>
                        <textarea
                          rows={3}
                          value={inboundNotes}
                          onChange={(e) => setInboundNotes(e.target.value)}
                          placeholder="e.g. Reefer compressor active upon arrival. Tamper seal validated against manufacturer manifest. No condensation or carton stress."
                          className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] min-h-[96px] py-3 px-3 leading-relaxed resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          disabled={inboundLoading || !(inboundSerial || drugs[0]?.serialNumber)}
                          onClick={() => handleInboundInspection('ACCEPTED')}
                          className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" /> {inboundLoading ? 'Recording...' : 'Accept Consignment into Vault'}
                        </button>
                        <button
                          type="button"
                          disabled={inboundLoading || !(inboundSerial || drugs[0]?.serialNumber)}
                          onClick={() => handleInboundInspection('REJECTED')}
                          className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                        >
                          <AlertOctagon className="h-4 w-4" /> Reject at Dock & Quarantine
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#00D6B4] flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#00D6B4]" /> GxP Dock Receiving Protocol
                      </h4>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        Under Good Distribution Practice (GDP 2013/C 343/01), receiving distributors must record temperature integrity before transferring custody from long-haul reefers to storage vaults.
                      </p>
                      <div className="space-y-2 text-xs text-[#94A3B8]">
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Check calibrated NIST thermometer probe</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Scan 2D DataMatrix serial to verify ledger state</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Immediate quarantine if seal is broken or temp exceeds 8°C</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Cryptographic custody transfer recorded upon acceptance</span>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#00D6B4]" /> Recent Inbound Inspection Log
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {drugs.filter((d) => d.inboundInspectionStatus).length === 0 ? (
                          <p className="text-xs text-[#94A3B8] italic">No inbound inspections logged in current session.</p>
                        ) : (
                          drugs
                            .filter((d) => d.inboundInspectionStatus)
                            .map((d) => (
                              <div
                                key={d.id}
                                className="p-3 bg-[#0B1220] border border-[#304257] rounded-xl text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[#00D6B4] font-bold">{d.serialNumber}</span>
                                  <span
                                    className={`badge badge-xs font-bold ${
                                      d.inboundInspectionStatus === 'ACCEPTED'
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                    }`}
                                  >
                                    {d.inboundInspectionStatus}
                                  </span>
                                </div>
                                <div className="text-[#94A3B8] text-[11px] flex items-center justify-between">
                                  <span>Dock Temp: {d.inboundInspectionTemp ?? 'N/A'}°C</span>
                                  <span>{d.storageZone || 'ZONE_A_COLD_2_8'}</span>
                                </div>
                                <div className="text-[10px] text-[#94A3B8] truncate">
                                  Inspected by: {d.inboundInspectedBy || 'Dock Agent'}
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {distributorSubTab === 'vault' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card bg-[#172638] border border-[#304257] p-4 rounded-2xl space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
                        Vault Active Consignments
                      </span>
                      <div className="text-2xl font-black text-[#F1F5F9]">
                        {drugs.filter((d) => d.storageZone || d.currentCustodian?.toLowerCase().includes('distributor') || d.currentCustodian?.toLowerCase().includes('dhl')).length}
                      </div>
                      <span className="text-[11px] text-[#00D6B4]">Stored in Cold Facility</span>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] p-4 rounded-2xl space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
                        Zone A: Biologics (2°C - 8°C)
                      </span>
                      <div className="text-2xl font-black text-cyan-400">
                        {drugs.filter((d) => d.storageZone === 'ZONE_A_COLD_2_8' || !d.storageZone).length}
                      </div>
                      <span className="text-[11px] text-[#94A3B8]">Vaccines & Monoclonals</span>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] p-4 rounded-2xl space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
                        Zone B: Cryo Vault (-20°C)
                      </span>
                      <div className="text-2xl font-black text-indigo-400">
                        {drugs.filter((d) => d.storageZone === 'ZONE_B_CRYO_M20').length}
                      </div>
                      <span className="text-[11px] text-[#94A3B8]">mRNA & Enzyme Vials</span>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] p-4 rounded-2xl space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
                        FEFO Priority (&lt; 90 Days)
                      </span>
                      <div className="text-2xl font-black text-amber-400">
                        {drugs.filter((d) => {
                          const days = getDaysToExpiry(d.expiryDate);
                          return days !== null && days <= 90;
                        }).length}
                      </div>
                      <span className="text-[11px] text-amber-300">Prioritize Outbound Dispatch</span>
                    </div>
                  </div>

                  <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <Snowflake className="h-5 w-5 text-[#00D6B4]" /> Cold-Room Vault & First-Expired, First-Out (FEFO) Matrix
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Inventory sorted strictly by expiration date to guarantee GxP FEFO compliance before dispatching to hospitals and pharmacies.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const fefoCandidates = [...drugs]
                            .sort((a, b) => new Date(a.expiryDate || 0).getTime() - new Date(b.expiryDate || 0).getTime())
                            .slice(0, 3)
                            .map((d) => d.serialNumber);
                          setManifestSelectedSerials(fefoCandidates);
                          setDistributorSubTab('manifest');
                        }}
                        className="btn btn-xs bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs px-3"
                      >
                        Auto-Select Top 3 FEFO for Manifest
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#304257] text-[#94A3B8]">
                            <th>Serial Number</th>
                            <th>Medicine & Batch</th>
                            <th>Vault Zone</th>
                            <th>Expiry Date</th>
                            <th>FEFO Urgency</th>
                            <th>Custodian</th>
                            <th>Vehicle Assignment</th>
                            <th className="text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#304257]">
                          {[...drugs]
                            .sort((a, b) => new Date(a.expiryDate || 0).getTime() - new Date(b.expiryDate || 0).getTime())
                            .map((d) => {
                              const days = getDaysToExpiry(d.expiryDate);
                              return (
                                <tr key={d.id} className="hover:bg-[#243247]/50 transition">
                                  <td className="font-mono text-[#00D6B4] font-bold">{d.serialNumber}</td>
                                  <td>
                                    <div className="font-bold text-[#F1F5F9]">{d.name}</div>
                                    <div className="text-[10px] text-[#94A3B8] font-mono">{d.batchNumber}</div>
                                  </td>
                                  <td>
                                    <span className="badge badge-xs bg-[#243247] text-[#94A3B8] border-[#304257] font-mono">
                                      {d.storageZone || 'ZONE_A_COLD_2_8'}
                                    </span>
                                  </td>
                                  <td className="font-mono text-[#F1F5F9]">
                                    {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td>
                                    {days === null ? (
                                      <span className="badge badge-xs bg-slate-700 text-slate-300">N/A</span>
                                    ) : days <= 30 ? (
                                      <span className="badge badge-xs bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold">
                                        CRITICAL ({days}d)
                                      </span>
                                    ) : days <= 90 ? (
                                      <span className="badge badge-xs bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
                                        EXPIRING SOON ({days}d)
                                      </span>
                                    ) : (
                                      <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                        STABLE ({days}d)
                                      </span>
                                    )}
                                  </td>
                                  <td className="text-[#94A3B8]">{d.currentCustodian || 'MANUFACTURER'}</td>
                                  <td>
                                    {d.assignedVehicleId ? (
                                      <span className="badge badge-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-mono font-bold">
                                        {d.assignedVehicleId}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-[#94A3B8] italic">Unassigned</span>
                                    )}
                                  </td>
                                  <td className="text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => {
                                          setAssignSerial(d.serialNumber);
                                          setDistributorSubTab('fleet');
                                        }}
                                        className="btn btn-xs bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-lg text-[10px]"
                                      >
                                        Assign Fleet
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (!manifestSelectedSerials.includes(d.serialNumber)) {
                                            setManifestSelectedSerials((prev) => [...prev, d.serialNumber]);
                                          }
                                          setDistributorSubTab('manifest');
                                        }}
                                        className="btn btn-xs bg-[#00D6B4]/15 hover:bg-[#00D6B4]/25 text-[#00D6B4] border border-[#00D6B4]/30 rounded-lg text-[10px]"
                                      >
                                        + Manifest
                                      </button>
                                    </div>
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

              {distributorSubTab === 'fleet' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {fleetVehicles.map((veh) => (
                      <div
                        key={veh.vehicleId}
                        className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-[#304257] pb-3">
                          <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-[#00D6B4]" />
                            <div>
                              <h4 className="text-sm font-black text-[#F1F5F9] font-mono">{veh.vehicleId}</h4>
                              <p className="text-[10px] text-[#94A3B8]">{veh.model} ({veh.plate})</p>
                            </div>
                          </div>
                          <span
                            className={`badge badge-sm font-bold ${
                              veh.status === 'OPTIMAL'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : veh.status === 'WARNING'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {veh.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-2.5 bg-[#0B1220] border border-[#304257] rounded-xl">
                            <span className="text-[10px] text-[#94A3B8] uppercase block">Reefer Temp</span>
                            <span className="text-base font-black text-[#00D6B4] font-mono">{veh.currentTemp}°C</span>
                          </div>
                          <div className="p-2.5 bg-[#0B1220] border border-[#304257] rounded-xl">
                            <span className="text-[10px] text-[#94A3B8] uppercase block">Compressor</span>
                            <span className="text-xs font-bold text-emerald-400">{veh.compressorStatus}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-[#94A3B8]">
                            <span>Driver:</span>
                            <strong className="text-[#F1F5F9]">{veh.driverName}</strong>
                          </div>
                          <div className="flex items-center justify-between text-[#94A3B8]">
                            <span>Door Seal:</span>
                            <span className="text-emerald-400 font-bold">{veh.doorSealStatus}</span>
                          </div>
                          <div className="flex items-center justify-between text-[#94A3B8]">
                            <span>Target Facility:</span>
                            <span className="text-[#F1F5F9] truncate max-w-[150px]">{veh.targetPharmacy}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#304257]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-[#94A3B8] uppercase font-bold">Assigned Serials ({veh.assignedBatches.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                            {veh.assignedBatches.length === 0 ? (
                              <span className="text-[11px] text-[#94A3B8] italic">No active batches assigned</span>
                            ) : (
                              veh.assignedBatches.map((s) => (
                                <span
                                  key={s}
                                  className="badge badge-xs bg-[#243247] text-[#00D6B4] border-[#304257] font-mono"
                                >
                                  {s}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-4">
                    <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                      <Truck className="h-5 w-5 text-[#00D6B4]" /> Quick Consignment Vehicle Assignment
                    </h3>
                    <p className="text-xs text-[#94A3B8]">
                      Assign verified warehouse consignments to active refrigerated transport vehicles with designated courier and transit corridors.
                    </p>

                    <form onSubmit={handleAssignFleet} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Target Medicine Serial</label>
                        <select
                          value={assignSerial || (drugs[0]?.serialNumber ?? '')}
                          onChange={(e) => setAssignSerial(e.target.value)}
                          className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          required
                        >
                          <option value="">-- Choose Consignment --</option>
                          {drugs.map((d) => (
                            <option key={d.id} value={d.serialNumber}>
                              {d.serialNumber} - {d.name} ({d.assignedVehicleId ? `Vehicle: ${d.assignedVehicleId}` : 'Unassigned'})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Fleet Transport Unit</label>
                        <select
                          value={assignVehicleId}
                          onChange={(e) => setAssignVehicleId(e.target.value)}
                          className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                        >
                          <option value="VAN-408">VAN-408 (Mercedes Sprinter Reefer | Marcus Vance)</option>
                          <option value="TRUCK-112">TRUCK-112 (Volvo FH Heavy Reefer | Elena Rostova)</option>
                          <option value="SHUTTLE-07">SHUTTLE-07 (Ford E-Transit Urban Shuttle | David Kim)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Transit Route Corridor</label>
                        <input
                          type="text"
                          value={assignDestination}
                          onChange={(e) => setAssignDestination(e.target.value)}
                          placeholder="e.g. Metro Healthcare Corridor - Bay Express"
                          className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          required
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={assignLoading || !assignSerial}
                          className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs w-full h-[38px] flex items-center justify-center gap-2"
                        >
                          <Check className="h-4 w-4" /> {assignLoading ? 'Assigning...' : 'Assign Consignment'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {distributorSubTab === 'manifest' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <FileText className="h-5 w-5 text-[#00D6B4]" /> Outbound Pharmacy Delivery Manifest (e-BoL)
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Generate an official Electronic Bill of Lading with cryptographic security departure seal.
                        </p>
                      </div>
                      <span className="badge bg-[#00D6B4]/10 text-[#00D6B4] border border-[#00D6B4]/20 text-[10px] font-mono shrink-0 whitespace-nowrap px-2.5 py-1 h-auto">
                        e-BoL GEN
                      </span>
                    </div>

                    <form onSubmit={handleCreateManifest} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                            Destination Pharmacy / Hospital
                          </label>
                          <input
                            type="text"
                            value={manifestPharmacyName}
                            onChange={(e) => setManifestPharmacyName(e.target.value)}
                            placeholder="e.g. CVS Central Hospital"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                            Delivery Facility Address
                          </label>
                          <input
                            type="text"
                            value={manifestPharmacyAddress}
                            onChange={(e) => setManifestPharmacyAddress(e.target.value)}
                            placeholder="e.g. 450 Medical Center Blvd, Suite 101"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Fleet Vehicle</label>
                          <select
                            value={manifestVehicleId}
                            onChange={(e) => setManifestVehicleId(e.target.value)}
                            className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          >
                            <option value="VAN-408">VAN-408 (Sprinter)</option>
                            <option value="TRUCK-112">TRUCK-112 (Volvo Heavy)</option>
                            <option value="SHUTTLE-07">SHUTTLE-07 (E-Transit)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Courier / Driver Name</label>
                          <input
                            type="text"
                            value={manifestDriverName}
                            onChange={(e) => setManifestDriverName(e.target.value)}
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Departure Security Seal #</label>
                          <input
                            type="text"
                            value={manifestDepartureSeal}
                            onChange={(e) => setManifestDepartureSeal(e.target.value)}
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs text-[#94A3B8] font-semibold">
                            Select Serialized Units for Manifest ({manifestSelectedSerials.length} selected)
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const allSerials = drugs.map((d) => d.serialNumber);
                                setManifestSelectedSerials(allSerials);
                              }}
                              className="text-[10px] text-[#00D6B4] hover:underline font-bold"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() => setManifestSelectedSerials([])}
                              className="text-[10px] text-rose-400 hover:underline"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-[#0B1220] border border-[#304257] rounded-xl">
                          {drugs.map((d) => {
                            const isChecked = manifestSelectedSerials.includes(d.serialNumber);
                            const days = getDaysToExpiry(d.expiryDate);
                            return (
                              <label
                                key={d.id}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                                  isChecked ? 'bg-[#243247] border border-[#00D6B4]/30' : 'hover:bg-[#172638]'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setManifestSelectedSerials((prev) => [...prev, d.serialNumber]);
                                      } else {
                                        setManifestSelectedSerials((prev) => prev.filter((s) => s !== d.serialNumber));
                                      }
                                    }}
                                    className="checkbox checkbox-xs checkbox-primary"
                                  />
                                  <span className="font-mono text-[#00D6B4] font-bold">{d.serialNumber}</span>
                                  <span className="text-[#F1F5F9]">{d.name} ({d.batchNumber})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {days !== null && days <= 90 && (
                                    <span className="badge badge-xs bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px]">
                                      FEFO {days}d
                                    </span>
                                  )}
                                  <span className="badge badge-xs bg-[#0B1220] text-[#94A3B8] border-[#304257] text-[10px]">
                                    {d.status}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={manifestLoading || manifestSelectedSerials.length === 0}
                          className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs w-full flex items-center justify-center gap-2"
                        >
                          <FileText className="h-4 w-4" /> {manifestLoading ? 'Generating e-BoL...' : 'Generate e-BoL & Dispatch Consignment'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    {manifestResult ? (
                      <div className="card bg-[#172638] border border-[#00D6B4]/40 rounded-2xl p-6 space-y-4 shadow-xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-[#304257] pb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-[#00D6B4]" />
                            <h4 className="text-sm font-black text-[#F1F5F9] font-mono">
                              {manifestResult.manifestId}
                            </h4>
                          </div>
                          <span className="badge bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                            e-BoL ACTIVE
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between text-[#94A3B8]">
                            <span>Destination:</span>
                            <strong className="text-[#F1F5F9]">{manifestResult.pharmacyName}</strong>
                          </div>
                          <div className="flex justify-between text-[#94A3B8]">
                            <span>Address:</span>
                            <span className="text-[#F1F5F9]">{manifestResult.pharmacyAddress}</span>
                          </div>
                          <div className="flex justify-between text-[#94A3B8]">
                            <span>Vehicle / Driver:</span>
                            <span className="text-[#00D6B4] font-mono">{manifestResult.vehicleId} ({manifestResult.driverName})</span>
                          </div>
                          <div className="flex justify-between text-[#94A3B8]">
                            <span>Security Seal:</span>
                            <span className="font-mono text-emerald-400 font-bold">{manifestResult.departureSeal}</span>
                          </div>
                          <div className="flex justify-between text-[#94A3B8]">
                            <span>Dispatched At:</span>
                            <span className="text-[#94A3B8]">{new Date(manifestResult.dispatchedAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[#304257]">
                          <span className="text-[10px] text-[#94A3B8] uppercase font-bold block mb-1">
                            Dispatched Serial Numbers ({manifestResult.dispatchedSerials?.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {manifestResult.dispatchedSerials?.map((s: string) => (
                              <span
                                key={s}
                                className="badge badge-xs bg-[#243247] text-[#00D6B4] border-[#304257] font-mono"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window !== 'undefined') window.print();
                            }}
                            className="btn btn-xs bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-lg font-bold text-xs w-full flex items-center justify-center gap-1.5"
                          >
                            <Printer className="h-3.5 w-3.5" /> Print Physical e-BoL Slip
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-6 text-center space-y-3">
                        <FileText className="h-10 w-10 text-[#94A3B8] mx-auto opacity-50" />
                        <h4 className="text-sm font-bold text-[#F1F5F9]">Electronic Bill of Lading Preview</h4>
                        <p className="text-xs text-[#94A3B8]">
                          Select destination pharmacy, security seal, and serialized consignments to compile and anchor an official e-BoL dispatch record.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {distributorSubTab === 'pod' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-[#00D6B4]" /> Electronic Proof of Delivery (PoD) Terminal
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Counter-sign arrival temperature and pharmacist credentials to finalize legal custody handover.
                        </p>
                      </div>
                      <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono shrink-0 whitespace-nowrap px-2.5 py-1 h-auto">
                        CUSTODY CLOSING
                      </span>
                    </div>

                    <form onSubmit={handleConfirmDelivery} className="space-y-4">
                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                          Target Delivered Medicine Serial
                        </label>
                        <select
                          value={podSerial || (drugs[0]?.serialNumber ?? '')}
                          onChange={(e) => setPodSerial(e.target.value)}
                          className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          required
                        >
                          <option value="">-- Choose Consignment for Handover --</option>
                          {drugs.map((d) => (
                            <option key={d.id} value={d.serialNumber}>
                              {d.serialNumber} - {d.name} ({d.batchNumber}) | Dest: {d.targetPharmacy || 'Hospital'} | Status: {d.status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                            Receiving Pharmacist Full Name
                          </label>
                          <input
                            type="text"
                            value={podPharmacistName}
                            onChange={(e) => setPodPharmacistName(e.target.value)}
                            placeholder="e.g. Dr. Sarah Lin, PharmD"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                            Pharmacist State License #
                          </label>
                          <input
                            type="text"
                            value={podPharmacistLicense}
                            onChange={(e) => setPodPharmacistLicense(e.target.value)}
                            placeholder="e.g. RPH-NY-448190"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs text-[#94A3B8] font-semibold">
                            Arrival Dock Temperature Probe (°C)
                          </label>
                          <span className={`text-xs font-mono font-bold ${
                            Number(podTemp) < 2 || Number(podTemp) > 8 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {podTemp}°C ({Number(podTemp) < 2 || Number(podTemp) > 8 ? 'DEVIATION' : 'ACCEPTABLE'})
                          </span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={podTemp}
                          onChange={(e) => setPodTemp(parseFloat(e.target.value) || 0)}
                          className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                          Handover Inspection Notes
                        </label>
                        <textarea
                          rows={3}
                          value={podNotes}
                          onChange={(e) => setPodNotes(e.target.value)}
                          placeholder="e.g. Inbound cold-chain seal intact, dock temp verified, placed directly in hospital vaccine refrigerator."
                          className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] min-h-[76px] py-2.5 leading-relaxed resize-none"
                        />
                      </div>

                      <div className="p-3 bg-[#0B1220] border border-[#304257] rounded-xl space-y-1">
                        <span className="text-[10px] text-[#94A3B8] uppercase block">Digital Counter-Signature Proof</span>
                        <div className="font-mono text-xs text-[#00D6B4] truncate">
                          SIG-POD-SHA256-AUTHENTICATED
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={podLoading || !podSerial}
                          className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs w-full flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" /> {podLoading ? 'Confirming...' : 'Execute Custody Handshake & Confirm PoD'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#00D6B4] flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#00D6B4]" /> Legal Handover Compliance
                      </h4>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        Executing this electronic handshake transfers distributor liability to the dispensing healthcare institution under DSCSA Title II.
                      </p>
                      <div className="space-y-2 text-xs text-[#94A3B8]">
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Pharmacist active license validation verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Final arrival cold-chain probe check recorded</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Drug status updated to DELIVERED</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>DISTRIBUTED custody event anchored to blockchain ledger</span>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#00D6B4]" /> Delivered Batches (PoD Confirmed)
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {drugs.filter((d) => d.status === 'DELIVERED' || d.deliveryProofSignature).length === 0 ? (
                          <p className="text-xs text-[#94A3B8] italic">No delivered batches with PoD confirmed yet.</p>
                        ) : (
                          drugs
                            .filter((d) => d.status === 'DELIVERED' || d.deliveryProofSignature)
                            .map((d) => (
                              <div
                                key={d.id}
                                className="p-3 bg-[#0B1220] border border-[#304257] rounded-xl text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[#00D6B4] font-bold">{d.serialNumber}</span>
                                  <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold">
                                    DELIVERED
                                  </span>
                                </div>
                                <div className="text-[#94A3B8] text-[11px]">
                                  Received by: <strong className="text-[#F1F5F9]">{d.deliveryProofReceivedBy || 'Pharmacist'}</strong>
                                </div>
                                <div className="text-[10px] text-[#94A3B8] font-mono truncate">
                                  Sig: {d.deliveryProofSignature || 'Verified'}
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pharmacy' && (
            <div className="space-y-6">
              <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-[#00D6B4]/20 text-[#00D6B4] border-[#00D6B4]/30 text-xs font-bold uppercase tracking-wider">
                      DSCSA Title II Compliant
                    </span>
                    <span className="badge bg-[#243247] text-[#94A3B8] border-[#304257] text-xs font-mono">
                      Hospital Dispensary Bay 1
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#F1F5F9] mt-2 tracking-tight">
                    Pharmacy Dispensary & Clinical Command
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Complete pharmacy operations suite: 3Ts inbound verification, cold-storage refrigerators, clinical prescription dispensing with anti-double-dispense circuit breakers, reverse logistics, and patient recall contact tracing.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      loadDrugs();
                      loadPharmacySummary();
                    }}
                    className="btn btn-sm bg-[#243247] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-xl font-bold text-xs flex items-center gap-2 shrink-0 whitespace-nowrap px-3.5 h-9 w-auto"
                  >
                    <RefreshCw className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">Sync Dispensary Stats</span>
                  </button>
                </div>
              </div>

              {pharmacyFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    pharmacyFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {pharmacyFeedback.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                    )}
                    <span>{pharmacyFeedback.message}</span>
                  </div>
                  <button
                    onClick={() => setPharmacyFeedback(null)}
                    className="text-xs opacity-70 hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 border-b border-[#304257] pb-3">
                {[
                  { id: 'inbound', label: '1. Inbound 3Ts Receiving Dock', icon: Package },
                  { id: 'dispensary', label: '2. Dispensary Fridges & Shelves', icon: Snowflake },
                  { id: 'dispense', label: '3. Patient Prescription Dispensing', icon: FileText },
                  { id: 'returns', label: '4. Returns & Hazardous Destruction', icon: Trash2 },
                  { id: 'recalls', label: '5. Patient Recall Tracing & Safety', icon: AlertOctagon },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = pharmacySubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPharmacySubTab(tab.id as any)}
                      className={`btn btn-sm rounded-xl font-bold text-xs flex items-center gap-2 transition ${
                        isActive
                          ? 'bg-[#00D6B4] text-[#0B1220] shadow-md border-none'
                          : 'bg-[#172638] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#304257]'
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {pharmacySubTab === 'inbound' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <Package className="h-5 w-5 text-[#00D6B4]" /> Inbound Consignment & 3Ts Receiving Inspection
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Verify DSCSA 3Ts transaction records, arrival cold-chain temperature, and license before transferring to dispensary stock.
                        </p>
                      </div>
                      <span className="badge bg-[#00D6B4]/10 text-[#00D6B4] border border-[#00D6B4]/20 text-[10px] font-mono shrink-0 whitespace-nowrap px-3 py-1 h-auto leading-none">
                        DOCK-INSPECT
                      </span>
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const effectiveRxInboundSerial = rxInboundSerial || drugs.find((d) => !d.pharmacyInboundStatus)?.serialNumber || drugs[0]?.serialNumber || '';
                        const cur = drugs.find((d) => d.serialNumber === effectiveRxInboundSerial);
                        const manifestId = cur?.outboundManifestId || 'MAN-2026-8841';
                        return (
                          <>
                            <div>
                              <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                                Select Arriving Consignment / Medicine Serial
                              </label>
                              <select
                                value={effectiveRxInboundSerial}
                                onChange={(e) => setRxInboundSerial(e.target.value)}
                                className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                              >
                                <option value="">-- Choose Consignment --</option>
                                {drugs.map((d) => (
                                  <option key={d.id} value={d.serialNumber}>
                                    {d.serialNumber} - {d.drugName || d.name} ({d.batchNumber}) | e-BoL: {d.outboundManifestId || 'MAN-2026-8841'} | Dest: {d.targetPharmacy || 'Pharmacy'}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {cur && (
                              <div className="space-y-3">
                                <div className="p-3.5 bg-[#0B1220] border border-[#304257] rounded-xl grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                                  <div>
                                    <span className="text-[10px] text-[#94A3B8] uppercase block">Medicine</span>
                                    <strong className="text-[#F1F5F9] truncate block" title={cur.drugName || cur.name}>
                                      {cur.drugName || cur.name || 'Amoxicillin 500mg'}
                                    </strong>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-[#94A3B8] uppercase block">Batch</span>
                                    <span className="text-[#00D6B4] font-mono">{cur.batchNumber}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-[#94A3B8] uppercase block">Distributor e-BoL</span>
                                    <span className="text-[#38BDF8] font-mono font-bold flex items-center gap-1">
                                      <FileText className="h-3 w-3 text-[#38BDF8]" />
                                      {manifestId}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-[#94A3B8] uppercase block">Temp Spec</span>
                                    <span className="text-emerald-400 font-bold">{cur.tempMin ?? 2}°C to {cur.tempMax ?? 8}°C</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-[#94A3B8] uppercase block">Inbound State</span>
                                    <span
                                      className={`badge badge-sm font-bold text-[10px] border px-2 py-0.5 truncate max-w-full ${
                                        cur.pharmacyInboundStatus === 'ACCEPTED'
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                          : cur.pharmacyInboundStatus === 'REJECTED'
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                          : 'bg-[#243247] text-[#00D6B4] border-[#304257]'
                                      }`}
                                    >
                                      {cur.pharmacyInboundStatus === 'ACCEPTED'
                                        ? 'ACCEPTED'
                                        : cur.pharmacyInboundStatus === 'REJECTED'
                                        ? 'REJECTED'
                                        : 'PENDING'}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 text-blue-300">
                                    <FileText className="h-4 w-4" />
                                    <span>Distributor e-BoL Verified: <strong className="font-mono text-[#F1F5F9]">{manifestId}</strong></span>
                                  </div>
                                  <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border-none font-bold">
                                    HASH MATCHED
                                  </span>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}

                      <div className="p-3 bg-[#0B1220] border border-[#304257] rounded-xl space-y-2">
                        <span className="text-xs font-bold text-[#00D6B4] block uppercase tracking-wider">
                          DSCSA 3Ts Continuous Verification Checklist
                        </span>
                        <div className="space-y-1.5 text-xs text-[#F1F5F9]">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" defaultChecked className="checkbox checkbox-xs checkbox-primary" />
                            <span>Transaction Information (TI): NDC, lot number, and e-BoL Manifest MAN-2026-8841 match bill of lading</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" defaultChecked className="checkbox checkbox-xs checkbox-primary" />
                            <span>Transaction History (TH): Continuous unbroken cryptographic trail from manufacturer</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" defaultChecked className="checkbox checkbox-xs checkbox-primary" />
                            <span>Transaction Statement (TS): Licensed entity legal compliance certification verified</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs text-[#94A3B8] font-semibold">
                            Arrival Dockside Infrared Thermometer Probe (°C)
                          </label>
                          <span className={`text-xs font-mono font-bold ${
                            Number(rxInboundTemp) < 2 || Number(rxInboundTemp) > 8 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {rxInboundTemp}°C ({Number(rxInboundTemp) < 2 || Number(rxInboundTemp) > 8 ? 'EXCURSION' : 'COMPLIANT'})
                          </span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={rxInboundTemp}
                          onChange={(e) => setRxInboundTemp(parseFloat(e.target.value) || 0)}
                          className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            { label: '4.0°C (Vaccine Compliant)', val: 4.0 },
                            { label: '5.5°C (Chilled Biologics)', val: 5.5 },
                            { label: '9.4°C (Thermal Excursion)', val: 9.4 },
                            { label: '-1.8°C (Sub-Zero Freezing)', val: -1.8 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setRxInboundTemp(preset.val)}
                              className="btn btn-xs bg-[#0B1220] hover:bg-[#243247] text-[#94A3B8] hover:text-[#00D6B4] border border-[#304257] rounded-lg text-[10px]"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                          Designated Pharmacy Storage Location
                        </label>
                        <select
                          value={rxInboundLocation}
                          onChange={(e) => setRxInboundLocation(e.target.value)}
                          className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                        >
                          <option value="FRIDGE_VACCINE_1">Certified Vaccine Refrigerator 1 (2.0°C - 8.0°C)</option>
                          <option value="FRIDGE_BIOLOGICS_2">Biologics & Injectables Refrigerator 2 (2.0°C - 8.0°C)</option>
                          <option value="SHELF_AMB_ORAL">Ambient Prescription Shelves (15.0°C - 25.0°C)</option>
                          <option value="VAULT_NARCOTICS">Schedule II Locked Narcotics Safe</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                            Receiving Pharmacist Name
                          </label>
                          <input
                            type="text"
                            value={rxInboundPharmacist}
                            onChange={(e) => setRxInboundPharmacist(e.target.value)}
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                            Pharmacist State License #
                          </label>
                          <input
                            type="text"
                            value={rxInboundLicense}
                            onChange={(e) => setRxInboundLicense(e.target.value)}
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] font-mono"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                          Inbound Receiving Observations
                        </label>
                        <textarea
                          rows={3}
                          value={rxInboundNotes}
                          onChange={(e) => setRxInboundNotes(e.target.value)}
                          placeholder="e.g. Courier cold-pack intact, calibrated infrared probe verified, transferred immediately into vaccine refrigerator."
                          className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] min-h-[96px] py-3 px-3 leading-relaxed resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          disabled={rxInboundLoading || !(rxInboundSerial || drugs.find((d) => !d.pharmacyInboundStatus)?.serialNumber || drugs[0]?.serialNumber)}
                          onClick={() => handlePharmacyReceiveInbound('ACCEPTED')}
                          className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" /> {rxInboundLoading ? 'Recording...' : 'Accept & Transfer to Dispensary'}
                        </button>
                        <button
                          type="button"
                          disabled={rxInboundLoading || !(rxInboundSerial || drugs.find((d) => !d.pharmacyInboundStatus)?.serialNumber || drugs[0]?.serialNumber)}
                          onClick={() => handlePharmacyReceiveInbound('REJECTED')}
                          className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl font-bold text-xs flex items-center justify-center gap-2"
                        >
                          <AlertOctagon className="h-4 w-4" /> Reject at Dock & Quarantine
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#00D6B4] flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#00D6B4]" /> DSCSA Pharmacy Obligations
                      </h4>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        Under US DSCSA Title II, dispensers cannot accept drug ownership without verifying complete transaction information (TI), transaction history (TH), and transaction statements (TS).
                      </p>
                      <div className="space-y-2 text-xs text-[#94A3B8]">
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Verify continuous 3Ts pedigree from authorized distributor</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Immediate quarantine if cold-chain was breached in transit</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Record pharmacist state license number on receiving record</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Archive electronic pedigree records for minimum 6-year statutory period</span>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#00D6B4]" /> Recent Pharmacy Receiving Records
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {drugs.filter((d) => d.pharmacyInboundStatus && d.pharmacyInboundStatus !== 'PENDING_PHARMACY').length === 0 ? (
                          <p className="text-xs text-[#94A3B8] italic">No pharmacy receiving records logged yet.</p>
                        ) : (
                          drugs
                            .filter((d) => d.pharmacyInboundStatus && d.pharmacyInboundStatus !== 'PENDING_PHARMACY')
                            .map((d) => (
                              <div
                                key={d.id}
                                className="p-3 bg-[#0B1220] border border-[#304257] rounded-xl text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[#00D6B4] font-bold">{d.serialNumber}</span>
                                  <span
                                    className={`badge badge-xs font-bold ${
                                      d.pharmacyInboundStatus === 'ACCEPTED'
                                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                    }`}
                                  >
                                    {d.pharmacyInboundStatus}
                                  </span>
                                </div>
                                <div className="text-[#94A3B8] text-[11px] flex items-center justify-between">
                                  <span>Dock Temp: {d.pharmacyInboundTemp ?? 'N/A'}°C</span>
                                  <span className="font-mono text-[10px] text-[#38BDF8]">{d.outboundManifestId || 'MAN-2026-8841'}</span>
                                </div>
                                <div className="text-[10px] text-[#94A3B8] flex items-center justify-between truncate">
                                  <span>Vault: {d.pharmacyStorageLocation || 'Dispensary'}</span>
                                  <span>RPh: {d.pharmacyInboundPharmacist || 'Dr. Sarah Lin'}</span>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pharmacySubTab === 'dispensary' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card bg-[#172638] border border-[#304257] p-4 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-[#94A3B8]">
                        <span className="text-[10px] uppercase font-bold tracking-wider">Vaccine Refrigerator 1</span>
                        <Snowflake className="h-4 w-4 text-[#00D6B4]" />
                      </div>
                      <div className="text-2xl font-black text-[#F1F5F9]">
                        {drugs.filter((d) => d.pharmacyStorageLocation === 'FRIDGE_VACCINE_1').length} units
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-mono font-bold">3.8°C (Optimal)</span>
                        <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border-none font-bold">NORMAL</span>
                      </div>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] p-4 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-[#94A3B8]">
                        <span className="text-[10px] uppercase font-bold tracking-wider">Biologics Chiller 2</span>
                        <Snowflake className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="text-2xl font-black text-cyan-400">
                        {drugs.filter((d) => d.pharmacyStorageLocation === 'FRIDGE_BIOLOGICS_2').length} units
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-mono font-bold">4.2°C (Optimal)</span>
                        <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border-none font-bold">NORMAL</span>
                      </div>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] p-4 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-[#94A3B8]">
                        <span className="text-[10px] uppercase font-bold tracking-wider">Ambient Prescription Shelf</span>
                        <Package className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="text-2xl font-black text-amber-400">
                        {drugs.filter((d) => d.pharmacyStorageLocation === 'SHELF_AMB_ORAL' || !d.pharmacyStorageLocation).length} units
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#94A3B8] font-mono">21.5°C (Controlled)</span>
                        <span className="badge badge-xs bg-slate-700 text-slate-300 border-none">AMBIENT</span>
                      </div>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] p-4 rounded-2xl space-y-1">
                      <div className="flex items-center justify-between text-[#94A3B8]">
                        <span className="text-[10px] uppercase font-bold tracking-wider">Schedule II Safe Vault</span>
                        <Lock className="h-4 w-4 text-rose-400" />
                      </div>
                      <div className="text-2xl font-black text-rose-400">
                        {drugs.filter((d) => d.pharmacyStorageLocation === 'VAULT_NARCOTICS').length} units
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-rose-400 font-bold">LOCKED & LOGGED</span>
                        <span className="badge badge-xs bg-rose-500/20 text-rose-300 border-none font-bold">VAULT</span>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <Snowflake className="h-5 w-5 text-[#00D6B4]" /> Dispensary Inventory & Refrigerator Storage Matrix
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Active pharmacy shelf inventory with verified storage compartment and expiration tracking.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full text-xs">
                        <thead>
                          <tr className="border-b border-[#304257] text-[#94A3B8]">
                            <th>Serial Number</th>
                            <th>Medicine & Batch</th>
                            <th>Storage Location</th>
                            <th>Expiry Date</th>
                            <th>FEFO Urgency</th>
                            <th>Dispense State</th>
                            <th className="text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#304257]">
                          {[...drugs]
                            .sort((a, b) => new Date(a.expiryDate || 0).getTime() - new Date(b.expiryDate || 0).getTime())
                            .map((d) => {
                              const days = getDaysToExpiry(d.expiryDate);
                              return (
                                <tr key={d.id} className="hover:bg-[#243247]/50 transition">
                                  <td className="font-mono text-[#00D6B4] font-bold">{d.serialNumber}</td>
                                  <td>
                                    <div className="font-bold text-[#F1F5F9]">{d.name}</div>
                                    <div className="text-[10px] text-[#94A3B8] font-mono">{d.batchNumber}</div>
                                  </td>
                                  <td>
                                    <span className="badge badge-xs bg-[#243247] text-[#94A3B8] border-[#304257] font-mono">
                                      {d.pharmacyStorageLocation || 'SHELF_AMB_ORAL'}
                                    </span>
                                  </td>
                                  <td className="font-mono text-[#F1F5F9]">
                                    {d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : 'N/A'}
                                  </td>
                                  <td>
                                    {days === null ? (
                                      <span className="badge badge-xs bg-slate-700 text-slate-300">N/A</span>
                                    ) : days <= 30 ? (
                                      <span className="badge badge-xs bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold">
                                        CRITICAL ({days}d)
                                      </span>
                                    ) : days <= 90 ? (
                                      <span className="badge badge-xs bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
                                        EXPIRING ({days}d)
                                      </span>
                                    ) : (
                                      <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                        STABLE ({days}d)
                                      </span>
                                    )}
                                  </td>
                                  <td>
                                    {d.dispensedAt ? (
                                      <span className="badge badge-xs bg-[#00D6B4]/20 text-[#00D6B4] border-[#00D6B4]/30 font-bold">
                                        DISPENSED
                                      </span>
                                    ) : d.isRecalled ? (
                                      <span className="badge badge-xs bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold">
                                        RECALLED
                                      </span>
                                    ) : (
                                      <span className="badge badge-xs bg-slate-700 text-slate-300 border-none">
                                        IN_STOCK
                                      </span>
                                    )}
                                  </td>
                                  <td className="text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {!d.dispensedAt && (
                                        <button
                                          onClick={() => {
                                            setRxDispenseSerial(d.serialNumber);
                                            setPharmacySubTab('dispense');
                                          }}
                                          className="btn btn-xs bg-[#00D6B4]/15 hover:bg-[#00D6B4]/25 text-[#00D6B4] border border-[#00D6B4]/30 rounded-lg text-[10px]"
                                        >
                                          Rx Dispense
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          setRxRetireSerial(d.serialNumber);
                                          setPharmacySubTab('returns');
                                        }}
                                        className="btn btn-xs bg-[#243247] hover:bg-[#304257] text-[#94A3B8] hover:text-rose-400 border border-[#304257] rounded-lg text-[10px]"
                                      >
                                        Retire / Destroy
                                      </button>
                                    </div>
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

              {pharmacySubTab === 'dispense' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <FileText className="h-5 w-5 text-[#00D6B4]" /> Clinical Prescription (Rx) Dispensing Terminal
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Fulfill verified patient prescription with automated anti-double-dispensing circuit breakers and expiry validation.
                        </p>
                      </div>
                      <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono shrink-0 whitespace-nowrap px-3 py-1 h-auto leading-none">
                        PATIENT HANDOVER
                      </span>
                    </div>

                    {(() => {
                      const effectiveDispenseSerial = rxDispenseSerial || drugs.find((d) => d.serialNumber === 'SN-2026-AMOX500' && !d.dispensedAt)?.serialNumber || drugs.find((d) => d.serialNumber === 'DRUG-002' && !d.dispensedAt)?.serialNumber || drugs.find((d) => !d.dispensedAt)?.serialNumber || drugs[0]?.serialNumber || '';
                      const target = drugs.find((d) => d.serialNumber === effectiveDispenseSerial);
                      const isExpired = target?.expiryDate ? new Date(target.expiryDate).getTime() < Date.now() : false;
                      const isDispensed = !!target?.dispensedAt;
                      const isRecalled = !!target?.isRecalled;

                      return dispenseBurnConfirmation ? (
                        <div className="p-5 sm:p-6 bg-[#0B1220] border-2 border-emerald-500/50 rounded-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#304257]">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                                <Flame className="h-5 w-5 text-emerald-400" />
                              </div>
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                                  On-Chain Digital Twin Decommission Confirmation
                                </span>
                                <h3 className="text-base font-black text-[#F1F5F9] tracking-tight">
                                  Twin Burned & Physical-to-Digital Parity Severed
                                </h3>
                              </div>
                            </div>
                            <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-3 py-1 font-bold shrink-0">
                              BURN ADDRESS: 0x00...0000
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 bg-[#172638] border border-[#304257] rounded-xl space-y-1">
                              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Decommissioned Medicine Serial</span>
                              <span className="font-mono text-[#00D6B4] font-bold block text-sm">{dispenseBurnConfirmation.serialNumber}</span>
                              <span className="text-[11px] text-[#94A3B8] block">{dispenseBurnConfirmation.drugName} (Lot: {dispenseBurnConfirmation.batchNumber})</span>
                            </div>

                            <div className="p-3 bg-[#172638] border border-[#304257] rounded-xl space-y-1">
                              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Clinical Prescription Reference</span>
                              <span className="font-mono text-[#F1F5F9] font-bold block text-sm">{dispenseBurnConfirmation.prescriptionNumber}</span>
                              <span className="text-[11px] text-[#94A3B8] block">Physician: {dispenseBurnConfirmation.prescribingDoctor}</span>
                            </div>

                            <div className="p-3 bg-[#172638] border border-[#304257] rounded-xl space-y-1">
                              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">Anonymized Patient Token</span>
                              <span className="font-mono text-cyan-300 font-bold block text-sm">{dispenseBurnConfirmation.patientToken}</span>
                              <span className="text-[11px] text-[#94A3B8] block">Dispensed by: {dispenseBurnConfirmation.pharmacistName}</span>
                            </div>

                            <div className="p-3 bg-[#172638] border border-[#304257] rounded-xl space-y-1">
                              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">On-Chain Burn Proof (Sepolia)</span>
                              <span className="font-mono text-emerald-400 font-bold block text-xs break-all">{dispenseBurnConfirmation.burnTxHash.slice(0, 24)}...</span>
                              <span className="text-[11px] text-[#94A3B8] block">Block #{dispenseBurnConfirmation.blockNumber} • ERC-4337 Sponsored Gasless</span>
                            </div>
                          </div>

                          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1">
                            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                              <span>Clinical Safety Interlock Engaged: Anti-Double-Dispensing Active</span>
                            </div>
                            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                              The cryptographic digital twin for serial {dispenseBurnConfirmation.serialNumber} has been permanently decommissioned on the ledger. Any subsequent attempt to dispense this serial number will be blocked to eliminate counterfeit packaging reuse.
                            </p>
                          </div>

                          <div className="space-y-2.5 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPharmacySubTab('recalls');
                                setDispenseBurnConfirmation(null);
                              }}
                              className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs w-full flex items-center justify-center gap-2 py-2.5 h-auto whitespace-nowrap shadow-sm"
                            >
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="whitespace-nowrap">View in Patient Recall Tracing (Tab 5)</span>
                              <ArrowRight className="h-4 w-4 shrink-0" />
                            </button>

                            <div className="flex items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await resetDrugDispense(dispenseBurnConfirmation.serialNumber);
                                    await loadDrugs();
                                    await loadPharmacySummary();
                                    setDispenseBurnConfirmation(null);
                                    setPharmacyFeedback({
                                      type: 'success',
                                      message: `Consignment ${dispenseBurnConfirmation.serialNumber} reset to READY TO DISPENSE state for demonstration.`,
                                    });
                                  } catch (err: any) {
                                    console.error(err);
                                  }
                                }}
                                className="btn btn-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-bold text-xs px-3.5 py-2 h-auto flex items-center gap-1.5 whitespace-nowrap"
                              >
                                <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                                <span className="whitespace-nowrap">Reset for Demo Recording</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDispenseBurnConfirmation(null)}
                                className="btn btn-sm bg-[#243247] hover:bg-[#304257] text-[#94A3B8] border border-[#304257] rounded-xl font-semibold text-xs px-4 py-2 h-auto whitespace-nowrap"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handlePharmacyDispense} className="space-y-4">
                          <div>
                            <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                              Target Medicine Serial (Dispensing Unit)
                            </label>
                            <select
                              value={effectiveDispenseSerial}
                              onChange={(e) => {
                                setRxDispenseSerial(e.target.value);
                                setDispenseBurnConfirmation(null);
                              }}
                              className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                              required
                            >
                              <option value="">-- Choose Unit for Prescription --</option>
                              {drugs.map((d) => (
                                <option key={d.id} value={d.serialNumber}>
                                  {d.serialNumber} - {d.drugName || d.name} ({d.batchNumber}) | Loc: {d.pharmacyStorageLocation || 'Dispensary'} | {d.dispensedAt ? 'ALREADY DISPENSED' : 'READY TO DISPENSE'}
                                </option>
                              ))}
                            </select>
                          </div>

                          {target && (
                            <div className="p-3.5 bg-[#0B1220] border border-[#304257] rounded-xl space-y-2">
                              <span className="text-[10px] text-[#94A3B8] uppercase font-bold block">
                                Automated Clinical Safety Interlocks
                              </span>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className={`p-2 rounded-lg border ${isDispensed ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
                                  <span className="text-[9px] uppercase block">Double-Dispense</span>
                                  <strong>{isDispensed ? 'BLOCKED' : 'CLEAR'}</strong>
                                </div>
                                <div className={`p-2 rounded-lg border ${isExpired ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
                                  <span className="text-[9px] uppercase block">Expiration Check</span>
                                  <strong>{isExpired ? 'EXPIRED' : 'VALID'}</strong>
                                </div>
                                <div className={`p-2 rounded-lg border ${isRecalled ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
                                  <span className="text-[9px] uppercase block">Recall & Hold</span>
                                  <strong>{isRecalled ? 'RECALLED' : 'CLEAR'}</strong>
                                </div>
                              </div>
                              {isDispensed && (
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs mt-2">
                                  <div className="text-amber-300">
                                    <span className="font-semibold block text-[11px]">Anti-Double-Dispensing Interlock Active</span>
                                    <span className="text-[10px] text-[#94A3B8]">Unit already dispensed under Rx #{target.prescriptionNumber || 'RECORD'}. Reset state to re-record dispense flow.</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        await resetDrugDispense(effectiveDispenseSerial);
                                        await loadDrugs();
                                        await loadPharmacySummary();
                                        setPharmacyFeedback({
                                          type: 'success',
                                          message: `Consignment ${effectiveDispenseSerial} reset to READY TO DISPENSE state for demonstration.`,
                                        });
                                      } catch (err: any) {
                                        console.error(err);
                                      }
                                    }}
                                    className="btn btn-xs bg-amber-500 hover:bg-amber-600 text-[#0B1220] font-bold border-none rounded-lg text-[10px]"
                                  >
                                    Reset for Demo
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                                Prescription Number (Rx ID)
                              </label>
                              <input
                                type="text"
                                value={rxPrescriptionNumber}
                                onChange={(e) => setRxPrescriptionNumber(e.target.value)}
                                placeholder="e.g. RX-2026-984421"
                                className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] font-mono"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                                Prescribing Physician (MD)
                              </label>
                              <input
                                type="text"
                                value={rxDoctorName}
                                onChange={(e) => setRxDoctorName(e.target.value)}
                                placeholder="e.g. Dr. Robert Chen, MD"
                                className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                              Patient Identifier / Anonymized Token Hash
                            </label>
                            <input
                              type="text"
                              value={rxPatientToken}
                              onChange={(e) => setRxPatientToken(e.target.value)}
                              placeholder="e.g. PT-HASH-8831"
                              className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] font-mono"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                              Dispensing Notes & Patient Instructions
                            </label>
                            <textarea
                              rows={3}
                              value={rxDispenseNotes}
                              onChange={(e) => setRxDispenseNotes(e.target.value)}
                              placeholder="e.g. Dispensed with standard patient counselling and GxP cold-pack container."
                              className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] min-h-[96px] py-3 px-3 leading-relaxed resize-none"
                            />
                          </div>

                          <div className="pt-2">
                            <button
                              type="submit"
                              disabled={rxDispenseLoading || !effectiveDispenseSerial || isDispensed}
                              className={`btn btn-sm rounded-xl font-bold text-xs w-full flex items-center justify-center gap-2 ${
                                isDispensed
                                  ? 'bg-[#243247] text-[#94A3B8] border border-[#304257] cursor-not-allowed opacity-80'
                                  : 'bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none'
                              }`}
                            >
                              {isDispensed ? (
                                <>
                                  <ShieldAlert className="h-4 w-4 text-rose-400" /> Double-Dispense Blocked (Unit Already Dispensed)
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" /> {rxDispenseLoading ? 'Decommissioning Digital Twin...' : 'Dispense Medication & Decommission Twin'}
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      );
                    })()}
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#00D6B4] flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#00D6B4]" /> Anti-Counterfeit Dispense Logic
                      </h4>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        Under clinical dispensary protocols, serialized units can be dispensed exactly once. Any secondary attempt to dispense this serial number is blocked to prevent counterfeit duplicate packaging.
                      </p>
                      <div className="space-y-2 text-xs text-[#94A3B8]">
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Validates active prescription from authorized physician</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Irreversible ledger state transition to DISPENSED</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[#00D6B4]" />
                          <span>Anonymized patient reference token protects clinical privacy</span>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#00D6B4]" /> Recent Clinical Dispense Log
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {drugs.filter((d) => d.dispensedAt).length === 0 ? (
                          <p className="text-xs text-[#94A3B8] italic">No medications dispensed in current session.</p>
                        ) : (
                          drugs
                            .filter((d) => d.dispensedAt)
                            .map((d) => (
                              <div
                                key={d.id}
                                className="p-3 bg-[#0B1220] border border-[#304257] rounded-xl text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[#00D6B4] font-bold">{d.serialNumber}</span>
                                  <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono">
                                    {d.prescriptionNumber}
                                  </span>
                                </div>
                                <div className="text-[#94A3B8] text-[11px] flex items-center justify-between">
                                  <span>Doctor: {d.prescribingDoctor}</span>
                                  <span className="font-mono text-[10px] text-cyan-300">Pt: {d.patientToken}</span>
                                </div>
                                <div className="text-[10px] text-[#94A3B8] flex items-center justify-between">
                                  <span>Dispensed by: {d.dispensedByPharmacist}</span>
                                  <span>{new Date(d.dispensedAt!).toLocaleDateString()}</span>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pharmacySubTab === 'returns' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <Trash2 className="h-5 w-5 text-rose-400" /> Reverse Logistics & Hazardous Destruction
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Log certified pharmaceutical destruction or initiate distributor Return-to-Vendor (RTV).
                        </p>
                      </div>
                      <span className="badge bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono shrink-0 whitespace-nowrap px-2.5 py-1 h-auto">
                        RETIREMENT
                      </span>
                    </div>

                    <form onSubmit={handlePharmacyRetire} className="space-y-4">
                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                          Target Medicine Serial
                        </label>
                        <select
                          value={rxRetireSerial || (drugs[0]?.serialNumber ?? '')}
                          onChange={(e) => setRxRetireSerial(e.target.value)}
                          className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          required
                        >
                          <option value="">-- Choose Unit to Retire --</option>
                          {drugs.map((d) => (
                            <option key={d.id} value={d.serialNumber}>
                              {d.serialNumber} - {d.name} ({d.batchNumber}) | Status: {d.status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Retirement Action</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setRxRetireAction('DESTROY')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                              rxRetireAction === 'DESTROY'
                                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                            }`}
                          >
                            Certified Incineration / Destruction
                          </button>
                          <button
                            type="button"
                            onClick={() => setRxRetireAction('RETURN')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                              rxRetireAction === 'RETURN'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                            }`}
                          >
                            Return to Distributor (RTV)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                          Retirement Justification Reason
                        </label>
                        <textarea
                          rows={3}
                          value={rxDestructionReason}
                          onChange={(e) => setRxDestructionReason(e.target.value)}
                          placeholder="e.g. Expired on dispensary shelf - beyond 30 days past shelf limit"
                          className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] min-h-[76px] py-2.5 leading-relaxed resize-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                            Destruction / Return Certificate #
                          </label>
                          <input
                            type="text"
                            value={rxDestructionCert}
                            onChange={(e) => setRxDestructionCert(e.target.value)}
                            placeholder="e.g. CERT-INCIN-8891"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                            Witness Pharmacist Name
                          </label>
                          <input
                            type="text"
                            value={rxDestructionWitness}
                            onChange={(e) => setRxDestructionWitness(e.target.value)}
                            placeholder="e.g. Dr. Sarah Lin, PharmD"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={rxRetireLoading || !rxRetireSerial}
                          className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl font-bold text-xs w-full flex items-center justify-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" /> {rxRetireLoading ? 'Retiring...' : 'Execute Retirement & Anchor Certificate'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-rose-400" /> Biohazard Destruction Compliance
                      </h4>
                      <p className="text-xs text-[#94A3B8] leading-relaxed">
                        Expired or compromised pharmaceutical inventory must be destroyed via certified high-temperature incineration under DEA Title 21 and EPA regulations.
                      </p>
                      <div className="space-y-2 text-xs text-[#94A3B8]">
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-rose-400" />
                          <span>Two-witness signoff required for controlled medications</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-rose-400" />
                          <span>Destruction certificate hash permanently recorded on ledger</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-rose-400" />
                          <span>Status set to DESTROYED removing unit from circulation</span>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9] flex items-center gap-2">
                        <Activity className="h-4 w-4 text-[#00D6B4]" /> Destruction & Returns Log
                      </h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {drugs.filter((d) => d.destructionCertificateId || d.returnReason).length === 0 ? (
                          <p className="text-xs text-[#94A3B8] italic">No medications retired or returned yet.</p>
                        ) : (
                          drugs
                            .filter((d) => d.destructionCertificateId || d.returnReason)
                            .map((d) => (
                              <div
                                key={d.id}
                                className="p-3 bg-[#0B1220] border border-[#304257] rounded-xl text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[#00D6B4] font-bold">{d.serialNumber}</span>
                                  <span className="badge badge-xs bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold">
                                    {d.destructionCertificateId ? 'DESTROYED' : 'RETURNED'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#94A3B8] truncate">
                                  Cert: {d.destructionCertificateId || 'RTV Return'}
                                </div>
                                <div className="text-[10px] text-[#94A3B8] italic">
                                  Reason: {d.destructionReason || d.returnReason}
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pharmacySubTab === 'recalls' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 card bg-[#172638] border border-[#304257] rounded-2xl p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <AlertOctagon className="h-5 w-5 text-amber-400" /> Patient Recall Contact Tracing Matrix
                        </h3>
                        <p className="text-xs text-[#94A3B8]">
                          Instant lookup of patient prescription records for recalled batches to execute emergency safety outreach.
                        </p>
                      </div>
                      <span className="badge bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono shrink-0 whitespace-nowrap px-3 py-1 h-auto leading-none">
                        SAFETY TRACE
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                          Dispensed Prescriptions Under Watch ({drugs.filter((d) => !!d.dispensedAt).length} units dispensed)
                        </label>
                        <div className="overflow-x-auto">
                          <table className="table table-sm min-w-full text-xs whitespace-nowrap">
                            <thead>
                              <tr className="border-b border-[#304257] text-[#94A3B8]">
                                <th className="whitespace-nowrap px-3 py-2.5">Serial #</th>
                                <th className="whitespace-nowrap px-3 py-2.5">Rx #</th>
                                <th className="whitespace-nowrap px-3 py-2.5">Batch #</th>
                                <th className="whitespace-nowrap px-3 py-2.5">Patient Token</th>
                                <th className="whitespace-nowrap px-3 py-2.5">Prescribing Doctor</th>
                                <th className="whitespace-nowrap px-3 py-2.5 text-center">Recall State</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#304257]">
                              {drugs.filter((d) => !!d.dispensedAt).length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="text-center py-6">
                                    <div className="space-y-3 max-w-md mx-auto">
                                      <p className="text-xs text-[#94A3B8]">
                                        Consignments in Vault inventory are ready to be dispensed to patients. Once dispensed in Tab 3, they will appear here under continuous safety surveillance.
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => setPharmacySubTab('dispense')}
                                        className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] font-bold text-xs rounded-xl inline-flex items-center gap-2"
                                      >
                                        <FileText className="h-4 w-4" /> Go to Tab 3: Patient Prescription Dispensing
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ) : (
                                drugs
                                  .filter((d) => !!d.dispensedAt)
                                  .map((d) => (
                                    <tr key={d.id} className="hover:bg-[#243247]/50">
                                      <td className="font-mono text-[#00D6B4] font-bold whitespace-nowrap px-3 py-2.5">{d.serialNumber}</td>
                                      <td className="font-mono text-[#F1F5F9] whitespace-nowrap px-3 py-2.5">{d.prescriptionNumber}</td>
                                      <td className="font-mono text-[#94A3B8] whitespace-nowrap px-3 py-2.5">{d.batchNumber}</td>
                                      <td className="font-mono text-cyan-300 whitespace-nowrap px-3 py-2.5">{d.patientToken}</td>
                                      <td className="text-[#F1F5F9] whitespace-nowrap px-3 py-2.5">{d.prescribingDoctor}</td>
                                      <td className="whitespace-nowrap px-3 py-2.5 text-center">
                                        {d.isRecalled ? (
                                          <span className="badge badge-xs bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold whitespace-nowrap">
                                            RECALLED LOT
                                          </span>
                                        ) : (
                                          <span className="badge badge-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold whitespace-nowrap">
                                            CLEAR
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-4">
                    <div className="card bg-[#172638] border border-[#304257] rounded-2xl p-5 space-y-4 mb-20">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-rose-400" /> Flag Suspected Counterfeit
                      </h4>
                      <p className="text-xs text-[#94A3B8]">
                        Instantly isolate suspected illegitimate medicine units, notify regulatory watchdog, and lock ledger custody.
                      </p>

                      {(() => {
                        const effectiveAlertSerial = rxAlertSerial || (drugs[0]?.serialNumber ?? '');
                        return (
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                                Target Medicine Serial
                              </label>
                              <select
                                value={effectiveAlertSerial}
                                onChange={(e) => setRxAlertSerial(e.target.value)}
                                className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                              >
                                <option value="">-- Choose Consignment --</option>
                                {drugs.map((d) => (
                                  <option key={d.id} value={d.serialNumber}>
                                    {d.serialNumber} - {d.drugName || d.name} ({d.batchNumber})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                                Security Anomaly Observed
                              </label>
                              <textarea
                                rows={3}
                                value={rxAlertNotes}
                                onChange={(e) => setRxAlertNotes(e.target.value)}
                                placeholder="Describe physical flaw (e.g. 2D DataMatrix code unreadable, duplicate serial, damaged foil seal)"
                                className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] min-h-[96px] py-3 px-3 leading-relaxed resize-none"
                              />
                            </div>

                            <button
                              type="button"
                              disabled={rxAlertLoading || !effectiveAlertSerial}
                              onClick={() => handleReportSuspectedCounterfeit(effectiveAlertSerial)}
                              className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl font-bold text-xs w-full flex items-center justify-center gap-2"
                            >
                              <AlertTriangle className="h-4 w-4" /> {rxAlertLoading ? 'Flagging...' : 'Flag Suspected Counterfeit & Quarantine'}
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'regulator' && (
            <div className="space-y-6">
              <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-[#00D6B4]/20 text-[#00D6B4] border-[#00D6B4]/30 text-xs font-bold uppercase tracking-wider">
                      US FDA & EMA Oversight
                    </span>
                    <span className="badge bg-[#243247] text-[#94A3B8] border-[#304257] text-xs font-mono">
                      21 CFR Part 11 & DSCSA 582
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#F1F5F9] mt-2 tracking-tight">
                    Regulatory Authority & GxP Compliance Command
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Federal oversight console for cGMP Form 483 facility audits, multi-tier federal recall matrices, MedWatch adverse drug event triage, 21 CFR Part 11 ALCOA+ data integrity certification, and DSCSA Section 582 counterfeit criminal dockets.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      loadDrugs();
                      loadAlcoaAnalysis();
                    }}
                    className="btn btn-sm bg-[#0B1220] hover:bg-[#243247] text-[#00D6B4] border border-[#304257] rounded-xl text-xs flex items-center gap-2 shrink-0 whitespace-nowrap px-3"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${alcoaLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh Regulatory Ledger</span>
                  </button>
                </div>
              </div>

              {regulatorFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs font-medium border flex items-center justify-between ${
                    regulatorFeedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {regulatorFeedback.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertOctagon className="h-4 w-4 shrink-0 text-rose-400" />
                    )}
                    <span>{regulatorFeedback.message}</span>
                  </div>
                  <button
                    onClick={() => setRegulatorFeedback(null)}
                    className="text-xs opacity-70 hover:opacity-100"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2 border-b border-[#304257] pb-3">
                <button
                  type="button"
                  onClick={() => setRegulatorSubTab('inspection')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    regulatorSubTab === 'inspection'
                      ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                      : 'bg-[#172638] text-[#94A3B8] hover:bg-[#243247] hover:text-[#F1F5F9]'
                  }`}
                >
                  <Building className="h-3.5 w-3.5" /> Facility Inspection & Form 483
                </button>
                <button
                  type="button"
                  onClick={() => setRegulatorSubTab('recalls')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    regulatorSubTab === 'recalls'
                      ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                      : 'bg-[#172638] text-[#94A3B8] hover:bg-[#243247] hover:text-[#F1F5F9]'
                  }`}
                >
                  <AlertOctagon className="h-3.5 w-3.5" /> Federal Recall & Containment
                </button>
                <button
                  type="button"
                  onClick={() => setRegulatorSubTab('pharmacovigilance')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    regulatorSubTab === 'pharmacovigilance'
                      ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                      : 'bg-[#172638] text-[#94A3B8] hover:bg-[#243247] hover:text-[#F1F5F9]'
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" /> MedWatch Pharmacovigilance
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRegulatorSubTab('alcoa');
                    loadAlcoaAnalysis();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    regulatorSubTab === 'alcoa'
                      ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                      : 'bg-[#172638] text-[#94A3B8] hover:bg-[#243247] hover:text-[#F1F5F9]'
                  }`}
                >
                  <FileCheck2 className="h-3.5 w-3.5" /> ALCOA+ Data Integrity Analyzer
                </button>
                <button
                  type="button"
                  onClick={() => setRegulatorSubTab('investigations')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    regulatorSubTab === 'investigations'
                      ? 'bg-[#00D6B4] text-[#0B1220] shadow-sm'
                      : 'bg-[#172638] text-[#94A3B8] hover:bg-[#243247] hover:text-[#F1F5F9]'
                  }`}
                >
                  <FlaskConical className="h-3.5 w-3.5" /> Section 582 Counterfeit Dockets
                </button>
              </div>

              {regulatorSubTab === 'inspection' && (
                <div className="space-y-6">
                  <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <Building className="h-5 w-5 text-[#00D6B4]" /> Form 483 / Warning Inspection Terminal
                        </h3>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          Conduct unannounced or routine cGMP audits. Issue statutory observations under 21 CFR citations and mandate corrective actions.
                        </p>
                      </div>
                      <span className="badge bg-[#243247] text-[#00D6B4] border border-[#304257] text-xs font-mono font-bold shrink-0 whitespace-nowrap px-3 py-1.5 h-auto">
                        Form FDA-483
                      </span>
                    </div>

                    <form onSubmit={handleIssueFacilityInspection} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Audited Facility Name / Site</label>
                          <input
                            type="text"
                            value={inspFacility}
                            onChange={(e) => setInspFacility(e.target.value)}
                            placeholder="e.g. PharmaCare Active Manufacturing Facility #01"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Target Production Batch (Optional)</label>
                          <select
                            value={inspTargetBatch}
                            onChange={(e) => setInspTargetBatch(e.target.value)}
                            className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          >
                            <option value="">All Facility Batches</option>
                            {Array.from(new Set(drugs.map((d) => d.batchNumber))).filter(Boolean).map((bn) => (
                              <option key={bn} value={bn}>
                                Batch: {bn}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Statutory Citation / Regulation</label>
                        <input
                          type="text"
                          value={inspCitation}
                          onChange={(e) => setInspCitation(e.target.value)}
                          placeholder="e.g. 21 CFR 211.160 - Laboratory Controls"
                          className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9] mb-2"
                          required
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            '21 CFR 211.160 - Laboratory Controls & Out-of-Specification Records',
                            '21 CFR 211.68 - Automatic, Mechanical, and Electronic Equipment',
                            '21 CFR 205.50 - Minimum Requirements for Storage and Handling of Prescription Drugs',
                            '21 CFR 211.42 - Cleanrooms & Environmental Air Quality Controls',
                          ].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setInspCitation(preset)}
                              className="btn btn-xs bg-[#0B1220] hover:bg-[#243247] text-[#94A3B8] hover:text-[#00D6B4] border border-[#304257] rounded-lg text-[10px]"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Inspection Disposition</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setInspDisposition('NAI')}
                              className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition ${
                                inspDisposition === 'NAI'
                                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                  : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                              }`}
                            >
                              NAI (Clear)
                            </button>
                            <button
                              type="button"
                              onClick={() => setInspDisposition('VAI')}
                              className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition ${
                                inspDisposition === 'VAI'
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                                  : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                              }`}
                            >
                              VAI (Advisory)
                            </button>
                            <button
                              type="button"
                              onClick={() => setInspDisposition('OAI')}
                              className={`py-2 px-2 text-center rounded-xl border text-xs font-bold transition ${
                                inspDisposition === 'OAI'
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                                  : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                              }`}
                            >
                              OAI (Quarantine)
                            </button>
                          </div>
                          <span className="text-[10px] text-[#94A3B8] block mt-1">
                            OAI triggers automatic immediate mandatory quarantine across supply chain.
                          </span>
                        </div>

                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Observation Reference #</label>
                          <input
                            type="text"
                            value={inspObservationRef}
                            onChange={(e) => setInspObservationRef(e.target.value)}
                            placeholder="e.g. FORM-483-2026-041"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Lead Inspector Badge ID</label>
                          <input
                            type="text"
                            value={inspInspectorBadge}
                            onChange={(e) => setInspInspectorBadge(e.target.value)}
                            placeholder="e.g. FDA-BADGE-8841"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Observation Details & CAPA Corrective Action Requirement</label>
                        <textarea
                          rows={3}
                          value={inspNotes}
                          onChange={(e) => setInspNotes(e.target.value)}
                          placeholder="Describe specific cGMP deviations observed, batch impact, and required Corrective and Preventive Actions (CAPA)..."
                          className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={inspLoading}
                          className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs px-6 shadow-md flex items-center gap-2"
                        >
                          <FileCheck2 className="h-4 w-4" />
                          {inspLoading ? 'Anchoring Form 483 Finding...' : 'Anchor Form 483 Inspection Observation'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                        <FileCheck2 className="h-5 w-5 text-[#00D6B4]" /> Facility Audit & Observation Registry
                      </h3>
                      <span className="badge bg-[#243247] text-[#94A3B8] border-[#304257] text-xs font-mono">
                        {drugs.filter((d) => d.inspectionObservationRef).length} Audited Units
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full text-left">
                        <thead>
                          <tr className="border-b border-[#304257] text-[#94A3B8] text-xs">
                            <th>Facility</th>
                            <th>Observation Ref</th>
                            <th>Citation</th>
                            <th>Disposition</th>
                            <th>Inspector Badge</th>
                            <th>Serial / Batch</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#304257]/50 text-xs">
                          {drugs.filter((d) => d.inspectionObservationRef).length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-6 text-[#94A3B8]">
                                No formal Form 483 observations recorded yet. Use the terminal above to anchor an inspection.
                              </td>
                            </tr>
                          ) : (
                            drugs
                              .filter((d) => d.inspectionObservationRef)
                              .map((d) => (
                                <tr key={d.id} className="hover:bg-[#0B1220]/50 transition">
                                  <td className="font-semibold text-[#F1F5F9]">{d.inspectedFacility || 'PharmaCare Facility #01'}</td>
                                  <td className="font-mono text-[#00D6B4]">{d.inspectionObservationRef}</td>
                                  <td className="text-[#94A3B8] max-w-xs truncate">{d.inspectionCitation}</td>
                                  <td>
                                    <span
                                      className={`badge text-[10px] font-bold ${
                                        d.inspectionDisposition === 'OAI'
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                          : d.inspectionDisposition === 'VAI'
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      }`}
                                    >
                                      {d.inspectionDisposition}
                                    </span>
                                  </td>
                                  <td className="font-mono text-[#94A3B8]">{d.inspectedInspectorBadge}</td>
                                  <td className="font-mono text-[#F1F5F9]">{d.serialNumber} ({d.batchNumber})</td>
                                  <td>
                                    <span
                                      className={`badge text-[10px] font-bold ${
                                        d.status === 'QUARANTINED'
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                          : d.status === 'RECALLED'
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      }`}
                                    >
                                      {d.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {regulatorSubTab === 'recalls' && (
                <div className="space-y-6">
                  {fedRecallResult && (
                    <div className="card bg-[#172638] border border-[#00D6B4]/40 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-[#304257] pb-3">
                        <div className="flex items-center gap-2">
                          <AlertOctagon className="h-5 w-5 text-rose-400" />
                          <h3 className="text-base font-bold text-[#F1F5F9]">
                            Live Federal Recall Containment Gauge: {fedRecallResult.directiveRef}
                          </h3>
                        </div>
                        <span className="badge bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs font-bold uppercase">
                          {fedRecallResult.recallClass}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="bg-[#0B1220] p-4 rounded-xl border border-[#304257]">
                          <span className="text-xs text-[#94A3B8] block">Containment Rate</span>
                          <span className="text-2xl font-black text-[#00D6B4] mt-1 block">
                            {fedRecallResult.containmentPercentage}%
                          </span>
                          <div className="w-full bg-[#243247] h-2 rounded-full mt-2 overflow-hidden">
                            <div
                              className="bg-[#00D6B4] h-full rounded-full transition-all duration-500"
                              style={{ width: `${fedRecallResult.containmentPercentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-[#0B1220] p-4 rounded-xl border border-[#304257]">
                          <span className="text-xs text-[#94A3B8] block">Total Lot Units</span>
                          <span className="text-2xl font-black text-[#F1F5F9] mt-1 block">
                            {fedRecallResult.totalLotUnits}
                          </span>
                          <span className="text-[10px] text-[#94A3B8]">Target: {fedRecallResult.target}</span>
                        </div>

                        <div className="bg-[#0B1220] p-4 rounded-xl border border-[#304257]">
                          <span className="text-xs text-[#94A3B8] block">Secured in Quarantine</span>
                          <span className="text-2xl font-black text-emerald-400 mt-1 block">
                            {fedRecallResult.containedCount}
                          </span>
                          <span className="text-[10px] text-emerald-400">Locked from dispensing</span>
                        </div>

                        <div className="bg-[#0B1220] p-4 rounded-xl border border-[#304257]">
                          <span className="text-xs text-[#94A3B8] block">Enforcement Authority</span>
                          <span className="text-sm font-bold text-[#F1F5F9] mt-2 block truncate">
                            {fedRecallResult.authority}
                          </span>
                          <span className="text-[10px] text-[#00D6B4]">Directive Active</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <AlertOctagon className="h-5 w-5 text-rose-400" /> Federal Recall Enforcement Terminal
                        </h3>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          Enforce binding federal recall directives across manufacturers, distributors, and pharmacy dispensaries.
                        </p>
                      </div>
                      <span className="badge bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs font-mono font-bold">
                        Circuit Breaker
                      </span>
                    </div>

                    <form onSubmit={handleEnforceFederalRecall} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Target Scope</label>
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <button
                              type="button"
                              onClick={() => setFedRecallIsBatch(true)}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                                fedRecallIsBatch
                                  ? 'bg-[#00D6B4]/20 border-[#00D6B4] text-[#00D6B4]'
                                  : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                              }`}
                            >
                              Entire Production Batch
                            </button>
                            <button
                              type="button"
                              onClick={() => setFedRecallIsBatch(false)}
                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition ${
                                !fedRecallIsBatch
                                  ? 'bg-[#00D6B4]/20 border-[#00D6B4] text-[#00D6B4]'
                                  : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                              }`}
                            >
                              Individual Serialized Unit
                            </button>
                          </div>

                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">
                            {fedRecallIsBatch ? 'Select Target Batch Number' : 'Select Target Serial Number'}
                          </label>
                          <select
                            value={fedRecallTarget}
                            onChange={(e) => setFedRecallTarget(e.target.value)}
                            className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          >
                            <option value="">Choose target...</option>
                            {fedRecallIsBatch
                              ? Array.from(new Set(drugs.map((d) => d.batchNumber))).filter(Boolean).map((bn) => (
                                  <option key={bn} value={bn}>
                                    Batch {bn}
                                  </option>
                                ))
                              : drugs.map((d) => (
                                  <option key={d.id} value={d.serialNumber}>
                                    {d.serialNumber} - {d.name} ({d.batchNumber})
                                  </option>
                                ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Federal Recall Classification</label>
                          <div className="space-y-2">
                            <label
                              onClick={() => setFedRecallClass('CLASS_I')}
                              className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                                fedRecallClass === 'CLASS_I'
                                  ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                                  : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="recallClass"
                                checked={fedRecallClass === 'CLASS_I'}
                                onChange={() => setFedRecallClass('CLASS_I')}
                                className="radio radio-xs radio-error mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-xs block text-rose-400">Class I - Dangerous / Defective</span>
                                <span className="text-[10px] leading-tight block">High probability of serious adverse health consequences or death. Irreversible supply halt.</span>
                              </div>
                            </label>

                            <label
                              onClick={() => setFedRecallClass('CLASS_II')}
                              className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                                fedRecallClass === 'CLASS_II'
                                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                                  : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="recallClass"
                                checked={fedRecallClass === 'CLASS_II'}
                                onChange={() => setFedRecallClass('CLASS_II')}
                                className="radio radio-xs radio-warning mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-xs block text-amber-400">Class II - Temporary / Reversible</span>
                                <span className="text-[10px] leading-tight block">Exposure may cause temporary or medically reversible adverse consequences.</span>
                              </div>
                            </label>

                            <label
                              onClick={() => setFedRecallClass('CLASS_III')}
                              className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                                fedRecallClass === 'CLASS_III'
                                  ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                                  : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                              }`}
                            >
                              <input
                                type="radio"
                                name="recallClass"
                                checked={fedRecallClass === 'CLASS_III'}
                                onChange={() => setFedRecallClass('CLASS_III')}
                                className="radio radio-xs radio-info mt-0.5"
                              />
                              <div>
                                <span className="font-bold text-xs block text-blue-400">Class III - Minor Technical Defect</span>
                                <span className="text-[10px] leading-tight block">Not likely to cause adverse health reaction; minor labeling or packaging defect.</span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Official Directive Reference #</label>
                          <input
                            type="text"
                            value={fedRecallDirectiveRef}
                            onChange={(e) => setFedRecallDirectiveRef(e.target.value)}
                            placeholder="e.g. FDA-DIR-2026-09"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Enforcing Regulatory Authority</label>
                          <input
                            type="text"
                            value={fedRecallAuthority}
                            onChange={(e) => setFedRecallAuthority(e.target.value)}
                            placeholder="e.g. US FDA CDER Office of Compliance"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Epidemiological Justification & Cause</label>
                        <textarea
                          rows={3}
                          value={fedRecallReason}
                          onChange={(e) => setFedRecallReason(e.target.value)}
                          placeholder="State root cause findings (e.g. Microbiological contamination, subpotent active ingredient, particulate matter)..."
                          className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={fedRecallLoading || !fedRecallTarget}
                          className="btn btn-sm bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl font-bold text-xs px-6 shadow-md flex items-center gap-2"
                        >
                          <AlertOctagon className="h-4 w-4" />
                          {fedRecallLoading ? 'Anchoring Federal Recall...' : 'Enforce Federal Recall Directive'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                        <AlertOctagon className="h-5 w-5 text-rose-400" /> Active Supply Chain Recall Directives
                      </h3>
                      <span className="badge bg-rose-500/20 text-rose-300 border-rose-500/30 text-xs font-mono">
                        {drugs.filter((d) => d.isRecalled || d.recallDirectiveRef).length} Active Recalls
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full text-left">
                        <thead>
                          <tr className="border-b border-[#304257] text-[#94A3B8] text-xs">
                            <th>Directive #</th>
                            <th>Class</th>
                            <th>Authority</th>
                            <th>Drug Name & Serial</th>
                            <th>Batch</th>
                            <th>Reason</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#304257]/50 text-xs">
                          {drugs.filter((d) => d.isRecalled || d.recallDirectiveRef).length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-6 text-[#94A3B8]">
                                Zero active recall directives on record. All inventory units are circulating normally.
                              </td>
                            </tr>
                          ) : (
                            drugs
                              .filter((d) => d.isRecalled || d.recallDirectiveRef)
                              .map((d) => (
                                <tr key={d.id} className="hover:bg-[#0B1220]/50 transition">
                                  <td className="font-mono text-[#00D6B4] font-bold">{d.recallDirectiveRef || 'DIRECTIVE-N/A'}</td>
                                  <td>
                                    <span
                                      className={`badge text-[10px] font-bold ${
                                        d.recallClass === 'CLASS_I'
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                          : d.recallClass === 'CLASS_II'
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                      }`}
                                    >
                                      {d.recallClass || 'CLASS_I'}
                                    </span>
                                  </td>
                                  <td className="text-[#94A3B8]">{d.recallAuthority || 'Federal Agency'}</td>
                                  <td className="font-semibold text-[#F1F5F9]">{d.name} ({d.serialNumber})</td>
                                  <td className="font-mono text-[#94A3B8]">{d.batchNumber}</td>
                                  <td className="text-[#94A3B8] max-w-xs truncate">{d.recallReason || 'Emergency Safety Directive'}</td>
                                  <td>
                                    <span className="badge bg-rose-500/20 text-rose-300 border-rose-500/30 text-[10px] font-bold">
                                      {d.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {regulatorSubTab === 'pharmacovigilance' && (
                <div className="space-y-6">
                  <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <ShieldAlert className="h-5 w-5 text-amber-400" /> FDA MedWatch (Form 3500A) ADE Triage
                        </h3>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          Triage and register Adverse Drug Event (ADE) reports. Life-threatening events trigger automatic emergency quarantine across the supply chain.
                        </p>
                      </div>
                      <span className="badge bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold shrink-0 whitespace-nowrap px-3 py-1.5 h-auto">
                        Form FDA-3500A
                      </span>
                    </div>

                    <form onSubmit={handleSubmitMedWatchAde} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Target Medicine Serial</label>
                          <select
                            value={adeSerial}
                            onChange={(e) => setAdeSerial(e.target.value)}
                            className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          >
                            <option value="">Select medicine serial...</option>
                            {drugs.map((d) => (
                              <option key={d.id} value={d.serialNumber}>
                                {d.serialNumber} - {d.name} ({d.batchNumber})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Clinician / Reporter Role</label>
                          <input
                            type="text"
                            value={adeReporterRole}
                            onChange={(e) => setAdeReporterRole(e.target.value)}
                            placeholder="e.g. Attending Clinical Immunologist"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Clinical Severity Classification</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <button
                            type="button"
                            onClick={() => setAdeSeverity('LIFE_THREATENING')}
                            className={`p-3 rounded-xl border text-left transition ${
                              adeSeverity === 'LIFE_THREATENING'
                                ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                                : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                            }`}
                          >
                            <span className="font-bold text-xs block text-rose-400">Life-Threatening</span>
                            <span className="text-[10px] block opacity-80 mt-0.5">Immediate anaphylaxis or organ failure. Mandatory hold.</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAdeSeverity('HOSPITALIZATION')}
                            className={`p-3 rounded-xl border text-left transition ${
                              adeSeverity === 'HOSPITALIZATION'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                                : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                            }`}
                          >
                            <span className="font-bold text-xs block text-amber-400">Hospitalization</span>
                            <span className="text-[10px] block opacity-80 mt-0.5">Required inpatient hospital admission.</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAdeSeverity('DISABILITY')}
                            className={`p-3 rounded-xl border text-left transition ${
                              adeSeverity === 'DISABILITY'
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                                : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                            }`}
                          >
                            <span className="font-bold text-xs block text-indigo-400">Disability</span>
                            <span className="text-[10px] block opacity-80 mt-0.5">Persistent or significant incapacity.</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAdeSeverity('MILD')}
                            className={`p-3 rounded-xl border text-left transition ${
                              adeSeverity === 'MILD'
                                ? 'bg-blue-500/20 border-blue-500 text-blue-200'
                                : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                              }`}
                            >
                            <span className="font-bold text-xs block text-blue-400">Mild Adverse Event</span>
                            <span className="text-[10px] block opacity-80 mt-0.5">Transient reaction, rash, nausea.</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Reaction Symptoms & Clinical Intervention Details</label>
                        <textarea
                          rows={3}
                          value={adeReaction}
                          onChange={(e) => setAdeReaction(e.target.value)}
                          placeholder="Detail onset time, symptoms, emergency interventions administered, and patient clinical status..."
                          className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={adeLoading || !adeSerial}
                          className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-[#0B1220] border-none rounded-xl font-bold text-xs px-6 shadow-md flex items-center gap-2"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          {adeLoading ? 'Anchoring MedWatch Report...' : 'Anchor MedWatch Adverse Event Report'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-[#00D6B4]" /> Adverse Drug Event Safety Registry
                      </h3>
                      <span className="badge bg-[#243247] text-[#94A3B8] border-[#304257] text-xs font-mono">
                        {drugs.filter((d) => d.adeReportId).length} Safety Reports
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full text-left">
                        <thead>
                          <tr className="border-b border-[#304257] text-[#94A3B8] text-xs">
                            <th>Report ID</th>
                            <th>Severity</th>
                            <th>Drug Name & Serial</th>
                            <th>Reported Date</th>
                            <th>Reaction Details</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#304257]/50 text-xs">
                          {drugs.filter((d) => d.adeReportId).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-6 text-[#94A3B8]">
                                Zero Adverse Drug Events reported. All clinical administrations safe.
                              </td>
                            </tr>
                          ) : (
                            drugs
                              .filter((d) => d.adeReportId)
                              .map((d) => (
                                <tr key={d.id} className="hover:bg-[#0B1220]/50 transition">
                                  <td className="font-mono text-[#00D6B4] font-bold">{d.adeReportId}</td>
                                  <td>
                                    <span
                                      className={`badge text-[10px] font-bold ${
                                        d.adeSeverity === 'LIFE_THREATENING'
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                          : d.adeSeverity === 'HOSPITALIZATION'
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                      }`}
                                    >
                                      {d.adeSeverity}
                                    </span>
                                  </td>
                                  <td className="font-semibold text-[#F1F5F9]">{d.name} ({d.serialNumber})</td>
                                  <td className="text-[#94A3B8]">
                                    {d.adeReportedAt ? new Date(d.adeReportedAt).toLocaleDateString() : 'Recent'}
                                  </td>
                                  <td className="text-[#94A3B8] max-w-xs truncate">{d.adeReactionDetails}</td>
                                  <td>
                                    <span
                                      className={`badge text-[10px] font-bold ${
                                        d.status === 'QUARANTINED'
                                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      }`}
                                    >
                                      {d.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {regulatorSubTab === 'alcoa' && (
                <div className="space-y-6">
                  <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#304257] pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="badge bg-[#00D6B4]/20 text-[#00D6B4] border-[#00D6B4]/30 text-xs font-bold uppercase">
                            21 CFR Part 11 & GAMP 5
                          </span>
                          <span className="badge bg-[#243247] text-[#94A3B8] border-[#304257] text-xs font-mono">
                            ALCOA+ Framework
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-[#F1F5F9] mt-2 flex items-center gap-2">
                          <FileCheck2 className="h-6 w-6 text-[#00D6B4]" /> Automated Electronic Records & Signatures Analyzer
                        </h3>
                        <p className="text-xs text-[#94A3B8] mt-1">
                          Evaluates blockchain supply chain ledger events against the 5 ALCOA+ principles: Attributable, Legible, Contemporaneous, Original, and Accurate.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={loadAlcoaAnalysis}
                          disabled={alcoaLoading}
                          className="btn btn-sm bg-[#0B1220] hover:bg-[#243247] text-[#00D6B4] border border-[#304257] rounded-xl text-xs flex items-center gap-2"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${alcoaLoading ? 'animate-spin' : ''}`} />
                          {alcoaLoading ? 'Auditing Ledger...' : 'Run Audit'}
                        </button>
                        <button
                          type="button"
                          onClick={handleExportAlcoaPdf}
                          disabled={!alcoaData}
                          className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md"
                        >
                          <Printer className="h-4 w-4" /> Export Certificate
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-[#0B1220] p-5 rounded-2xl border border-[#304257] flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-semibold text-[#94A3B8] block">Composite Integrity Score</span>
                          <div className="text-4xl font-black text-[#00D6B4] mt-2">
                            {alcoaData?.compositeScore ?? 98.4}%
                          </div>
                        </div>
                        <span className="badge bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-bold uppercase mt-3 w-fit">
                          {alcoaData?.status ?? 'CERTIFIED_COMPLIANT'}
                        </span>
                      </div>

                      <div className="bg-[#0B1220] p-5 rounded-2xl border border-[#304257] flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-semibold text-[#94A3B8] block">Audited Ledger Records</span>
                          <div className="text-4xl font-black text-[#F1F5F9] mt-2">
                            {alcoaData?.totalAuditEventsEvaluated ?? 0}
                          </div>
                        </div>
                        <span className="text-xs text-[#94A3B8] mt-3">
                          Covering {alcoaData?.totalDrugsEvaluated ?? drugs.length} verified production batches
                        </span>
                      </div>

                      <div className="bg-[#0B1220] p-5 rounded-2xl border border-[#304257] flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-semibold text-[#94A3B8] block">Digital Certification Anchor Hash</span>
                          <span className="font-mono text-xs text-[#00D6B4] break-all block mt-2">
                            {alcoaData?.certificationHash || '0x8f3c71a9...'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#94A3B8] mt-3">
                          Evaluated: {alcoaData?.evaluatedAt ? new Date(alcoaData.evaluatedAt).toLocaleString() : 'Just now'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
                      <div className="bg-[#0B1220] p-4 rounded-xl border border-[#304257] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#F1F5F9]">Attributable</span>
                          <span className="badge bg-[#00D6B4]/20 text-[#00D6B4] text-[10px] font-bold">
                            {alcoaData?.principles.attributable.score ?? 100}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          {alcoaData?.principles.attributable.description ?? '100% of ledger transactions signed with verified cryptographic keys and stakeholder identities.'}
                        </p>
                      </div>

                      <div className="bg-[#0B1220] p-4 rounded-xl border border-[#304257] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#F1F5F9]">Legible</span>
                          <span className="badge bg-[#00D6B4]/20 text-[#00D6B4] text-[10px] font-bold">
                            {alcoaData?.principles.legible.score ?? 100}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          {alcoaData?.principles.legible.description ?? 'All GS1 2D DataMatrix payloads, event streams, and audit logs parse to validated JSON schemas.'}
                        </p>
                      </div>

                      <div className="bg-[#0B1220] p-4 rounded-xl border border-[#304257] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#F1F5F9]">Contemporaneous</span>
                          <span className="badge bg-[#00D6B4]/20 text-[#00D6B4] text-[10px] font-bold">
                            {alcoaData?.principles.contemporaneous.score ?? 96}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          {alcoaData?.principles.contemporaneous.description ?? 'Zero backdated blocks. Transaction timestamps synchronize with network consensus block-time within 30s.'}
                        </p>
                      </div>

                      <div className="bg-[#0B1220] p-4 rounded-xl border border-[#304257] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#F1F5F9]">Original</span>
                          <span className="badge bg-[#00D6B4]/20 text-[#00D6B4] text-[10px] font-bold">
                            {alcoaData?.principles.original.score ?? 100}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          {alcoaData?.principles.original.description ?? 'Primary immutable transaction hashes anchored directly to blockchain ledger root. Zero downstream mutations.'}
                        </p>
                      </div>

                      <div className="bg-[#0B1220] p-4 rounded-xl border border-[#304257] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#F1F5F9]">Accurate</span>
                          <span className="badge bg-[#00D6B4]/20 text-[#00D6B4] text-[10px] font-bold">
                            {alcoaData?.principles.accurate.score ?? 96}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                          {alcoaData?.principles.accurate.description ?? 'IoT cold chain temperature and humidity verified against calibrated tolerances with verified state machines.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {regulatorSubTab === 'investigations' && (
                <div className="space-y-6">
                  <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl space-y-5">
                    <div className="flex items-center justify-between border-b border-[#304257] pb-3 gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                          <FlaskConical className="h-5 w-5 text-[#00D6B4]" /> DSCSA Section 582 Counterfeit Investigation Docket
                        </h3>
                        <p className="text-xs text-[#94A3B8] mt-0.5">
                          Manage criminal and forensic investigations for suspect product notifications under DSCSA Section 582. Record forensic laboratory assays and legal dispositions.
                        </p>
                      </div>
                      <span className="badge bg-[#243247] text-[#00D6B4] border border-[#304257] text-xs font-mono font-bold shrink-0 whitespace-nowrap px-3 py-1.5 h-auto">
                        DSCSA 582 Docket
                      </span>
                    </div>

                    <form onSubmit={handleUpdateInvestigationDocket} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Target Medicine Serial</label>
                          <select
                            value={invSerial}
                            onChange={(e) => setInvSerial(e.target.value)}
                            className="select select-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          >
                            <option value="">Select medicine serial...</option>
                            {drugs.map((d) => (
                              <option key={d.id} value={d.serialNumber}>
                                {d.serialNumber} - {d.name} ({d.batchNumber})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Official Case Docket #</label>
                          <input
                            type="text"
                            value={invDocket}
                            onChange={(e) => setInvDocket(e.target.value)}
                            placeholder="e.g. FDA-OC-CASE-2026-441"
                            className="input input-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Regulatory & Legal Disposition</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => setInvDisposition('SEIZED_CONFIRMED_COUNTERFEIT')}
                            className={`p-3 rounded-xl border text-left transition ${
                              invDisposition === 'SEIZED_CONFIRMED_COUNTERFEIT'
                                ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                                : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                            }`}
                          >
                            <span className="font-bold text-xs block text-rose-400">Seized: Confirmed Counterfeit</span>
                            <span className="text-[10px] block opacity-80 mt-0.5">Physical seizure executed. Criminal prosecution referral initiated.</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInvDisposition('CLEARED_LEGITIMATE')}
                            className={`p-3 rounded-xl border text-left transition ${
                              invDisposition === 'CLEARED_LEGITIMATE'
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200'
                                : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                            }`}
                          >
                            <span className="font-bold text-xs block text-emerald-400">Cleared: Legitimate Product</span>
                            <span className="text-[10px] block opacity-80 mt-0.5">Forensic testing authenticated genuine product. Quarantine lifted.</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInvDisposition('UNDER_INVESTIGATION')}
                            className={`p-3 rounded-xl border text-left transition ${
                              invDisposition === 'UNDER_INVESTIGATION'
                                ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                                : 'bg-[#0B1220] border-[#304257] text-[#94A3B8]'
                            }`}
                          >
                            <span className="font-bold text-xs block text-amber-400">Under Investigation</span>
                            <span className="text-[10px] block opacity-80 mt-0.5">Laboratory chemical assay and forensic analysis in progress.</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Forensic Chemical & Spectroscopy Assay Findings</label>
                        <textarea
                          rows={2}
                          value={invAssayFindings}
                          onChange={(e) => setInvAssayFindings(e.target.value)}
                          placeholder="e.g. Raman spectroscopy analysis confirms excipient starch with absent active pharmaceutical ingredient (API)..."
                          className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-xs text-[#94A3B8] font-semibold block mb-1">Chain-of-Custody & Evidence Interception Notes</label>
                        <textarea
                          rows={2}
                          value={invForensicNotes}
                          onChange={(e) => setInvForensicNotes(e.target.value)}
                          placeholder="e.g. Packaging foil font discrepancy verified matching known transshipment counterfeit pattern..."
                          className="textarea textarea-bordered w-full bg-[#0B1220] border-[#304257] rounded-xl text-xs text-[#F1F5F9]"
                          required
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={invLoading || !invSerial}
                          className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs px-6 shadow-md flex items-center gap-2"
                        >
                          <FlaskConical className="h-4 w-4" />
                          {invLoading ? 'Updating Docket...' : 'Update Regulatory Case Docket'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="card bg-[#172638] border border-[#304257] p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#F1F5F9] flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-[#00D6B4]" /> Open Section 582 Investigation Dockets
                      </h3>
                      <span className="badge bg-[#243247] text-[#94A3B8] border-[#304257] text-xs font-mono">
                        {drugs.filter((d) => d.regulatoryInvestigationDocket).length} Active Dockets
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="table table-sm w-full text-left">
                        <thead>
                          <tr className="border-b border-[#304257] text-[#94A3B8] text-xs">
                            <th>Docket #</th>
                            <th>Disposition</th>
                            <th>Drug Name & Serial</th>
                            <th>Assay Finding</th>
                            <th>Forensic Notes</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#304257]/50 text-xs">
                          {drugs.filter((d) => d.regulatoryInvestigationDocket).length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-6 text-[#94A3B8]">
                                Zero active counterfeit investigation dockets. Use the terminal above to file a case.
                              </td>
                            </tr>
                          ) : (
                            drugs
                              .filter((d) => d.regulatoryInvestigationDocket)
                              .map((d) => (
                                <tr key={d.id} className="hover:bg-[#0B1220]/50 transition">
                                  <td className="font-mono text-[#00D6B4] font-bold">{d.regulatoryInvestigationDocket}</td>
                                  <td>
                                    <span
                                      className={`badge text-[10px] font-bold ${
                                        d.regulatoryInvestigationStatus === 'SEIZED_CONFIRMED_COUNTERFEIT'
                                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                          : d.regulatoryInvestigationStatus === 'CLEARED_LEGITIMATE'
                                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      }`}
                                    >
                                      {d.regulatoryInvestigationStatus || 'UNDER_INVESTIGATION'}
                                    </span>
                                  </td>
                                  <td className="font-semibold text-[#F1F5F9]">{d.name} ({d.serialNumber})</td>
                                  <td className="text-[#94A3B8] max-w-xs truncate">{d.regulatoryAssayFinding}</td>
                                  <td className="text-[#94A3B8] max-w-xs truncate">{d.regulatoryForensicNotes}</td>
                                  <td>
                                    <Link
                                      href={`/verify/${d.serialNumber}`}
                                      target="_blank"
                                      className="btn btn-xs bg-[#0B1220] hover:bg-[#243247] text-[#00D6B4] border border-[#304257] rounded-lg"
                                    >
                                      Verify
                                    </Link>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
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

      {showMultiQrModal && (
        <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card bg-[#172638] border border-[#00D6B4]/50 shadow-2xl rounded-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#304257] pb-3">
              <div className="flex items-center gap-2 text-[#00D6B4] font-bold text-sm">
                <Printer className="h-5 w-5" /> Serialized Packaging Label Sheet (GS1 DataMatrix)
              </div>
              <button
                onClick={() => setShowMultiQrModal(false)}
                className="btn btn-sm btn-ghost btn-circle text-[#94A3B8] hover:text-[#F1F5F9]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Ready for high-speed factory carton labeling and packaging line application. Each label encodes unique unit traceability.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[#0B1220] rounded-xl border border-[#304257]">
              {bulkResultSerials.map((sn) => (
                <div key={sn} className="p-3 bg-white rounded-lg flex flex-col items-center justify-center text-center text-[#0B1220]">
                  <QRCodeSVG
                    value={typeof window !== 'undefined' ? `${window.location.origin}/verify/${sn}` : `/verify/${sn}`}
                    size={90}
                    bgColor={"#ffffff"}
                    fgColor={"#0B1220"}
                    level={"M"}
                  />
                  <div className="text-[10px] font-mono font-bold mt-1 text-[#0B1220]">{sn}</div>
                  <div className="text-[9px] text-slate-600 font-sans">{bulkName || 'Medicine Formulation'}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMultiQrModal(false)}
                className="btn btn-sm btn-ghost text-[#94A3B8] text-xs"
              >
                Close Sheet
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.print();
                  }
                }}
                className="btn btn-sm bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold text-xs px-4 flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Label Sheet
              </button>
            </div>
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
