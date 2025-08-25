'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Coins, AlertCircle, Loader2 } from 'lucide-react';

interface FormData {
  username: string;
  passcode: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    passcode: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    if (!formData.passcode) {
      newErrors.passcode = '6-digit passcode is required';
    } else if (!/^\d{6}$/.test(formData.passcode)) {
      newErrors.passcode = 'Passcode must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log('🔐 NEW CLEAN LOGIN ATTEMPT');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      console.log('📋 Login response:', {
        success: data.success,
        userType: data.user?.type,
        error: data.error
      });

      if (data.success && data.user) {
        const userType = data.user.type.toLowerCase();
        console.log(`✅ Login successful - redirecting to dashboard/${userType}`);
        
        // Direct redirect to dashboard
        router.push(`/dashboard/${userType}`);
      } else {
        console.log('❌ Login failed:', data.error);
        setErrors({ general: data.error || 'Login failed' });
      }
    } catch (error) {
      console.error('🚨 Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary-500 p-3 rounded-full">
              <Coins className="h-8 w-8 text-white" />
            </div>
            <span className="font-bold text-2xl text-gray-900">TG/LC</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">
            Enter your username and 6-digit passcode
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">Test Accounts:</p>
            <div className="text-xs text-blue-600 mt-1 space-y-1">
              <div>👤 testdonor / 123456 (Donor)</div>
              <div>👤 testdonee / 654321 (Donee)</div>
              <div>👤 admin / 999999 (Admin)</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* 6-Digit Passcode */}
            <div>
              <label htmlFor="passcode" className="block text-sm font-medium text-gray-700 mb-1">
                6-Digit Passcode
              </label>
              <div className="relative">
                <input
                  id="passcode"
                  name="passcode"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="off"
                  value={formData.passcode}
                  onChange={handleInputChange}
                  maxLength={6}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-2xl tracking-[0.5em] font-mono ${
                    errors.passcode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.passcode && (
                <p className="mt-1 text-sm text-red-600">{errors.passcode}</p>
              )}
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Use the test accounts above to access the dashboard
          </p>
        </div>
      </div>
    </div>
  );
}