import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash, randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

function generateUserId(): string {
  return 'user_' + randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  console.log('🚀 NEW CLEAN SIGNUP ROUTE');
  
  try {
    const { username, email, password, type } = await request.json();

    console.log('📋 Signup request:', { username, email, type, passwordLength: password?.length });

    // Validate input
    if (!username || !email || !password || !type) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['DONOR', 'DONEE'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user type' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
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

    // Create user
    const userId = generateUserId();
    const salt = randomBytes(32).toString('hex');
    const hashedPassword = hashPassword(password, salt);

    try {
      const user = await prisma.user.create({
        data: {
          id: userId,
          username,
          email,
          type: type as 'DONOR' | 'DONEE',
          passwordHash: hashedPassword,
          salt: salt,
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
        message: 'Account created successfully!',
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