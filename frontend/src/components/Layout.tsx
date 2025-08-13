import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './auth/AuthModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ms' : 'en');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-xl font-display font-bold text-malaysia-red tracking-tight">
                  TransparensiMY
                </Link>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/') 
                      ? 'border-malaysia-red text-malaysia-red' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/projects"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/projects') 
                      ? 'border-malaysia-red text-malaysia-red' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('projects')}
                </Link>
                <Link
                  to="/departments"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/departments') 
                      ? 'border-malaysia-red text-malaysia-red' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('departments')}
                </Link>
                <Link
                  to="/feedback"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/feedback') 
                      ? 'border-malaysia-red text-malaysia-red' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Feedback
                </Link>
                <Link
                  to="/admin"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/admin') 
                      ? 'border-malaysia-red text-malaysia-red' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('admin')}
                </Link>
              </div>
            </div>

            {/* Right side - Auth and Language toggle */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-malaysia-red flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user?.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-malaysia-red text-sm font-medium rounded-md text-malaysia-red bg-white hover:bg-malaysia-red hover:text-white transition-colors duration-200"
                >
                  Login
                </button>
              )}
              
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center px-3 py-1 border border-malaysia-red text-sm font-medium rounded-md text-malaysia-red bg-white hover:bg-malaysia-red hover:text-white transition-colors duration-200"
              >
                {i18n.language === 'en' ? '🇲🇾 BM' : '🇬🇧 EN'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/') 
                  ? 'bg-malaysia-red bg-opacity-10 border-malaysia-red text-malaysia-red' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {t('dashboard')}
            </Link>
            <Link
              to="/projects"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/projects') 
                  ? 'bg-malaysia-red bg-opacity-10 border-malaysia-red text-malaysia-red' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {t('projects')}
            </Link>
            <Link
              to="/departments"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/departments') 
                  ? 'bg-malaysia-red bg-opacity-10 border-malaysia-red text-malaysia-red' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {t('departments')}
            </Link>
            <Link
              to="/feedback"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/feedback') 
                  ? 'bg-malaysia-red bg-opacity-10 border-malaysia-red text-malaysia-red' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              Feedback
            </Link>
            <Link
              to="/admin"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/admin') 
                  ? 'bg-malaysia-red bg-opacity-10 border-malaysia-red text-malaysia-red' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {t('admin')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 TransparensiMY. Transparency in Government Spending.</p>
            <p className="mt-1">
              Powered by Blockchain Technology on Polygon Network
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </div>
  );
};