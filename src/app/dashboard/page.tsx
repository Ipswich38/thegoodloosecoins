'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const redirectToUserDashboard = async () => {
      try {
        // Try direct session check first, then fallback to Supabase auth
        let response = await fetch('/api/auth/check-session', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (!response.ok) {
          response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          });
        }

        if (!response.ok) {
          // User is not authenticated, redirect to login
          router.push('/login?message=' + encodeURIComponent('Please log in to access your dashboard.'));
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          // Redirect to appropriate dashboard based on user type
          const userType = data.user.type.toLowerCase();
          router.push(`/dashboard/${userType}`);
        } else {
          // User data not available, redirect to login
          router.push('/login?message=' + encodeURIComponent('Please log in to access your dashboard.'));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Unable to load dashboard. Please try again.');
        setIsLoading(false);
      }
    };

    redirectToUserDashboard();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Access Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h2>
        <p className="text-gray-600">Redirecting you to your personalized dashboard...</p>
      </div>
    </div>
  );
}