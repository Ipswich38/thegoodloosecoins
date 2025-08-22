'use client';

import { useState } from 'react';
import { DollarSign, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface AmountSentFormProps {
  pledgeId: string;
  pledgeAmount: number;
  currentAmountSent: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AmountSentForm({
  pledgeId,
  pledgeAmount,
  currentAmountSent,
  onSuccess,
  onCancel
}: AmountSentFormProps) {
  const [amountSent, setAmountSent] = useState(currentAmountSent.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const remainingAmount = pledgeAmount - currentAmountSent;
  const newAmountValue = parseFloat(amountSent) || 0;
  const totalAfterUpdate = currentAmountSent + newAmountValue;
  const completionPercentage = (totalAfterUpdate / pledgeAmount) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const amount = parseFloat(amountSent);
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      setIsLoading(false);
      return;
    }

    if (totalAfterUpdate > pledgeAmount) {
      setError(`Amount sent cannot exceed pledge amount ($${pledgeAmount.toFixed(2)})`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/pledges/${pledgeId}/amount-sent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountSent: amount
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setError(data.error?.message || 'Failed to update amount sent');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Amount Sent Updated!
          </h3>
          <p className="text-gray-600">
            Your transfer has been recorded successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Report Amount Sent</h2>
        <p className="text-gray-600 mt-1">
          Update how much you've actually transferred to recipients
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Pledge Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Pledge Amount:</span>
              <span className="font-semibold text-gray-900 ml-2">
                ${pledgeAmount.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Already Sent:</span>
              <span className="font-semibold text-gray-900 ml-2">
                ${currentAmountSent.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Remaining:</span>
              <span className="font-semibold text-gray-900 ml-2">
                ${remainingAmount.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Completion:</span>
              <span className="font-semibold text-gray-900 ml-2">
                {((currentAmountSent / pledgeAmount) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amountSent" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Amount Sent
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="amountSent"
              value={amountSent}
              onChange={(e) => setAmountSent(e.target.value)}
              step="0.01"
              min="0"
              max={remainingAmount}
              placeholder="0.00"
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
              required
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Maximum additional amount: ${remainingAmount.toFixed(2)}
          </p>
        </div>

        {/* Preview */}
        {newAmountValue > 0 && (
          <div className="bg-primary-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">After this update:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Sent:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  ${totalAfterUpdate.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Completion:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  {completionPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
            {completionPercentage >= 100 && (
              <div className="mt-2 flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Pledge will be marked as complete!</span>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Transfer Proof Upload Placeholder */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">
              Upload transfer receipt or proof (Coming Soon)
            </p>
            <p className="text-gray-500 text-xs mt-1">
              For now, please keep your transfer receipts for verification
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            disabled={isLoading || !amountSent || parseFloat(amountSent) <= 0}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                <span>Update Amount Sent</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}