'use client';
import { useEffect, useState } from 'react';
import { Users, Heart, Coins } from 'lucide-react';
import { formatCurrency } from '@/lib/coins';

interface GlobalStats {
  totalUsers: number;
  totalDonors: number;
  totalDonees: number;
  totalPledges: number;
  totalAmountPledged: number;
  totalAmountSent: number;
  completedPledges: number;
  activeDonorsCount: number;
  peopleHelpedCount: number;
  totalImpactPoints: number;
  averagePledgeAmount: number;
  completionRate: number;
  coinsBackInCirculation: number;
}

export default function Stats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    {
      icon: Users,
      label: 'Active Donors',
      value: loading ? '...' : `${stats?.activeDonorsCount?.toLocaleString() || '0'}+`,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: Heart,
      label: 'People Helped',
      value: loading ? '...' : `${stats?.peopleHelpedCount?.toLocaleString() || '0'}+`,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
    },
    {
      icon: Coins,
      label: 'Coins Back in Circulation',
      value: loading ? '...' : formatCurrency(stats?.coinsBackInCirculation || 0),
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Our Impact So Far
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {statItems.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex p-4 rounded-full ${stat.bg} mb-4`}>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              
              <div className="text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}