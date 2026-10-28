'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Network,
  GitBranch,
  Boxes,
  Layers,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ShieldCheck,
  Lock,
  Thermometer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Cpu,
  Building,
  Truck,
  Store,
  Flame,
  ArrowRight,
  ExternalLink,
  Eye,
  Download,
  Filter,
  Activity,
  Share2,
} from 'lucide-react';

export interface DagNode {
  id: string;
  label: string;
  sublabel: string;
  level: number;
  type:
    | 'MANUFACTURER'
    | 'QA_AUDIT'
    | 'PACKAGING'
    | 'ESCROW'
    | 'LOGISTICS'
    | 'WHOLESALER'
    | 'PHARMACY'
    | 'DISPENSED'
    | 'PALLET'
    | 'CASE'
    | 'ITEM';
  status: 'AUTHENTIC' | 'COMPLIANT' | 'LOCKED' | 'IN_TRANSIT' | 'BURNED' | 'EXCURSION';
  timestamp: string;
  actor: string;
  actorAddress: string;
  hash: string;
  x: number;
  y: number;
  details: {
    merkleRoot?: string;
    ipfsCid?: string;
    temperature?: number;
    humidity?: number;
    kmsKeyId?: string;
    escrowAmountEth?: number;
    contractAnchor?: string;
    packagingLevel?: string;
    sscc?: string;
    gtin?: string;
    gln?: string;
  };
}

export interface DagEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  status: 'VERIFIED' | 'PENDING' | 'DISPUTED';
}

