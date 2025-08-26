import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔐 Login attempt with email auth:', { email });

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Sign in with Supabase Auth using email
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      console.error('❌ Full auth error details:', {
        message: authError.message,
        status: authError.status,
        code: authError.code
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email or password',
          debug: process.env.NODE_ENV === 'development' ? authError.message : undefined
        },
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

    console.log('✅ Login successful for user:', userProfile?.username || authData.user.email);

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: authData.user.id,
        username: userProfile?.username || authData.user.user_metadata?.username,
        email: authData.user.email,
        type: userProfile?.type || authData.user.user_metadata?.user_type || 'DONOR',
      },
      session: authData.session,
    });

  } catch (error) {
    console.error('🚨 Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}