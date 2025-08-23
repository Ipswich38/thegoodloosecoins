import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

function generateUserId(): string {
  return 'user_' + randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  console.log('🚀 ULTRA-SIMPLE SIGNUP ROUTE - NO PASSWORDS');
  
  try {
    const { username, email, password, type } = await request.json();

    console.log('📋 Signup request:', { username, email, type });

    // Validate input
    if (!username || !email || !type) {
      return NextResponse.json(
        { success: false, error: 'Username, email, and account type are required' },
        { status: 400 }
      );
    }

    if (!['DONOR', 'DONEE'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Check for existing users
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Username';
        return NextResponse.json(
          { success: false, error: `${field} is already taken` },
          { status: 409 }
        );
      }
    } catch (dbError) {
      console.error('Database check failed:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database connection error' },
        { status: 503 }
      );
    }

    // Create user (no password validation for now)
    const userId = generateUserId();

    try {
      const user = await prisma.user.create({
        data: {
          id: userId,
          username,
          email,
          type: type as 'DONOR' | 'DONEE',
        },
        select: {
          id: true,
          username: true,
          email: true,
          type: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log('✅ User created successfully:', userId, type);

      // Create session
      const sessionToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const response = NextResponse.json({
        success: true,
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        message: 'Account created successfully! (Password validation temporarily disabled)',
      });

      // Set session cookies
      response.cookies.set('session-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });

      response.cookies.set('user-id', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });

      return response;
    } catch (dbError) {
      console.error('❌ Database creation error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to create account' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}