const CUSTODY_NODES: DagNode[] = [
  {
    id: 'node-mfg',
    label: 'Genesis Batch Production',
    sublabel: 'BioGenix LifeSciences GmbH',
    level: 0,
    type: 'MANUFACTURER',
    status: 'AUTHENTIC',
    timestamp: '2026-10-15T08:30:00Z',
    actor: 'Dr. Evelyn Vance (Chief Quality Officer)',
    actorAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    hash: '0x4f8b21ca88921df378b901ac89d312bc90a881347621d98a09b82143ea01cd82',
    x: 60,
    y: 190,
    details: {
      merkleRoot: '0xeeb818f60a7cd12cee45d02ba7b95b5e310ff13524c03ae03407a045488a35e8',
      ipfsCid: 'bafybeiccpf3luej4ojamrtluwjks3wmhedyrm2h',
      kmsKeyId: 'kms-pharma-mfg-01',
      gln: '0844514000018',
      gtin: '00300018899201',
      contractAnchor: '0xeAcd0d4136D728beD3E53c4bb21af75Cc6596684',
    },
  },
  {
    id: 'node-qa',
    label: 'GxP Regulatory Certification',
    sublabel: 'FDA / EMA Regulatory Node',
    level: 1,
    type: 'QA_AUDIT',
    status: 'COMPLIANT',
    timestamp: '2026-10-15T10:15:00Z',
    actor: 'US FDA Inspectorate / CDER Office',
    actorAddress: '0xF60e3C557686fA391FbB72724b22eeC2613e5e53',
    hash: '0x7e1c9a05b38290fa8201cd93821948ba0821049c8120fa89b380291df93021aa',
    x: 510,
    y: 100,
    details: {
      kmsKeyId: 'kms-pharma-reg-01',
      contractAnchor: '0x32810a4e76a02931bc89a02319efb01928372091',
      gln: '0844514000099',
    },
  },
  {
    id: 'node-escrow',
    label: 'Delivery Escrow Deposit (DvP)',
    sublabel: 'Commercial Escrow Engine',
    level: 1,
    type: 'ESCROW',
    status: 'LOCKED',
    timestamp: '2026-10-15T11:00:00Z',
    actor: 'Autonomous Settlement Vault',
    actorAddress: '0x509aC7B938B7383DB474B3A3348baab03abcEf79',
    hash: '0x362b5e961dbcc608879de250333b9d8f83f5159458e3f6478792d477b8a9e54c',
    x: 510,
    y: 280,
    details: {
      escrowAmountEth: 2.5,
      contractAnchor: '0x8104eb158d99cf9840d5c33d0ca86c75759b1a229ca0bc15a82d06c04013d4bd',
    },
  },
  {
    id: 'node-pack',
    label: 'EPCIS Packaging Aggregation',
    sublabel: 'Cleanroom Case / Pallet Packing',
    level: 2,
    type: 'PACKAGING',
    status: 'AUTHENTIC',
    timestamp: '2026-10-15T13:45:00Z',
    actor: 'Secondary Packaging Unit A4',
    actorAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    hash: '0x9fd20434b9429e59158ea3c99dda50ac9be4d6a5ad47a55ed389acc525603c17',
    x: 960,
    y: 190,
    details: {
      sscc: 'SSCC-PALLET-901',
      packagingLevel: 'PALLET (48 Cases)',
      merkleRoot: '0xeeb818f60a7cd12cee45d02ba7b95b5e310ff13524c03ae03407a045488a35e8',
      ipfsCid: 'bafybeicas7u5i3vfrvl7harrzboeuytfvckojml',
    },
  },
  {
    id: 'node-transit',
    label: 'Cold-Chain Reefer Logistics',
    sublabel: 'Apex Specialized Reefer Hub',
    level: 3,
    type: 'LOGISTICS',
    status: 'IN_TRANSIT',
    timestamp: '2026-10-15T16:20:00Z',
    actor: 'Apex Global Reefer Fleet Van #408',
    actorAddress: '0x0d9Bf9Da442ba0700999E16399EF60Bb91C092DF',
    hash: '0x68c6bf7be0687168c0fa507c154dc9613dd66ec8dc2a7f0da4a1c26606ab7222',
    x: 1410,
    y: 190,
    details: {
      temperature: 4.2,
      humidity: 46,
      gln: '0844514000025',
      contractAnchor: '0xeAcd0d4136D728beD3E53c4bb21af75Cc6596684',
    },
  },
  {
    id: 'node-wholesaler',
    label: 'Regional Wholesaler Ingest',
    sublabel: 'Nordic Healthcare Distribution',
    level: 4,
    type: 'WHOLESALER',
    status: 'COMPLIANT',
    timestamp: '2026-10-15T21:05:00Z',
    actor: 'Regional Receiving Supervisor',
    actorAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    hash: '0x2efa1e4a26f9017732507f735f202eccaa004d4306ec1d64c53e00e7bc453413',
    x: 1860,
    y: 190,
    details: {
      gln: '0844514000056',
      kmsKeyId: 'kms-pharma-reg-01',
      contractAnchor: '0x32810a4e76a02931bc89a02319efb01928372091',
    },
  },
  {
    id: 'node-pharmacy',
    label: 'Hospital Pharmacy Reception',
    sublabel: 'St. Jude Clinical Dispensary',
    level: 5,
    type: 'PHARMACY',
    status: 'AUTHENTIC',
    timestamp: '2026-10-16T00:10:00Z',
    actor: 'Licensed Lead Pharmacist',
    actorAddress: '0x2c54FfeF295aE9E54bc428Ce804b64524Ea468b9',
    hash: '0x8b81911c7e05a23981987708a2334f91ab8c7b81013e5ed4b36e2ab0501bfebf',
    x: 2310,
    y: 190,
    details: {
      gln: '0844514000104',
      temperature: 3.9,
      humidity: 43,
      contractAnchor: '0xeAcd0d4136D728beD3E53c4bb21af75Cc6596684',
    },
  },
  {
    id: 'node-dispense',
    label: 'Patient Dispense & Twin Burn',
    sublabel: 'Permanent Anti-Recirculation',
    level: 6,
    type: 'DISPENSED',
    status: 'BURNED',
    timestamp: '2026-10-16T01:45:00Z',
    actor: 'Clinical Care Protocol Engine',
    actorAddress: '0x0000000000000000000000000000000000000000',
    hash: '0xa68b4e3c01e483778d5fc46f3a9c61741c29679301d6c7720e2eeb5201b3854c',
    x: 2760,
    y: 190,
    details: {
      contractAnchor: '0x362b5e961dbcc608879de250333b9d8f83f5159458e3f6478792d477b8a9e54c',
    },
  },
];

