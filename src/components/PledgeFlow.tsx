'use client';

import { useState } from 'react';
import { Calculator, User, Send, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { calculateCoinTotal, formatCurrency, COIN_VALUES, getCoinDisplayName } from '@/lib/coins';
import { CoinCount } from '@/types/pledge';
import UsernameCreation from './UsernameCreation';
import { saveUser, savePledge, getCurrentUser, setCurrentUser } from '@/lib/localStore';

interface PledgeFlowProps {
  beneficiaries: Array<{
    id: string;
    name: string;
    description: string;
    verified: boolean;
  }>;
  onPledgeSuccess?: () => void;
}

type PledgeStep = 'select-beneficiary' | 'count-coins' | 'enter-username' | 'create-profile' | 'confirm' | 'success';

export default function PledgeFlow({ beneficiaries, onPledgeSuccess }: PledgeFlowProps) {
  const [currentStep, setCurrentStep] = useState<PledgeStep>('select-beneficiary');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(null);
  const [coinCounts, setCoinCounts] = useState<Partial<CoinCount>>({});
  const [customAmount, setCustomAmount] = useState<string>('');
  const [useCustomAmount, setUseCustomAmount] = useState(false);
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showUsernameCreation, setShowUsernameCreation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedBeneficiaryData = beneficiaries.find(b => b.id === selectedBeneficiary);
  const totalAmount = useCustomAmount ? parseFloat(customAmount) || 0 : calculateCoinTotal(coinCounts);

  const handleCoinCountChange = (coinType: keyof CoinCount, value: string) => {
    const numValue = parseInt(value) || 0;
    setCoinCounts(prev => ({
      ...prev,
      [coinType]: numValue
    }));
  };

  const handleSubmitPledge = async () => {
    setIsSubmitting(true);
    
    try {
      // Save pledge to local storage
      const pledgeId = savePledge(
        username,
        selectedBeneficiary!,
        selectedBeneficiaryData!.name,
        totalAmount
      );
      
      console.log('Pledge saved:', pledgeId);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentStep('success');
      
      // Trigger callback to refresh dashboard data
      if (onPledgeSuccess) {
        onPledgeSuccess();
      }
      
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('tglc-data-changed'));
      
    } catch (error) {
      console.error('Error saving pledge:', error);
      // Handle error - could show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameCreated = (newUsername: string, newPasscode: string) => {
    // Save user to local storage
    saveUser(newUsername, newPasscode);
    setCurrentUser(newUsername);
    
    setUsername(newUsername);
    setPasscode(newPasscode);
    setShowUsernameCreation(false);
    setCurrentStep('confirm');
  };

  const resetFlow = () => {
    setCurrentStep('select-beneficiary');
    setSelectedBeneficiary(null);
    setCoinCounts({});
    setCustomAmount('');
    setUseCustomAmount(false);
    setUsername('');
    setPasscode('');
    setShowUsernameCreation(false);
    
    // Trigger data refresh on reset
    if (onPledgeSuccess) {
      onPledgeSuccess();
    }
  };

  if (beneficiaries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="bg-gray-100 p-4 rounded-full inline-flex mb-4">
          <div className="w-8 h-8">
            <Image 
              src="/th good loose coins (3).png" 
              alt="Coins" 
              width={32}
              height={32}
              className="w-full h-full object-contain opacity-60"
            />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Beneficiaries Available</h3>
        <p className="text-gray-600">
          There are currently no verified beneficiaries. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      {/* Step Indicator */}
      {currentStep !== 'success' && (
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            {(['select-beneficiary', 'count-coins', 'enter-username', 'confirm'] as const).map((step, index) => {
              const steps = ['select-beneficiary', 'count-coins', 'enter-username', 'confirm'] as const;
              const currentIndex = steps.indexOf(currentStep as any);
              
              return (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step ? 'bg-primary-600 text-white' :
                    index < currentIndex ? 'bg-primary-200 text-primary-800' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 1: Select Beneficiary */}
      {currentStep === 'select-beneficiary' && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Choose a Beneficiary</h3>
          <div className="grid gap-4 max-w-2xl mx-auto">
            {beneficiaries.map((beneficiary) => (
              <button
                key={beneficiary.id}
                onClick={() => {
                  setSelectedBeneficiary(beneficiary.id);
                  setCurrentStep('count-coins');
                }}
                className="p-4 border-2 border-gray-200 hover:border-primary-400 rounded-lg text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{beneficiary.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{beneficiary.description}</p>
                  </div>
                  {beneficiary.verified && (
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ✓ Verified
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Count Coins */}
      {currentStep === 'count-coins' && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Count Your Coins</h3>
          <p className="text-gray-600 text-center mb-6">
            Pledging to: <span className="font-semibold text-primary-600">{selectedBeneficiaryData?.name}</span>
          </p>

          {/* Payment Method Selection */}
          <div className="max-w-md mx-auto mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Choose Your Payment Method</h4>
            
            <div className="space-y-3">
              <div 
                onClick={() => setUseCustomAmount(false)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  !useCustomAmount ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={!useCustomAmount}
                    onChange={() => setUseCustomAmount(false)}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Calculator className="h-5 w-5 text-primary-600 mr-2" />
                      <span className="font-medium text-gray-900">Loose Coins</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Count your spare coins and exchange them at participating stores</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setUseCustomAmount(true)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  useCustomAmount ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={useCustomAmount}
                    onChange={() => setUseCustomAmount(true)}
                    className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-2 text-primary-600">💳</div>
                      <span className="font-medium text-gray-900">Bills / Digital Payment</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Donate using bills, bank transfer, or e-wallet (GCash, PayMaya, etc.)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {useCustomAmount ? (
            // Bills / Digital Payment Amount Input
            <div className="max-w-sm mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Amount (₱)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 <strong>Trust-based system:</strong> We rely on your honesty. Same social impact points whether coins or other payment methods.
              </p>
            </div>
          ) : (
            // Coin Counting Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {Object.entries(COIN_VALUES).map(([coinType, value]) => (
                <div key={coinType} className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getCoinDisplayName(coinType as keyof Omit<CoinCount, 'total'>)}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={coinCounts[coinType as keyof CoinCount] || ''}
                    onChange={(e) => handleCoinCountChange(coinType as keyof CoinCount, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Total Display */}
          <div className="mt-8 text-center">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 inline-block">
              <p className="text-sm text-primary-700 mb-1">Total Amount</p>
              <p className="text-3xl font-bold text-primary-900">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setCurrentStep('enter-username')}
              disabled={totalAmount <= 0}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Enter Username */}
      {currentStep === 'enter-username' && (
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Enter Your Username</h3>
          <p className="text-gray-600 text-center mb-6">
            This will appear on the public leaderboard
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter your username"
                maxLength={20}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Max 20 characters. Choose wisely - this cannot be changed later.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentStep('count-coins')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (username.trim() && username.trim().length >= 2 && passcode) {
                  setCurrentStep('confirm');
                } else {
                  setShowUsernameCreation(true);
                  setCurrentStep('create-profile');
                }
              }}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              {username.trim() && username.trim().length >= 2 && passcode ? 'Continue' : 'Create Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Create Profile */}
      {currentStep === 'create-profile' && showUsernameCreation && (
        <div>
          <UsernameCreation
            onSuccess={handleUsernameCreated}
            onCancel={() => {
              setShowUsernameCreation(false);
              setCurrentStep('enter-username');
            }}
          />
        </div>
      )}

      {/* Step 5: Confirm */}
      {currentStep === 'confirm' && (
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confirm Your Pledge</h3>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Beneficiary:</span>
                <span className="font-semibold">{selectedBeneficiaryData?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-primary-600">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Username:</span>
                <span className="font-semibold">{username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impact Points:</span>
                <span className="font-semibold text-primary-600">{Math.floor(totalAmount)} points</span>
              </div>
              <div className="text-xs text-gray-500 text-center mt-2 p-2 bg-blue-50 rounded">
                ℹ️ All payment methods earn the same impact points: ₱1 = 1 point
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setCurrentStep('enter-username')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmitPledge}
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed inline-flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Pledge
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Success */}
      {currentStep === 'success' && (
        <div className="text-center">
          <div className="bg-green-100 p-6 rounded-full inline-flex mb-6">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Pledge Submitted!</h3>
          <p className="text-gray-600 mb-6">
            Your pledge of <span className="font-semibold text-primary-600">{formatCurrency(totalAmount)}</span> to{' '}
            <span className="font-semibold">{selectedBeneficiaryData?.name}</span> has been recorded.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You'll earn {Math.floor(totalAmount)} Impact Points once the beneficiary confirms receipt.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link 
              href={`/donor/${username}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center"
            >
              <User className="h-4 w-4 mr-2" />
              View My Account
            </Link>
            <button
              onClick={resetFlow}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Make Another Pledge
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Next step:</strong> Visit your account to mark donations as "Sent" after you transfer the money to the beneficiary.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}