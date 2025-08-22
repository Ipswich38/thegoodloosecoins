import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

// GET /api/auth/callback - Handle OAuth callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=No+authorization+code+received', request.url)
    );
  }

  try {
    // Exchange the code for a session
    const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError || !sessionData.user) {
      console.error('Session exchange error:', sessionError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(sessionError?.message || 'Failed to create session')}`, request.url)
      );
    }

    const user = sessionData.user;
    const email = user.email;
    const username = user.user_metadata?.full_name || user.user_metadata?.name || email?.split('@')[0];

    if (!email) {
      return NextResponse.redirect(
        new URL('/login?error=No+email+found+in+OAuth+response', request.url)
      );
    }

    // Check if user already exists in our database
    let dbUser = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, we need to create them
    // For OAuth users, we'll redirect them to complete their profile
    if (!dbUser) {
      // Store OAuth user data temporarily in a secure way
      // For simplicity, we'll redirect to signup with pre-filled data
      const signupUrl = new URL('/signup', request.url);
      signupUrl.searchParams.set('oauth', 'true');
      signupUrl.searchParams.set('email', email);
      signupUrl.searchParams.set('username', username || '');
      
      const response = NextResponse.redirect(signupUrl);
      
      // Set a temporary OAuth session cookie
      if (sessionData.session) {
        response.cookies.set('sb-oauth-token', sessionData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 300, // 5 minutes
          path: '/',
        });
      }
      
      return response;
    }

    // User exists, create the session
    const response = NextResponse.redirect(new URL('/dashboard/' + dbUser.type.toLowerCase(), request.url));

    if (sessionData.session) {
      response.cookies.set('sb-access-token', sessionData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: sessionData.session.expires_in || 3600,
        path: '/',
      });

      response.cookies.set('sb-refresh-token', sessionData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=Authentication+failed', request.url)
    );
  }
}