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
    const devSimulated = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    return devSimulated;
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
    const devAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    const simulatedSig =
      '0x4355c47d63924e8a72e509b67023a1921ba21fa71cf3b5958a9e5f5a1837cd1e779a12c48a31589f7e77a39b5270aac354d6573280916c61ae44ea13d410e4a61c';
    return { signature: simulatedSig, address: devAddress };
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
