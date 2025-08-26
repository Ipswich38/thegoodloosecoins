'use client';

import { useState, useEffect } from 'react';
import { Users, Award, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import PledgeFlow from '@/components/PledgeFlow';
import Leaderboard from '@/components/Leaderboard';
import { generateLeaderboard, getGlobalStats } from '@/lib/localStore';

export default function Dashboard() {
  // Demo beneficiaries for presentation
  const beneficiaries = [
    {
      id: '1',
      name: 'Test Beneficiary 1',
      description: 'Educational programs and student support initiatives for community development',
      verified: true,
      facebook: 'https://www.facebook.com/testbeneficiary1',
      school: 'Demo School 1'
    },
    {
      id: '2', 
      name: 'Test Beneficiary 2',
      description: 'Technology infrastructure and learning resources for enhanced educational experience',
      verified: true,
      facebook: 'https://www.facebook.com/testbeneficiary2',
      location: 'Demo Location, Philippines'
    }
  ];

  // Real leaderboard data from localStorage
  const [leaderboardEntries, setLeaderboardEntries] = useState<Array<{
    id: string;
    username: string;
    totalPledged: number;
    totalSent: number;
    impactPoints: number;
    pledgeCount: number;
    rank: number;
  }>>([]);

  const [globalStats, setGlobalStats] = useState({
    totalPledged: 0,
    totalSent: 0,
    totalImpactPoints: 0,
    totalPledges: 0,
    totalUsers: 0,
    beneficiaryCount: 2
  });

  // Update data when component mounts and when localStorage changes
  useEffect(() => {
    const updateData = () => {
      setLeaderboardEntries(generateLeaderboard());
      setGlobalStats(getGlobalStats());
    };

    updateData();

    // Listen for storage changes to update in real-time
    const handleStorageChange = () => updateData();
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events when data changes in the same tab
    window.addEventListener('tglc-data-changed', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tglc-data-changed', handleStorageChange);
    };
  }, []);

  // Function to trigger data refresh
  const refreshData = () => {
    setLeaderboardEntries(generateLeaderboard());
    setGlobalStats(getGlobalStats());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8">
                <Image 
                  src="/th good loose coins (3).png" 
                  alt="The Good Loose Coins Logo" 
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-900">The Good Loose Coins</h1>
            </div>
            <div className="text-sm text-gray-600">
              Public Dashboard
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Beneficiaries</p>
                <p className="text-2xl font-bold text-gray-900">{beneficiaries.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <div className="w-6 h-6">
                  <Image 
                    src="/th good loose coins (3).png" 
                    alt="Coins" 
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Pledged</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{globalStats.totalPledged.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Successfully Sent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₱{globalStats.totalSent.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Impact Points</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalStats.totalImpactPoints.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pledge Flow */}
        <div className="mb-8">
          <PledgeFlow 
            beneficiaries={beneficiaries} 
            onPledgeSuccess={refreshData}
          />
        </div>

        {/* Verified Beneficiaries Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Verified Beneficiaries</h2>
            
            {beneficiaries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {beneficiaries.map((beneficiary) => (
                  <div key={beneficiary.id} className="p-6 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{beneficiary.name}</h3>
                        {beneficiary.school && (
                          <p className="text-xs text-gray-500 mb-2">{beneficiary.school}</p>
                        )}
                        {beneficiary.location && (
                          <p className="text-xs text-gray-500 mb-2">{beneficiary.location}</p>
                        )}
                      </div>
                      {beneficiary.verified && (
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          ✓ PTA Verified
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{beneficiary.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <a 
                        href={beneficiary.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                      >
                        📘 Facebook Page
                      </a>
                      <div className="text-xs text-gray-400">
                        ID: #{beneficiary.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full inline-flex mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No verified beneficiaries yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Beneficiaries will appear here once verified and approved
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mb-8">
          <Leaderboard entries={leaderboardEntries} />
        </div>

        {/* How it Works */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 p-4 rounded-full inline-flex mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose Beneficiary</h3>
              <p className="text-sm text-gray-600">Select from verified beneficiaries</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 p-4 rounded-full inline-flex mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Count Coins</h3>
              <p className="text-sm text-gray-600">Enter your coin amounts</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 p-4 rounded-full inline-flex mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Make Pledge</h3>
              <p className="text-sm text-gray-600">Add username and pledge</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 p-4 rounded-full inline-flex mb-4">
                <span className="text-2xl font-bold text-primary-600">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Earn Impact</h3>
              <p className="text-sm text-gray-600">Get points when confirmed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}