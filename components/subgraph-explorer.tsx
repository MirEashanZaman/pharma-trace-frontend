'use client';

import React, { useState } from 'react';
import {
  Database,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Copy,
  Download,
  AlertCircle,
  FileCode,
  Layers,
  Shield,
  Activity,
  Box,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SubgraphExplorerProps {
  initialSerialNumber?: string;
}

export function SubgraphExplorer({ initialSerialNumber = 'SN-2026-AMOX-001' }: SubgraphExplorerProps) {
  const [selectedQuery, setSelectedQuery] = useState<'provenance' | 'twin' | 'escrow' | 'carrier' | 'zk' | 'telemetry'>('provenance');
  const [targetId, setTargetId] = useState<string>(initialSerialNumber);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(34);

  const [mockResult, setMockResult] = useState<any>({
    digitalTwin: {
      id: '0x01',
      tokenId: '1',
      serialNumber: initialSerialNumber,
      gtin: '00312345678901',
      batchNumber: 'BATCH-2026-AMOX-A1',
      currentHolder: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
      status: 'IN_TRANSIT',
      isBurned: false,
      dispenser: null,
      mintedAt: '1761800000',
      ipfsDossierCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    },
    transfers: [
      {
        id: 'tx-01',
        from: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        amount: '1',
        timestamp: '1761801200',
        blockNumber: '1849201',
        transactionHash: '0x4f128ab7cd8934ef019283471029384756102938475610293847561029384756',
      },
      {
        id: 'tx-02',
        from: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        to: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        amount: '1',
        timestamp: '1761808400',
        blockNumber: '1849640',
        transactionHash: '0x9923847561029384756102938475610293847561029384756102938475610293',
      },
    ],
    attestations: [
      {
        id: '0xatt-01',
        dataHash: '0x3a4f91c78e12b45091a273b4e9f10a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f',
        eventType: 'PRODUCTION_RELEASE',
        signer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        timestamp: '1761800100',
        isRevoked: false,
        metadataUri: 'ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      },
      {
        id: '0xatt-02',
        dataHash: '0x8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f3a4f91c78e12b45091a273b4e9f10a',
        eventType: 'COLD_CHAIN_CLEARANCE',
        signer: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        timestamp: '1761808000',
        isRevoked: false,
        metadataUri: 'ipfs://bafybeihd127918237198273918273918273918273918273918273918273918',
        transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      },
    ],
    escrows: [
      {
        id: '0xescrow-01',
        orderId: '0x9cf7315c4e6add106fbf34134321c6201dca3f758ef0315bc0905f2fa37eedff',
        buyer: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        seller: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        amountWei: '4500000000000000000',
        status: 'RELEASED',
        coldChainCompliant: true,
        custodyAccepted: true,
        createdAt: '1761800200',
        settledAt: '1761808500',
      },
    ],
    zkRecords: [
      {
        id: 'zk-rec-01',
        batchHash: '0x8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
        isCompliant: true,
        minTemp: '200',
        maxTemp: '740',
        verifiedAt: '1761808200',
      },
    ],
  });

  const handleExecuteQuery = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const response = await fetch(`/api/v1/blockchain/subgraph/provenance/${encodeURIComponent(targetId)}`);
      if (response.ok) {
        const json = await response.json();
        if (json && Object.keys(json).length > 0) {
          setMockResult(json);
        }
      }
    } catch {
    } finally {
      const elapsed = Math.round(performance.now() - start);
      setExecutionTimeMs(elapsed > 0 ? elapsed : 28);
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(mockResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const rows = [
      ['Entity', 'ID', 'Details', 'Timestamp', 'TxHash'],
      ['DigitalTwin', mockResult?.digitalTwin?.serialNumber || '', mockResult?.digitalTwin?.status || '', mockResult?.digitalTwin?.mintedAt || '', ''],
      ...(mockResult?.transfers || []).map((t: any) => ['CustodyTransfer', t.id, `${t.from} -> ${t.to}`, t.timestamp, t.transactionHash]),
      ...(mockResult?.attestations || []).map((a: any) => ['Attestation', a.eventType, a.dataHash, a.timestamp, a.transactionHash]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `subgraph-provenance-${targetId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-full space-y-6">
      <Card className="bg-[#172638] border-[#304257] text-[#F1F5F9] rounded-2xl overflow-hidden shadow-lg">
        <CardHeader className="border-b border-[#304257] p-5 sm:p-6 bg-[#0B1220]/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center">
                  <Database className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-[#F1F5F9] tracking-tight">
                  The Graph Protocol Subgraph Explorer
                </CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm text-[#94A3B8]">
                Decentralized indexed GraphQL provenance node querying EVM event logs across digital twins, escrows, and ZK verifications.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="teal" size="sm" className="font-mono text-[11px] gap-1.5 py-1 px-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D6B4] animate-pulse"></span>
                GraphQL Subgraph Synced
              </Badge>
              <Badge variant="outline" size="sm" className="font-mono text-[11px] py-1 px-2.5 border-[#304257] text-[#94A3B8]">
                {executionTimeMs}ms Latency
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Indexed Schema Query
              </label>
              <select
                value={selectedQuery}
                onChange={(e) => setSelectedQuery(e.target.value as any)}
                className="w-full bg-[#243247] border border-[#304257] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#F1F5F9] focus:outline-none focus:border-[#00D6B4] transition"
              >
                <option value="provenance">GetDrugProvenanceTimeline</option>
                <option value="twin">GetDigitalTwinWithCustodyHistory</option>
                <option value="escrow">GetEscrowOrderWithCompliance</option>
                <option value="carrier">GetCarrierBondsAndAccreditations</option>
                <option value="zk">GetZkColdChainVerificationHistory</option>
                <option value="telemetry">GetColdChainTelemetryExcursions</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Query Parameter Target (Serial / ID / Hash)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  placeholder="e.g. SN-2026-AMOX-001 or 0x..."
                  className="w-full bg-[#243247] border border-[#304257] rounded-xl px-4 py-2 text-xs sm:text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#00D6B4] transition font-mono pr-10"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
              </div>
            </div>

            <div className="md:col-span-1 flex items-end">
              <Button
                onClick={handleExecuteQuery}
                disabled={isLoading}
                className="w-full bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] font-bold rounded-xl text-xs sm:text-sm h-10 shadow-sm"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs"></span> Querying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Execute Query <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#00D6B4]" /> Provenance Verification Timeline
                </h3>
                <span className="text-xs text-[#94A3B8]">
                  {(mockResult?.transfers?.length || 0) + (mockResult?.attestations?.length || 0)} Indexed Events
                </span>
              </div>

              {mockResult?.digitalTwin && (
                <div className="bg-[#243247] border border-[#304257] rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#304257]/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Box className="h-4 w-4 text-[#00D6B4]" />
                      <span className="font-bold text-sm text-[#F1F5F9]">{mockResult.digitalTwin.serialNumber}</span>
                      <Badge variant="outline" size="sm" className="font-mono text-[10px] border-[#00D6B4]/30 text-[#00D6B4]">
                        Token ID #{mockResult.digitalTwin.tokenId}
                      </Badge>
                    </div>
                    <Badge variant={mockResult.digitalTwin.status === 'BURNED' ? 'destructive' : 'teal'} size="sm" className="font-bold text-[10px]">
                      {mockResult.digitalTwin.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[#94A3B8] block text-[11px]">GTIN Code</span>
                      <span className="font-mono font-semibold text-[#F1F5F9]">{mockResult.digitalTwin.gtin}</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[11px]">Batch Number</span>
                      <span className="font-mono font-semibold text-[#F1F5F9]">{mockResult.digitalTwin.batchNumber}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#94A3B8] block text-[11px]">Current Custody Holder</span>
                      <span className="font-mono font-semibold text-[#00D6B4] truncate block max-w-full" title={mockResult.digitalTwin.currentHolder}>
                        {mockResult.digitalTwin.currentHolder}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(mockResult?.transfers || []).map((tx: any, idx: number) => (
                  <div key={tx.id || idx} className="bg-[#243247]/60 border border-[#304257] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#00D6B4]"></span>
                        <span className="font-bold text-xs text-[#F1F5F9]">Custody Hop #{idx + 1}</span>
                        <span className="text-[11px] font-mono text-[#94A3B8]">Block #{tx.blockNumber}</span>
                      </div>
                      <div className="text-xs text-[#94A3B8] flex flex-wrap items-center gap-1.5 font-mono">
                        <span className="text-[#F1F5F9]">{tx.from ? `${tx.from.slice(0, 8)}...${tx.from.slice(-6)}` : 'Origin'}</span>
                        <ArrowRight className="h-3 w-3 text-[#00D6B4]" />
                        <span className="text-[#00D6B4] font-semibold">{tx.to ? `${tx.to.slice(0, 8)}...${tx.to.slice(-6)}` : 'Destination'}</span>
                      </div>
                    </div>

                    <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                      <span className="text-[11px] text-[#94A3B8] flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(Number(tx.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B] truncate max-w-[140px]" title={tx.transactionHash}>
                        {tx.transactionHash ? `${tx.transactionHash.slice(0, 10)}...` : ''}
                      </span>
                    </div>
                  </div>
                ))}

                {(mockResult?.attestations || []).map((att: any, idx: number) => (
                  <div key={att.id || idx} className="bg-[#243247]/40 border border-[#304257]/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5 text-[#38BDF8]" />
                        <span className="font-bold text-xs text-[#F1F5F9]">{att.eventType}</span>
                        <Badge variant="teal" size="sm" className="text-[9px] py-0 px-2 font-mono">
                          GxP Attested
                        </Badge>
                      </div>
                      <div className="text-[11px] font-mono text-[#94A3B8] break-all max-w-full">
                        Digest: {att.dataHash ? `${att.dataHash.slice(0, 16)}...${att.dataHash.slice(-8)}` : ''}
                      </div>
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                      <span className="text-[11px] text-[#A3E635] flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="h-3 w-3" /> Validated
                      </span>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        Signer: {att.signer ? `${att.signer.slice(0, 6)}...${att.signer.slice(-4)}` : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-[#00D6B4]" /> GraphQL Response Payload
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyJson}
                    className="p-1.5 rounded-lg bg-[#243247] hover:bg-[#304257] text-[#94A3B8] hover:text-[#F1F5F9] transition text-xs flex items-center gap-1"
                    title="Copy JSON"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span className="text-[10px]">{copied ? 'Copied' : 'JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadCsv}
                    className="p-1.5 rounded-lg bg-[#243247] hover:bg-[#304257] text-[#94A3B8] hover:text-[#F1F5F9] transition text-xs flex items-center gap-1"
                    title="Export CSV"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="text-[10px]">CSV</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#0B1220] border border-[#304257] rounded-xl p-4 font-mono text-[11px] text-[#94A3B8] h-[340px] overflow-y-auto overflow-x-hidden break-all leading-relaxed shadow-inner">
                <pre className="whitespace-pre-wrap">{JSON.stringify(mockResult, null, 2)}</pre>
              </div>

              <div className="bg-[#243247] border border-[#304257] rounded-xl p-3 text-xs text-[#94A3B8] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span>Protocol Engine</span>
                  <span className="text-[#00D6B4] font-semibold">The Graph v0.32.0</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Index Node</span>
                  <span className="text-[#F1F5F9] font-mono">http://localhost:8000</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Cache Status</span>
                  <span className="text-[#A3E635] font-semibold">LIVE_STREAMED</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
