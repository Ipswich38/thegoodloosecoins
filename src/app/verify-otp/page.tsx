'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

interface OTPFormProps {
  email: string;
  userData: any;
}

function OTPForm({ email, userData }: OTPFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otp.trim(),
          userData: userData && {
            username: userData.username,
            type: userData.type,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Registration/verification successful
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setResendMessage('New verification code sent to your email');
      } else {
        setError(data.error || 'Failed to resend verification code');
      }
    } catch (error) {
      setError('Failed to resend verification code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to signup
          </Link>
          <Mail className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-primary-600">{email}</p>
        </div>

        {/* OTP Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="sr-only">
              Verification code
            </label>
            <div className="relative">
              <input
                id="otp"
                name="otp"
                type="text"
                autoComplete="one-time-code"
                required
                maxLength={6}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setOtp(value);
                }}
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {resendMessage && (
              <p className="mt-2 text-sm text-green-600" role="alert">
                {resendMessage}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend code'}
              </button>
            </p>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            The verification code will expire in 10 minutes
          </p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">
              <strong>💡 Tip:</strong> If you received an email with a confirmation link instead of a code, 
              look for a 6-digit code in the email body or URL parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function OTPVerificationPage() {
  const router = useRouter();

  useEffect(() => {
    // COMPLETELY BYPASS OTP - redirect to signup instead
    console.log('🚫 OTP page accessed - redirecting to signup to avoid OTP flow');
    router.push('/signup?message=' + encodeURIComponent('Email verification temporarily disabled. Please try signing up again.'));
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-4" />
        <p>Redirecting you back to signup...</p>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    }>
      <OTPVerificationPage />
    </Suspense>
  );
}