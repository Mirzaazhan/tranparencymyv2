import React, { useState } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext';

interface SpendingFormData {
  department: string;
  projectName: string;
  projectType: string;
  budgetAllocated: string;
  amountSpent: string;
  location: string;
  description: string;
}

interface AdminSpendingFormProps {
  onSuccess?: () => void;
}

const AdminSpendingForm: React.FC<AdminSpendingFormProps> = ({ onSuccess }) => {
  const { isConnected, recordTransaction, estimateGas } = useBlockchain();
  const [formData, setFormData] = useState<SpendingFormData>({
    department: 'MOH',
    projectName: '',
    projectType: '',
    budgetAllocated: '',
    amountSpent: '',
    location: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<any>(null);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  const departments = [
    { id: 'MOH', name: 'Ministry of Health', nameMs: 'Kementerian Kesihatan' },
    { id: 'MOE', name: 'Ministry of Education', nameMs: 'Kementerian Pendidikan' },
    { id: 'MOT', name: 'Ministry of Transport', nameMs: 'Kementerian Pengangkutan' },
    { id: 'MOF', name: 'Ministry of Finance', nameMs: 'Kementerian Kewangan' },
    { id: 'MOD', name: 'Ministry of Defence', nameMs: 'Kementerian Pertahanan' },
    { id: 'MOHA', name: 'Ministry of Home Affairs', nameMs: 'Kementerian Dalam Negeri' },
    { id: 'MOSTI', name: 'Ministry of Science, Technology and Innovation', nameMs: 'Kementerian Sains, Teknologi dan Inovasi' },
    { id: 'MOTAC', name: 'Ministry of Tourism, Arts and Culture', nameMs: 'Kementerian Pelancongan, Seni dan Budaya' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setTxHash('');
  };

  const handleEstimateGas = async () => {
    if (!isConnected) return;

    try {
      const args = [
        formData.department,
        formData.projectName,
        formData.projectType,
        formData.budgetAllocated,
        formData.amountSpent,
        formData.location,
        formData.description
      ];

      const estimate = await estimateGas('recordTransaction', args, 'spending');
      setGasEstimate(estimate);
    } catch (error: any) {
      setError(`Gas estimation failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    // Validation
    if (parseFloat(formData.amountSpent) > parseFloat(formData.budgetAllocated)) {
      setError('Amount spent cannot exceed budget allocated');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const hash = await recordTransaction(formData);
      setTxHash(hash);
      
      // Reset form
      setFormData({
        department: 'MOH',
        projectName: '',
        projectType: '',
        budgetAllocated: '',
        amountSpent: '',
        location: '',
        description: ''
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      setGasEstimate(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Admin Access Required</h3>
        <p className="text-yellow-700">Please connect your wallet to submit spending records.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Government Spending Record</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {txHash && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p><strong>Transaction Successful!</strong></p>
          <p className="text-sm font-mono mt-1">TX: {txHash}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.id} - {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Hospital Renovation Project"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectType"
              value={formData.projectType}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Infrastructure, Healthcare, Education"
              required
            />
          </div>
        </div>

        {/* Budget Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Allocated (in MYR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="budgetAllocated"
              value={formData.budgetAllocated}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Spent (in MYR) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="amountSpent"
              value={formData.amountSpent}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="750.00"
              required
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Kuala Lumpur, Selangor"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of the project and spending..."
            required
          />
        </div>

        {/* Gas Estimation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Gas Estimation</h3>
            <button
              type="button"
              onClick={handleEstimateGas}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Estimate Gas
            </button>
          </div>
          {gasEstimate && (
            <div className="text-xs text-gray-600 space-y-1">
              <p>Gas Limit: {parseInt(gasEstimate.gasLimit).toLocaleString()}</p>
              <p>Gas Price: {parseFloat(gasEstimate.gasPrice).toFixed(2)} gwei</p>
              <p>Estimated Cost: {parseFloat(gasEstimate.totalCostEth).toFixed(6)} ETH</p>
            </div>
          )}
        </div>

        {/* Currency Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💱 Currency Information</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• All amounts are entered in <strong>Malaysian Ringgit (MYR)</strong></p>
            <p>• Blockchain conversion rate: 1 MATIC ≈ RM 3.00</p>
            <p>• All transactions are permanently recorded on blockchain</p>
            <p>• Citizens will view budget amounts in MYR for better understanding</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setFormData({
                department: 'MOH',
                projectName: '',
                projectType: '',
                budgetAllocated: '',
                amountSpent: '',
                location: '',
                description: ''
              });
              setGasEstimate(null);
              setError('');
              setTxHash('');
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md font-medium ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit to Blockchain'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSpendingForm;