'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, CheckCircle, Clock, DollarSign, RefreshCw } from 'lucide-react';
import { User } from '@/types/auth';
import { DoneeStats } from '@/types/pledge';
import PledgesList from '@/components/pledges/PledgesList';

export default function DoneeDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DoneeStats | null>(null);
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

  const handlePledgeUpdate = (pledge: any) => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        setUser(userData);
        
        // Redirect if user type doesn't match
        if (userData && userData.type !== 'DONEE') {
          router.replace(`/dashboard/${userData.type.toLowerCase()}`);
          return;
        }
      } else {
        // User not authenticated, redirect to login
        router.replace('/login');
        return;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.username}!</h1>
          <p className="text-gray-600 mt-2">Complete tasks to unlock donations and get the support you need</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Funds</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.availableFunds.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-gray-500">
                  From completed transfers
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeTasks || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.completedTasks || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Transfers</p>
                <p className="text-2xl font-bold text-gray-900">${stats?.pendingRewards.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-gray-500">
                  Partially sent by donors
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Tasks */}
        <div className="mb-8">
          <PledgesList 
            userType="DONEE" 
            onPledgeUpdate={handlePledgeUpdate}
          />
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">How It Works</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="p-3 bg-primary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Wait for Pledges</h3>
                <p className="text-gray-600 text-sm">Donors will create pledges to support you based on your needs</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-primary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Tasks Available</h3>
                <p className="text-gray-600 text-sm">Tasks will appear above when pledges are made. You can track donor progress.</p>
              </div>
              <div className="text-center">
                <div className="p-3 bg-primary-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Receive Support</h3>
                <p className="text-gray-600 text-sm">Access the donated funds when donors complete their tasks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}