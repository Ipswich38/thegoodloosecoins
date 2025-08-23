import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { LoginRequest } from '@/types/auth';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// POST /api/auth - Login
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/username and password are required' },
        { status: 400 }
      );
    }

    // Determine if input is email or username
    const isEmail = email.includes('@');
    let actualEmail = email;

    // If username is provided, find the corresponding email
    if (!isEmail) {
      try {
        const userRecord = await prisma.user.findUnique({
          where: { username: email },
          select: { email: true },
        });

        if (!userRecord || !userRecord.email) {
          return NextResponse.json(
            { success: false, error: 'Invalid username or password' },
            { status: 401 }
          );
        }

        actualEmail = userRecord.email;
      } catch (dbError) {
        console.error('Database error during username lookup:', dbError);
        return NextResponse.json(
          { success: false, error: 'Authentication service temporarily unavailable' },
          { status: 503 }
        );
      }
    }

    // Authenticate with Supabase using the email
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: actualEmail,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { success: false, error: isEmail ? authError.message : 'Invalid username or password' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get user data from our database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: actualEmail },
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
        // Create fallback user object if database is unavailable
        user = {
          id: authData.user.id,
          username: authData.user.user_metadata?.username || 'user',
          email: actualEmail,
          type: (authData.user.user_metadata?.user_type || 'DONOR') as 'DONOR' | 'DONEE',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    } catch (dbError) {
      console.error('Database error during user lookup:', dbError);
      // Create fallback user object
      user = {
        id: authData.user.id,
        username: authData.user.user_metadata?.username || 'user',
        email: actualEmail,
        type: (authData.user.user_metadata?.user_type || 'DONOR') as 'DONOR' | 'DONEE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      message: 'Login successful',
    });

    // Set session cookie
    if (authData.session) {
      response.cookies.set('sb-access-token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: authData.session.expires_in || 3600,
        path: '/',
      });

      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/auth - Logout
export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (accessToken) {
      // Create a Supabase client with the session token
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}