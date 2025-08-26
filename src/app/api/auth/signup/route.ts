import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, username, birthYear, password, userType } = await request.json();

    console.log('🔐 Creating new user with enhanced auth:', { email, username, birthYear, userType });

    // Validate input
    if (!email || !username || !birthYear || !password || !userType) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['DONOR', 'DONEE'].includes(userType)) {
      return NextResponse.json(
        { success: false, error: 'User type must be DONOR or DONEE' },
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

    // Username validation
    if (username.length < 2 || username.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Username must be between 2 and 50 characters' },
        { status: 400 }
      );
    }

    // Birth year validation
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    if (birthYear < currentYear - 100 || birthYear > currentYear - 13) {
      return NextResponse.json(
        { success: false, error: 'Invalid birth year. You must be between 13 and 100 years old' },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must contain at least one uppercase letter, lowercase letter, and number' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          birth_year: birthYear,
          user_type: userType,
        },
        emailRedirectTo: undefined, // Disable email confirmation for now
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

    console.log('✅ User created successfully:', {
      userId: authData.user.id,
      email: authData.user.email,
      emailConfirmed: authData.user.email_confirmed_at,
      hasSession: !!authData.session,
      sessionExpires: authData.session?.expires_at
    });

    // Create user profile in our users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        username: username,
        email: email,
        type: userType,
        birth_year: birthYear,
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
        username: username,
        email: email,
        type: userType,
        birth_year: birthYear,
      },
    });

    if (authData.session) {
      console.log('🍪 Setting session cookies:', {
        hasAccessToken: !!authData.session.access_token,
        hasRefreshToken: !!authData.session.refresh_token,
        expiresAt: authData.session.expires_at,
        expiresAtDate: new Date(authData.session.expires_at! * 1000)
      });

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

      console.log('✅ Session cookies set successfully');
    } else {
      console.log('⚠️ No session returned from signup - attempting manual sign in...');
      
      // Try to sign in immediately after signup
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ Auto sign-in failed:', signInError);
      } else if (signInData.session) {
        console.log('✅ Auto sign-in successful, setting session cookies');
        response.cookies.set('supabase-auth-token', signInData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(signInData.session.expires_at! * 1000),
          path: '/',
        });

        response.cookies.set('supabase-refresh-token', signInData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          path: '/',
        });
      }
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