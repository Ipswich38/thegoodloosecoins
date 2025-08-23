import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('🔍 NEW CLEAN AUTH CHECK');
  
  try {
    const sessionToken = request.cookies.get('session-token')?.value;
    const userId = request.cookies.get('user-id')?.value;

    console.log('🍪 Cookies:', {
      hasSessionToken: !!sessionToken,
      userId: userId
    });

    if (!sessionToken || !userId) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      );
    }

    // Get user from database
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      console.log('✅ Auth check successful:', user.username, user.type);

      return NextResponse.json({
        success: true,
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      });
    } catch (dbError) {
      console.error('Database error in auth check:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database temporarily unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}