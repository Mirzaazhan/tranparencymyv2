import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Import contract ABIs (you'll need to copy these from backend/artifacts)
// For now, we'll use placeholder interfaces
interface ContractABI {
  [key: string]: any;
}

export interface BlockchainContextType {
  // Wallet connection
  account: string | null;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Contract addresses
  contractAddresses: {
    GovernmentSpending: string;
    CitizenFeedback: string;
  } | null;
  
  // Methods
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  
  // Contract interaction methods
  recordTransaction: (data: TransactionData) => Promise<string>;
  submitFeedback: (transactionId: number, comment: string, rating: number) => Promise<string>;
  estimateGas: (method: string, args: any[], contractType?: 'spending' | 'feedback') => Promise<GasEstimate>;
}

interface TransactionData {
  department: string;
  projectName: string;
  projectType: string;
  budgetAllocated: string;
  amountSpent: string;
  location: string;
  description: string;
}

interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  totalCostEth: string;
  totalCostWei: string;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

interface BlockchainProviderProps {
  children: ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractAddresses, setContractAddresses] = useState<{
    GovernmentSpending: string;
    CitizenFeedback: string;
  } | null>(null);

  // Load contract addresses
  useEffect(() => {
    const loadContracts = async () => {
      try {
        // In a real app, you'd fetch this from your backend or config
        const addresses = {
          GovernmentSpending: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          CitizenFeedback: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
        };
        setContractAddresses(addresses);
      } catch (error) {
        console.error('Failed to load contract addresses:', error);
      }
    };

    loadContracts();
  }, []);

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed');
      }

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create provider
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3Provider.listAccounts();
      const userSigner = web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(userSigner);
      setAccount(accounts[0]);
      setIsConnected(true);

      // Check network
      const network = await web3Provider.getNetwork();
      console.log('Connected to network:', network);

    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setIsConnected(false);
    setError(null);
  };

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) throw new Error('MetaMask not installed');

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        const networkConfig = getNetworkConfig(chainId);
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig],
        });
      } else {
        throw switchError;
      }
    }
  };

  const getNetworkConfig = (chainId: number) => {
    switch (chainId) {
      case 31337: // Localhost
        return {
          chainId: '0x7A69',
          chainName: 'Localhost 8545',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['http://127.0.0.1:8545'],
        };
      case 80001: // Mumbai
        return {
          chainId: '0x13881',
          chainName: 'Mumbai Testnet',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://polygon-mumbai.g.alchemy.com/v2/demo'],
          blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
        };
      case 137: // Polygon
        return {
          chainId: '0x89',
          chainName: 'Polygon Mainnet',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://polygon-rpc.com'],
          blockExplorerUrls: ['https://polygonscan.com/'],
        };
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`);
    }
  };

  const recordTransaction = async (data: TransactionData): Promise<string> => {
    if (!signer || !contractAddresses) {
      throw new Error('Wallet not connected or contracts not loaded');
    }

    try {
      // You'll need to import the actual ABI
      const governmentSpendingABI = [
        "function recordTransaction(string memory _department, string memory _projectName, string memory _projectType, uint256 _budgetAllocated, uint256 _amountSpent, string memory _location, string memory _description) public"
      ];

      const contract = new ethers.Contract(
        contractAddresses.GovernmentSpending,
        governmentSpendingABI,
        signer
      );

      const tx = await contract.recordTransaction(
        data.department,
        data.projectName,
        data.projectType,
        ethers.utils.parseEther(data.budgetAllocated),
        ethers.utils.parseEther(data.amountSpent),
        data.location,
        data.description
      );

      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  };

  const submitFeedback = async (transactionId: number, comment: string, rating: number): Promise<string> => {
    if (!signer || !contractAddresses) {
      throw new Error('Wallet not connected or contracts not loaded');
    }

    try {
      const citizenFeedbackABI = [
        "function submitFeedback(uint256 _transactionId, string memory _comment, uint8 _rating) public"
      ];

      const contract = new ethers.Contract(
        contractAddresses.CitizenFeedback,
        citizenFeedbackABI,
        signer
      );

      const tx = await contract.submitFeedback(transactionId, comment, rating);
      await tx.wait();
      return tx.hash;
    } catch (error: any) {
      throw new Error(`Feedback submission failed: ${error.message}`);
    }
  };

  const estimateGas = async (method: string, args: any[], contractType: 'spending' | 'feedback' = 'spending'): Promise<GasEstimate> => {
    if (!provider || !contractAddresses) {
      throw new Error('Provider not available or contracts not loaded');
    }

    try {
      // Basic ABI for gas estimation
      const abi = contractType === 'spending' 
        ? ["function recordTransaction(string memory _department, string memory _projectName, string memory _projectType, uint256 _budgetAllocated, uint256 _amountSpent, string memory _location, string memory _description) public"]
        : ["function submitFeedback(uint256 _transactionId, string memory _comment, uint8 _rating) public"];

      const contractAddress = contractType === 'spending' 
        ? contractAddresses.GovernmentSpending 
        : contractAddresses.CitizenFeedback;

      const contract = new ethers.Contract(contractAddress, abi, provider);

      const gasLimit = await contract.estimateGas[method](...args);
      const gasPrice = await provider.getGasPrice();
      const totalGasCost = gasLimit.mul(gasPrice);

      return {
        gasLimit: gasLimit.toString(),
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        totalCostEth: ethers.utils.formatEther(totalGasCost),
        totalCostWei: totalGasCost.toString()
      };
    } catch (error: any) {
      throw new Error(`Gas estimation failed: ${error.message}`);
    }
  };

  const value = {
    account,
    provider,
    signer,
    isConnected,
    isLoading,
    error,
    contractAddresses,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    recordTransaction,
    submitFeedback,
    estimateGas,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};

// Add types to window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (args: any) => void) => void;
      removeListener: (event: string, callback: (args: any) => void) => void;
    };
  }
}