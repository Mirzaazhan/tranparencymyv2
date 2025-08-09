import React from 'react';
import { useBlockchain } from '../contexts/BlockchainContext';

const WalletConnection: React.FC = () => {
  const {
    account,
    isConnected,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork
  } = useBlockchain();

  const handleConnect = async () => {
    try {
      await connectWallet();
      // Switch to localhost network for development
      await switchNetwork(31337);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Connecting...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
        <button
          onClick={handleConnect}
          className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center space-x-4 bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <div>
          <p className="text-sm text-green-800">
            Connected: <span className="font-mono font-medium">{formatAddress(account)}</span>
          </p>
        </div>
        <button
          onClick={disconnectWallet}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-yellow-800 mb-2">Connect Your Wallet</h3>
      <p className="text-yellow-700 mb-4 text-sm">
        To submit spending records or feedback, you need to connect your MetaMask wallet.
      </p>
      
      <button
        onClick={handleConnect}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Connect MetaMask
      </button>
      
      <div className="mt-3 text-xs text-yellow-600">
        <p>📱 Don't have MetaMask? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="underline">Download here</a></p>
        <p>🔧 Make sure you're on the correct network (Localhost for testing)</p>
      </div>
    </div>
  );
};

export default WalletConnection;