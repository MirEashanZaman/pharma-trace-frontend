'use client';

import React from 'react';
import { Thermometer, Droplets } from 'lucide-react';

export interface OverviewTabProps {
  drugsCount: number;
  eventsCount: number;
  liveTemp: number;
  liveHumidity: number;
  tempExcursion: boolean;
  wsConnected: boolean;
}

export function OverviewTab({
  drugsCount,
  eventsCount,
  liveTemp,
  liveHumidity,
  tempExcursion,
  wsConnected,
}: OverviewTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5">
          <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Registered Batches</span>
          <p className="text-3xl font-black text-[#F1F5F9] mt-2">{drugsCount}</p>
        </div>
        <div className="card bg-[#243247] border border-[#304257] shadow-sm rounded-2xl p-5">
          <span className="text-xs text-[#94A3B8] uppercase font-bold tracking-wider">Saga Events Processed</span>
          <p className="text-3xl font-black text-[#00D6B4] mt-2">{eventsCount}</p>
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
    </div>
  );
}

