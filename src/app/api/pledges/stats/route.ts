import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { PledgeStats, DoneeStats } from '@/types/pledge';

async function getCurrentUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  return dbUser;
}

async function getDonorStats(userId: string): Promise<PledgeStats> {
  // Get pledge statistics
  const pledgeStats = await prisma.pledge.aggregate({
    where: { donorId: userId },
    _sum: { 
      amount: true,
      amountSent: true,
      completionPercentage: true
    },
    _count: {
      id: true,
      _all: true,
    }
  });

  const activePledgesCount = await prisma.pledge.count({
    where: { 
      donorId: userId,
      status: { in: ['PENDING', 'TASK1_COMPLETE', 'TASK2_COMPLETE'] }
    }
  });

  const completedPledgesCount = await prisma.pledge.count({
    where: { 
      donorId: userId,
      status: 'COMPLETED'
    }
  });

  // Get total impact points
  const socialImpactPoints = await prisma.socialImpactPoint.findUnique({
    where: { userId }
  });

  // Get number of people helped (unique beneficiaries from donations)
  const peopleHelped = await prisma.donation.groupBy({
    by: ['beneficiaryId'],
    where: {
      pledge: {
        donorId: userId
      }
    }
  });

  // Calculate average completion percentage
  const totalPledges = pledgeStats._count.id;
  const averageCompletion = totalPledges > 0 
    ? (pledgeStats._sum.completionPercentage || 0) / totalPledges 
    : 0;

  return {
    totalPledged: pledgeStats._sum.amount || 0,
    totalAmountSent: pledgeStats._sum.amountSent || 0,
    activePledges: activePledgesCount,
    completedPledges: completedPledgesCount,
    totalPoints: socialImpactPoints?.points || 0,
    peopleHelped: peopleHelped.length,
    averageCompletion: averageCompletion,
  };
}

async function getDoneeStats(userId: string): Promise<DoneeStats> {
  // Get donations for this donee
  const donations = await prisma.donation.findMany({
    where: { beneficiaryId: userId },
    include: {
      pledge: true
    }
  });

  // Calculate available funds based on actual amount sent from completed pledges
  const availableFunds = donations
    .filter(d => d.pledge.status === 'COMPLETED')
    .reduce((sum, d) => {
      // Use the actual amount sent for this donation's share
      const pledgeAmountSent = d.pledge.amountSent || 0;
      const donationShare = d.amount / d.pledge.amount; // This donation's share of the pledge
      return sum + (pledgeAmountSent * donationShare);
    }, 0);

  // Calculate pending rewards from pledges that have amounts sent but not completed
  const pendingRewards = donations
    .filter(d => d.pledge.status !== 'COMPLETED' && (d.pledge.amountSent || 0) > 0)
    .reduce((sum, d) => {
      const pledgeAmountSent = d.pledge.amountSent || 0;
      const donationShare = d.amount / d.pledge.amount;
      return sum + (pledgeAmountSent * donationShare);
    }, 0);

  // Total potential earnings (based on full donation amounts)
  const totalPotentialEarned = donations.reduce((sum, d) => sum + d.amount, 0);

  // Total actually earned (based on amount sent)
  const totalEarned = donations.reduce((sum, d) => {
    const pledgeAmountSent = d.pledge.amountSent || 0;
    const donationShare = d.amount / d.pledge.amount;
    return sum + (pledgeAmountSent * donationShare);
  }, 0);

  // Active tasks are pledges that have donations for this user but aren't completed
  const activeTasks = donations.filter(d => 
    d.pledge.status !== 'COMPLETED'
  ).length;

  // Completed tasks
  const completedTasks = donations.filter(d => 
    d.pledge.status === 'COMPLETED'
  ).length;

  return {
    availableFunds,
    activeTasks,
    completedTasks,
    pendingRewards,
    totalEarned,
  };
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

    let stats;
    
    if (user.type === 'DONOR') {
      stats = await getDonorStats(user.id);
    } else {
      stats = await getDoneeStats(user.id);
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error('Error fetching pledge stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to fetch statistics'
        }
      },
      { status: 500 }
    );
  }
}