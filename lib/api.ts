import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pharma_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface UserProfile {
  id: number;
  email: string;
  role: string;
  walletAddress?: string;
  organization?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

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

// Auth API Methods
export const registerUser = async (data: any): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', data);
  if (res.data.accessToken && typeof window !== 'undefined') {
    localStorage.setItem('pharma_access_token', res.data.accessToken);
  }
  return res.data;
};

export const loginUser = async (data: any): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', data);
  if (res.data.accessToken && typeof window !== 'undefined') {
    localStorage.setItem('pharma_access_token', res.data.accessToken);
  }
  return res.data;
};

export const web3LoginUser = async (data: {
  walletAddress: string;
  signature: string;
  message: string;
  role?: string;
  organization?: string;
}): Promise<AuthResponse> => {
  const res = await api.post('/auth/web3-login', data);
  if (res.data.accessToken && typeof window !== 'undefined') {
    localStorage.setItem('pharma_access_token', res.data.accessToken);
  }
  return res.data;
};

export const fetchProfile = async (): Promise<UserProfile> => {
  const res = await api.get('/auth/profile');
  return res.data;
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pharma_access_token');
  }
};

// Drug & Traceability Methods
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
