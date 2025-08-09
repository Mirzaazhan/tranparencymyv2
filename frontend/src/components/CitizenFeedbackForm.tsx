import React, { useState } from 'react';
import { useBlockchain } from '../contexts/BlockchainContext';

interface FeedbackFormProps {
  transactionId: number;
  projectName: string;
  onClose?: () => void;
}

const CitizenFeedbackForm: React.FC<FeedbackFormProps> = ({ 
  transactionId, 
  projectName,
  onClose 
}) => {
  const { isConnected, submitFeedback, estimateGas } = useBlockchain();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<any>(null);
  const [txHash, setTxHash] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleEstimateGas = async () => {
    if (!isConnected) return;

    try {
      const args = [transactionId, comment, rating];
      const estimate = await estimateGas('submitFeedback', args, 'feedback');
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

    if (comment.trim().length === 0) {
      setError('Please provide feedback comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const hash = await submitFeedback(transactionId, comment.trim(), rating);
      setTxHash(hash);
      
      // Reset form
      setComment('');
      setRating(5);
      setGasEstimate(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition-colors ${
              star <= value ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            ⭐
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {value} out of 5 stars
        </span>
      </div>
    );
  };

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Wallet Connection Required</h3>
        <p className="text-yellow-700">Please connect your wallet to submit feedback.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Submit Feedback</h2>
          <p className="text-gray-600 mt-1">Project: {projectName}</p>
          <p className="text-sm text-gray-500">Transaction ID: #{transactionId}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {txHash && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p><strong>Feedback Submitted Successfully!</strong></p>
          <p className="text-sm font-mono mt-1">TX: {txHash}</p>
          <p className="text-sm mt-2">Thank you for your feedback. It will help improve government transparency.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Rate this project <span className="text-red-500">*</span>
          </label>
          <StarRating value={rating} onChange={setRating} />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Feedback <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setError('');
              setTxHash('');
            }}
            rows={6}
            maxLength={500}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share your thoughts about this government project. Was it completed on time? Did it benefit the community? What could be improved?"
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Feedback Guidelines</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Be honest and constructive in your feedback</li>
            <li>• Focus on the project's impact on your community</li>
            <li>• Avoid personal attacks or inappropriate language</li>
            <li>• Your feedback will be permanently stored on the blockchain</li>
          </ul>
        </div>

        {/* Gas Estimation */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Transaction Cost</h3>
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
              <p>Estimated Cost: {parseFloat(gasEstimate.totalCostEth).toFixed(6)} ETH (~$0.01)</p>
            </div>
          )}
          {!gasEstimate && (
            <p className="text-xs text-gray-500">Click "Estimate Gas" to see transaction cost</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              setComment('');
              setRating(5);
              setGasEstimate(null);
              setError('');
              setTxHash('');
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isSubmitting || comment.trim().length === 0}
            className={`px-6 py-2 rounded-md font-medium ${
              isSubmitting || comment.trim().length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          🔒 Your feedback is stored permanently and transparently on the blockchain.
          <br />
          ⛽ Small gas fee required for blockchain transaction.
        </p>
      </div>
    </div>
  );
};

export default CitizenFeedbackForm;