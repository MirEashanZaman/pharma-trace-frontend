'use client';

import React from 'react';
import { CommandPalette } from './command-palette';
import { UserOpStatusDrawer } from './userop-status-drawer';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CommandPalette />
      <UserOpStatusDrawer />
    </>
  );
}
