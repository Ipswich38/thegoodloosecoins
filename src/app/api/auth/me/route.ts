import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

// GET /api/auth/me - Get current user
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'No access token found' },
        { status: 401 }
      );
    }

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

  // Get user data from our database
  const user = await prisma.user.findUnique({
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