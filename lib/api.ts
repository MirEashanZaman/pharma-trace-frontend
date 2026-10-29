import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pharma_access_token');
    if (token && typeof token === 'string' && token.split('.').length === 3) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('pharma_access_token');
      localStorage.removeItem('pharma_user');
    }
    return Promise.reject(error);
  },
);

export interface UserProfile {
  id: number;
  email: string;
  role: string;
  fullName?: string;
  walletAddress?: string;
  organization?: string;
  isDisabled?: boolean;
  warningCount?: number;
  warningReason?: string;
  warningIssuedAt?: string;
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
  transactionHash?: string;
  explorerUrl?: string;
}

export interface ComplianceDossier {
  serialNumber: string;
  drugName: string;
  manufacturer: string;
  batchNumber: string;
  createdAt: string;
  complianceSummary: {
    standard: string;
    disposition: string;
    isRecalled: boolean;
    totalEvents: number;
    totalTelemetryPings: number;
    compliantReadings: number;
    excursionReadings: number;
    compliancePercentage: number;
    minTemperature: number;
    maxTemperature: number;
    averageTemperature: number;
    auditTimestamp: string;
    auditInspectorAuthority: string;
  };
  custodyTimeline: Array<{
    step: number;
    id: number;
    eventType: string;
    timestamp: string;
    eventHash: string;
    handler: string;
    role: string;
    temperature: number | null;
    humidity: number | null;
    location: string;
    signerAddress: string;
  }>;
}


export const registerUser = async (data: any): Promise<AuthResponse> => {
  const res = await api.post('/auth/register', data);
  if (res.data.accessToken && typeof window !== 'undefined') {
    localStorage.setItem('pharma_access_token', res.data.accessToken);
    if (res.data.user) {
      localStorage.setItem('pharma_user', JSON.stringify(res.data.user));
    }
  }
  return res.data;
};

export const loginUser = async (data: any): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', data);
  if (res.data.accessToken && typeof window !== 'undefined') {
    localStorage.setItem('pharma_access_token', res.data.accessToken);
    if (res.data.user) {
      localStorage.setItem('pharma_user', JSON.stringify(res.data.user));
    }
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
    if (res.data.user) {
      localStorage.setItem('pharma_user', JSON.stringify(res.data.user));
    }
  }
  return res.data;
};

export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string; previewOtp?: string }> => {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
};

export const verifyOtp = async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post('/auth/verify-otp', { email, otp });
  return res.data;
};

export const resetPassword = async (data: { email: string; otp: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
  const res = await api.post('/auth/reset-password', data);
  return res.data;
};

export const fetchProfile = async (): Promise<UserProfile> => {
  const res = await api.get('/auth/profile');
  if (res.data && typeof window !== 'undefined') {
    localStorage.setItem('pharma_user', JSON.stringify(res.data));
  }
  return res.data;
};

export interface UpdateProfilePayload {
  fullName?: string;
  organization?: string;
  walletAddress?: string;
  role?: string;
  password?: string;
}

export const updateProfile = async (data: UpdateProfilePayload): Promise<UserProfile> => {
  const res = await api.put('/auth/profile', data);
  if (res.data && typeof window !== 'undefined') {
    localStorage.setItem('pharma_user', JSON.stringify(res.data));
    window.dispatchEvent(new Event('pharma_profile_updated'));
  }
  return res.data;
};

export const fetchUsers = async (): Promise<UserProfile[]> => {
  const res = await api.get('/auth/users');
  return res.data;
};

export const warnUser = async (id: number, reason: string): Promise<UserProfile> => {
  const res = await api.post(`/auth/users/${id}/warn`, { reason });
  return res.data;
};

export const clearUserWarnings = async (id: number): Promise<UserProfile> => {
  const res = await api.post(`/auth/users/${id}/clear-warnings`);
  return res.data;
};

export const toggleDisableUser = async (id: number, disabled: boolean, reason?: string): Promise<UserProfile> => {
  const res = await api.put(`/auth/users/${id}/disable`, { disabled, reason });
  return res.data;
};

export const deleteUser = async (id: number): Promise<{ deleted: boolean; id: number }> => {
  const res = await api.delete(`/auth/users/${id}`);
  return res.data;
};

export const getStoredUser = (): UserProfile | null => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('pharma_user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.email && parsed.role) {
          return parsed;
        }
      } catch (e) {
        localStorage.removeItem('pharma_user');
        return null;
      }
    }
  }
  return null;
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pharma_access_token');
    localStorage.removeItem('pharma_user');
  }
};


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

export const simulateIotTelemetry = async (data: {
  serialNumber?: string;
  temperature: number;
  humidity: number;
  location?: string;
}) => {
  const res = await api.post('/iot/simulate', data);
  return res.data;
};

export const fetchAuditDossier = async (serialNumber: string): Promise<ComplianceDossier> => {
  const res = await api.get(`/drugs/${serialNumber}/audit-dossier`);
  return res.data;
};

export const fetchAuditCsv = async (serialNumber: string): Promise<string> => {
  const res = await api.get(`/drugs/${serialNumber}/export-csv`);
  return res.data;
};

export const resolveGs1DigitalLink = async (gtin: string, serial: string) => {
  const res = await api.get(`/blockchain/gs1/resolve/${gtin}/${serial}`);
  return res.data;
};

export const parseGs1Uri = async (uri: string) => {
  const res = await api.post('/blockchain/gs1/parse', { uri });
  return res.data;
};

export const verifyDigitalTwin = async (serialNumber: string) => {
  const res = await api.get(`/blockchain/twin/verify/${serialNumber}`);
  return res.data;
};

