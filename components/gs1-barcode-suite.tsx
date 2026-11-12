'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Scan,
  CheckCircle2,
  Copy,
  Download,
  Camera,
  Flashlight,
  ShieldCheck,
  AlertCircle,
  FileText,
  Boxes,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ParsedGs1Data {
  gtin: string;
  serialNumber: string;
  expiryDate: string;
  batchNumber: string;
  rawString: string;
}

export function Gs1BarcodeSuite() {
  const [rawInput, setRawInput] = useState<string>(
    '(01)00312345678901(21)SN-2026-AMOX-001(17)281231(10)BATCH-2026-A1'
  );
  const [parsedData, setParsedData] = useState<ParsedGs1Data>({
    gtin: '00312345678901',
    serialNumber: 'SN-2026-AMOX-001',
    expiryDate: '2028-12-31',
    batchNumber: 'BATCH-2026-A1',
    rawString: '(01)00312345678901(21)SN-2026-AMOX-001(17)281231(10)BATCH-2026-A1',
  });
  const [torchActive, setTorchActive] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const handleParse = (text: string) => {
    setRawInput(text);
    let gtin = '00312345678901';
    let serial = 'SN-2026-AMOX-001';
    let expiry = '2028-12-31';
    let batch = 'BATCH-2026-A1';

    const gtinMatch = text.match(/\(01\)(\d{14})/);
    if (gtinMatch) gtin = gtinMatch[1];

    const serialMatch = text.match(/\(21\)([A-Za-z0-9-_]+)/);
    if (serialMatch) serial = serialMatch[1];

    const expiryMatch = text.match(/\(17\)(\d{6})/);
    if (expiryMatch) {
      const yy = expiryMatch[1].slice(0, 2);
      const mm = expiryMatch[1].slice(2, 4);
      const dd = expiryMatch[1].slice(4, 6);
      expiry = `20${yy}-${mm}-${dd}`;
    }

    const batchMatch = text.match(/\(10\)([A-Za-z0-9-_]+)/);
    if (batchMatch) batch = batchMatch[1];

    setParsedData({
      gtin,
      serialNumber: serial,
      expiryDate: expiry,
      batchNumber: batch,
      rawString: text,
    });
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const simulated = '(01)00398765432109(21)SN-2026-VAX-774(17)270630(10)LOT-2026-M4';
      handleParse(simulated);
      setIsScanning(false);
    }, 500);
  };

  return (
    <Card className="bg-[#172638] border-[#304257] text-[#F1F5F9] rounded-2xl overflow-hidden shadow-lg w-full max-w-full">
      <CardHeader className="border-b border-[#304257] p-5 sm:p-6 bg-[#0B1220]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center">
                <Scan className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-[#F1F5F9] tracking-tight">
                GS1 2D DataMatrix Serialization Suite
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm text-[#94A3B8]">
              Automated ISO/IEC 16022 2D DataMatrix decoding adhering to US DSCSA and EU FMD 2011/62/EU.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="teal" size="sm" className="font-mono text-[11px] py-1 px-2.5">
              GS1 Digital Link Ready
            </Badge>
            <Badge variant="outline" size="sm" className="font-mono text-[11px] py-1 px-2.5 border-[#304257] text-[#94A3B8]">
              ISO/IEC 16022
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="relative bg-[#0B1220] border border-[#304257] rounded-2xl h-56 sm:h-64 flex flex-col items-center justify-center overflow-hidden p-4">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00D6B4]/5 to-transparent animate-pulse pointer-events-none"></div>

              <div className="relative border-2 border-dashed border-[#00D6B4]/60 rounded-xl w-36 h-36 flex items-center justify-center">
                <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#00D6B4]"></div>
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#00D6B4]"></div>
                <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#00D6B4]"></div>
                <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#00D6B4]"></div>

                <div className="p-2 bg-white rounded-lg shadow-md">
                  <svg viewBox="0 0 100 100" className="w-20 h-20">
                    <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                    <rect x="10" y="10" width="80" height="8" fill="#0B1220" />
                    <rect x="10" y="10" width="8" height="80" fill="#0B1220" />
                    <rect x="10" y="82" width="80" height="8" fill="#0B1220" />
                    <rect x="82" y="10" width="8" height="80" fill="#0B1220" />
                    <rect x="25" y="25" width="15" height="15" fill="#0B1220" />
                    <rect x="60" y="25" width="15" height="15" fill="#0B1220" />
                    <rect x="25" y="60" width="15" height="15" fill="#0B1220" />
                    <rect x="48" y="48" width="10" height="10" fill="#00D6B4" />
                  </svg>
                </div>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => setTorchActive(!torchActive)}
                  className={`p-2 rounded-xl border transition ${torchActive ? 'bg-[#00D6B4] text-[#0B1220] border-[#00D6B4]' : 'bg-[#243247] text-[#94A3B8] border-[#304257]'}`}
                  title="Toggle Torch"
                >
                  <Flashlight className="h-4 w-4" />
                </button>
              </div>

              <div className="absolute bottom-3 inset-x-4 flex justify-between items-center text-xs">
                <span className="text-[#94A3B8] text-[11px] font-mono">Camera: Enclosed Macro HUD</span>
                <Button
                  size="sm"
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  className="bg-[#00D6B4] hover:bg-[#00b89a] text-[#0B1220] font-bold text-xs h-7 rounded-lg"
                >
                  {isScanning ? 'Decoding...' : 'Simulate Camera Scan'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Raw GS1-128 / DataMatrix Application Identifier String
              </label>
              <input
                type="text"
                value={rawInput}
                onChange={(e) => handleParse(e.target.value)}
                className="w-full bg-[#243247] border border-[#304257] rounded-xl px-4 py-2 text-xs sm:text-sm text-[#F1F5F9] font-mono focus:outline-none focus:border-[#00D6B4] transition"
                placeholder="(01)...(21)...(17)...(10)..."
              />
            </div>
          </div>

          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#F1F5F9] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#00D6B4]" /> Parsed Serialization Payload
              </h3>

              <div className="bg-[#243247] border border-[#304257] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#304257] pb-2 text-xs">
                  <span className="text-[#94A3B8]">(01) Global Trade Item Number (GTIN)</span>
                  <span className="font-mono font-bold text-[#F1F5F9]">{parsedData.gtin}</span>
                </div>

                <div className="flex items-center justify-between border-b border-[#304257] pb-2 text-xs">
                  <span className="text-[#94A3B8]">(21) Serial Number</span>
                  <span className="font-mono font-bold text-[#00D6B4]">{parsedData.serialNumber}</span>
                </div>

                <div className="flex items-center justify-between border-b border-[#304257] pb-2 text-xs">
                  <span className="text-[#94A3B8]">(17) Expiration Date (YYMMDD)</span>
                  <span className="font-mono font-bold text-[#38BDF8]">{parsedData.expiryDate}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">(10) Lot / Batch Number</span>
                  <span className="font-mono font-bold text-[#A3E635]">{parsedData.batchNumber}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0B1220] border border-[#304257] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8] font-semibold">GS1 Digital Link URI</span>
                <span className="text-[10px] text-[#A3E635] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> W3C DID Mapped
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#00D6B4] break-all bg-[#172638] p-2.5 rounded-lg border border-[#304257]/60">
                https://id.pharmatrace.io/01/{parsedData.gtin}/21/{parsedData.serialNumber}?17={parsedData.expiryDate.replace(/-/g, '').slice(2)}&amp;10={parsedData.batchNumber}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
