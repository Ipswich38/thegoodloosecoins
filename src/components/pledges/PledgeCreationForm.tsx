'use client';

import { useState, useEffect } from 'react';
import { Heart, Calculator, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { CoinCount, CreatePledgeRequest, PLEDGE_VALIDATION } from '@/types/pledge';
import { calculateCoinTotal, formatCurrency, getCoinDisplayName, validateCoinCounts, COIN_VALUES } from '@/lib/coins';

interface PledgeCreationFormProps {
  onSuccess?: (pledge: any) => void;
  onCancel?: () => void;
  className?: string;
}

type FormStep = 'amount' | 'coins' | 'confirmation';

export default function PledgeCreationForm({ onSuccess, onCancel, className = '' }: PledgeCreationFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('amount');
  const [directAmount, setDirectAmount] = useState('');
  const [coinCounts, setCoinCounts] = useState<Partial<CoinCount>>({
    twentyPesos: 0,
    tenPesos: 0,
    fivePesos: 0,
    onePeso: 0,
    fiftyCentavos: 0,
    twentyFiveCentavos: 0,
    tenCentavos: 0,
    fiveCentavos: 0,
    oneCentavo: 0,
  });
  const [useCoins, setUseCoins] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const calculatedAmount = useCoins ? calculateCoinTotal(coinCounts) : parseFloat(directAmount) || 0;

  useEffect(() => {
    // Clear errors when amount changes
    setError(null);
    setValidationErrors([]);
  }, [directAmount, coinCounts, useCoins]);

  const validateAmount = (amount: number): string[] => {
    const errors: string[] = [];
    
    if (isNaN(amount) || amount <= 0) {
      errors.push('Please enter a valid amount');
      return errors;
    }
    
    if (amount < PLEDGE_VALIDATION.amount.min) {
      errors.push(`Amount must be at least ${formatCurrency(PLEDGE_VALIDATION.amount.min)}`);
    }
    
    if (amount > PLEDGE_VALIDATION.amount.max) {
      errors.push(`Amount cannot exceed ${formatCurrency(PLEDGE_VALIDATION.amount.max)}`);
    }
    
    // Check if amount is a valid coin increment (multiples of 0.01)
    if (Math.round(amount * 100) / 100 !== amount) {
      errors.push('Amount must be in valid currency format');
    }
    
    return errors;
  };

  const handleAmountNext = () => {
    const errors = validateAmount(calculatedAmount);
    if (useCoins) {
      errors.push(...validateCoinCounts(coinCounts));
    }
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    
    if (useCoins) {
      setCurrentStep('confirmation');
    } else {
      setCurrentStep('coins');
    }
  };

  const handleCoinsNext = () => {
    setCurrentStep('confirmation');
  };

  const handleSubmit = async () => {
    const errors = validateAmount(calculatedAmount);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request: CreatePledgeRequest = {
        amount: calculatedAmount,
      };

      const response = await fetch('/api/pledges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to create pledge');
      }

      onSuccess?.(data.pledge);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoinCountChange = (coinType: keyof Omit<CoinCount, 'total'>, value: string) => {
    const numValue = parseInt(value) || 0;
    setCoinCounts(prev => ({
      ...prev,
      [coinType]: Math.max(0, numValue),
    }));
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Heart className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Pledge</h2>
        <p className="text-gray-600">How much would you like to pledge today?</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 text-center mb-4">Choose Your Payment Method</h4>
        
        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-300"
             onClick={() => setUseCoins(false)}>
          <input
            type="radio"
            id="direct-amount"
            name="input-method"
            checked={!useCoins}
            onChange={() => setUseCoins(false)}
            className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
          />
          <div className="flex-1">
            <label htmlFor="direct-amount" className="text-sm font-medium text-gray-700 flex items-center cursor-pointer">
              <div className="w-5 h-5 mr-2 text-primary-600">💳</div>
              Bills / Digital Payment (Bank Transfer, E-wallet, etc.)
            </label>
            <p className="text-xs text-gray-500 mt-1">For those who prefer to donate using bills or digital payments</p>
          </div>
        </div>

        {!useCoins && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Donation Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                value={directAmount}
                onChange={(e) => setDirectAmount(e.target.value)}
                min={PLEDGE_VALIDATION.amount.min}
                max={PLEDGE_VALIDATION.amount.max}
                step="0.01"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 <strong>Trust-based system:</strong> Whether coins or bills/digital - same impact points! We trust you to be honest.
            </p>
          </div>
        )}

        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-300"
             onClick={() => setUseCoins(true)}>
          <input
            type="radio"
            id="count-coins"
            name="input-method"
            checked={useCoins}
            onChange={() => setUseCoins(true)}
            className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
          />
          <div className="flex-1">
            <label htmlFor="count-coins" className="text-sm font-medium text-gray-700 flex items-center cursor-pointer">
              <Calculator className="h-5 w-5 mr-2 text-primary-600" />
              Count My Loose Coins
            </label>
            <p className="text-xs text-gray-500 mt-1">For those who want to exchange spare coins at participating stores</p>
          </div>
        </div>

        {useCoins && (
          <div className="space-y-4 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-medium text-gray-900">Coin Counter</h3>
            </div>
            
            {(Object.keys(coinCounts) as Array<keyof Omit<CoinCount, 'total'>>).map((coinType) => (
              <div key={coinType} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-700">
                  {getCoinDisplayName(coinType)}
                </label>
                <input
                  type="number"
                  value={coinCounts[coinType] || ''}
                  onChange={(e) => handleCoinCountChange(coinType, e.target.value)}
                  min="0"
                  max="1000"
                  placeholder="0"
                  className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center"
                />
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-primary-600">
                  {formatCurrency(calculateCoinTotal(coinCounts))}
                </span>
              </div>
            </div>
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleAmountNext}
          disabled={calculatedAmount <= 0}
          className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderCoinsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Calculator className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Count Your Coins</h2>
        <p className="text-gray-600">Let's count how many coins you'll be donating</p>
      </div>

      <div className="space-y-4 border border-gray-200 rounded-lg p-6">
        {(Object.keys(coinCounts) as Array<keyof Omit<CoinCount, 'total'>>).map((coinType) => (
          <div key={coinType} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-900 block">
                {getCoinDisplayName(coinType)}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {coinCounts[coinType] || 0} × {formatCurrency(COIN_VALUES[coinType])} = {formatCurrency((coinCounts[coinType] || 0) * COIN_VALUES[coinType])}
              </p>
            </div>
            <input
              type="number"
              value={coinCounts[coinType] || ''}
              onChange={(e) => handleCoinCountChange(coinType, e.target.value)}
              min="0"
              max="1000"
              placeholder="0"
              className="w-full sm:w-28 px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg sm:text-base"
            />
          </div>
        ))}
        
        <div className="pt-4 border-t border-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total Pledge:</span>
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(calculateCoinTotal(coinCounts))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => setCurrentStep('amount')}
          className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleCoinsNext}
          disabled={calculateCoinTotal(coinCounts) <= 0}
          className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Pledge</h2>
        <p className="text-gray-600">Review your pledge details before submitting</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-700">Pledge Amount:</span>
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(calculatedAmount)}
          </span>
        </div>

        {useCoins && calculateCoinTotal(coinCounts) > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Coin Breakdown:</h4>
            <div className="space-y-2">
              {(Object.keys(coinCounts) as Array<keyof Omit<CoinCount, 'total'>>)
                .filter(coinType => (coinCounts[coinType] || 0) > 0)
                .map((coinType) => (
                  <div key={coinType} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">{getCoinDisplayName(coinType)}:</span>
                    <span className="font-medium">{coinCounts[coinType]} × {formatCurrency(COIN_VALUES[coinType])}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">What happens next:</h4>
          <ol className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
              Your pledge will be created (Task 1 complete)
            </li>
            <li className="flex items-start">
              <span className="bg-gray-300 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
              Exchange your coins at a participating store
            </li>
            <li className="flex items-start">
              <span className="bg-gray-300 text-gray-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
              Complete the transfer to finish your donation
            </li>
          </ol>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error creating pledge</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => setCurrentStep(useCoins ? 'amount' : 'coins')}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || calculatedAmount <= 0}
          className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Heart className="h-4 w-4" />
              <span>Create Pledge</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-4 sm:p-6 lg:p-8">
        {currentStep === 'amount' && renderAmountStep()}
        {currentStep === 'coins' && renderCoinsStep()}
        {currentStep === 'confirmation' && renderConfirmationStep()}
      </div>
    </div>
  );
}