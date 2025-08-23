import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SignupRequest } from '@/types/auth';
import { createHash, randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

// Hash password with salt
function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

// Generate random user ID
function generateUserId(): string {
  return 'user_' + randomBytes(16).toString('hex');
}

// Direct signup bypassing Supabase Auth entirely
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 DIRECT SIGNUP ROUTE CALLED');
    const body: SignupRequest = await request.json();
    const { username, email, password, type } = body;

    console.log('🎯 Direct signup attempt for:', email, 'type:', type);

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

    // Check for duplicate username/email in database
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email },
          ],
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

    // Generate user ID and password hash
    const userId = generateUserId();
    const salt = randomBytes(32).toString('hex');
    const hashedPassword = hashPassword(password, salt);

    // Create user directly in our database
    let user;
    try {
      user = await prisma.user.create({
        data: {
          id: userId,
          username,
          email,
          type: type as 'DONOR' | 'DONEE',
          // Store password hash and salt in metadata for now
          // In production, you'd want a separate passwords table
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

      console.log('✅ User created successfully in database:', userId, 'type:', user.type);
    } catch (dbError) {
      console.error('❌ Database creation error:', dbError);
      return NextResponse.json(
        { success: false, error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Create a simple session token
    const sessionToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const responseData = {
      success: true,
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      message: 'Account created successfully! Welcome to The Good Loose Coins.',
      // Explicitly prevent OTP redirect
      requiresOTP: false,
    };

    console.log('🎉 Direct signup SUCCESS - returning:', {
      success: responseData.success,
      userType: responseData.user.type,
      requiresOTP: responseData.requiresOTP,
    });

    const response = NextResponse.json(responseData);

    // Set simple session cookie
    response.cookies.set('app-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    // Store user ID in cookie for quick access
    response.cookies.set('user-id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Direct signup error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}