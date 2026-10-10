import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Drug {
  id: number;
  serialNumber: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
  createdAt: string;
}

export interface DrugEvent {
  id: number;
  drugSerialNumber: string;
  eventType: string;
  eventData: any;
  eventHash: string;
  createdAt: string;
}

export interface AttestationVerification {
  exists: boolean;
  isValid: boolean;
  drugSerialNumber: string;
  eventType: string;
  signer: string;
  timestamp: number;
  metadataUri: string;
  onChain: boolean;
}

export const fetchDrugs = async (): Promise<Drug[]> => {
  const res = await api.get('/drugs');
  return res.data;
};

export const fetchDrugEvents = async (serialNumber: string): Promise<DrugEvent[]> => {
  const res = await api.get(`/drug-events/${serialNumber}`);
  return res.data;
};

export const createDrug = async (drugData: Partial<Drug>): Promise<Drug> => {
  const res = await api.post('/drugs', drugData);
  return res.data;
};

export const createDrugEvent = async (eventData: {
  drugSerialNumber: string;
  eventType: string;
  eventData: any;
}): Promise<DrugEvent> => {
  const res = await api.post('/drug-events', eventData);
  return res.data;
};

export const verifyAttestation = async (hash: string): Promise<AttestationVerification> => {
  const res = await api.get(`/blockchain/verify/${hash}`);
  return res.data;
};

export const verifyWalletSignature = async (message: string, signature: string, address: string) => {
  const res = await api.post('/blockchain/verify-signature', { message, signature, address });
  return res.data;
};
