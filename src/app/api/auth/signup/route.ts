import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { SignupRequest } from '@/types/auth';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

interface OAuthSignupRequest {
  username: string;
  email: string;
  type: 'DONOR' | 'DONEE';
  oauth: boolean;
}

// POST /api/auth/signup - Register new user
export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest | OAuthSignupRequest = await request.json();
    const { username, email, type } = body;
    const isOAuth = 'oauth' in body && body.oauth;
    const password = 'password' in body ? body.password : undefined;

    // Validate input
    if (!username || !email || !type) {
      return NextResponse.json(
        { success: false, error: 'Username, email, and account type are required' },
        { status: 400 }
      );
    }

    if (!isOAuth && !password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!['DONOR', 'DONEE'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user type' },
        { status: 400 }
      );
    }

    if (!isOAuth && password && password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if username is already taken
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'Username is already taken' },
        { status: 409 }
      );
    }

    // Check if email is already registered
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email is already registered' },
        { status: 409 }
      );
    }

    let authData;
    let userId;

    if (isOAuth) {
      // Handle OAuth flow - get user ID from OAuth token
      const oauthToken = request.cookies.get('sb-oauth-token')?.value;
      if (!oauthToken) {
        return NextResponse.json(
          { success: false, error: 'OAuth session expired' },
          { status: 401 }
        );
      }

      // Set the session to get user info
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: oauthToken,
        refresh_token: '',
      });

      if (sessionError || !sessionData.user) {
        return NextResponse.json(
          { success: false, error: 'Invalid OAuth session' },
          { status: 401 }
        );
      }

      authData = sessionData;
      userId = sessionData.user.id;
    } else {
      // Create user in Supabase Auth for email/password
      const signUpResult = await supabase.auth.signUp({
        email,
        password: password!,
        options: {
          data: {
            username,
            user_type: type,
          },
        },
      });

      if (signUpResult.error) {
        return NextResponse.json(
          { success: false, error: signUpResult.error.message },
          { status: 400 }
        );
      }

      if (!signUpResult.data.user) {
        return NextResponse.json(
          { success: false, error: 'Failed to create user' },
          { status: 500 }
        );
      }

      authData = signUpResult.data;
      userId = signUpResult.data.user.id;
    }

    // Create user in our database
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

    // Handle session creation
    const response = NextResponse.json({
      success: true,
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      message: authData.session 
        ? 'Account created and logged in successfully'
        : 'Account created successfully. Please check your email to confirm your account.',
    });

    // Set session cookies if available
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

    // Clear OAuth token if it was an OAuth flow
    if (isOAuth) {
      response.cookies.delete('sb-oauth-token');
    }

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    
    // If there was an error creating the database user but Supabase user was created,
    // we should clean up the Supabase user (this would require admin privileges)
    
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