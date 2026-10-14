'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, Volume2, VolumeX, Smartphone, CheckCircle2, Scan } from 'lucide-react';
import { playScannerSound, triggerHaptic } from '@/lib/scanner-audio';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export function CameraQrScanner({ onScanSuccess, onClose }: QrScannerProps) {
  const [scanError, setScanError] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [detectedText, setDetectedText] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const soundRef = useRef(soundEnabled);
  const hapticRef = useRef(hapticEnabled);

  useEffect(() => {
    soundRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    hapticRef.current = hapticEnabled;
  }, [hapticEnabled]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        if (soundRef.current) {
          playScannerSound('beep');
        }
        if (hapticRef.current) {
          triggerHaptic('beep');
        }
        setDetectedText(decodedText);
        scanner.clear().catch(() => {});
        setTimeout(() => {
          onScanSuccess(decodedText);
        }, 280);
      },
      () => {}
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#243247] border border-[#304257] rounded-3xl p-6 shadow-2xl text-[#F1F5F9]">
        <div className="flex items-center justify-between pb-4 border-b border-[#304257]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#00D6B4] text-[#0B1220] flex items-center justify-center font-bold">
              <Scan className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F1F5F9]">Optical Medicine QR Scanner</h3>
              <p className="text-[11px] text-[#94A3B8]">Align GS1 / Digital Attestation code inside reticle</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Beep' : 'Enable Beep'}
              className={`btn btn-xs btn-circle border ${
                soundEnabled
                  ? 'bg-[#00D6B4]/15 border-[#00D6B4] text-[#00D6B4]'
                  : 'bg-[#172638] border-[#304257] text-[#94A3B8]'
              }`}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => setHapticEnabled(!hapticEnabled)}
              title={hapticEnabled ? 'Disable Haptic Pulse' : 'Enable Haptic Pulse'}
              className={`btn btn-xs btn-circle border ${
                hapticEnabled
                  ? 'bg-[#00D6B4]/15 border-[#00D6B4] text-[#00D6B4]'
                  : 'bg-[#172638] border-[#304257] text-[#94A3B8]'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost text-[#94A3B8] hover:text-white ml-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative my-4 overflow-hidden rounded-2xl bg-[#0B1220] border border-[#304257] min-h-[260px] flex items-center justify-center">
          <div id="qr-reader-container" className="w-full"></div>

          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="w-8 h-8 border-t-2 border-l-2 border-[#00D6B4] rounded-tl-lg" />
              <div className="w-8 h-8 border-t-2 border-r-2 border-[#00D6B4] rounded-tr-lg" />
            </div>
            <div className="flex items-center justify-center">
              <div className={`h-12 w-12 rounded-full border border-[#00D6B4]/40 flex items-center justify-center transition-all ${
                detectedText ? 'bg-[#A3E635]/30 border-[#A3E635] scale-125' : 'animate-ping'
              }`} />
            </div>
            <div className="flex justify-between">
              <div className="w-8 h-8 border-b-2 border-l-2 border-[#00D6B4] rounded-bl-lg" />
              <div className="w-8 h-8 border-b-2 border-r-2 border-[#00D6B4] rounded-br-lg" />
            </div>
          </div>

          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 pointer-events-none h-0.5 bg-[#00D6B4]/80 shadow-[0_0_12px_#00D6B4] animate-pulse" />
        </div>

        {detectedText && (
          <div className="p-3 bg-[#A3E635]/20 border border-[#A3E635]/40 rounded-xl text-xs font-mono text-[#A3E635] flex items-center gap-2 mb-3 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="truncate">Captured: {detectedText}</span>
          </div>
        )}

        {scanError && (
          <div className="alert alert-error text-xs rounded-xl py-2 px-3 text-[#0B1220] bg-[#F87171] border-none font-bold mb-3">
            {scanError}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-mono pt-1">
          <span>Audio: {soundEnabled ? 'Beep ON' : 'Muted'}</span>
          <span>Haptics: {hapticEnabled ? 'Pulse ON' : 'Disabled'}</span>
          <button
            onClick={onClose}
            className="btn btn-xs bg-[#172638] hover:bg-[#0B1220] text-[#94A3B8] border border-[#304257] rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
