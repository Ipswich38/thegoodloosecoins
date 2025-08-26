'use client';

import { useState } from 'react';
import { User, Award, Send, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/coins';

interface UserProfileProps {
  username: string;
  userId?: string;
  pledgeHistory?: Array<{
    id: string;
    amount: number;
    beneficiaryName: string;
    status: 'pending' | 'confirmed';
    pledgedAt: string;
    confirmedAt?: string;
  }>;
  stats?: {
    totalPledged: number;
    totalSent: number;
    impactPoints: number;
    pledgeCount: number;
    rank?: number;
  };
}

export default function UserProfile({ 
  username, 
  userId = 'temp-user-id',
  pledgeHistory = [],
  stats = {
    totalPledged: 0,
    totalSent: 0,
    impactPoints: 0,
    pledgeCount: 0
  }
}: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const completionRate = stats.totalPledged > 0 ? (stats.totalSent / stats.totalPledged) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="bg-primary-100 p-4 rounded-full">
            <User className="h-12 w-12 text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{username}</h1>
            <p className="text-gray-600">Donor Profile</p>
            {stats.rank && (
              <div className="flex items-center mt-2">
                <Award className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">
                  Rank #{stats.rank} on Leaderboard
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{stats.impactPoints}</div>
            <div className="text-sm text-gray-600">Impact Points</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(stats.totalPledged)}
            </div>
            <div className="text-sm text-gray-600">Total Pledged</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(stats.totalSent)}
            </div>
            <div className="text-sm text-gray-600">Successfully Sent</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {stats.pledgeCount}
            </div>
            <div className="text-sm text-gray-600">Total Pledges</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-primary-600">
              {completionRate.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>

        {/* Completion Progress Bar */}
        {stats.totalPledged > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Pledge Completion</span>
              <span className="text-sm text-gray-600">{completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              Pledge History ({pledgeHistory.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {stats.totalPledged > 0 ? (
                <div className="space-y-6">
                  {/* Impact Summary */}
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Impact Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Contribution</p>
                        <p className="text-2xl font-bold text-primary-600">
                          {formatCurrency(stats.totalPledged)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lives Potentially Impacted</p>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.floor(stats.totalSent / 50)} {/* Assuming 50 pesos helps 1 person */}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Preview */}
                  {pledgeHistory.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {pledgeHistory.slice(0, 3).map((pledge) => (
                          <div key={pledge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                pledge.status === 'confirmed' ? 'bg-green-100' : 'bg-orange-100'
                              }`}>
                                {pledge.status === 'confirmed' ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Clock className="h-4 w-4 text-orange-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {formatCurrency(pledge.amount)} to {pledge.beneficiaryName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(pledge.pledgedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              pledge.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {pledge.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 p-6 rounded-full inline-flex mb-4">
                    <Send className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pledges Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start making a difference by creating your first pledge to a verified beneficiary.
                  </p>
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Make Your First Pledge
                  </button>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Pledge History</h3>
              
              {pledgeHistory.length > 0 ? (
                <div className="space-y-4">
                  {pledgeHistory.map((pledge) => (
                    <div key={pledge.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            pledge.status === 'confirmed' ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            {pledge.status === 'confirmed' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {formatCurrency(pledge.amount)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              to {pledge.beneficiaryName}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          pledge.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {pledge.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Pledged: {new Date(pledge.pledgedAt).toLocaleString()}</p>
                        {pledge.confirmedAt && (
                          <p>Confirmed: {new Date(pledge.confirmedAt).toLocaleString()}</p>
                        )}
                        <p>Transaction ID: {pledge.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 p-6 rounded-full inline-flex mb-4">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No pledge history found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}