import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { transactionAPI, departmentAPI } from '../utils/api';
import { Transaction, Department, SpendingSummary, ChartData } from '../types';

const COLORS = ['#CC0000', '#010066', '#FFCC00', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

// Mock data as constants to ensure they're always arrays
const MOCK_SUMMARY: SpendingSummary = {
  totalProjects: 25,
  totalBudget: 150000000,
  totalSpent: 90000000,
  averageUtilization: 60.0,
  departmentCount: 8,
  projectTypes: ['Healthcare', 'Education', 'Infrastructure']
};

const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'MOH',
    name: 'Ministry of Health',
    nameMs: 'Kementerian Kesihatan',
    totalBudget: '25000000',
    totalSpent: '18000000',
    utilizationRate: 72.0,
    isActive: true,
    projectCount: 5
  },
  {
    id: 'MOE', 
    name: 'Ministry of Education',
    nameMs: 'Kementerian Pendidikan',
    totalBudget: '30000000',
    totalSpent: '22000000', 
    utilizationRate: 73.3,
    isActive: true,
    projectCount: 4
  },
  {
    id: 'MOT',
    name: 'Ministry of Transport',
    nameMs: 'Kementerian Pengangkutan',
    totalBudget: '40000000',
    totalSpent: '25000000',
    utilizationRate: 62.5,
    isActive: true,
    projectCount: 6
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    department: 'MOH',
    projectName: 'Kuala Lumpur Hospital Equipment Modernization',
    projectType: 'Healthcare',
    budgetAllocated: '5000000',
    amountSpent: '3500000',
    location: 'Kuala Lumpur',
    timestamp: new Date(),
    description: 'Modern medical equipment for KL Hospital',
    recordedBy: '0x123'
  },
  {
    id: '2',
    department: 'MOE',
    projectName: 'Selangor School Digital Learning Initiative',
    projectType: 'Education',
    budgetAllocated: '8000000',
    amountSpent: '6200000',
    location: 'Selangor',
    timestamp: new Date(),
    description: 'Digital learning infrastructure for schools',
    recordedBy: '0x456'
  },
  {
    id: '3',
    department: 'MOT',
    projectName: 'Penang Bridge Maintenance Project',
    projectType: 'Infrastructure',
    budgetAllocated: '12000000',
    amountSpent: '8500000',
    location: 'Penang',
    timestamp: new Date(),
    description: 'Structural maintenance and safety upgrades',
    recordedBy: '0x789'
  }
];

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SpendingSummary>(MOCK_SUMMARY);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching dashboard data...');

      // Try to fetch from API, but keep mock data as fallback
      const [summaryRes, departmentsRes, transactionsRes] = await Promise.allSettled([
        transactionAPI.getSummary(),
        transactionAPI.getByDepartment(),
        transactionAPI.getAll({ limit: 10 })
      ]);

      // Handle summary response
      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.data) {
        console.log('Summary data received:', summaryRes.value.data.data);
        setSummary(summaryRes.value.data.data);
      } else {
        console.log('Using mock summary data');
      }

      // Handle departments response with extra safety
      if (departmentsRes.status === 'fulfilled' && departmentsRes.value?.data?.data) {
        const deptData = departmentsRes.value.data.data;
        console.log('Departments data received:', deptData);
        
        // Ensure it's an array
        if (Array.isArray(deptData)) {
          setDepartments(deptData);
        } else {
          console.warn('Departments data is not an array, using mock data');
          setDepartments(MOCK_DEPARTMENTS);
        }
      } else {
        console.log('Using mock departments data');
        setDepartments(MOCK_DEPARTMENTS);
      }

      // Handle transactions response
      if (transactionsRes.status === 'fulfilled' && transactionsRes.value?.data?.data) {
        const transData = transactionsRes.value.data.data;
        console.log('Transactions data received:', transData);
        
        // Ensure it's an array
        if (Array.isArray(transData)) {
          setRecentTransactions(transData);
        } else {
          console.warn('Transactions data is not an array, using mock data');
          setRecentTransactions(MOCK_TRANSACTIONS);
        }
      } else {
        console.log('Using mock transactions data');
        setRecentTransactions(MOCK_TRANSACTIONS);
      }

    } catch (err) {
      console.error('Dashboard error:', err);
      setError('API temporarily unavailable - showing demo data');
      // Ensure we have valid arrays even on error
      setSummary(MOCK_SUMMARY);
      setDepartments(MOCK_DEPARTMENTS);
      setRecentTransactions(MOCK_TRANSACTIONS);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `RM ${num.toLocaleString('en-MY', { maximumFractionDigits: 0 })}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Ensure departments is always an array before mapping
  const safeDepartments = Array.isArray(departments) ? departments : MOCK_DEPARTMENTS;
  const safeTransactions = Array.isArray(recentTransactions) ? recentTransactions : MOCK_TRANSACTIONS;

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

  // Create chart data with safe array handling
  const departmentChartData: ChartData[] = safeDepartments.map(dept => ({
    name: dept.name || 'Unknown Department',
    value: parseFloat(dept.totalBudget || '0'),
    budget: parseFloat(dept.totalBudget || '0'),
    spent: parseFloat(dept.totalSpent || '0'),
    utilization: dept.utilizationRate || 0
  }));

  const pieChartData: ChartData[] = safeDepartments.map(dept => ({
    name: dept.name || 'Unknown Department',
    value: parseFloat(dept.totalBudget || '0')
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show error message if API failed but continue with demo data */}
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button 
                onClick={fetchDashboardData}
                className="text-sm bg-yellow-200 hover:bg-yellow-300 px-2 py-1 rounded"
              >
                Retry API
              </button>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-malaysia-red">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('totalBudget')}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {formatCurrency(summary?.totalBudget || 0)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-malaysia-blue">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('totalSpent')}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {formatCurrency(summary?.totalSpent || 0)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-malaysia-yellow">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('activeProjects')}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {summary?.totalProjects || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {t('utilizationRate')}
            </div>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {formatPercentage(summary?.averageUtilization || 0)}
            </div>
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
                  <YAxis tickFormatter={(value) => `RM ${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    formatter={(value, name) => [
                      formatCurrency(value as number), 
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
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Budget']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No budget data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
          </div>
          <div className="overflow-x-auto">
            {safeTransactions.length > 0 ? (
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
                      {t('budget')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('spent')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('location')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.projectName || 'Unknown Project'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {t(`departments.${transaction.department}`) || transaction.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(transaction.budgetAllocated || '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(transaction.amountSpent || '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.location || 'Unknown Location'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-500">
                No transaction data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};