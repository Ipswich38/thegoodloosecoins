import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Simple access codes for each user (in production, these would be in the database)
const ACCESS_CODES: Record<string, string> = {
  'testdonor': '123456',
  'testdonee': '654321', 
  'admin': '999999'
};

export async function POST(request: NextRequest) {
  try {
    const { username, passcode } = await request.json();

    console.log('Login attempt:', { username, passcode: passcode ? '***' : 'missing' });

    // Validate input
    if (!username || !passcode) {
      return NextResponse.json(
        { success: false, error: 'Username and passcode are required' },
        { status: 400 }
      );
    }

    // Validate passcode format (6 digits)
    if (!/^\d{6}$/.test(passcode)) {
      return NextResponse.json(
        { success: false, error: 'Passcode must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Check access code
    const lowerUsername = username.toLowerCase();
    const expectedPasscode = ACCESS_CODES[lowerUsername];
    
    if (!expectedPasscode || expectedPasscode !== passcode) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or access code' },
        { status: 401 }
      );
    }

    // Find user in database
    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        type: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 401 }
      );
    }

    console.log('Login successful for:', user.username);

    // Create session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        type: user.type
      }
    });

    // Set authentication cookies
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });

    response.cookies.set('user-id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });

    response.cookies.set('user-type', user.type, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific database connection errors
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        return NextResponse.json(
          { success: false, error: 'Database connection failed. Please try again.' },
          { status: 503 }
        );
      }
      
      // Log the specific error for debugging
      console.error('Detailed login error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      return NextResponse.json(
        { success: false, error: `Login failed: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}