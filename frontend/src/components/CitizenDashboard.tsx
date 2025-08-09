import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { Projects } from './Projects';
import { blockchainDataService } from '../services/blockchainDataService';

interface CitizenStats {
  totalProjects: number;
  totalFeedbacks: number;
  averageRating: number;
  recentProjects: number;
}

export const CitizenDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isConnected } = useBlockchain();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects'>('overview');
  const [stats, setStats] = useState<CitizenStats>({
    totalProjects: 0,
    totalFeedbacks: 0,
    averageRating: 0,
    recentProjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCitizenStats();
  }, []);

  const fetchCitizenStats = async () => {
    try {
      setLoading(true);
      const overallStats = await blockchainDataService.getOverallStats();
      const transactions = await blockchainDataService.getTransactions(100);
      
      // Calculate recent projects (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentProjects = transactions.filter(tx => tx.timestamp > thirtyDaysAgo).length;
      
      setStats({
        totalProjects: overallStats.totalProjects,
        totalFeedbacks: overallStats.totalFeedbacks,
        averageRating: overallStats.averageRating,
        recentProjects
      });
    } catch (error) {
      console.error('Failed to fetch citizen stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRating = (rating: number) => {
    return `${rating.toFixed(1)}⭐`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Citizen Header */}
      <div className="bg-malaysia-blue text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">👥</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Citizen Portal</h1>
                  <p className="text-sm opacity-90">Monitor & Engage with Government</p>
                </div>
              </div>
              
              {/* Blockchain Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
                isConnected ? 'bg-green-500/20 text-green-100' : 'bg-yellow-500/20 text-yellow-100'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-yellow-300'}`}></div>
                <span>{isConnected ? '🔗 Blockchain Connected' : '⚠️ Disconnected'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs opacity-75">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Citizen Navigation */}
          <div className="border-t border-white/20">
            <nav className="flex space-x-8 py-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                🏠 Overview
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'projects'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                📋 All Projects
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Citizen Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">📊</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{stats.totalProjects} Projects</div>
                <div className="text-xs text-gray-500">Available to Review</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">💬</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{stats.totalFeedbacks} Reviews</div>
                <div className="text-xs text-gray-500">From Citizens</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold text-sm">⭐</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{formatRating(stats.averageRating)}</div>
                <div className="text-xs text-gray-500">Average Rating</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">🆕</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{stats.recentProjects} Recent</div>
                <div className="text-xs text-gray-500">Last 30 Days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' ? (
          <div>
            {/* Citizen Welcome Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Welcome, {user?.name}!
                </h2>
                <p className="text-gray-700 mb-4">
                  Monitor government spending, rate projects, and contribute to transparency in Malaysia through blockchain-verified data.
                </p>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Real-time Project Data
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Blockchain Verified
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Your Voice Matters
                  </span>
                </div>
              </div>
            </div>

            {/* Citizen Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-xl">👀</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">View Projects</h3>
                    <p className="text-sm text-gray-500">Browse government spending</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Explore all government projects and their budget allocations stored permanently on blockchain.
                </p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  View All Projects
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Give Feedback</h3>
                    <p className="text-sm text-gray-500">Rate project performance</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Share your opinions and rate government projects to promote accountability and improvement.
                </p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="w-full bg-green-50 text-green-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  Rate Projects
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Verify Data</h3>
                    <p className="text-sm text-gray-500">Blockchain verification</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  All data is stored on blockchain - tamper-proof and publicly verifiable for complete transparency.
                </p>
                <div className="w-full bg-purple-50 text-purple-700 px-4 py-2 rounded-md text-sm font-medium text-center">
                  Always Verified ✓
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Platform Statistics</h3>
                <p className="text-sm text-gray-500">Live data from blockchain</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
                    <div className="text-sm text-gray-500">Total Projects</div>
                    <div className="text-xs text-gray-400 mt-1">On Blockchain</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalFeedbacks}</div>
                    <div className="text-sm text-gray-500">Citizen Reviews</div>
                    <div className="text-xs text-gray-400 mt-1">Community Voice</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{formatRating(stats.averageRating)}</div>
                    <div className="text-sm text-gray-500">Average Rating</div>
                    <div className="text-xs text-gray-400 mt-1">Citizen Satisfaction</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.recentProjects}</div>
                    <div className="text-sm text-gray-500">New This Month</div>
                    <div className="text-xs text-gray-400 mt-1">Recent Activity</div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mt-8 bg-gray-100 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">🔗 How Blockchain Transparency Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-malaysia-red text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <div className="font-medium">Government Submits</div>
                    <div className="text-gray-600">Officials record spending on blockchain</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-malaysia-blue text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <div className="font-medium">Citizens Review</div>
                    <div className="text-gray-600">You rate and provide feedback</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <div className="font-medium">Permanent Record</div>
                    <div className="text-gray-600">Data stored forever, cannot be altered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Project browsing header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Government Projects</h2>
              <p className="text-gray-600">
                Browse all government spending records, rate projects, and provide feedback to promote transparency.
              </p>
            </div>

            {/* Render the existing Projects component */}
            <Projects />
          </div>
        )}
      </div>
    </div>
  );
};