export const burnDigitalTwin = async (serialNumber: string, dispenserAddress: string) => {
  const res = await api.post('/blockchain/twin/burn', { serialNumber, dispenserAddress });
  return res.data;
};

export const verifyNfcTap = async (tagUid: string, tapCounter: number, cmac: string) => {
  const res = await api.post('/iot/nfc/verify', { tagUid, tapCounter, cmac });
  return res.data;
};

export const simulateNfcTap = async (tagUid: string) => {
  const res = await api.get(`/iot/nfc/simulate-tap/${tagUid}`);
  return res.data;
};

export const checkEscrowAutomation = async () => {
  const res = await api.get('/blockchain/escrow/automation/check');
  return res.data;
};

export const depositStake = async (data: { carrierAddress: string; amount: number }) => {
  const res = await api.post('/blockchain/carrier-staking/deposit', data);
  return res.data;
};

export const getCarrierAccount = async (carrierAddress: string) => {
  const res = await api.get(`/blockchain/carrier-staking/account/${carrierAddress}`);
  return res.data;
};

export const lockShipmentBond = async (data: {
  carrierAddress: string;
  shipmentId: string;
  bondAmount: number;
  manufacturerAddress: string;
}) => {
  const res = await api.post('/blockchain/carrier-staking/bond/lock', data);
  return res.data;
};

export const getShipmentBond = async (shipmentId: string) => {
  const res = await api.get(`/blockchain/carrier-staking/bond/${shipmentId}`);
  return res.data;
};

export const listShipmentBonds = async (params?: { carrierAddress?: string; status?: string; limit?: number }) => {
  const res = await api.get('/blockchain/carrier-staking/bonds', { params });
  return res.data;
};

export const resolveShipmentBond = async (data: {
  shipmentId: string;
  sensorClusters: any[];
  slashPercentage?: number;
}) => {
  const res = await api.post('/blockchain/carrier-staking/bond/resolve', data);
  return res.data;
};

export const unstakeCarrier = async (data: { carrierAddress: string; amount: number }) => {
  const res = await api.post('/blockchain/carrier-staking/unstake', data);
  return res.data;
};

export const getCarrierIndemnity = async (manufacturerAddress: string) => {
  const res = await api.get(`/blockchain/carrier-staking/indemnity/${manufacturerAddress}`);
  return res.data;
};

export const createEscrowOrder = async (data: any) => {
  const res = await api.post('/blockchain/escrow/create', data);
  return res.data;
};

export const getEscrowOrder = async (orderId: string) => {
  const res = await api.get(`/blockchain/escrow/${orderId}`);
  return res.data;
};

export const releaseEscrowOrder = async (orderId: string, callerAddress: string) => {
  const res = await api.post('/blockchain/escrow/release', { orderId, callerAddress });
  return res.data;
};

export const evaluateEscrowWithConsensus = async (data: {
  orderId: string;
  sensorClusters: any[];
  callerAddress: string;
}) => {
  const res = await api.post('/blockchain/escrow/evaluate-consensus', data);
  return res.data;
};

export const refundEscrowOrder = async (orderId: string, reason: string) => {
  const res = await api.post('/blockchain/escrow/refund', { orderId, reason });
  return res.data;
};

export const performEscrowAutomation = async (orderId: string, actionType: number) => {
  const res = await api.post('/blockchain/escrow/automation/perform', { orderId, actionType });
  return res.data;
};

export const pollEscrowAutomation = async () => {
  const res = await api.post('/blockchain/escrow/automation/poll');
  return res.data;
};

export const fetchGovernanceGuardians = async () => {
  const res = await api.get('/blockchain/governance/guardians');
  return res.data;
};

export const fetchGovernanceProposals = async (params?: { status?: string; target?: string }) => {
  const res = await api.get('/blockchain/governance/proposals', { params });
  return res.data;
};

export const fetchGovernanceProposal = async (id: string) => {
  const res = await api.get(`/blockchain/governance/proposals/${id}`);
  return res.data;
};

export const createGovernanceProposal = async (data: any) => {
  const res = await api.post('/blockchain/governance/propose', data);
  return res.data;
};

export const confirmGovernanceProposal = async (proposalId: string, guardianAddress: string) => {
  const res = await api.post('/blockchain/governance/confirm', { proposalId, guardianAddress });
  return res.data;
};

export const executeGovernanceProposal = async (proposalId: string, executorAddress: string) => {
  const res = await api.post('/blockchain/governance/execute', { proposalId, executorAddress });
  return res.data;
};

export const cancelGovernanceProposal = async (proposalId: string, guardianAddress: string, reason?: string) => {
  const res = await api.post('/blockchain/governance/cancel', { proposalId, guardianAddress, reason });
  return res.data;
};

export const estimateUserOpGas = async (userOp: any) => {
  const res = await api.post('/blockchain/aa/estimate-gas', userOp);
  return res.data;
};

export const sponsorUserOp = async (userOp: any, actionName: string) => {
  const res = await api.post('/blockchain/aa/sponsor', { userOp, actionName });
  return res.data;
};

export const sendUserOp = async (userOp: any) => {
  const res = await api.post('/blockchain/aa/send-userop', userOp);
  return res.data;
};

export const bundleAndExecuteUserOps = async (data?: { maxBatchSize?: number; beneficiary?: string }) => {
  const res = await api.post('/blockchain/aa/bundle-and-execute', data || {});
  return res.data;
};

export const getUserOpReceipt = async (hash: string) => {
  const res = await api.get(`/blockchain/aa/receipt/${hash}`);
  return res.data;
};

export const getBundlerMempool = async () => {
  const res = await api.get('/blockchain/aa/mempool');
  return res.data;
};