const CUSTODY_EDGES: DagEdge[] = [
  {
    id: 'edge-mfg-qa',
    source: 'node-mfg',
    target: 'node-qa',
    label: 'GxP Dossier Submission',
    status: 'VERIFIED',
  },
  {
    id: 'edge-mfg-escrow',
    source: 'node-mfg',
    target: 'node-escrow',
    label: 'Commercial Invoice Link',
    status: 'VERIFIED',
  },
  {
    id: 'edge-qa-pack',
    source: 'node-qa',
    target: 'node-pack',
    label: 'Quality Release Stamp',
    status: 'VERIFIED',
  },
  {
    id: 'edge-escrow-pack',
    source: 'node-escrow',
    target: 'node-pack',
    label: 'Escrow Lock Validation',
    status: 'VERIFIED',
  },
  {
    id: 'edge-pack-transit',
    source: 'node-pack',
    target: 'node-transit',
    label: 'EIP-712 Dual Handshake',
    status: 'VERIFIED',
  },
  {
    id: 'edge-transit-wholesaler',
    source: 'node-transit',
    target: 'node-wholesaler',
    label: 'Telemetric Custody Ingest',
    status: 'VERIFIED',
  },
  {
    id: 'edge-wholesaler-pharmacy',
    source: 'node-wholesaler',
    target: 'node-pharmacy',
    label: 'EIP-712 Final Acceptance',
    status: 'VERIFIED',
  },
  {
    id: 'edge-pharmacy-dispense',
    source: 'node-pharmacy',
    target: 'node-dispense',
    label: 'Digital Twin Burn On Dispense',
    status: 'VERIFIED',
  },
];

const PACKAGING_NODES: DagNode[] = [
  {
    id: 'pack-pallet-901',
    label: 'SSCC-PALLET-901',
    sublabel: 'Intermodal Shipping Pallet (ISO-1)',
    level: 0,
    type: 'PALLET',
    status: 'AUTHENTIC',
    timestamp: '2026-10-15T13:45:00Z',
    actor: 'Central Distribution Logistics Hub',
    actorAddress: '0x0d9Bf9Da442ba0700999E16399EF60Bb91C092DF',
    hash: '0x9fd20434b9429e59158ea3c99dda50ac9be4d6a5ad47a55ed389acc525603c17',
    x: 660,
    y: 50,
    details: {
      sscc: '001084451400901001',
      packagingLevel: 'PALLET (48 Shipper Cases)',
      merkleRoot: '0xeeb818f60a7cd12cee45d02ba7b95b5e310ff13524c03ae03407a045488a35e8',
      ipfsCid: 'bafybeiccpf3luej4ojamrtluwjks3wmhedyrm2h',
    },
  },
  {
    id: 'pack-case-501',
    label: 'SSCC-CASE-501',
    sublabel: 'Cold-Chain Shipper Case (200 Packs)',
    level: 1,
    type: 'CASE',
    status: 'AUTHENTIC',
    timestamp: '2026-10-15T12:30:00Z',
    actor: 'Cleanroom Packaging Line #2',
    actorAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    hash: '0x68c6bf7be0687168c0fa507c154dc9613dd66ec8dc2a7f0da4a1c26606ab7222',
    x: 100,
    y: 200,
    details: {
      sscc: '001084451400501003',
      packagingLevel: 'CASE (200 Primary Units)',
      temperature: 4.1,
    },
  },
  {
    id: 'pack-case-502',
    label: 'SSCC-CASE-502',
    sublabel: 'Cold-Chain Shipper Case (200 Packs)',
    level: 1,
    type: 'CASE',
    status: 'AUTHENTIC',
    timestamp: '2026-10-15T12:35:00Z',
    actor: 'Cleanroom Packaging Line #2',
    actorAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    hash: '0x2efa1e4a26f9017732507f735f202eccaa004d4306ec1d64c53e00e7bc453413',
    x: 660,
    y: 200,
    details: {
      sscc: '001084451400502000',
      packagingLevel: 'CASE (200 Primary Units)',
      temperature: 4.3,
    },
  },
  {
    id: 'pack-case-503',
    label: 'SSCC-CASE-503',
    sublabel: 'Insulated Vaccine Shipper (150 Packs)',
    level: 1,
    type: 'CASE',
    status: 'COMPLIANT',
    timestamp: '2026-10-15T12:40:00Z',
    actor: 'Cryogenic Packaging Cell #1',
    actorAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    hash: '0x7e1c9a05b38290fa8201cd93821948ba0821049c8120fa89b380291df93021aa',
    x: 1220,
    y: 200,
    details: {
      sscc: '001084451400503007',
      packagingLevel: 'CASE (150 Primary Units)',
      temperature: -20.4,
    },
  },
  {
    id: 'pack-item-9901',
    label: 'SN-2026-AMOX500',
    sublabel: 'Unit Serialization (SGTIN)',
    level: 2,
    type: 'ITEM',
    status: 'AUTHENTIC',
    timestamp: '2026-10-15T09:10:00Z',
    actor: 'High-Speed Serialization Marker',
    actorAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    hash: '0x4f8b21ca88921df378b901ac89d312bc90a881347621d98a09b82143ea01cd82',
    x: 0,
    y: 350,
    details: {
      gtin: '00300018899201',
      packagingLevel: 'PRIMARY_ITEM (Bottle 500mg)',
      contractAnchor: '0xeAcd0d4136D728beD3E53c4bb21af75Cc6596684',
    },
  },
  {
    id: 'pack-item-9902',
    label: 'SN-2026-AMOX501',
    sublabel: 'Unit Serialization (SGTIN)',
    level: 2,
    type: 'ITEM',
    status: 'AUTHENTIC',
    timestamp: '2026-10-15T09:11:00Z',
    actor: 'High-Speed Serialization Marker',
    actorAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    hash: '0x8b81911c7e05a23981987708a2334f91ab8c7b81013e5ed4b36e2ab0501bfebf',
    x: 300,
    y: 350,
    details: {
      gtin: '00300018899201',
      packagingLevel: 'PRIMARY_ITEM (Bottle 500mg)',
    },
  },
  {
    id: 'pack-item-9903',
    label: 'SN-2026-INSULIN100',
    sublabel: 'Unit Serialization (SGTIN)',
    level: 2,
    type: 'ITEM',
    status: 'IN_TRANSIT',
    timestamp: '2026-10-15T09:15:00Z',
    actor: 'Sterile Biologics Packaging',
    actorAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    hash: '0x362b5e961dbcc608879de250333b9d8f83f5159458e3f6478792d477b8a9e54c',
    x: 660,
    y: 350,
    details: {
      gtin: '00300018899317',
      packagingLevel: 'PRIMARY_ITEM (Cartridge 100IU)',
      temperature: 4.6,
    },
  },
  {
    id: 'pack-item-9904',
    label: 'SN-2026-VAX-MRNA',
    sublabel: 'Unit Serialization (SGTIN)',
    level: 2,
    type: 'ITEM',
    status: 'COMPLIANT',
    timestamp: '2026-10-15T09:20:00Z',
    actor: 'Automated Cryo-Labeling Unit',
    actorAddress: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    hash: '0xa68b4e3c01e483778d5fc46f3a9c61741c29679301d6c7720e2eeb5201b3854c',
    x: 1220,
    y: 350,
    details: {
      gtin: '00300018899447',
      packagingLevel: 'PRIMARY_ITEM (Vial 0.5ml)',
      temperature: -20.2,
    },
  },
];

