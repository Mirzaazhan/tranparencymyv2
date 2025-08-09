import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { blockchainDataService, BlockchainTransaction, DepartmentAnalytics } from '../services/blockchainDataService';
import { formatMYRFromMATIC, formatPercentage, formatRating, formatChartCurrency } from '../utils/currency';

const COLORS = ['#CC0000', '#010066', '#FFCC00', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

interface OverallStats {
  totalProjects: number;
  totalFeedbacks: number;
  totalBudget: number;
  totalSpent: number;
  utilizationRate: number;
  activeProjects: number;
  completedProjects: number;
  averageRating: number;
  departmentCount: number;
}

interface ChartData {
  name: string;
  value: number;
  budget?: number;
  spent?: number;
  utilization?: number;
}

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [departments, setDepartments] = useState<DepartmentAnalytics[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<BlockchainTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check blockchain connection
      const connected = await blockchainDataService.isConnected();
      setIsConnected(connected);

      if (!connected) {
        setError('🔗 Blockchain network not available. Please ensure local Hardhat node is running on localhost:8545');
        setLoading(false);
        return;
      }

      // Fetch all blockchain data in parallel
      const [stats, departmentAnalytics, transactions] = await Promise.all([
        blockchainDataService.getOverallStats(),
        blockchainDataService.getDepartmentAnalytics(),
        blockchainDataService.getTransactions(10) // Get 10 most recent
      ]);

      setOverallStats(stats);
      setDepartments(departmentAnalytics);
      setRecentTransactions(transactions);

      if (transactions.length === 0) {
        setError('📝 No blockchain data found. Submit your first spending record to see analytics!');
      }

    } catch (err: any) {
      console.error('Dashboard error:', err);
      setError(`Failed to fetch blockchain data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Currency formatting functions are now imported from utils/currency.ts

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-malaysia-red mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Create chart data from blockchain analytics
  const departmentChartData: ChartData[] = departments.map(dept => ({
    name: dept.name,
    value: parseFloat(dept.totalBudget),
    budget: parseFloat(dept.totalBudget),
    spent: parseFloat(dept.totalSpent),
    utilization: dept.utilizationRate
  }));

  const pieChartData: ChartData[] = departments
    .filter(dept => parseFloat(dept.totalBudget) > 0)
    .map(dept => ({
      name: dept.name,
      value: parseFloat(dept.totalBudget)
    }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blockchain Status */}
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button 
                onClick={fetchDashboardData}
                className="text-sm bg-yellow-200 hover:bg-yellow-300 px-3 py-1 rounded"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success indicator when connected */}
      {isConnected && !error && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <p className="text-sm">🔗 Connected to blockchain • Data auto-refreshes every 30 seconds</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-malaysia-red to-malaysia-blue text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">TransparensiMY</h1>
            <p className="text-xl opacity-90">{t('governmentSpending')} {t('transparency')}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-malaysia-red">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Budget
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {formatMYRFromMATIC(overallStats?.totalBudget || 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">On-chain allocation</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-malaysia-blue">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Total Spent
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {formatMYRFromMATIC(overallStats?.totalSpent || 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Blockchain verified</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-malaysia-yellow">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Active Projects
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {overallStats?.activeProjects || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">In progress</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Completion Rate
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {formatPercentage(overallStats?.utilizationRate || 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Budget utilization</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Citizen Rating
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {formatRating(overallStats?.averageRating || 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{overallStats?.totalFeedbacks || 0} reviews</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Department Spending Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Spending by Department
            </h3>
            {departmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis tickFormatter={formatChartCurrency} />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatMYRFromMATIC(value as number), 
                      name === 'budget' ? 'Budget' : 'Spent'
                    ]}
                  />
                  <Bar dataKey="budget" fill="#CC0000" name="budget" />
                  <Bar dataKey="spent" fill="#010066" name="spent" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No department data available
              </div>
            )}
          </div>

          {/* Budget Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Budget Distribution
            </h3>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatMYRFromMATIC(value as number), 'Budget']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No budget data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Blockchain Projects */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Blockchain Projects</h3>
              <div className="text-sm text-gray-500">
                {recentTransactions.length} projects • Live from blockchain
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {recentTransactions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget / Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blockchain Info
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{transaction.projectName}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.projectType} • {transaction.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">{transaction.department}</div>
                        <div className="text-xs text-gray-500">Ministry</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="text-gray-900">
                          Budget: <span className="font-medium">{formatMYRFromMATIC(transaction.budgetAllocated)}</span>
                        </div>
                        <div className="text-gray-900">
                          Spent: <span className="font-medium">{formatMYRFromMATIC(transaction.amountSpent)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {transaction.utilizationRate.toFixed(1)}% utilized
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                        {transaction.rating && transaction.rating.total > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            ⭐ {transaction.rating.average.toFixed(1)} ({transaction.rating.total} reviews)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-xs">
                          <div>TX #{transaction.id}</div>
                          <div className="font-mono text-xs text-gray-400">
                            {transaction.recordedBy.substring(0, 10)}...
                          </div>
                          <div className="text-xs text-gray-400">
                            {transaction.timestamp.toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <div className="text-lg font-medium">No blockchain projects yet</div>
                <div className="text-sm text-center mt-2">
                  Submit your first government spending record to see it here!
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};