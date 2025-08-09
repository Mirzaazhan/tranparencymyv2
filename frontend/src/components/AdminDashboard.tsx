import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useBlockchain } from '../contexts/BlockchainContext';
import { Dashboard } from './Dashboard';
import AdminSpendingForm from './AdminSpendingForm';
import { blockchainDataService } from '../services/blockchainDataService';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isConnected } = useBlockchain();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submit' | 'reviews'>('dashboard');
  const [totalProjects, setTotalProjects] = useState(0);
  const [allFeedbacks, setAllFeedbacks] = useState<any[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const stats = await blockchainDataService.getOverallStats();
      setTotalProjects(stats.totalProjects);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    }
  };

  const fetchAllFeedbacks = async () => {
    try {
      setLoadingFeedbacks(true);
      const feedbacks = await blockchainDataService.getAllFeedbacks(50);
      setAllFeedbacks(feedbacks);
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  // Fetch feedbacks when reviews tab is selected
  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchAllFeedbacks();
    }
  }, [activeTab]);

  const handleSuccessfulSubmission = () => {
    fetchStats();
    // Switch back to dashboard after successful submission
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-malaysia-red text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">🏛️</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Admin Portal</h1>
                  <p className="text-sm opacity-90">Government Transparency Management</p>
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

          {/* Admin Navigation */}
          <div className="border-t border-white/20">
            <nav className="flex space-x-8 py-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                📊 Analytics Dashboard
              </button>
              <button
                onClick={() => setActiveTab('submit')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'submit'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                📝 Submit Spending Record
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/70 hover:text-white hover:border-white/50'
                }`}
              >
                💬 Citizen Reviews
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">📊</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{totalProjects} Projects</div>
                <div className="text-xs text-gray-500">On Blockchain</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">✅</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Admin Access</div>
                <div className="text-xs text-gray-500">Full Permissions</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">🔐</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Secure Platform</div>
                <div className="text-xs text-gray-500">Blockchain Verified</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold text-sm">🇲🇾</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Malaysia Gov</div>
                <div className="text-xs text-gray-500">Official Platform</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? (
          <div>
            {/* Admin-specific intro */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to the Admin Dashboard
                </h2>
                <p className="text-gray-700 mb-4">
                  Monitor government spending transparency, submit new projects, and track citizen engagement with blockchain-verified data.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Real-time Analytics
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Blockchain Integration
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Citizen Feedback
                  </span>
                </div>
              </div>
            </div>

            {/* Render the existing Dashboard component */}
            <Dashboard />
          </div>
        ) : activeTab === 'reviews' ? (
          <div>
            {/* Reviews Section */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Citizen Reviews & Feedback</h2>
              <p className="text-gray-600">
                Review all citizen feedback and ratings across government projects to improve transparency and accountability.
              </p>
            </div>

            {loadingFeedbacks ? (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-malaysia-red"></div>
                  <span className="ml-3 text-gray-600">Loading citizen reviews...</span>
                </div>
              </div>
            ) : allFeedbacks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                <p className="text-gray-500">Citizens haven't submitted any feedback yet. Reviews will appear here once they start rating projects.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">All Citizen Reviews ({allFeedbacks.length})</h3>
                    <button 
                      onClick={fetchAllFeedbacks}
                      className="bg-malaysia-red text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Citizen Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Review Comment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allFeedbacks.map((feedback) => (
                        <tr key={feedback.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm">
                            <div className="font-medium text-gray-900">{feedback.projectName}</div>
                            <div className="text-gray-500">
                              {feedback.department} • Project #{feedback.transactionId}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="font-mono text-gray-700">
                              {feedback.citizen.substring(0, 8)}...{feedback.citizen.substring(36)}
                            </div>
                            <div className="text-xs text-gray-400">Citizen Wallet</div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-lg ${
                                      i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              <span className="ml-2 text-gray-600">({feedback.rating}/5)</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="max-w-xs">
                              <p className="text-gray-900 line-clamp-3">{feedback.comment}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div>{feedback.timestamp.toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {feedback.timestamp.toLocaleTimeString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Reviews Analytics */}
            {allFeedbacks.length > 0 && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Total Reviews
                  </div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    {allFeedbacks.length}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Average Rating
                  </div>
                  <div className="mt-2 text-3xl font-bold text-gray-900">
                    {(allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allFeedbacks.length).toFixed(1)}⭐
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Most Active
                  </div>
                  <div className="mt-2 text-sm font-bold text-gray-900">
                    {(() => {
                      const deptCounts: { [key: string]: number } = {};
                      allFeedbacks.forEach(f => {
                        deptCounts[f.department] = (deptCounts[f.department] || 0) + 1;
                      });
                      const mostActive = Object.entries(deptCounts).sort(([,a], [,b]) => b - a)[0];
                      return mostActive ? `${mostActive[0]} (${mostActive[1]} reviews)` : 'N/A';
                    })()}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Recent Activity
                  </div>
                  <div className="mt-2 text-sm font-bold text-gray-900">
                    {allFeedbacks.filter(f => {
                      const dayAgo = new Date();
                      dayAgo.setDate(dayAgo.getDate() - 1);
                      return f.timestamp > dayAgo;
                    }).length} reviews today
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Spending Submission Form */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit New Spending Record</h2>
              <p className="text-gray-600">
                Record government spending on the blockchain for complete transparency and public accountability.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <AdminSpendingForm onSuccess={handleSuccessfulSubmission} />
            </div>
            
            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">📋 Submission Guidelines</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Ensure all project details are accurate before blockchain submission</li>
                <li>• Budget amounts are recorded in MATIC for transparency</li>
                <li>• All submissions are permanently stored and publicly verifiable</li>
                <li>• Citizens will be able to rate and provide feedback on submitted projects</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};