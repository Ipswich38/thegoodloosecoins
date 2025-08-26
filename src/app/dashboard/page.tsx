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
      console.log('🏠 MAIN DASHBOARD - Checking authentication and redirecting...');
      
      // Wait a moment to allow cookies to be set properly
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        // Try direct session check first, then fallback to Supabase auth
        console.log('📡 Trying /api/auth/check-session...');
        let response = await fetch('/api/auth/check-session', {
          method: 'GET',
          credentials: 'include',
        });
        
        console.log('📋 Check-session response:', {
          status: response.status,
          ok: response.ok
        });
        
        if (!response.ok) {
          console.log('📡 Check-session failed, trying /api/auth/me...');
          response = await fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include',
          });
          
          console.log('📋 Auth/me response:', {
            status: response.status,
            ok: response.ok
          });
        }

        if (!response.ok) {
          console.log('❌ Both auth endpoints failed - redirecting to home');
          console.log('🔄 Redirecting with message: Please log in to access your dashboard.');
          // User is not authenticated, redirect to home page
          router.push('/?message=' + encodeURIComponent('Please log in to access your dashboard.'));
          return;
        }

        const data = await response.json();
        console.log('✅ Auth successful:', {
          success: data.success,
          hasUser: !!data.user,
          userType: data.user?.type
        });

        if (data.success && data.user) {
          // Redirect to appropriate dashboard based on user type
          const userType = data.user.type.toLowerCase();
          console.log(`🎯 Redirecting to dashboard/${userType}`);
          router.push(`/dashboard/${userType}`);
        } else {
          console.log('❌ No user data in successful response - redirecting to home');
          // User data not available, redirect to home page  
          router.push('/?message=' + encodeURIComponent('Please log in to access your dashboard.'));
        }
      } catch (error) {
        console.error('🚨 Error fetching user data:', error);
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
              onClick={() => router.push('/')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Go to Home
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