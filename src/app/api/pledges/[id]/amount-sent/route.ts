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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const body = await request.json();
    const { amountSent } = body;
    const pledgeId = params.id;

    // Validate amount
    if (typeof amountSent !== 'number' || amountSent <= 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid amount' } },
        { status: 400 }
      );
    }

    // Find and verify the pledge belongs to the current user
    const pledge = await prisma.pledge.findUnique({
      where: { id: pledgeId },
      include: { donor: true }
    });

    if (!pledge) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Pledge not found' } },
        { status: 404 }
      );
    }

    if (pledge.donorId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } },
        { status: 403 }
      );
    }

    // Calculate new totals
    const currentAmountSent = pledge.amountSent || 0;
    const newTotalAmountSent = currentAmountSent + amountSent;
    
    // Ensure we don't exceed the pledge amount
    if (newTotalAmountSent > pledge.amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: `Total amount sent cannot exceed pledge amount ($${pledge.amount.toFixed(2)})` 
          } 
        },
        { status: 400 }
      );
    }

    // Calculate completion percentage
    const completionPercentage = (newTotalAmountSent / pledge.amount) * 100;
    
    // Determine new status based on completion
    let newStatus = pledge.status;
    if (completionPercentage >= 100) {
      newStatus = 'COMPLETED';
    }

    // Update the pledge
    const updatedPledge = await prisma.pledge.update({
      where: { id: pledgeId },
      data: {
        amountSent: newTotalAmountSent,
        completionPercentage: completionPercentage,
        status: newStatus
      },
      include: {
        donor: true,
        donations: {
          include: {
            beneficiary: true
          }
        }
      }
    });

    // If pledge is now completed, award impact points
    if (newStatus === 'COMPLETED' && pledge.status !== 'COMPLETED') {
      // Calculate points based on amount (e.g., 10 points per dollar)
      const pointsToAward = Math.floor(pledge.amount * 10);
      
      // Update or create social impact points record
      await prisma.socialImpactPoint.upsert({
        where: { userId: user.id },
        update: {
          points: {
            increment: pointsToAward
          }
        },
        create: {
          userId: user.id,
          points: pointsToAward
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        pledge: updatedPledge,
        amountAdded: amountSent,
        newTotalAmountSent: newTotalAmountSent,
        completionPercentage: completionPercentage,
        statusChanged: newStatus !== pledge.status,
        newStatus: newStatus
      }
    });

  } catch (error) {
    console.error('Error updating amount sent:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update amount sent'
        }
      },
      { status: 500 }
    );
  }
}