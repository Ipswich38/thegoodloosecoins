import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password, userType } = await request.json();

    console.log('🔐 Creating new user with simple auth:', { username, userType });

    // Validate input
    if (!username || !password || !userType) {
      return NextResponse.json(
        { success: false, error: 'Username, password, and user type are required' },
        { status: 400 }
      );
    }

    if (!['DONOR', 'DONEE'].includes(userType)) {
      return NextResponse.json(
        { success: false, error: 'User type must be DONOR or DONEE' },
        { status: 400 }
      );
    }

    // Basic validation
    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Create a temporary email for Supabase Auth (we can ask for real email later)
    const tempEmail = `${username}@temp.thegoodloosecoins.app`;

    // Sign up user with Supabase Auth using temp email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password,
      options: {
        data: {
          username,
          user_type: userType,
        },
        emailRedirectTo: undefined, // Don't send confirmation emails for temp emails
      },
    });

    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create account';
      if (authError.message?.includes('email')) {
        errorMessage = 'Email configuration issue. Please try again.';
      } else if (authError.message?.includes('password')) {
        errorMessage = 'Password does not meet requirements';
      } else if (authError.message?.includes('already registered')) {
        errorMessage = 'This username is already taken';
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? authError.message : undefined
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 400 }
      );
    }

    console.log('✅ User created successfully:', authData.user.id);

    // Create user profile in our users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        username,
        email: null, // No email required initially
        type: userType,
      });

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      // Don't fail the signup if profile creation fails - we can retry later
      // But log the specific error for debugging
      console.error('Profile error details:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint
      });
    }

    // Initialize social impact points
    const { error: pointsError } = await supabase
      .from('social_impact_points')
      .insert({
        user_id: authData.user.id,
        points: 0,
      });

    if (pointsError) {
      console.error('⚠️ Points initialization error:', pointsError);
    }

    // Auto-login the user by setting session cookies
    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to The Good Loose Coins!',
      user: {
        id: authData.user.id,
        username,
        email: null,
        type: userType,
      },
    });

    if (authData.session) {
      // Set auth cookies for immediate login
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
    }

    return response;

  } catch (error) {
    console.error('🚨 Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}