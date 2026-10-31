'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface VerifySerialPageProps {
  params: {
    serialNumber: string;
  };
}

export default function VerifySerialPage({ params }: VerifySerialPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (params.serialNumber) {
      router.replace(`/verify?serial=${encodeURIComponent(params.serialNumber)}`);
    } else {
      router.replace('/verify');
    }
  }, [params.serialNumber, router]);

  return (
    <div className="min-h-screen bg-[#0B1220] text-[#F1F5F9] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="loading loading-spinner text-[#00D6B4] loading-lg" />
      <div className="text-center space-y-1">
        <h2 className="text-base font-bold text-[#F1F5F9]">Resolving Medicine Serialization</h2>
        <p className="text-xs text-[#94A3B8] font-mono">Querying ledger for {params.serialNumber}...</p>
      </div>
    </div>
  );
}
