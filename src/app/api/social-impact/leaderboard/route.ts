import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

async function getCurrentUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  return dbUser;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  points: number;
  rank: number;
  totalPledges: number;
  totalDonated: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');

    // Build date filter based on timeframe
    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFilter = { createdAt: { gte: monthAgo } };
        break;
      case 'all':
      default:
        dateFilter = {};
        break;
    }

    // Get social impact points with user data and pledge statistics
    const socialImpactData = await prisma.socialImpactPoint.findMany({
      where: {
        points: { gt: 0 },
        ...(timeframe !== 'all' ? { updatedAt: dateFilter.createdAt } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            pledges: {
              where: dateFilter,
              select: {
                id: true,
                amount: true,
                status: true,
              }
            }
          }
        }
      },
      orderBy: {
        points: 'desc'
      }
    });

    // Process the data to create leaderboard entries
    const leaderboardData: LeaderboardEntry[] = socialImpactData
      .map(item => {
        const totalPledges = item.user.pledges.length;
        const totalDonated = item.user.pledges
          .filter(p => p.status === 'COMPLETED')
          .reduce((sum, p) => sum + p.amount, 0);

        return {
          userId: item.userId,
          username: item.user.username,
          points: item.points,
          rank: 0, // Will be set below
          totalPledges,
          totalDonated,
        };
      })
      .filter(entry => entry.points > 0)
      .sort((a, b) => b.points - a.points);

    // Assign ranks
    leaderboardData.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Get the top entries for the main leaderboard
    const leaderboard = leaderboardData.slice(0, limit);

    // Find current user's rank if not in top list
    let currentUserRank: LeaderboardEntry | null = null;
    if (userId) {
      const userEntry = leaderboardData.find(entry => entry.userId === userId);
      if (userEntry && userEntry.rank > limit) {
        currentUserRank = userEntry;
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard,
      currentUserRank,
      total: leaderboardData.length,
      timeframe,
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to fetch leaderboard'
        }
      },
      { status: 500 }
    );
  }
}