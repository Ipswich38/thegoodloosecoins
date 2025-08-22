import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { PledgeTask, PledgeWithTasks, POINTS_CONFIG } from '@/types/pledge';

async function getCurrentUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  return dbUser;
}

function generateTasksForPledge(pledge: any): PledgeTask[] {
  const tasks: PledgeTask[] = [
    {
      id: 1,
      title: "Create Pledge",
      description: "Create your pledge to help someone in need. This task is automatically completed when you create the pledge.",
      status: pledge.status === 'PENDING' ? 'in_progress' : 'completed',
      completedAt: pledge.status !== 'PENDING' ? pledge.createdAt : undefined,
      points: POINTS_CONFIG.TASK1_COMPLETION,
    },
    {
      id: 2,
      title: "Exchange Coins at Store",
      description: "Take your loose coins to a participating store or coin exchange machine. Upload a photo of your receipt or the exchange process as proof.",
      status: getTaskStatus(pledge.status, 'TASK2_COMPLETE'),
      completedAt: pledge.status === 'TASK2_COMPLETE' || pledge.status === 'COMPLETED' ? pledge.updatedAt : undefined,
      points: POINTS_CONFIG.TASK2_COMPLETION,
    },
    {
      id: 3,
      title: "Transfer Confirmation",
      description: "Confirm that you've transferred the exchanged amount to complete the donation process. Provide transfer confirmation or receipt.",
      status: getTaskStatus(pledge.status, 'COMPLETED'),
      completedAt: pledge.status === 'COMPLETED' ? pledge.updatedAt : undefined,
      points: POINTS_CONFIG.TASK3_COMPLETION,
    }
  ];

  return tasks;
}

function getTaskStatus(pledgeStatus: string, requiredStatus: string): 'pending' | 'in_progress' | 'completed' {
  if (pledgeStatus === requiredStatus) {
    return 'completed';
  }
  
  const statusOrder = ['PENDING', 'TASK1_COMPLETE', 'TASK2_COMPLETE', 'COMPLETED'];
  const currentIndex = statusOrder.indexOf(pledgeStatus);
  const requiredIndex = statusOrder.indexOf(requiredStatus);
  
  if (currentIndex === -1 || requiredIndex === -1) {
    return 'pending';
  }
  
  if (currentIndex === requiredIndex - 1) {
    return 'in_progress';
  }
  
  return currentIndex > requiredIndex ? 'completed' : 'pending';
}

function calculatePoints(pledge: any): { totalPoints: number, earnedPoints: number } {
  const basePoints = POINTS_CONFIG.PLEDGE_CREATION;
  
  // Calculate total possible points
  let totalPoints = basePoints + POINTS_CONFIG.TASK1_COMPLETION + POINTS_CONFIG.TASK2_COMPLETION + POINTS_CONFIG.TASK3_COMPLETION;
  
  // Add bonus points based on amount
  for (const [_, threshold] of Object.entries(POINTS_CONFIG.BONUS_THRESHOLDS)) {
    if (pledge.amount >= threshold.min && pledge.amount <= threshold.max) {
      totalPoints += threshold.bonus;
      break;
    }
  }
  
  // Calculate earned points based on current status
  let earnedPoints = basePoints; // Always get base points for creating
  
  if (pledge.status !== 'PENDING') {
    earnedPoints += POINTS_CONFIG.TASK1_COMPLETION;
  }
  if (pledge.status === 'TASK2_COMPLETE' || pledge.status === 'COMPLETED') {
    earnedPoints += POINTS_CONFIG.TASK2_COMPLETION;
  }
  if (pledge.status === 'COMPLETED') {
    earnedPoints += POINTS_CONFIG.TASK3_COMPLETION;
  }
  
  // Add bonus points if any tasks are completed
  if (pledge.status !== 'PENDING') {
    for (const [_, threshold] of Object.entries(POINTS_CONFIG.BONUS_THRESHOLDS)) {
      if (pledge.amount >= threshold.min && pledge.amount <= threshold.max) {
        earnedPoints += threshold.bonus;
        break;
      }
    }
  }
  
  return { totalPoints, earnedPoints };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const pledgeId = id;

    const pledge = await prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: {
        donor: {
          select: { id: true, username: true, email: true }
        },
        donations: {
          include: {
            beneficiary: {
              select: { id: true, username: true, email: true }
            }
          }
        }
      }
    });

    if (!pledge) {
      return NextResponse.json(
        { success: false, error: { code: 'PLEDGE_NOT_FOUND', message: 'Pledge not found' } },
        { status: 404 }
      );
    }

    // Check authorization - donors can see their own pledges, donees can see pledges with donations for them
    const canView = pledge.donorId === user.id || 
                   (user.type === 'DONEE' && pledge.donations?.some(d => d.beneficiaryId === user.id));

    if (!canView) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'You do not have permission to view this pledge' } },
        { status: 403 }
      );
    }

    // Generate tasks for the pledge
    const tasks = generateTasksForPledge(pledge);
    const { totalPoints, earnedPoints } = calculatePoints(pledge);

    const response: { success: boolean; data: PledgeWithTasks } = {
      success: true,
      data: {
        ...pledge,
        createdAt: pledge.createdAt.toISOString(),
        updatedAt: pledge.updatedAt.toISOString(),
        donations: pledge.donations?.map(donation => ({
          ...donation,
          createdAt: donation.createdAt.toISOString(),
          updatedAt: donation.updatedAt.toISOString(),
        })),
        tasks,
        totalPoints,
        earnedPoints,
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching pledge tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to fetch pledge tasks'
        }
      },
      { status: 500 }
    );
  }
}