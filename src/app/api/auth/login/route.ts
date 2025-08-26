import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('🔐 Login attempt with simplified auth:', { username });

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Convert username to temporary email format for Supabase Auth
    const tempEmail = `${username}@temp.thegoodloosecoins.app`;

    // Sign in with Supabase Auth using temp email
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: tempEmail,
      password,
    });

    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !userProfile) {
      console.error('❌ Profile fetch error:', profileError);
      // Create profile if it doesn't exist
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username: authData.user.user_metadata?.username || authData.user.email?.split('@')[0] || 'User',
          email: authData.user.email,
          type: authData.user.user_metadata?.user_type || 'DONOR',
        });

      if (createError) {
        console.error('❌ Profile creation error:', createError);
      }

      // Retry fetching profile
      const { data: retryProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!retryProfile) {
        return NextResponse.json(
          { success: false, error: 'Failed to load user profile' },
          { status: 500 }
        );
      }
    }

    console.log('✅ Login successful for username:', username);

    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: authData.user.id,
        username: userProfile?.username || authData.user.user_metadata?.username,
        email: authData.user.email,
        type: userProfile?.type || authData.user.user_metadata?.user_type || 'DONOR',
      },
    });

    // Set auth cookies for session management
    response.cookies.set('supabase-auth-token', authData.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(authData.session.expires_at! * 1000),
      path: '/',
    });

    response.cookies.set('supabase-refresh-token', authData.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('🚨 Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}