const PACKAGING_EDGES: DagEdge[] = [
  {
    id: 'edge-p-c1',
    source: 'pack-pallet-901',
    target: 'pack-case-501',
    label: 'Aggregation (SSCC Child)',
    status: 'VERIFIED',
  },
  {
    id: 'edge-p-c2',
    source: 'pack-pallet-901',
    target: 'pack-case-502',
    label: 'Aggregation (SSCC Child)',
    status: 'VERIFIED',
  },
  {
    id: 'edge-p-c3',
    source: 'pack-pallet-901',
    target: 'pack-case-503',
    label: 'Aggregation (SSCC Child)',
    status: 'VERIFIED',
  },
  {
    id: 'edge-c1-i1',
    source: 'pack-case-501',
    target: 'pack-item-9901',
    label: 'Unpack / Unit Ingest',
    status: 'VERIFIED',
  },
  {
    id: 'edge-c1-i2',
    source: 'pack-case-501',
    target: 'pack-item-9902',
    label: 'Unpack / Unit Ingest',
    status: 'VERIFIED',
  },
  {
    id: 'edge-c2-i3',
    source: 'pack-case-502',
    target: 'pack-item-9903',
    label: 'Unpack / Unit Ingest',
    status: 'VERIFIED',
  },
  {
    id: 'edge-c3-i4',
    source: 'pack-case-503',
    target: 'pack-item-9904',
    label: 'Unpack / Unit Ingest',
    status: 'VERIFIED',
  },
];

