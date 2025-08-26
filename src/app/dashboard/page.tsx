'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const redirectToUserDashboard = async () => {
      console.log('🏠 MAIN DASHBOARD - Checking authentication and redirecting...');
      
      try {
        // Check if user has a session with Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('📋 Session check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          sessionError: sessionError?.message
        });

        if (sessionError || !session || !session.user) {
          console.log('❌ No valid session - redirecting to home');
          router.push('/?message=' + encodeURIComponent('Please log in to access your dashboard.'));
          return;
        }

        // Get user profile from our database
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError || !userProfile) {
          console.error('❌ Profile fetch error:', profileError);
          router.push('/?message=' + encodeURIComponent('Please log in to access your dashboard.'));
          return;
        }

        console.log('✅ Auth successful:', {
          userId: session.user.id,
          userType: userProfile.type
        });

        // Redirect to appropriate dashboard based on user type
        const userType = userProfile.type.toLowerCase();
        console.log(`🎯 Redirecting to dashboard/${userType}`);
        router.push(`/dashboard/${userType}`);

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