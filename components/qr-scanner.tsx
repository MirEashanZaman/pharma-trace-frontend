'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export function CameraQrScanner({ onScanSuccess, onClose }: QrScannerProps) {
  const [scanError, setScanError] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        scanner.clear().catch(console.error);
        onScanSuccess(decodedText);
      },
      (error) => {
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#243247] border border-[#304257] rounded-3xl p-6 shadow-2xl text-[#F1F5F9]">
        <div className="flex items-center justify-between pb-4 border-b border-[#304257]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#00D6B4] text-[#0B1220] flex items-center justify-center font-bold">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F1F5F9]">Scan Drug Box QR Code</h3>
              <p className="text-[11px] text-[#94A3B8]">Align the QR code within the camera frame</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-[#94A3B8] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 overflow-hidden rounded-2xl bg-[#0B1220] border border-[#304257]">
          <div id="qr-reader-container" className="w-full"></div>
        </div>

        {scanError && (
          <div className="alert alert-error text-xs rounded-xl py-2 px-3 text-[#0B1220] bg-[#F87171] border-none font-bold mb-3">
            {scanError}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="btn btn-sm bg-[#172638] hover:bg-[#0B1220] text-[#94A3B8] border border-[#304257] rounded-xl font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
