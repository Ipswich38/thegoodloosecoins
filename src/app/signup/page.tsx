'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Coins, AlertCircle, Loader2, Heart, HandHeart, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  type: 'DONOR' | 'DONEE' | '';
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  type?: string;
  general?: string;
}

function SignupForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    type: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isOAuthFlow, setIsOAuthFlow] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if this is an OAuth flow
    const oauth = searchParams.get('oauth');
    const email = searchParams.get('email');
    const username = searchParams.get('username');
    const error = searchParams.get('error');

    if (oauth && email) {
      setIsOAuthFlow(true);
      setFormData(prev => ({
        ...prev,
        email,
        username: username || '',
      }));
    }

    if (error) {
      setErrors({ general: decodeURIComponent(error) });
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isOAuthFlow) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (!formData.type) {
      newErrors.type = 'Please select an account type';
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
      let response;
      
      if (isOAuthFlow) {
        // Complete OAuth signup by creating user in database
        const oauthToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('sb-oauth-token='))
          ?.split('=')[1];

        if (!oauthToken) {
          setErrors({ general: 'OAuth session expired. Please try signing up again.' });
          setIsLoading(false);
          return;
        }

        // Create user in database with OAuth info
        response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${oauthToken}`,
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            type: formData.type,
            oauth: true,
          }),
        });
      } else {
        // Regular email/password signup - try simple signup first
        response = await fetch('/api/auth/simple-signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            type: formData.type,
          }),
        });
        
        // If simple signup fails, try the original route
        if (!response.ok) {
          console.log('Simple signup failed, trying original signup route...');
          response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: formData.username,
              email: formData.email,
              password: formData.password,
              type: formData.type,
            }),
          });
        }
      }

      const data = await response.json();

      if (data.success) {
        if (data.requiresOTP) {
          // OTP verification required - redirect to verification page
          const userDataParam = encodeURIComponent(JSON.stringify(data.userData));
          router.push(`/verify-otp?email=${encodeURIComponent(data.userData.email)}&userData=${userDataParam}`);
        } else if (data.user) {
          // User was created successfully - redirect to dashboard
          router.push(`/dashboard/${data.user.type.toLowerCase()}`);
        } else {
          // Fallback - redirect to login
          router.push('/login?message=' + encodeURIComponent(data.message || 'Account created successfully'));
        }
      } else {
        setErrors({ general: data.error || 'Signup failed' });
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        setErrors({ general: error.message });
        setIsGoogleLoading(false);
      }
      // If successful, user will be redirected, so no need to setIsGoogleLoading(false)
    } catch (error) {
      console.error('Google signup error:', error);
      setErrors({ general: 'Failed to initiate Google signup. Please try again.' });
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTypeSelection = (type: 'DONOR' | 'DONEE') => {
    setFormData(prev => ({ ...prev, type }));
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: undefined }));
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
          <h2 className="text-3xl font-bold text-gray-900">
            {isOAuthFlow ? 'Complete your profile' : 'Create your account'}
          </h2>
          <p className="mt-2 text-gray-600">
            {isOAuthFlow 
              ? 'Choose your account type to finish setting up'
              : 'Join the community and start making a difference today'
            }
          </p>
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
            {/* Account Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to...
              </label>
              <div className="grid grid-cols-1 gap-3">
                {/* Donor Option */}
                <button
                  type="button"
                  onClick={() => handleTypeSelection('DONOR')}
                  className={`p-4 border rounded-lg text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    formData.type === 'DONOR'
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      formData.type === 'DONOR' ? 'bg-primary-500' : 'bg-gray-200'
                    }`}>
                      <Heart className={`h-4 w-4 ${
                        formData.type === 'DONOR' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">Donate money</h3>
                        {formData.type === 'DONOR' && (
                          <Check className="h-4 w-4 text-primary-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pledge money to support those in need and earn social impact points
                      </p>
                    </div>
                  </div>
                </button>

                {/* Donee Option */}
                <button
                  type="button"
                  onClick={() => handleTypeSelection('DONEE')}
                  className={`p-4 border rounded-lg text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    formData.type === 'DONEE'
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      formData.type === 'DONEE' ? 'bg-primary-500' : 'bg-gray-200'
                    }`}>
                      <HandHeart className={`h-4 w-4 ${
                        formData.type === 'DONEE' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">Receive donations</h3>
                        {formData.type === 'DONEE' && (
                          <Check className="h-4 w-4 text-primary-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Complete tasks to unlock pledged donations and get the support you need
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              {errors.type && (
                <p className="mt-2 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

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
                placeholder="Choose a username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isOAuthFlow}
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${isOAuthFlow ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password fields (only for regular signup) */}
            {!isOAuthFlow && (
              <>
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Create a strong password"
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
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Creating Account...' : (isOAuthFlow ? 'Complete Setup' : 'Create Account')}
          </button>

          {/* Temporarily disabled Google OAuth */}
          {/*
          {!isOAuthFlow && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-primary-50 text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
              </button>
            </>
          )}
          */}
        </form>

        {/* Sign In Link */}
        {!isOAuthFlow && (
          <div className="text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>}>
      <SignupForm />
    </Suspense>
  );
}