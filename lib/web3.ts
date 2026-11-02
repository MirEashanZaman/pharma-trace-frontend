import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  '0xaa36a7': {
    chainId: '0xaa36a7',
    chainName: 'Ethereum Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  '0x14a34': {
    chainId: '0x14a34',
    chainName: 'Base Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
  '0x13882': {
    chainId: '0x13882',
    chainName: 'Polygon Amoy',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com'],
  },
  '0x66eee': {
    chainId: '0x66eee',
    chainName: 'Arbitrum Sepolia',
    nativeCurrency: { name: 'Arbitrum Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io'],
  },
};

export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
  networkName?: string;
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

export const switchEthereumChain = async (chainIdHex: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    if (switchError.code === 4902 && SUPPORTED_NETWORKS[chainIdHex]) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [SUPPORTED_NETWORKS[chainIdHex]],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add network to wallet:', addError);
        return false;
      }
    }
    console.error('Failed to switch network:', switchError);
    return false;
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

export const signTypedAttestationData = async (
  domain: ethers.TypedDataDomain,
  types: Record<string, ethers.TypedDataField[]>,
  value: Record<string, any>
): Promise<{ signature: string; address: string } | null> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const signature = await signer.signTypedData(domain, types, value);
    return { signature, address };
  } catch (error: any) {
    console.error('Typed data signing error:', error);
    return null;
  }
};

export const listenWalletEvents = (
  onAccountsChanged: (accounts: string[]) => void,
  onChainChanged: (chainId: string) => void
): (() => void) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return () => {};
  }

  window.ethereum.on('accountsChanged', onAccountsChanged);
  window.ethereum.on('chainChanged', onChainChanged);

  return () => {
    window.ethereum.removeListener('accountsChanged', onAccountsChanged);
    window.ethereum.removeListener('chainChanged', onChainChanged);
  };
};
