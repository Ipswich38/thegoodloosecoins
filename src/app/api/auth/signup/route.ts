import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, email, type } = await request.json();

    console.log('Signup attempt:', { username, email, type });

    // Validate required fields
    if (!username || !email || !type) {
      return NextResponse.json(
        { success: false, error: 'Username, email, and account type are required' },
        { status: 400 }
      );
    }

    // Validate account type
    if (!['DONOR', 'DONEE'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Account type must be either DONOR or DONEE' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Test database connection first
    console.log('Testing database connection...');
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });
    
    console.log('Database query successful. Existing user check completed.');

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return NextResponse.json(
        { success: false, error: `${field} already exists. Please choose a different one.` },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        type: type as 'DONOR' | 'DONEE'
      },
      select: {
        id: true,
        username: true,
        email: true,
        type: true,
        createdAt: true
      }
    });

    console.log('User created successfully:', newUser.id);

    // Create session cookie
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        type: newUser.type,
        createdAt: newUser.createdAt.toISOString()
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

    response.cookies.set('user-id', newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Signup error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      error: error
    });
    
    // Handle specific database connection errors
    if (error instanceof Error) {
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        return NextResponse.json(
          { success: false, error: 'Database connection failed. Please try again.', details: error.message },
          { status: 503 }
        );
      }
      
      if (error.message.includes('unique constraint')) {
        return NextResponse.json(
          { success: false, error: 'Username or email already exists.' },
          { status: 409 }
        );
      }
      
      // Return the actual error message for debugging
      return NextResponse.json(
        { success: false, error: 'Account creation failed. Please try again.', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Account creation failed. Please try again.', details: 'Unknown error type' },
      { status: 500 }
    );
  }
}