import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { 
  CreatePledgeRequest, 
  PledgeResponse, 
  PledgesResponse, 
  PledgeFilters,
  PaginationParams,
  PLEDGE_VALIDATION,
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

function validatePledgeAmount(amount: number): PledgeError | null {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return {
      code: 'INVALID_AMOUNT',
      message: 'Amount must be a valid number',
      field: 'amount'
    };
  }

  if (amount < PLEDGE_VALIDATION.amount.min) {
    return {
      code: 'INVALID_AMOUNT',
      message: `Amount must be at least $${PLEDGE_VALIDATION.amount.min}`,
      field: 'amount'
    };
  }

  if (amount > PLEDGE_VALIDATION.amount.max) {
    return {
      code: 'INVALID_AMOUNT',
      message: `Amount cannot exceed $${PLEDGE_VALIDATION.amount.max}`,
      field: 'amount'
    };
  }

  // Check if amount is a valid coin increment (multiples of 0.01)
  if (Math.round(amount * 100) / 100 !== amount) {
    return {
      code: 'INVALID_AMOUNT',
      message: 'Amount must be in valid currency format (cents)',
      field: 'amount'
    };
  }

  return null;
}

function calculatePledgePoints(amount: number): number {
  let points = POINTS_CONFIG.PLEDGE_CREATION + POINTS_CONFIG.TASK1_COMPLETION;

  // Add bonus points based on amount
  for (const [_, threshold] of Object.entries(POINTS_CONFIG.BONUS_THRESHOLDS)) {
    if (amount >= threshold.min && amount <= threshold.max) {
      points += threshold.bonus;
      break;
    }
  }

  return points;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    if (user.type !== 'DONOR') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Only donors can create pledges' } },
        { status: 403 }
      );
    }

    const body: CreatePledgeRequest = await request.json();
    const { amount } = body;

    // Validate amount
    const amountError = validatePledgeAmount(amount);
    if (amountError) {
      return NextResponse.json(
        { success: false, error: amountError },
        { status: 400 }
      );
    }

    // Create pledge in database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the pledge
      const pledge = await tx.pledge.create({
        data: {
          donorId: user.id,
          amount,
          status: 'TASK1_COMPLETE', // Task 1 is automatically completed on creation
        },
        include: {
          donor: {
            select: {
              id: true,
              username: true,
              email: true,
            }
          }
        }
      });

      // Award points for pledge creation and task 1 completion
      const points = calculatePledgePoints(amount);
      
      // Update or create social impact points
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

      return pledge;
    });

    const response: PledgeResponse = {
      success: true,
      pledge: {
        ...result,
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      },
      message: 'Pledge created successfully'
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating pledge:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to create pledge'
        }
      },
      { status: 500 }
    );
  }
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
    
    // Parse filters
    const filters: PledgeFilters = {
      status: searchParams.get('status') as any,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
      maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
    };

    // Parse pagination
    const pagination: PaginationParams = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };

    // Build where clause
    const where: any = {};

    if (user.type === 'DONOR') {
      where.donorId = user.id;
    } else {
      // For donees, show pledges where donations exist for them or could be created
      // This is more complex and might need adjustment based on business logic
      where.status = { in: ['TASK2_COMPLETE', 'COMPLETED'] };
    }

    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }
    if (filters.minAmount || filters.maxAmount) {
      where.amount = {};
      if (filters.minAmount) where.amount.gte = filters.minAmount;
      if (filters.maxAmount) where.amount.lte = filters.maxAmount;
    }

    // Calculate skip for pagination
    const skip = (pagination.page! - 1) * pagination.limit!;

    // Build orderBy
    const orderBy = {
      [pagination.sortBy!]: pagination.sortOrder
    };

    // Get pledges with total count
    const [pledges, total] = await Promise.all([
      prisma.pledge.findMany({
        where,
        include: {
          donor: {
            select: {
              id: true,
              username: true,
              email: true,
            }
          },
          donations: {
            include: {
              beneficiary: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: pagination.limit,
      }),
      prisma.pledge.count({ where })
    ]);

    const response: PledgesResponse = {
      success: true,
      pledges: pledges.map(pledge => ({
        ...pledge,
        createdAt: pledge.createdAt.toISOString(),
        updatedAt: pledge.updatedAt.toISOString(),
        donations: pledge.donations?.map(donation => ({
          ...donation,
          createdAt: donation.createdAt.toISOString(),
          updatedAt: donation.updatedAt.toISOString(),
        }))
      })),
      total,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching pledges:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Failed to fetch pledges'
        }
      },
      { status: 500 }
    );
  }
}