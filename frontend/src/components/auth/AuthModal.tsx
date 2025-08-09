import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [error, setError] = useState<string | null>(null);
  const { login, register, loading } = useAuth();

  if (!isOpen) return null;

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      await login(email, password);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Login failed');
    }
  };

  const handleRegister = async (
    email: string, 
    password: string, 
    name: string, 
    role: string, 
    adminCode?: string
  ) => {
    try {
      setError(null);
      await register(email, password, name, role, adminCode);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    }
  };

  const handleSwitchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative w-full max-w-md">
          {mode === 'login' ? (
            <LoginForm
              onLogin={handleLogin}
              onSwitchToRegister={handleSwitchMode}
              loading={loading}
              error={error}
            />
          ) : (
            <RegisterForm
              onRegister={handleRegister}
              onSwitchToLogin={handleSwitchMode}
              loading={loading}
              error={error}
            />
          )}
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};