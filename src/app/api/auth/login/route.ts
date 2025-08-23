import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash, randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

function hashPassword(password: string, salt: string): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

export async function POST(request: NextRequest) {
  console.log('🔐 NEW CLEAN LOGIN ROUTE');
  
  try {
    const { email, password } = await request.json();

    console.log('📋 Login request:', { email, passwordLength: password?.length });

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/username and password are required' },
        { status: 400 }
      );
    }

    // Find user by email or username
    const isEmail = email.includes('@');
    
    try {
      const user = await prisma.user.findFirst({
        where: isEmail 
          ? { email: email }
          : { username: email },
        select: {
          id: true,
          username: true,
          email: true,
          type: true,
          passwordHash: true,
          salt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        console.log('❌ User not found:', email);
        return NextResponse.json(
          { success: false, error: 'Invalid email/username or password' },
          { status: 401 }
        );
      }

      // Verify password
      const hashedPassword = hashPassword(password, user.salt);
      if (hashedPassword !== user.passwordHash) {
        console.log('❌ Invalid password for user:', email);
        return NextResponse.json(
          { success: false, error: 'Invalid email/username or password' },
          { status: 401 }
        );
      }

      console.log('✅ Login successful:', user.username, user.type);

      // Create session
      const sessionToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          type: user.type,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
        message: 'Login successful',
      });

      // Set session cookies
      response.cookies.set('session-token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });

      response.cookies.set('user-id', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt,
        path: '/',
      });

      return response;
    } catch (dbError) {
      console.error('Database error during login:', dbError);
      return NextResponse.json(
        { success: false, error: 'Authentication service temporarily unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}