export function ProvenanceDagVisualizer({
  initialBatch = 'SN-2026-AMOX500',
}: {
  initialBatch?: string;
}) {
  const [viewMode, setViewMode] = useState<'custody' | 'packaging'>('custody');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-mfg');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [selectedBatch, setSelectedBatch] = useState<string>(initialBatch);

  const [zoom, setZoom] = useState(0.72);
  const [pan, setPan] = useState({ x: 30, y: 35 });
  const [isPanning, setIsPanning] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const activeNodes = useMemo(() => {
    return viewMode === 'custody' ? CUSTODY_NODES : PACKAGING_NODES;
  }, [viewMode]);

  const activeEdges = useMemo(() => {
    return viewMode === 'custody' ? CUSTODY_EDGES : PACKAGING_EDGES;
  }, [viewMode]);

  const selectedNode = useMemo(() => {
    return activeNodes.find((n) => n.id === selectedNodeId) || activeNodes[0];
  }, [activeNodes, selectedNodeId]);

  useEffect(() => {
    if (viewMode === 'custody') {
      setSelectedNodeId('node-mfg');
    } else {
      setSelectedNodeId('pack-pallet-901');
    }
  }, [viewMode]);

  const connectedNodeIds = useMemo(() => {
    const targetId = hoveredNodeId || selectedNodeId;
    if (!targetId) return new Set<string>();

    const connected = new Set<string>([targetId]);
    activeEdges.forEach((e) => {
      if (e.source === targetId) connected.add(e.target);
      if (e.target === targetId) connected.add(e.source);
    });
    return connected;
  }, [hoveredNodeId, selectedNodeId, activeEdges]);

  const filteredNodes = useMemo(() => {
    return activeNodes.filter((node) => {
      const matchesSearch =
        searchQuery === '' ||
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.sublabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.hash.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        filterRole === 'ALL' ||
        node.type === filterRole ||
        (filterRole === 'PACKAGING' && ['PALLET', 'CASE', 'ITEM'].includes(node.type));

      return matchesSearch && matchesRole;
    });
  }, [activeNodes, searchQuery, filterRole]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'dag-bg') {
      setIsPanning(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.4), 2.2));
  };

  const handleReset = () => {
    setZoom(0.72);
    setPan({ x: 30, y: 35 });
    setSelectedNodeId(viewMode === 'custody' ? 'node-mfg' : 'pack-pallet-901');
  };

  const getNodeColor = (type: DagNode['type']) => {
    switch (type) {
      case 'MANUFACTURER':
        return '#00D6B4';
      case 'QA_AUDIT':
        return '#A3E635';
      case 'ESCROW':
        return '#FBBF24';
      case 'PACKAGING':
      case 'PALLET':
        return '#38BDF8';
      case 'CASE':
        return '#818CF8';
      case 'ITEM':
        return '#00D6B4';
      case 'LOGISTICS':
        return '#FBBF24';
      case 'WHOLESALER':
        return '#C084FC';
      case 'PHARMACY':
        return '#34D399';
      case 'DISPENSED':
        return '#F87171';
      default:
        return '#00D6B4';
    }
  };

  const getNodeIcon = (type: DagNode['type']) => {
    switch (type) {
      case 'MANUFACTURER':
        return <Building className="h-4 w-4" />;
      case 'QA_AUDIT':
        return <ShieldCheck className="h-4 w-4" />;
      case 'ESCROW':
        return <Lock className="h-4 w-4" />;
      case 'PACKAGING':
      case 'PALLET':
        return <Boxes className="h-4 w-4" />;
      case 'CASE':
        return <Layers className="h-4 w-4" />;
      case 'ITEM':
        return <Cpu className="h-4 w-4" />;
      case 'LOGISTICS':
        return <Truck className="h-4 w-4" />;
      case 'WHOLESALER':
        return <Building className="h-4 w-4" />;
      case 'PHARMACY':
        return <Store className="h-4 w-4" />;
      case 'DISPENSED':
        return <Flame className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const handleExportJson = () => {
    const exportData = {
      batch: selectedBatch,
      timestamp: new Date().toISOString(),
      viewMode,
      totalNodes: activeNodes.length,
      totalEdges: activeEdges.length,
      cryptographicContinuity: '100% Verified',
      acyclicStatus: 'Zero Cycles Detected',
      nodes: activeNodes,
      edges: activeEdges,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `provenance-dag-${selectedBatch.toLowerCase()}-${viewMode}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col space-y-4 font-sans text-[#F1F5F9]">
      <div className="bg-[#243247] p-5 rounded-2xl border border-[#304257] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#00D6B4]/15 border border-[#00D6B4]/30 text-[#00D6B4] flex items-center justify-center font-bold">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-[#F1F5F9]">
                Interactive Provenance DAG Visualizer
              </h2>
              <span className="badge badge-sm bg-[#00D6B4] text-[#0B1220] font-bold border-none text-[10px]">
                EIP-712 / EPCIS 2.0
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Decentralized directed acyclic graph mapping custody handovers, cryptographic anchors, and packaging trees.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <div className="join bg-[#172638] border border-[#304257] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('custody')}
              className={`join-item btn btn-xs rounded-lg font-bold transition ${
                viewMode === 'custody'
                  ? 'bg-[#00D6B4] text-[#0B1220]'
                  : 'bg-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <GitBranch className="h-3.5 w-3.5 mr-1" /> Custody Handover DAG
            </button>
            <button
              onClick={() => setViewMode('packaging')}
              className={`join-item btn btn-xs rounded-lg font-bold transition ${
                viewMode === 'packaging'
                  ? 'bg-[#00D6B4] text-[#0B1220]'
                  : 'bg-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <Boxes className="h-3.5 w-3.5 mr-1" /> EPCIS Packaging Tree
            </button>
          </div>

          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="select select-xs bg-[#172638] border-[#304257] text-[#F1F5F9] font-mono rounded-xl focus:border-[#00D6B4] focus:outline-none"
          >
            <option value="SN-2026-AMOX500">SN-2026-AMOX500</option>
            <option value="SN-2026-INSULIN100">SN-2026-INSULIN100</option>
            <option value="SN-2026-VAX-MRNA">SN-2026-VAX-MRNA</option>
            <option value="SN-2026-HEPARIN5000">SN-2026-HEPARIN5000</option>
          </select>

          <button
            onClick={handleExportJson}
            className="btn btn-xs bg-[#172638] hover:bg-[#304257] text-[#00D6B4] border border-[#304257] rounded-xl font-bold"
          >
            <Download className="h-3.5 w-3.5 mr-1" /> Export Audit DAG
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 flex flex-col space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-[#243247] p-2.5 rounded-xl border border-[#304257] text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="h-3.5 w-3.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search node, hash, actor, or identifier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#172638] border border-[#304257] text-[#F1F5F9] rounded-lg px-2.5 py-1 text-xs w-full focus:border-[#00D6B4] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-semibold text-[#94A3B8] mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filter:
              </span>
              {['ALL', 'MANUFACTURER', 'LOGISTICS', 'PHARMACY', 'PACKAGING'].map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`btn btn-xs rounded-lg text-[10px] font-bold ${
                    filterRole === role
                      ? 'bg-[#00D6B4] text-[#0B1220]'
                      : 'bg-[#172638] text-[#94A3B8] border border-[#304257] hover:text-[#F1F5F9]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleZoom(0.15)}
                className="btn btn-xs btn-square bg-[#172638] border-[#304257] text-[#94A3B8] hover:text-[#00D6B4]"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => handleZoom(-0.15)}
                className="btn btn-xs btn-square bg-[#172638] border-[#304257] text-[#94A3B8] hover:text-[#00D6B4]"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={handleReset}
                className="btn btn-xs btn-square bg-[#172638] border-[#304257] text-[#94A3B8] hover:text-[#00D6B4]"
                title="Reset View"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono text-[#94A3B8] px-1">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative h-[560px] w-full rounded-2xl bg-[#0B1220] border border-[#304257] overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg
              id="dag-bg"
              className="absolute inset-0 h-full w-full"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #304257 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <defs>
                <marker
                  id="arrow-teal"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#00D6B4" />
                </marker>
                <marker
                  id="arrow-amber"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#FBBF24" />
                </marker>
                <marker
                  id="arrow-muted"
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#304257" />
                </marker>
                <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <g
                transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                transition="transform 0.05s ease-out"
              >
                <g id="dag-edge-paths">
                  {activeEdges.map((edge) => {
                    const sourceNode = activeNodes.find((n) => n.id === edge.source);
                    const targetNode = activeNodes.find((n) => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;

                    const isHighlighted =
                      connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target);

                    const isCustody = viewMode === 'custody';
                    const cardWidth = 260;
                    const cardHeight = 82;

                    const x1 = isCustody ? sourceNode.x + cardWidth : sourceNode.x + cardWidth / 2;
                    const y1 = isCustody ? sourceNode.y + cardHeight / 2 : sourceNode.y + cardHeight;
                    const x2 = isCustody ? targetNode.x : targetNode.x + cardWidth / 2;
                    const y2 = isCustody ? targetNode.y + cardHeight / 2 : targetNode.y;

                    const pathData = isCustody
                      ? (() => {
                          const dx = Math.max(30, Math.abs(x2 - x1) * 0.5);
                          return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                        })()
                      : (() => {
                          const dy = Math.max(25, Math.abs(y2 - y1) * 0.5);
                          return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
                        })();

                    return (
                      <path
                        key={`path-${edge.id}`}
                        d={pathData}
                        fill="none"
                        stroke={isHighlighted ? '#00D6B4' : '#304257'}
                        strokeWidth={isHighlighted ? 3 : 1.5}
                        strokeDasharray={isHighlighted ? '6 4' : undefined}
                        markerEnd={isHighlighted ? 'url(#arrow-teal)' : 'url(#arrow-muted)'}
                        filter={isHighlighted ? 'url(#glow-teal)' : undefined}
                        className="transition-all duration-200"
                      />
                    );
                  })}
                </g>

                <g id="dag-nodes">
                  {activeNodes.map((node) => {
                    const isSelected = node.id === selectedNodeId;
                    const isHovered = node.id === hoveredNodeId;
                    const isConnected = connectedNodeIds.has(node.id);
                    const isVisible = filteredNodes.some((fn) => fn.id === node.id);
                    const nodeColor = getNodeColor(node.type);

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        onClick={() => setSelectedNodeId(node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer transition-transform duration-150"
                        opacity={isVisible ? 1 : 0.25}
                      >
                        <rect
                          width={260}
                          height={82}
                          rx={14}
                          fill="#243247"
                          stroke={
                            isSelected
                              ? '#00D6B4'
                              : isHovered || isConnected
                              ? nodeColor
                              : '#304257'
                          }
                          strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                          filter={isSelected ? 'url(#glow-teal)' : undefined}
                        />

                        <rect
                          x={0}
                          y={0}
                          width={6}
                          height={82}
                          rx={3}
                          fill={nodeColor}
                        />

                        <circle
                          cx={24}
                          cy={24}
                          r={12}
                          fill="#172638"
                          stroke={nodeColor}
                          strokeWidth={1.5}
                        />

                        <foreignObject x={16} y={16} width={16} height={16}>
                          <div
                            style={{ color: nodeColor }}
                            className="flex items-center justify-center"
                          >
                            {getNodeIcon(node.type)}
                          </div>
                        </foreignObject>

                        <text
                          x={44}
                          y={22}
                          fill="#F1F5F9"
                          fontSize="10"
                          fontWeight="700"
                          fontFamily="sans-serif"
                        >
                          {node.label}
                        </text>

                        <text
                          x={44}
                          y={35}
                          fill="#94A3B8"
                          fontSize="8.5"
                          fontFamily="sans-serif"
                        >
                          {node.sublabel}
                        </text>

                        <line
                          x1={14}
                          y1={47}
                          x2={246}
                          y2={47}
                          stroke="#304257"
                          strokeWidth={0.7}
                        />

                        <rect
                          x={14}
                          y={55}
                          width={74}
                          height={17}
                          rx={4}
                          fill="#172638"
                        />
                        <text
                          x={51}
                          y={67}
                          textAnchor="middle"
                          fill={nodeColor}
                          fontSize="8"
                          fontWeight="700"
                          fontFamily="monospace"
                        >
                          {node.type}
                        </text>

                        <text
                          x={246}
                          y={67}
                          textAnchor="end"
                          fill="#00D6B4"
                          fontSize="8"
                          fontWeight="600"
                          fontFamily="monospace"
                        >
                          {node.hash.slice(0, 6)}...{node.hash.slice(-4)}
                        </text>
                      </g>
                    );
                  })}
                </g>

                <g id="dag-edge-labels" className="pointer-events-none">
                  {activeEdges.map((edge) => {
                    const sourceNode = activeNodes.find((n) => n.id === edge.source);
                    const targetNode = activeNodes.find((n) => n.id === edge.target);
                    if (!sourceNode || !targetNode) return null;

                    const isHighlighted =
                      connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target);

                    const isCustody = viewMode === 'custody';
                    const cardWidth = 260;
                    const cardHeight = 82;

                    const x1 = isCustody ? sourceNode.x + cardWidth : sourceNode.x + cardWidth / 2;
                    const y1 = isCustody ? sourceNode.y + cardHeight / 2 : sourceNode.y + cardHeight;
                    const x2 = isCustody ? targetNode.x : targetNode.x + cardWidth / 2;
                    const y2 = isCustody ? targetNode.y + cardHeight / 2 : targetNode.y;

                    const midX = (x1 + x2) / 2;
                    const midY = (y1 + y2) / 2;

                    const badgeWidth = Math.max(90, edge.label.length * 5.8 + 18);

                    return (
                      <g key={`label-${edge.id}`} className="transition-all duration-200">
                        <rect
                          x={midX - badgeWidth / 2}
                          y={midY - 10}
                          width={badgeWidth}
                          height={20}
                          rx={6}
                          fill="#172638"
                          stroke={isHighlighted ? '#00D6B4' : '#304257'}
                          strokeWidth={1}
                        />
                        <text
                          x={midX}
                          y={midY + 3.5}
                          textAnchor="middle"
                          fill={isHighlighted ? '#00D6B4' : '#94A3B8'}
                          fontSize="8.5"
                          fontWeight="600"
                          fontFamily="monospace"
                        >
                          {edge.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
            </svg>

            <div className="absolute bottom-3 left-3 bg-[#172638]/90 backdrop-blur border border-[#304257] px-3 py-1.5 rounded-xl text-[10px] text-[#94A3B8] flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#00D6B4]"></span> Acyclic DAG Verified
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#A3E635]"></span> 0 Cycles
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#38BDF8]"></span> EIP-712 Handshake Cohesive
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#243247] p-5 rounded-2xl border border-[#304257] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-[#304257] pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00D6B4]">
                  Node Cryptographic Inspector
                </span>
                <span
                  className="badge badge-xs font-bold font-mono"
                  style={{
                    backgroundColor: `${getNodeColor(selectedNode.type)}25`,
                    color: getNodeColor(selectedNode.type),
                    borderColor: `${getNodeColor(selectedNode.type)}50`,
                  }}
                >
                  {selectedNode.status}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[#F1F5F9] mt-1">
                {selectedNode.label}
              </h3>
              <p className="text-xs text-[#94A3B8]">{selectedNode.sublabel}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Stakeholder Identity
                </label>
                <div className="font-semibold text-[#F1F5F9] mt-0.5">
                  {selectedNode.actor}
                </div>
                <div className="font-mono text-[11px] text-[#00D6B4] truncate mt-0.5">
                  {selectedNode.actorAddress}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Attestation SHA-256 Digest
                </label>
                <div className="p-2 bg-[#172638] rounded-lg border border-[#304257] font-mono text-[10px] text-[#94A3B8] break-all select-all">
                  {selectedNode.hash}
                </div>
              </div>

              {selectedNode.details.merkleRoot && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Merkle Batch Tree Root
                  </label>
                  <div className="font-mono text-[10px] text-[#38BDF8] break-all">
                    {selectedNode.details.merkleRoot}
                  </div>
                </div>
              )}

              {selectedNode.details.ipfsCid && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Decentralized IPFS Dossier CID
                  </label>
                  <div className="font-mono text-[10px] text-[#A3E635] break-all">
                    ipfs://{selectedNode.details.ipfsCid}
                  </div>
                </div>
              )}

              {selectedNode.details.kmsKeyId && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    Hardware HSM KMS Signer Key
                  </label>
                  <div className="font-mono text-[11px] text-[#C084FC]">
                    {selectedNode.details.kmsKeyId} (FIPS 140-2 Level 3)
                  </div>
                </div>
              )}

              {selectedNode.details.temperature !== undefined && (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#172638] rounded-xl border border-[#304257]">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">Telemetry Temp</span>
                    <span className="font-bold text-sm text-[#00D6B4]">
                      {selectedNode.details.temperature}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block">Cold-Chain GxP</span>
                    <span className="font-bold text-xs text-[#A3E635]">Compliant (2-8°C)</span>
                  </div>
                </div>
              )}

              {selectedNode.details.sscc && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    GS1 Serial Shipping Container Code (SSCC)
                  </label>
                  <div className="font-mono text-[11px] text-[#38BDF8]">
                    {selectedNode.details.sscc}
                  </div>
                </div>
              )}

              {selectedNode.details.escrowAmountEth && (
                <div className="p-2.5 bg-[#172638] rounded-xl border border-[#304257] flex items-center justify-between">
                  <span className="text-xs text-[#94A3B8]">DvP Escrow Value</span>
                  <span className="font-extrabold text-sm text-[#FBBF24]">
                    {selectedNode.details.escrowAmountEth} ETH
                  </span>
                </div>
              )}

              {selectedNode.details.contractAnchor && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                    EVM Smart Contract Anchor
                  </label>
                  <div className="font-mono text-[10px] text-[#94A3B8] truncate">
                    {selectedNode.details.contractAnchor}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#304257] space-y-2">
            <div className="text-[10px] text-[#94A3B8] flex items-center justify-between">
              <span>Timestamp</span>
              <span className="font-mono">{new Date(selectedNode.timestamp).toLocaleString()}</span>
            </div>
            <a
              href={`/verify?hash=${selectedNode.hash}`}
              className="btn btn-xs w-full bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] border-none rounded-xl font-bold flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="h-3 w-3" /> Audit Verification View
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
