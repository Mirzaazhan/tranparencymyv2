import axios from 'axios';
import { Transaction, Department, SpendingSummary, Feedback, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const transactionAPI = {
  getAll: (params?: { limit?: number; offset?: number; department?: string; projectType?: string; location?: string }) =>
    api.get<ApiResponse<Transaction[]>>('/test?endpoint=transactions', { params }),
  
  getById: (id: string) =>
    api.get<ApiResponse<Transaction>>(`/transactions/${id}`),
  
  search: (query: string, limit?: number) =>
    api.get<ApiResponse<Transaction[]>>(`/transactions/search/${query}`, { params: { limit } }),
  
  getSummary: () =>
    api.get<ApiResponse<SpendingSummary>>('/test?endpoint=summary'),
  
  getByDepartment: () =>
    api.get<ApiResponse<Department[]>>('/test?endpoint=departments'),
};

export const departmentAPI = {
  getAll: () =>
    api.get<ApiResponse<Department[]>>('/departments'),
  
  getSpending: (id: string) =>
    api.get<ApiResponse<{ department: string; totalBudget: string; totalSpent: string; utilizationRate: number }>>(`/departments/${id}/spending`),
  
  getTransactions: (id: string, params?: { limit?: number; offset?: number }) =>
    api.get<ApiResponse<Transaction[]>>(`/departments/${id}/transactions`, { params }),
};

export const feedbackAPI = {
  submit: (data: { transactionId: number; comment: string; rating: number }) =>
    api.post<ApiResponse<{ txHash: string }>>('/feedback', data),
  
  getByTransaction: (transactionId: string) =>
    api.get<ApiResponse<{ feedbacks: Feedback[]; rating: { average: number; total: number } }>>(`/feedback/transaction/${transactionId}`),
  
  getRating: (transactionId: string) =>
    api.get<ApiResponse<{ averageRating: number; totalFeedbacks: number }>>(`/feedback/rating/${transactionId}`),
};

export const adminAPI = {
  createTransaction: (data: {
    department: string;
    projectName: string;
    projectType: string;
    budgetAllocated: string;
    amountSpent?: string;
    location: string;
    description?: string;
  }) =>
    api.post<ApiResponse<{ txHash: string }>>('/admin/transaction', data),
  
  getDashboard: () =>
    api.get<ApiResponse<{
      totalProjects: number;
      totalBudget: number;
      totalSpent: number;
      utilizationRate: number;
      activeDepartments: number;
      recentTransactions: Transaction[];
      departmentSpending: Department[];
    }>>('/admin/dashboard'),
};

export default api;