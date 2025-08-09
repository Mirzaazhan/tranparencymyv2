import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockchainDataService, BlockchainTransaction } from '../services/blockchainDataService';
import CitizenFeedbackForm from './CitizenFeedbackForm';
import { formatMYRFromMATIC } from '../utils/currency';

export const Projects: React.FC = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProjectType, setSelectedProjectType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Feedback modal
  const [selectedProjectForFeedback, setSelectedProjectForFeedback] = useState<BlockchainTransaction | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh data every 30 seconds to get latest blockchain updates
  useEffect(() => {
    if (isConnected && transactions.length > 0) {
      const interval = setInterval(() => {
        fetchData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, transactions.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check blockchain connection
      const connected = await blockchainDataService.isConnected();
      setIsConnected(connected);

      if (!connected) {
        setError('⚠️ Blockchain network not available. Please ensure local Hardhat node is running.');
        setLoading(false);
        return;
      }

      // Fetch blockchain data
      const blockchainTransactions = await blockchainDataService.getTransactions(100);
      
      if (blockchainTransactions.length === 0) {
        setError('📝 No projects found on blockchain. Submit your first spending record to see it here!');
      }
      
      setTransactions(blockchainTransactions);
    } catch (err: any) {
      setError(`Failed to load blockchain projects: ${err.message}`);
      console.error('Projects error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for blockchain data
  const applyFilters = () => {
    if (!isConnected) return [];
    
    let filtered = [...transactions];

    // Search filter
    if (searchQuery.trim().length >= 3) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.projectName.toLowerCase().includes(query) ||
        tx.description.toLowerCase().includes(query) ||
        tx.department.toLowerCase().includes(query) ||
        tx.location.toLowerCase().includes(query)
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(tx => tx.department === selectedDepartment);
    }

    // Project type filter
    if (selectedProjectType) {
      filtered = filtered.filter(tx => tx.projectType === selectedProjectType);
    }

    // Location filter
    if (selectedLocation) {
      filtered = filtered.filter(tx => tx.location === selectedLocation);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(tx => tx.status === selectedStatus);
    }

    return filtered;
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedProjectType('');
    setSelectedLocation('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  // Currency formatting is now handled by the imported formatMYRFromMATIC function

  const getUtilizationColor = (utilizationRate: number) => {
    if (utilizationRate >= 90) return 'text-red-600 bg-red-50';
    if (utilizationRate >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get filtered data and unique values for filters
  const filteredTransactions = applyFilters();
  const departments = Array.from(new Set(transactions.map(t => t.department)));
  const projectTypes = Array.from(new Set(transactions.map(t => t.projectType)));
  const locations = Array.from(new Set(transactions.map(t => t.location)));
  const statuses = ['Pending', 'In Progress', 'Completed'];

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-malaysia-red mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('projects')}</h1>
          <p className="text-gray-600">Explore government projects and spending transparency</p>
        </div>

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <p className="text-yellow-800 text-sm">
                ⚠️ Blockchain connection unavailable. Make sure Hardhat node is running on localhost:8545
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('search')}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-malaysia-red focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('department')}
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-malaysia-red focus:border-transparent"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('projectType')}
              </label>
              <select
                value={selectedProjectType}
                onChange={(e) => setSelectedProjectType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-malaysia-red focus:border-transparent"
              >
                <option value="">All Types</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('location')}
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-malaysia-red focus:border-transparent"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-malaysia-red focus:border-transparent"
              >
                <option value="">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="text-sm text-malaysia-red hover:text-red-700 underline"
            >
              Clear all filters
            </button>
            <div className="text-sm text-gray-600">
              Showing {filteredTransactions.length} of {transactions.length} blockchain projects
            </div>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <p className="text-red-600 text-lg">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-malaysia-red text-white rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No projects found matching your criteria
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('projectName')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('department')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('budget')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('spent')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('location')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="font-medium">{transaction.projectName}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: #{transaction.id} • {transaction.timestamp.toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="font-medium">{transaction.department}</div>
                          <div className="text-xs text-gray-400">Ministry</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {transaction.projectType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{formatMYRFromMATIC(transaction.budgetAllocated)}</div>
                          <div className="text-xs text-gray-500">Allocated</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{formatMYRFromMATIC(transaction.amountSpent)}</div>
                          <div className="text-xs text-gray-500">Spent</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUtilizationColor(transaction.utilizationRate)}`}>
                            {transaction.utilizationRate.toFixed(1)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(transaction.utilizationRate, 100)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.rating && transaction.rating.total > 0 ? (
                            <div>
                              <div className="flex items-center">
                                <span className="text-yellow-400">⭐</span>
                                <span className="ml-1 font-medium">{transaction.rating.average.toFixed(1)}</span>
                              </div>
                              <div className="text-xs text-gray-500">{transaction.rating.total} reviews</div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-400">No reviews</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedProjectForFeedback(transaction)}
                              className="text-green-600 hover:text-green-700 text-xs"
                            >
                              💬 Feedback
                            </button>
                            <a
                              href={`https://sepolia.etherscan.io/address/${transaction.recordedBy}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-xs"
                            >
                              🔍 Verify
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(indexOfLastItem, filteredTransactions.length)}</span> of{' '}
                        <span className="font-medium">{filteredTransactions.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === i + 1
                                ? 'z-10 bg-malaysia-red border-malaysia-red text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {selectedProjectForFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <CitizenFeedbackForm
                transactionId={parseInt(selectedProjectForFeedback.id)}
                projectName={selectedProjectForFeedback.projectName}
                onClose={() => setSelectedProjectForFeedback(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};