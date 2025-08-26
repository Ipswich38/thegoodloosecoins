import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, username, birthYear } = await request.json();

    console.log('🔐 Password reset request:', { email, username, birthYear });

    // Validate input
    if (!email || !username || !birthYear) {
      return NextResponse.json(
        { success: false, error: 'Email, username, and birth year are required' },
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

    // Birth year validation
    const currentYear = new Date().getFullYear();
    if (birthYear < currentYear - 100 || birthYear > currentYear - 13) {
      return NextResponse.json(
        { success: false, error: 'Invalid birth year' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if user exists with matching email, name, and birth year
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('email, username, birth_year')
      .eq('email', email)
      .eq('username', username)
      .eq('birth_year', parseInt(birthYear))
      .single();

    if (profileError || !userProfile) {
      console.log('❌ User verification failed:', profileError);
      // Return generic message for security - don't reveal if user exists
      return NextResponse.json(
        { success: true, message: 'If an account with those details exists, a password reset link has been sent to your email.' },
        { status: 200 }
      );
    }

    // Send password reset email through Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (resetError) {
      console.error('❌ Password reset error:', resetError);
      return NextResponse.json(
        { success: false, error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      );
    }

    console.log('✅ Password reset email sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email. Please check your inbox and follow the instructions.',
    });

  } catch (error) {
    console.error('🚨 Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}