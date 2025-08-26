import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, userType } = await request.json();

    console.log('🔐 Creating new user with Supabase Auth:', { email, username, userType });

    // Validate input
    if (!email || !password || !username || !userType) {
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

    const supabase = createClient();

    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          user_type: userType,
        },
      },
    });

    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      return NextResponse.json(
        { success: false, error: authError.message },
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
        email,
        type: userType,
      });

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      // Don't fail the signup if profile creation fails - user is still created in auth
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
      // Don't fail signup for this
    }

    return NextResponse.json({
      success: true,
      message: authData.user.email_confirmed_at 
        ? 'Account created successfully!' 
        : 'Account created! Please check your email to confirm your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username,
        type: userType,
      },
    });

  } catch (error) {
    console.error('🚨 Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}