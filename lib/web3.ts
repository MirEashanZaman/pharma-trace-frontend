import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
}

export const connectMetaMask = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    alert('MetaMask browser extension not detected. Please install MetaMask from metamask.io or proceed with your Enterprise Credentials.');
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    return accounts[0] || null;
  } catch (error: any) {
    console.error('MetaMask connection error:', error);
    return null;
  }
};

export const signAttestationMessage = async (message: string): Promise<{ signature: string; address: string } | null> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const signature = await signer.signMessage(message);
    return { signature, address };
  } catch (error: any) {
    console.error('Signing error:', error);
    return null;
  }
};
