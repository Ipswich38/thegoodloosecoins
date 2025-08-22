import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { 
  UpdatePledgeRequest, 
  PledgeResponse,
  STATUS_TRANSITIONS,
  POINTS_CONFIG,
  PledgeError 
} from '@/types/pledge';

async function getCurrentUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  return dbUser;
}

function validateStatusTransition(currentStatus: string, newStatus: string): PledgeError | null {
  const validTransitions = STATUS_TRANSITIONS[currentStatus as keyof typeof STATUS_TRANSITIONS];
  
  if (!validTransitions.includes(newStatus as any)) {
    return {
      code: 'INVALID_STATUS_TRANSITION',
      message: `Cannot transition from ${currentStatus} to ${newStatus}`,
      field: 'status'
    };
  }

  return null;
}

function calculateTaskPoints(newStatus: string): number {
  switch (newStatus) {
    case 'TASK1_COMPLETE':
      return POINTS_CONFIG.TASK1_COMPLETION;
    case 'TASK2_COMPLETE':
      return POINTS_CONFIG.TASK2_COMPLETION;
    case 'COMPLETED':
      return POINTS_CONFIG.TASK3_COMPLETION;
    default:
      return 0;
  }
}

export async function PATCH(
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
    const body: UpdatePledgeRequest = await request.json();
    const { status: newStatus, taskEvidence } = body;

    // Get the current pledge
    const currentPledge = await prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: {
        donor: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    if (!currentPledge) {
      return NextResponse.json(
        { success: false, error: { code: 'PLEDGE_NOT_FOUND', message: 'Pledge not found' } },
        { status: 404 }
      );
    }

    // Check authorization - only the donor can update their pledge
    if (currentPledge.donorId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'You can only update your own pledges' } },
        { status: 403 }
      );
    }

    // Validate status transition
    const transitionError = validateStatusTransition(currentPledge.status, newStatus);
    if (transitionError) {
      return NextResponse.json(
        { success: false, error: transitionError },
        { status: 400 }
      );
    }

    // Check if evidence is required for certain transitions
    if ((newStatus === 'TASK2_COMPLETE' || newStatus === 'COMPLETED') && !taskEvidence?.description) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'EVIDENCE_REQUIRED', 
            message: 'Task evidence is required for this status update',
            field: 'taskEvidence'
          } 
        },
        { status: 400 }
      );
    }

    // Update pledge and award points in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the pledge
      const updatedPledge = await tx.pledge.update({
        where: { id: pledgeId },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
        include: {
          donor: {
            select: { id: true, username: true, email: true }
          }
        }
      });

      // Award points for task completion
      const points = calculateTaskPoints(newStatus);
      if (points > 0) {
        await tx.socialImpactPoint.upsert({
          where: { userId: user.id },
          update: {
            points: {
              increment: points
            }
          },
          create: {
            userId: user.id,
            points
          }
        });
      }

      // If the pledge is completed, create donation record for available beneficiaries
      // This is a simplified version - in a real app, you might have a more complex matching system
      if (newStatus === 'COMPLETED') {
        // Find a beneficiary (for now, just get any DONEE user)
        // In a real system, you might have a more sophisticated matching algorithm
        const beneficiary = await tx.user.findFirst({
          where: { type: 'DONEE' },
          orderBy: { createdAt: 'asc' }
        });

        if (beneficiary) {
          await tx.donation.create({
            data: {
              pledgeId: pledgeId,
              beneficiaryId: beneficiary.id,
              amount: currentPledge.amount,
            }
          });
        }
      }

      return updatedPledge;
    });

    const response: PledgeResponse = {
      success: true,
      pledge: {
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
      message: 'Pledge updated successfully'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error updating pledge:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to update pledge'
        }
      },
      { status: 500 }
    );
  }
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

    const response: PledgeResponse = {
      success: true,
      pledge: {
        ...pledge,
        createdAt: pledge.createdAt.toISOString(),
        updatedAt: pledge.updatedAt.toISOString(),
        donations: pledge.donations?.map(donation => ({
          ...donation,
          createdAt: donation.createdAt.toISOString(),
          updatedAt: donation.updatedAt.toISOString(),
        }))
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching pledge:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to fetch pledge'
        }
      },
      { status: 500 }
    );
  }
}