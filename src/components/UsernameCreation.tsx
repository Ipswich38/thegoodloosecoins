'use client';

import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Check, X } from 'lucide-react';

interface UsernameCreationProps {
  onSuccess: (username: string, passcode: string) => void;
  onCancel?: () => void;
}

export default function UsernameCreation({ onSuccess, onCancel }: UsernameCreationProps) {
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [showConfirmPasscode, setShowConfirmPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateUsername = (value: string): string | null => {
    if (!value.trim()) return 'Username is required';
    if (value.length < 2) return 'Username must be at least 2 characters';
    if (value.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, hyphens, and underscores';
    return null;
  };

  const validatePasscode = (value: string): string | null => {
    if (!value) return 'Passcode is required';
    if (!/^\d{6}$/.test(value)) return 'Passcode must be exactly 6 digits';
    return null;
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    const error = validateUsername(value);
    setErrors(prev => ({
      ...prev,
      username: error || ''
    }));
  };

  const handlePasscodeChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setPasscode(digitsOnly);
    
    const error = validatePasscode(digitsOnly);
    setErrors(prev => ({
      ...prev,
      passcode: error || ''
    }));

    // Clear confirm passcode error if it was mismatched
    if (confirmPasscode && digitsOnly !== confirmPasscode) {
      setErrors(prev => ({
        ...prev,
        confirmPasscode: 'Passcodes do not match'
      }));
    } else if (confirmPasscode && digitsOnly === confirmPasscode) {
      setErrors(prev => ({
        ...prev,
        confirmPasscode: ''
      }));
    }
  };

  const handleConfirmPasscodeChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setConfirmPasscode(digitsOnly);
    
    const error = digitsOnly !== passcode ? 'Passcodes do not match' : '';
    setErrors(prev => ({
      ...prev,
      confirmPasscode: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const usernameError = validateUsername(username);
    const passcodeError = validatePasscode(passcode);
    const confirmError = passcode !== confirmPasscode ? 'Passcodes do not match' : '';

    if (usernameError || passcodeError || confirmError) {
      setErrors({
        username: usernameError || '',
        passcode: passcodeError || '',
        confirmPasscode: confirmError || ''
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess(username, passcode);
    } catch (error) {
      console.error('Error creating username:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = !errors.username && !errors.passcode && !errors.confirmPasscode && 
                  username.trim() && passcode.length === 6 && confirmPasscode.length === 6;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="bg-primary-100 p-4 rounded-full inline-flex mb-4">
          <User className="h-8 w-8 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Your Profile</h2>
        <p className="text-gray-600 text-sm">
          Choose a username and secure 6-digit passcode to track your contributions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username / Alias
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.username ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your preferred username"
              maxLength={20}
            />
            {username && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {errors.username ? (
                  <X className="h-5 w-5 text-red-500" />
                ) : (
                  <Check className="h-5 w-5 text-green-500" />
                )}
              </div>
            )}
          </div>
          {errors.username && (
            <p className="text-red-500 text-xs mt-1">{errors.username}</p>
          )}
          <p className="text-gray-400 text-xs mt-1">
            2-20 characters, letters, numbers, hyphens, underscores only
          </p>
        </div>

        {/* Passcode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            6-Digit Passcode
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showPasscode ? 'text' : 'password'}
              value={passcode}
              onChange={(e) => handlePasscodeChange(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.passcode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter 6-digit passcode"
              maxLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPasscode(!showPasscode)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasscode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.passcode && (
            <p className="text-red-500 text-xs mt-1">{errors.passcode}</p>
          )}
        </div>

        {/* Confirm Passcode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Passcode
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showConfirmPasscode ? 'text' : 'password'}
              value={confirmPasscode}
              onChange={(e) => handleConfirmPasscodeChange(e.target.value)}
              className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.confirmPasscode ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirm your passcode"
              maxLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPasscode(!showConfirmPasscode)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPasscode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPasscode && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPasscode}</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed inline-flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Profile'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800 text-xs leading-relaxed">
          <strong>Privacy:</strong> Your passcode is only used to access your profile and confirm pledges. 
          We do not store personal information beyond your chosen username.
        </p>
      </div>
    </div>
  );
}