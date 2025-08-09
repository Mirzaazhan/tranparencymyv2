import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, login, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    if (user.role === 'ADMIN' || user.role === 'GOVERNMENT') {
      return <Navigate to="/admin-dashboard" replace />;
    } else {
      return <Navigate to="/citizen-dashboard" replace />;
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      await login(email, password);
      // Redirect will happen automatically due to useEffect above
    } catch (error: any) {
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ms' : 'en');
  };

  const demoCredentials = [
    { 
      role: 'Admin/Government',
      email: 'admin@malaysia.gov.my',
      password: 'admin123',
      description: 'Access to admin dashboard, submit spending records'
    },
    { 
      role: 'Citizen',
      email: 'citizen@example.com',
      password: 'citizen123',
      description: 'View projects, submit feedback, rate transparency'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-malaysia-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-malaysia-red to-malaysia-blue">
      {/* Header */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLanguage}
          className="inline-flex items-center px-3 py-1 border border-white/30 text-sm font-medium rounded-md text-white bg-white/10 hover:bg-white/20 transition-colors duration-200"
        >
          {i18n.language === 'en' ? '🇲🇾 BM' : '🇬🇧 EN'}
        </button>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl w-full">
          {!showLogin ? (
            // Landing Page Content
            <div className="text-center">
              {/* Logo and Title */}
              <div className="mb-12">
                <h1 className="text-6xl font-bold text-white mb-4">
                  TransparensiMY
                </h1>
                <p className="text-xl text-white/90 mb-2">
                  {t('governmentSpending')} {t('transparency')}
                </p>
                <p className="text-lg text-white/80">
                  🔗 Powered by Blockchain Technology
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
                  <div className="text-4xl mb-4">🏛️</div>
                  <h3 className="text-xl font-semibold mb-2">Government Transparency</h3>
                  <p className="text-white/80">
                    Real-time access to government spending records stored immutably on blockchain
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-2">Citizen Participation</h3>
                  <p className="text-white/80">
                    Rate and provide feedback on government projects to drive accountability
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
                  <div className="text-4xl mb-4">⛓️</div>
                  <h3 className="text-xl font-semibold mb-2">Blockchain Verified</h3>
                  <p className="text-white/80">
                    All data permanently recorded on blockchain - tamper-proof and publicly verifiable
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="w-full max-w-md bg-white text-malaysia-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                >
                  🔐 Access Dashboard
                </button>
                
                <div className="text-white/80 text-sm">
                  Secure login with role-based access control
                </div>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center text-white">
                  <div className="text-3xl font-bold">6</div>
                  <div className="text-sm opacity-80">Active Projects</div>
                </div>
                <div className="text-center text-white">
                  <div className="text-3xl font-bold">RM 27.3M</div>
                  <div className="text-sm opacity-80">Total Budget</div>
                </div>
                <div className="text-center text-white">
                  <div className="text-3xl font-bold">7</div>
                  <div className="text-sm opacity-80">Citizen Reviews</div>
                </div>
                <div className="text-center text-white">
                  <div className="text-3xl font-bold">8</div>
                  <div className="text-sm opacity-80">Departments</div>
                </div>
              </div>
            </div>
          ) : (
            // Login Form
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                  <p className="text-gray-600 mt-2">Sign in to access your dashboard</p>
                </div>

                {loginError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-malaysia-red focus:border-malaysia-red"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-malaysia-red focus:border-malaysia-red"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-malaysia-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-malaysia-red disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loginLoading ? 'Signing in...' : 'Sign In'}
                  </button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Demo Credentials:</h3>
                  <div className="space-y-3">
                    {demoCredentials.map((cred, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-medium text-gray-700">{cred.role}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEmail(cred.email);
                              setPassword(cred.password);
                            }}
                            className="text-xs text-malaysia-red hover:text-red-700"
                          >
                            Use
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          📧 {cred.email} • 🔑 {cred.password}
                        </div>
                        <div className="text-xs text-gray-500">
                          {cred.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowLogin(false)}
                    className="text-sm text-malaysia-red hover:text-red-700"
                  >
                    ← Back to Home
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 text-white/60 text-sm">
        © 2024 TransparensiMY • Blockchain Transparency Platform
      </div>
    </div>
  );
};