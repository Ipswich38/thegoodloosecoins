import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Test route to debug signup email behavior
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Test what kind of email Supabase sends
    console.log('Testing signup for email:', email);

    const signUpResult = await supabase.auth.signUp({
      email,
      password: 'testpassword123',
      options: {
        data: {
          username: 'testuser',
          user_type: 'DONOR',
        },
        // Try different configurations
        emailRedirectTo: undefined,
      },
    });

    console.log('Signup result:', {
      error: signUpResult.error,
      user: signUpResult.data.user ? {
        id: signUpResult.data.user.id,
        email: signUpResult.data.user.email,
        email_confirmed_at: signUpResult.data.user.email_confirmed_at,
        confirmation_sent_at: signUpResult.data.user.confirmation_sent_at,
      } : null,
      session: !!signUpResult.data.session,
    });

    if (signUpResult.error) {
      return NextResponse.json({
        success: false,
        error: signUpResult.error.message,
        details: signUpResult.error,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Test signup completed - check logs for details',
      userCreated: !!signUpResult.data.user,
      sessionCreated: !!signUpResult.data.session,
      needsConfirmation: !signUpResult.data.session && !!signUpResult.data.user,
    });
  } catch (error) {
    console.error('Test signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}