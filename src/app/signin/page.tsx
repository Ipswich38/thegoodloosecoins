'use client';

import { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { verifyUser, setCurrentUser } from '@/lib/localStore';

export default function SignIn() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }
    
    if (!passcode) {
      setError('Please enter your passcode');
      return;
    }
    
    if (passcode.length !== 6) {
      setError('Passcode must be 6 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify credentials
      const isValid = verifyUser(username.trim(), passcode);
      
      if (isValid) {
        // Set current user in localStorage
        setCurrentUser(username.trim());
        
        // Redirect to donor dashboard
        router.push(`/donor/${username.trim()}`);
      } else {
        setError('Invalid username or passcode. Please try again.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasscodeChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setPasscode(digitsOnly);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="w-16 h-16 mx-auto mb-6">
            <Image 
              src="/th good loose coins (3).png" 
              alt="The Good Loose Coins Logo" 
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
          <p className="text-gray-600">
            Access your donor account to track your pledges and donations
          </p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

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
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your username"
                  maxLength={20}
                  autoComplete="username"
                />
              </div>
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your 6-digit passcode"
                  maxLength={6}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasscode ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the 6-digit passcode you created when you first made a pledge
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!username.trim() || passcode.length !== 6 || isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed inline-flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Don't have an account?</h4>
            <p className="text-blue-800 text-sm mb-3">
              You can create an account by making your first pledge on the main dashboard.
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Go to Dashboard
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          {/* Forgot Passcode */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Forgot your passcode? Contact support for assistance.
            </p>
          </div>
        </div>

        {/* Demo Accounts */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Demo Accounts (Development Only)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-yellow-800">TestUser1</span>
                <span className="font-mono text-yellow-700">123456</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-yellow-800">TestUser2</span>
                <span className="font-mono text-yellow-700">654321</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}