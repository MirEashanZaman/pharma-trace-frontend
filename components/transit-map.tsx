'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { Truck, ShieldCheck, Thermometer, Navigation2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface RoutePoint {
  id: string;
  name: string;
  role: string;
  lat: number;
  lng: number;
  status: 'COMPLETED' | 'IN_TRANSIT' | 'SCHEDULED';
  temp: number;
  timestamp: string;
  handler: string;
}

interface TransitMapProps {
  serialNumber?: string;
  currentTemp?: number;
  isExcursion?: boolean;
}

const DEFAULT_ROUTE: RoutePoint[] = [
  {
    id: 'pt-1',
    name: 'Pfizer Bio-Manufacturing Plant 04',
    role: 'MANUFACTURER',
    lat: 40.7128,
    lng: -74.006,
    status: 'COMPLETED',
    temp: 4.1,
    timestamp: '2026-10-10 08:30 UTC',
    handler: 'Dr. Marcus Vance (Batch Lead)',
  },
  {
    id: 'pt-2',
    name: 'MediCold Global Logistics Hub',
    role: 'DISTRIBUTOR',
    lat: 40.7589,
    lng: -73.9851,
    status: 'COMPLETED',
    temp: 3.9,
    timestamp: '2026-10-11 14:15 UTC',
    handler: 'Apex Fleet Driver #408',
  },
  {
    id: 'pt-3',
    name: 'Live Cold-Chain Vehicle in Transit',
    role: 'IN_TRANSIT',
    lat: 40.7829,
    lng: -73.9654,
    status: 'IN_TRANSIT',
    temp: 4.4,
    timestamp: 'Live IoT Telemetry Ping',
    handler: 'Autonomous Reefer Van TX-92',
  },
  {
    id: 'pt-4',
    name: 'Metropolitan Central Hospital Pharmacy',
    role: 'PHARMACY',
    lat: 40.8075,
    lng: -73.9465,
    status: 'SCHEDULED',
    temp: 4.0,
    timestamp: 'Estimated Delivery: 2026-10-12 18:00 UTC',
    handler: 'Chief Pharmacist S. Jenkins',
  },
];

export default function TransitMap({ serialNumber, currentTemp = 4.2, isExcursion = false }: TransitMapProps) {
  const [mounted, setMounted] = useState(false);
  const [activePoint, setActivePoint] = useState<RoutePoint>(DEFAULT_ROUTE[2]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[480px] w-full rounded-2xl bg-[#0B1220] border border-[#304257] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="loading loading-spinner text-[#00D6B4] loading-lg"></div>
        <span className="text-xs font-mono tracking-wider uppercase text-slate-400">
          Initializing Uber-Style Dark Cartography...
        </span>
      </div>
    );
  }

  const createCustomIcon = (status: RoutePoint['status']) => {
    const isLive = status === 'IN_TRANSIT';
    const isCompleted = status === 'COMPLETED';
    const bgCol = isLive ? '#00D6B4' : isCompleted ? '#3B82F6' : '#64748B';

    return L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div style="
          background: ${bgCol};
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid #0B1220;
          box-shadow: 0 0 ${isLive ? '16px #00D6B4' : '6px rgba(0,0,0,0.5)'};
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="background: #ffffff; width: 6px; height: 6px; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
  };

  const polylineCoords = DEFAULT_ROUTE.map((pt) => [pt.lat, pt.lng] as [number, number]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#304257] bg-[#0B1220] shadow-2xl">
      <div className="absolute top-4 left-4 z-[1000] max-w-sm w-full bg-[#0B1220]/90 backdrop-blur-md p-4 rounded-xl border border-[#304257] shadow-xl text-[#F1F5F9] space-y-3 pointer-events-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D6B4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D6B4]"></span>
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-[#00D6B4]">
              Uber-Style Live Dispatch
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#172638] text-slate-300 border border-[#304257]">
            {serialNumber || 'RX-994821'}
          </span>
        </div>

        <div className="bg-[#172638]/90 rounded-lg p-3 border border-[#304257] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Live Cold-Chain Temp</div>
            <div className="text-lg font-black font-mono text-[#F1F5F9] flex items-center gap-1.5">
              <Thermometer className={`h-4 w-4 ${isExcursion ? 'text-rose-400' : 'text-[#00D6B4]'}`} />
              {currentTemp.toFixed(1)}°C
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Excursion Status</div>
            <span
              className={`badge badge-sm font-bold text-[10px] border-none ${
                isExcursion ? 'bg-rose-500/20 text-rose-300' : 'bg-[#00D6B4]/20 text-[#00D6B4]'
              }`}
            >
              {isExcursion ? 'ALERT OUT-OF-SPEC' : 'OPTIMAL (2°-8°C)'}
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Waypoint</div>
          <div className="text-xs font-bold text-[#F1F5F9] truncate">{activePoint.name}</div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>{activePoint.handler}</span>
            <span className="font-mono text-[#00D6B4]">{activePoint.temp}°C</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-[1000] bg-[#0B1220]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-[#304257] shadow-xl text-[11px] text-slate-300 flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#3B82F6]"></span>
          <span>Checkpoint Passed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#00D6B4] animate-pulse"></span>
          <span>Live Vehicle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#64748B]"></span>
          <span>Destination</span>
        </div>
      </div>

      <div className="h-[480px] w-full z-0">
        <MapContainer
          center={[40.7589, -73.9851]}
          zoom={12.5}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ background: '#090D16' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: '#00D6B4',
              weight: 4,
              opacity: 0.9,
              dashArray: '8, 8',
            }}
          />

          {DEFAULT_ROUTE.map((point) => (
            <React.Fragment key={point.id}>
              {point.status === 'IN_TRANSIT' && (
                <CircleMarker
                  center={[point.lat, point.lng]}
                  radius={24}
                  pathOptions={{
                    color: '#00D6B4',
                    fillColor: '#00D6B4',
                    fillOpacity: 0.2,
                    weight: 1,
                  }}
                />
              )}
              <Marker
                position={[point.lat, point.lng]}
                icon={createCustomIcon(point.status)}
                eventHandlers={{
                  click: () => setActivePoint(point),
                }}
              >
                <Popup className="uber-map-popup">
                  <div className="p-1 space-y-1 text-[#0B1220]">
                    <div className="font-bold text-xs">{point.name}</div>
                    <div className="text-[10px] text-slate-600 font-mono">{point.timestamp}</div>
                    <div className="text-[10px] text-slate-800 font-semibold">
                      Handler: {point.handler}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-teal-700">
                      Cold-Chain Temp: {point.temp}°C
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
