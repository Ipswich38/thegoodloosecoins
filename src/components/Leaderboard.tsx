'use client';

import { Award, Trophy, Medal, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/coins';

interface LeaderboardEntry {
  id: string;
  username: string;
  totalPledged: number;
  totalSent: number;
  impactPoints: number;
  pledgeCount: number;
  rank: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-300" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Award className="h-6 w-6 mr-2 text-primary-600" />
          Leaderboard
        </h2>
        
        <div className="text-center py-8">
          <div className="bg-gray-100 p-3 rounded-full inline-flex mb-3">
            <Award className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500">No pledges yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Be the first to make a pledge!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Award className="h-6 w-6 mr-2 text-primary-600" />
        Leaderboard
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({entries.length} donors)
        </span>
      </h2>
      
      {/* Top 3 Highlight */}
      {entries.length >= 3 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">🏆 Top Contributors 🏆</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            {entries.slice(0, 3).map((entry) => (
              <div key={entry.id} className="space-y-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-bold ${getRankBadgeColor(entry.rank)}`}>
                  {entry.rank}
                </div>
                <p className="text-xs font-medium text-gray-900 truncate">{entry.username}</p>
                <p className="text-xs text-primary-600 font-semibold">{entry.impactPoints}pts</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 pb-2 border-b border-gray-200">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Donor</div>
          <div className="col-span-2 text-right">Pledged</div>
          <div className="col-span-2 text-right">Sent</div>
          <div className="col-span-2 text-right">Points</div>
          <div className="col-span-1 text-right">Count</div>
        </div>

        {/* Entries */}
        {entries.map((entry, index) => {
          const isTopThree = entry.rank <= 3;
          const completionRate = entry.totalPledged > 0 ? (entry.totalSent / entry.totalPledged) * 100 : 0;
          
          return (
            <div 
              key={entry.id} 
              className={`grid grid-cols-12 gap-2 py-3 px-2 rounded-lg transition-colors ${
                isTopThree ? 'bg-primary-25 border border-primary-100' : 'hover:bg-gray-50'
              }`}
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(entry.rank)}`}>
                  {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                </div>
              </div>

              {/* Username */}
              <div className="col-span-4 flex items-center">
                <div>
                  <p className={`text-sm font-medium ${isTopThree ? 'text-primary-900' : 'text-gray-900'} truncate`}>
                    {entry.username}
                  </p>
                  {completionRate > 0 && (
                    <div className="flex items-center mt-1">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${Math.min(completionRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {completionRate.toFixed(0)}% sent
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Pledged */}
              <div className="col-span-2 text-right flex items-center justify-end">
                <span className={`text-sm font-medium ${isTopThree ? 'text-primary-700' : 'text-gray-700'}`}>
                  {formatCurrency(entry.totalPledged)}
                </span>
              </div>

              {/* Total Sent */}
              <div className="col-span-2 text-right flex items-center justify-end">
                <span className={`text-sm font-medium ${
                  entry.totalSent > 0 
                    ? isTopThree ? 'text-green-700' : 'text-green-600'
                    : 'text-gray-400'
                }`}>
                  {entry.totalSent > 0 ? formatCurrency(entry.totalSent) : '—'}
                </span>
              </div>

              {/* Impact Points */}
              <div className="col-span-2 text-right flex items-center justify-end">
                <div className="text-right">
                  <span className={`text-sm font-bold ${
                    isTopThree ? 'text-primary-700' : 'text-primary-600'
                  }`}>
                    {entry.impactPoints}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">pts</span>
                </div>
              </div>

              {/* Pledge Count */}
              <div className="col-span-1 text-right flex items-center justify-end">
                <span className="text-xs text-gray-500">
                  {entry.pledgeCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Pledged</p>
            <p className="text-lg font-semibold text-primary-600">
              {formatCurrency(entries.reduce((sum, entry) => sum + entry.totalPledged, 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Sent</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(entries.reduce((sum, entry) => sum + entry.totalSent, 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Impact Points</p>
            <p className="text-lg font-semibold text-primary-600">
              {entries.reduce((sum, entry) => sum + entry.impactPoints, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}