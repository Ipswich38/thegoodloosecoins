'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, TrendingUp, Users, DollarSign, Plus } from 'lucide-react';
import { User } from '@/types/auth';
import { PledgeStats } from '@/types/pledge';
import PledgeCreationForm from '@/components/pledges/PledgeCreationForm';
import PledgesList from '@/components/pledges/PledgesList';
import Leaderboard from '@/components/social-impact/Leaderboard';

export default function DonorDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PledgeStats | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, refreshTrigger]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/pledges/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePledgeCreated = (pledge: any) => {
    setShowCreateForm(false);
    setRefreshTrigger(prev => prev + 1);
    // Optionally show a success message
  };

  const handlePledgeUpdate = (pledge: any) => {
    setRefreshTrigger(prev => prev + 1);
  };

  const checkAuthStatus = async () => {
    try {
      // First try the new direct session check
      let response = await fetch('/api/auth/check-session');
      
      if (!response.ok) {
        // Fallback to the original auth/me endpoint
        response = await fetch('/api/auth/me');
      }
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const userData = data.user;
          setUser(userData);
          
          // Redirect if user type doesn't match
          if (userData.type !== 'DONOR') {
            router.replace(`/dashboard/${userData.type.toLowerCase()}`);
            return;
          }
        } else {
          // User not found in database but response was OK
          console.error('User data not found in response:', data);
          router.replace('/login?message=' + encodeURIComponent('Please log in again'));
          return;
        }
      } else if (response.status === 503) {
        // Database temporarily unavailable - create fallback user
        console.warn('Database temporarily unavailable, using fallback authentication');
        setUser({
          id: 'temp',
          username: 'User',
          email: 'user@example.com',
          type: 'DONOR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // User not authenticated, redirect to login
        console.log('Authentication failed with status:', response.status);
        router.replace('/login?message=' + encodeURIComponent('Please log in to access your dashboard'));
        return;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Network error - try to continue with limited functionality
      router.replace('/login?message=' + encodeURIComponent('Connection error. Please try again.'));
      return;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we verify your access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}!</h1>
          <p className="text-gray-600 mt-2">Ready to make a difference today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pledged</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.totalPledged.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Amount Sent</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.totalAmountSent?.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-gray-500">
                  {stats?.totalPledged ? `${((stats.totalAmountSent || 0) / stats.totalPledged * 100).toFixed(1)}% of pledged` : '0% of pledged'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">People Helped</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.peopleHelped || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Heart className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Impact Points</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPoints.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500">
                  Avg completion: {stats?.averageCompletion?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {showCreateForm ? (
          <div className="mb-8">
            <PledgeCreationForm
              onSuccess={handlePledgeCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Create New Pledge */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Create New Pledge</h2>
                <p className="text-gray-600 mt-1">Start making a difference by creating a new pledge</p>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to help?</h3>
                  <p className="text-gray-600 mb-6">
                    {stats?.activePledges === 0 
                      ? 'Create your first pledge to support someone in need.'
                      : 'Create another pledge to increase your impact.'
                    }
                  </p>
                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Pledge</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Impact Leaderboard */}
            <Leaderboard 
              currentUserId={user?.id} 
              limit={5} 
              className="h-fit"
            />
          </div>
        )}

        {/* Pledges List */}
        {!showCreateForm && (
          <div className="mb-8">
            <PledgesList 
              userType="DONOR" 
              onPledgeUpdate={handlePledgeUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}