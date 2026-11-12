'use client';

import React, { useState } from 'react';
import {
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Cpu,
  RefreshCw,
  TrendingDown,
  Layers,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TelemetryPoint {
  time: string;
  temp: number;
  humidity: number;
  isExcursion?: boolean;
}

export function ColdChainChart({ shipmentId = 'SHIPMENT-BOND-2026-01' }: { shipmentId?: string }) {
  const [activeRange, setActiveRange] = useState<'24h' | '48h' | '7d'>('24h');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const [points, setPoints] = useState<TelemetryPoint[]>([
    { time: '00:00', temp: 4.2, humidity: 45 },
    { time: '03:00', temp: 4.5, humidity: 46 },
    { time: '06:00', temp: 5.1, humidity: 48 },
    { time: '09:00', temp: 4.8, humidity: 47 },
    { time: '12:00', temp: 5.4, humidity: 50 },
    { time: '15:00', temp: 6.2, humidity: 52 },
    { time: '18:00', temp: 4.9, humidity: 48 },
    { time: '21:00', temp: 4.3, humidity: 46 },
  ]);

  const minSafeTemp = 2.0;
  const maxSafeTemp = 8.0;

  const width = 740;
  const height = 220;
  const padding = { top: 25, right: 30, bottom: 35, left: 45 };

  const minScale = 0;
  const maxScale = 10;

  const getX = (index: number) => {
    const usableWidth = width - padding.left - padding.right;
    return padding.left + (index / (points.length - 1)) * usableWidth;
  };

  const getY = (val: number) => {
    const usableHeight = height - padding.top - padding.bottom;
    const normalized = (val - minScale) / (maxScale - minScale);
    return height - padding.bottom - normalized * usableHeight;
  };

  const safeBandTop = getY(maxSafeTemp);
  const safeBandBottom = getY(minSafeTemp);
  const safeBandHeight = safeBandBottom - safeBandTop;

  const pathD = points.reduce((acc, pt, i) => {
    const x = getX(i);
    const y = getY(pt.temp);
    if (i === 0) return `M ${x} ${y}`;
    const prevX = getX(i - 1);
    const prevY = getY(points[i - 1].temp);
    const cx1 = prevX + (x - prevX) / 2;
    const cx2 = prevX + (x - prevX) / 2;
    return `${acc} C ${cx1} ${prevY}, ${cx2} ${y}, ${x} ${y}`;
  }, '');

  const handleSimulateExcursion = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setPoints((prev) => [
        ...prev.slice(0, 6),
        { time: '18:00', temp: 9.1, humidity: 58, isExcursion: true },
        { time: '21:00', temp: 7.8, humidity: 54 },
      ]);
      setIsSimulating(false);
    }, 400);
  };

  const handleResetTelemetry = () => {
    setPoints([
      { time: '00:00', temp: 4.2, humidity: 45 },
      { time: '03:00', temp: 4.5, humidity: 46 },
      { time: '06:00', temp: 5.1, humidity: 48 },
      { time: '09:00', temp: 4.8, humidity: 47 },
      { time: '12:00', temp: 5.4, humidity: 50 },
      { time: '15:00', temp: 6.2, humidity: 52 },
      { time: '18:00', temp: 4.9, humidity: 48 },
      { time: '21:00', temp: 4.3, humidity: 46 },
    ]);
  };

  const hasExcursion = points.some((p) => p.temp > maxSafeTemp || p.temp < minSafeTemp);

  return (
    <Card className="bg-[#172638] border-[#304257] text-[#F1F5F9] rounded-2xl overflow-hidden shadow-lg w-full max-w-full">
      <CardHeader className="border-b border-[#304257] p-5 sm:p-6 bg-[#0B1220]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#00D6B4]/15 text-[#00D6B4] flex items-center justify-center">
                <Thermometer className="h-4 w-4" />
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-[#F1F5F9] tracking-tight">
                Real-Time Cold Chain IoT Telemetry
              </CardTitle>
            </div>
            <CardDescription className="text-xs sm:text-sm text-[#94A3B8]">
              Automated multi-sensor consensus and smart contract threshold monitoring for biologics and vaccines.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={hasExcursion ? 'destructive' : 'teal'} size="sm" className="font-mono text-[11px] gap-1.5 py-1 px-2.5">
              <span className={`h-1.5 w-1.5 rounded-full ${hasExcursion ? 'bg-rose-400' : 'bg-[#00D6B4]'} animate-pulse`}></span>
              {hasExcursion ? 'Excursion Detected' : 'Safe 2.0C - 8.0C Compliant'}
            </Badge>
            <div className="flex items-center bg-[#243247] rounded-lg p-0.5 border border-[#304257]">
              {(['24h', '48h', '7d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRange(r)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${activeRange === r ? 'bg-[#00D6B4] text-[#0B1220]' : 'text-[#94A3B8] hover:text-[#F1F5F9]'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        <div className="w-full overflow-hidden bg-[#0B1220] rounded-xl border border-[#304257] p-2 sm:p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-full overflow-visible" preserveAspectRatio="xMidYMid meet">
            <rect
              x={padding.left}
              y={safeBandTop}
              width={width - padding.left - padding.right}
              height={safeBandHeight}
              fill="#00D6B4"
              fillOpacity="0.08"
            />
            <line
              x1={padding.left}
              y1={safeBandTop}
              x2={width - padding.right}
              y2={safeBandTop}
              stroke="#00D6B4"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
            <line
              x1={padding.left}
              y1={safeBandBottom}
              x2={width - padding.right}
              y2={safeBandBottom}
              stroke="#00D6B4"
              strokeDasharray="4 4"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />

            {[0, 2, 4, 6, 8, 10].map((t) => {
              const y = getY(t);
              return (
                <g key={t}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#304257"
                    strokeWidth="0.8"
                    strokeOpacity="0.5"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fill="#64748B"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {t}C
                  </text>
                </g>
              );
            })}

            {points.map((pt, i) => {
              const x = getX(i);
              return (
                <text
                  key={i}
                  x={x}
                  y={height - padding.bottom + 18}
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {pt.time}
                </text>
              );
            })}

            <path
              d={pathD}
              fill="none"
              stroke={hasExcursion ? '#F43F5E' : '#00D6B4'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {points.map((pt, i) => {
              const x = getX(i);
              const y = getY(pt.temp);
              const isBreach = pt.temp > maxSafeTemp || pt.temp < minSafeTemp;
              return (
                <g key={i} className="cursor-pointer group">
                  <circle
                    cx={x}
                    cy={y}
                    r={isBreach ? 6 : 4}
                    fill={isBreach ? '#F43F5E' : '#00D6B4'}
                    stroke="#0B1220"
                    strokeWidth="2"
                  />
                  {isBreach && (
                    <circle
                      cx={x}
                      cy={y}
                      r="10"
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="1.5"
                      className="animate-ping opacity-75"
                    />
                  )}
                  <text
                    x={x}
                    y={y - 10}
                    textAnchor="middle"
                    fill={isBreach ? '#F43F5E' : '#F1F5F9'}
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pt.temp.toFixed(1)}C
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#243247] border border-[#304257] rounded-xl p-4 space-y-1">
            <span className="text-xs text-[#94A3B8]">Cluster Median Temp</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#00D6B4]">
              {(points.reduce((acc, p) => acc + p.temp, 0) / points.length).toFixed(2)}C
            </div>
            <span className="text-[11px] text-[#A3E635] flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> 3/3 Sensors in Agreement
            </span>
          </div>

          <div className="bg-[#243247] border border-[#304257] rounded-xl p-4 space-y-1">
            <span className="text-xs text-[#94A3B8]">Relative Humidity</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#38BDF8]">
              {points[points.length - 1].humidity}% RH
            </div>
            <span className="text-[11px] text-[#94A3B8]">Within 30% - 65% USP range</span>
          </div>

          <div className="bg-[#243247] border border-[#304257] rounded-xl p-4 space-y-1">
            <span className="text-xs text-[#94A3B8]">Oracle Automation Slash</span>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#F1F5F9]">
              {hasExcursion ? '15% Penalized' : '0% (Standard)'}
            </div>
            <span className={`text-[11px] ${hasExcursion ? 'text-rose-400 font-bold' : 'text-[#A3E635]'}`}>
              {hasExcursion ? 'Carrier Staking Bond Slashed' : 'Bond Retained Safe'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <Cpu className="h-4 w-4 text-[#00D6B4]" />
            <span>Sensors: Sensirion SHT40, Bosch BME688, Honeywell HIH8120</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSimulateExcursion}
              disabled={isSimulating}
              className="border-[#F43F5E]/40 text-rose-300 hover:bg-rose-500/10 text-xs rounded-xl h-8"
            >
              Simulate Breach
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetTelemetry}
              className="border-[#304257] text-[#94A3B8] hover:text-[#F1F5F9] text-xs rounded-xl h-8"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
