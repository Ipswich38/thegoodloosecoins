import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  console.log('🔍 AUTH/ME - Checking user authentication...');
  
  try {
    // Check for both Supabase cookies and direct session cookies
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;
    const appSession = request.cookies.get('app-session')?.value;
    const userId = request.cookies.get('user-id')?.value;

    console.log('🍪 Available cookies:', {
      hasSupabaseTokens: !!(accessToken && refreshToken),
      hasDirectSession: !!(appSession && userId),
      accessToken: accessToken ? '***' : null,
      refreshToken: refreshToken ? '***' : null,
      appSession: appSession ? '***' : null,
      userId: userId
    });

    // If we have direct session cookies, handle them
    if (appSession && userId && !accessToken) {
      console.log('🔄 Using direct session authentication...');
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            username: true,
            email: true,
            type: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (user) {
          console.log('✅ Direct session user found:', user.username, user.type);
          return NextResponse.json({
            success: true,
            user: {
              ...user,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
          });
        } else {
          console.log('❌ Direct session user not found in database');
        }
      } catch (dbError) {
        console.error('Database error checking direct session:', dbError);
        return NextResponse.json(
          { success: false, error: 'Database temporarily unavailable' },
          { status: 503 }
        );
      }
    }

    if (!accessToken) {
      console.log('❌ No authentication tokens found');
      return NextResponse.json(
        { success: false, error: 'No access token found' },
        { status: 401 }
      );
    }

    console.log('🔄 Using Supabase session authentication...');

    // Set the session in Supabase client
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    });

    if (sessionError || !sessionData.user) {
      // Try to refresh the token if we have one
      if (refreshToken) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (refreshError || !refreshData.user) {
          return NextResponse.json(
            { success: false, error: 'Session expired' },
            { status: 401 }
          );
        }

        // Update cookies with new tokens
        const response = await getUserResponse(refreshData.user.email);
        
        if (refreshData.session) {
          response.cookies.set('sb-access-token', refreshData.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: refreshData.session.expires_in || 3600,
            path: '/',
          });

          response.cookies.set('sb-refresh-token', refreshData.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 604800, // 7 days
            path: '/',
          });
        }

        return response;
      }

      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    return getUserResponse(sessionData.user.email);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getUserResponse(email: string | undefined) {
  if (!email) {
    return NextResponse.json(
      { success: false, error: 'No email found' },
      { status: 401 }
    );
  }

  // Get user data from our database with fallback
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
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
    console.error('Database error in /api/auth/me:', dbError);
    // If database is down, we can't get user data
    return NextResponse.json(
      { success: false, error: 'Database temporarily unavailable' },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  });
}