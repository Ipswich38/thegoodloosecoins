'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Award, Users, TrendingUp } from 'lucide-react';
import { SocialImpactPoint } from '@/types/pledge';

interface LeaderboardEntry {
  userId: string;
  username: string;
  points: number;
  rank: number;
  totalPledges: number;
  totalDonated: number;
}

interface LeaderboardProps {
  currentUserId?: string;
  limit?: number;
  className?: string;
}

export default function Leaderboard({ currentUserId, limit = 10, className = '' }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        timeframe,
        limit: limit.toString(),
      });

      if (currentUserId) {
        searchParams.set('userId', currentUserId);
      }

      const response = await fetch(`/api/social-impact/leaderboard?${searchParams.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch leaderboard');
      }

      setLeaderboard(data.leaderboard || []);
      setCurrentUserRank(data.currentUserRank || null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe, limit, currentUserId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-primary-600">{rank}</span>
          </div>
        );
    }
  };

  const getRankBackgroundColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return 'bg-primary-50 border-primary-200';
    }
    
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Trophy className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Impact Leaderboard</h2>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow ${className}`}>
        <div className="p-6 text-center">
          <div className="text-red-600 mb-4">
            <Trophy className="h-8 w-8 mx-auto mb-2" />
            <p className="font-medium">Error loading leaderboard</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchLeaderboard}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Impact Leaderboard</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
            <p className="text-gray-600">
              The leaderboard will show top contributors when pledges are made.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.userId === currentUserId;
              
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center space-x-4 p-4 border rounded-lg ${getRankBackgroundColor(entry.rank, isCurrentUser)}`}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${isCurrentUser ? 'text-primary-900' : 'text-gray-900'}`}>
                        {entry.username}
                      </span>
                      {isCurrentUser && (
                        <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{entry.totalPledges} pledges</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>•</span>
                        <span>${entry.totalDonated.toFixed(2)} donated</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className={`font-bold ${isCurrentUser ? 'text-primary-900' : 'text-gray-900'}`}>
                      {entry.points.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Current User Rank (if not in top list) */}
        {currentUserRank && !leaderboard.some(entry => entry.userId === currentUserId) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2">Your ranking:</div>
            <div className={`flex items-center space-x-4 p-4 border rounded-lg ${getRankBackgroundColor(currentUserRank.rank, true)}`}>
              <div className="flex-shrink-0">
                {getRankIcon(currentUserRank.rank)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-primary-900">
                    {currentUserRank.username}
                  </span>
                  <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    You
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{currentUserRank.totalPledges} pledges</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>•</span>
                    <span>${currentUserRank.totalDonated.toFixed(2)} donated</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-bold text-primary-900">
                  {currentUserRank.points.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Point System Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              How are points calculated?
            </summary>
            <div className="mt-3 text-sm text-gray-600 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Pledge Creation:</span> 10 points
                </div>
                <div>
                  <span className="font-medium">Task Completion:</span> 5-20 points
                </div>
                <div>
                  <span className="font-medium">Small Pledge Bonus:</span> 5 points ($5-$24.99)
                </div>
                <div>
                  <span className="font-medium">Large Pledge Bonus:</span> 50+ points ($100+)
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}