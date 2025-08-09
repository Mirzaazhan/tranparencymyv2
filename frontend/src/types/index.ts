export interface Transaction {
  id: string;
  department: string;
  projectName: string;
  projectType: string;
  budgetAllocated: string;
  amountSpent: string;
  location: string;
  description: string;
  timestamp: Date;
  recordedBy: string;
}

export interface Department {
  id: string;
  name: string;
  nameMs: string;
  isActive: boolean;
  totalBudget?: string;
  totalSpent?: string;
  utilizationRate?: number;
  projectCount: number;
}

export interface Feedback {
  id: string;
  transactionId: string;
  citizen: string;
  comment: string;
  rating: number;
  timestamp: Date;
}

export interface SpendingSummary {
  totalProjects: number;
  totalBudget: number;
  totalSpent: number;
  averageUtilization: number;
  departmentCount: number;
  projectTypes: string[];
}

export interface ChartData {
  name: string;
  value: number;
  budget?: number;
  spent?: number;
  utilization?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}