import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createSupabaseClient } from '@/lib/auth-server';
// Force this route to be dynamic
export const dynamic = 'force-dynamic';
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
      message: `Amount must be at least ₱${PLEDGE_VALIDATION.amount.min}`,
      field: 'amount'
    };
  }

  if (amount > PLEDGE_VALIDATION.amount.max) {
    return {
      code: 'INVALID_AMOUNT',
      message: `Amount cannot exceed ₱${PLEDGE_VALIDATION.amount.max}`,
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
    const user = await getCurrentUser(request);

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

    const supabase = await createSupabaseClient();

    // Create the pledge
    const { data: pledge, error: pledgeError } = await supabase
      .from('pledges')
      .insert({
        donor_id: user.id,
        amount,
        status: 'TASK1_COMPLETE', // Task 1 is automatically completed on creation
      })
      .select('*')
      .single();

    if (pledgeError || !pledge) {
      console.error('❌ Pledge creation error:', pledgeError);
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

    // Award points for pledge creation and task 1 completion
    const points = calculatePledgePoints(amount);
    
    // Update or create social impact points
    const { error: pointsError } = await supabase
      .from('social_impact_points')
      .upsert({
        user_id: user.id,
        points: points
      }, {
        onConflict: 'user_id'
      });

    if (pointsError) {
      console.error('⚠️ Points update error:', pointsError);
      // Don't fail pledge creation for points error
    }

    const response: PledgeResponse = {
      success: true,
      pledge: {
        id: pledge.id,
        donorId: pledge.donor_id,
        amount: pledge.amount,
        status: pledge.status,
        createdAt: pledge.created_at,
        updatedAt: pledge.updated_at,
        donor: {
          id: user.id,
          username: user.username,
          email: user.email,
        }
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
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseClient();

    // Get user's pledges
    const { data: pledges, error } = await supabase
      .from('pledges')
      .select('*')
      .eq('donor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
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

    const response: PledgesResponse = {
      success: true,
      pledges: pledges.map(pledge => ({
        id: pledge.id,
        donorId: pledge.donor_id,
        amount: pledge.amount,
        status: pledge.status,
        createdAt: pledge.created_at,
        updatedAt: pledge.updated_at,
        donor: {
          id: user.id,
          username: user.username,
          email: user.email,
        }
      })),
      total: pledges.length,
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