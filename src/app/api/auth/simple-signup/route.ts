import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { SignupRequest } from '@/types/auth';

export const dynamic = 'force-dynamic';

// Simple signup route that bypasses OTP issues
export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    const { username, email, password, type } = body;

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

    // Check for duplicate username/email in database first
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
      console.warn('Database check failed, proceeding:', dbError);
    }

    // Create user in Supabase without email confirmation requirement
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          user_type: type,
        },
        // Try to disable email confirmation
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      console.error('Supabase signup error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user in our database
    let user;
    try {
      user = await prisma.user.create({
        data: {
          id: data.user.id,
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
    } catch (dbError) {
      console.error('Database creation error:', dbError);
      // Create fallback user object
      user = {
        id: data.user.id,
        username,
        email,
        type: type as 'DONOR' | 'DONEE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const response = NextResponse.json({
      success: true,
      user: {
        ...user,
        createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updatedAt: user.updatedAt instanceof Date ? user.updatedAt.toISOString() : user.updatedAt,
      },
      message: data.session 
        ? 'Account created and logged in successfully' 
        : 'Account created successfully',
    });

    // Set session cookies if available
    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.session.expires_in || 3600,
        path: '/',
      });

      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Simple signup error:', error);
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