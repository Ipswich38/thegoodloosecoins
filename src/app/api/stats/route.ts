import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    // Get total users count (both donors and donees)
    const totalUsers = await prisma.user.count();
    
    // Get total donors count
    const totalDonors = await prisma.user.count({
      where: { type: 'DONOR' }
    });
    
    // Get total donees count
    const totalDonees = await prisma.user.count({
      where: { type: 'DONEE' }
    });
    
    // Get total pledges made
    const totalPledges = await prisma.pledge.count();
    
    // Get total amount pledged
    const pledgeAmountResult = await prisma.pledge.aggregate({
      _sum: { amount: true }
    });
    const totalAmountPledged = pledgeAmountResult._sum.amount || 0;
    
    // Get total amount actually sent to recipients
    const amountSentResult = await prisma.pledge.aggregate({
      _sum: { amountSent: true }
    });
    const totalAmountSent = amountSentResult._sum.amountSent || 0;
    
    // Get total completed pledges
    const completedPledges = await prisma.pledge.count({
      where: { status: 'COMPLETED' }
    });
    
    // Get active donors (those with at least one pledge)
    const activeDonors = await prisma.pledge.groupBy({
      by: ['donorId']
    });
    const activeDonorsCount = activeDonors.length;
    
    // Get people helped (unique beneficiaries who received donations)
    const peopleHelped = await prisma.donation.groupBy({
      by: ['beneficiaryId']
    });
    const peopleHelpedCount = peopleHelped.length;
    
    // Get total impact points earned across all users
    const impactPointsResult = await prisma.socialImpactPoint.aggregate({
      _sum: { points: true }
    });
    const totalImpactPoints = impactPointsResult._sum.points || 0;
    
    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalDonors,
        totalDonees,
        totalPledges,
        totalAmountPledged,
        totalAmountSent,
        completedPledges,
        activeDonorsCount,
        peopleHelpedCount,
        totalImpactPoints,
        // Additional calculated metrics
        averagePledgeAmount: totalPledges > 0 ? totalAmountPledged / totalPledges : 0,
        completionRate: totalPledges > 0 ? (completedPledges / totalPledges) * 100 : 0,
        coinsBackInCirculation: totalAmountSent // Amount actually transferred
      }
    });
    
  } catch (error) {
    console.error('Error fetching global statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch statistics'
        }
      },
      { status: 500 }
    );
  }
}