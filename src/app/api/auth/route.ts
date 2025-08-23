import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { LoginRequest } from '@/types/auth';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// POST /api/auth - Login
export async function POST(request: NextRequest) {
  console.log('🔐 LOGIN ROUTE - Processing login request...');
  
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    console.log('📋 Login attempt details:', {
      email: email,
      isEmail: email?.includes('@'),
      passwordLength: password?.length
    });

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email/username and password are required' },
        { status: 400 }
      );
    }

    // Determine if input is email or username
    const isEmail = email.includes('@');
    let actualEmail = email;
    let userRecord = null;

    // If username is provided, find the corresponding email
    if (!isEmail) {
      console.log('🔍 Looking up username:', email);
      try {
        userRecord = await prisma.user.findUnique({
          where: { username: email },
          select: { 
            id: true,
            email: true, 
            username: true, 
            type: true,
            createdAt: true,
            updatedAt: true 
          },
        });

        if (!userRecord || !userRecord.email) {
          console.log('❌ Username not found:', email);
          return NextResponse.json(
            { success: false, error: 'Invalid username or password' },
            { status: 401 }
          );
        }

        actualEmail = userRecord.email;
        console.log('✅ Username found, email:', actualEmail);
      } catch (dbError) {
        console.error('Database error during username lookup:', dbError);
        return NextResponse.json(
          { success: false, error: 'Authentication service temporarily unavailable' },
          { status: 503 }
        );
      }
    } else {
      // For email login, also get user record from database
      console.log('🔍 Looking up email:', email);
      try {
        userRecord = await prisma.user.findUnique({
          where: { email: actualEmail },
          select: { 
            id: true,
            email: true, 
            username: true, 
            type: true,
            createdAt: true,
            updatedAt: true 
          },
        });
        
        if (userRecord) {
          console.log('✅ Email found in database:', userRecord.username, userRecord.type);
        } else {
          console.log('⚠️ Email not found in database, will try Supabase auth');
        }
      } catch (dbError) {
        console.error('Database error during email lookup:', dbError);
        // Continue with Supabase auth attempt
      }
    }

    console.log('🔑 Attempting Supabase authentication...');
    
    // Authenticate with Supabase using the email
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: actualEmail,
      password,
    });

    if (authError) {
      console.log('❌ Supabase auth failed:', authError.message);
      
      // If Supabase auth fails but we have a user record (from direct signup), 
      // we need to handle direct auth differently
      if (userRecord) {
        console.log('⚠️ Supabase auth failed but user exists in DB - this is likely a direct signup user');
        console.log('🚧 Direct password verification not yet implemented');
        // TODO: Implement password verification for direct signup users
        // For now, return the Supabase error
      }
      
      return NextResponse.json(
        { success: false, error: isEmail ? authError.message : 'Invalid username or password' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      console.log('❌ No user data from Supabase');
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    console.log('✅ Supabase authentication successful');

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