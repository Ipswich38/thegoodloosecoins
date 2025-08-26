import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { username, password, userType } = await request.json();

    console.log('🧪 Testing signup with:', { username, userType });

    const supabase = createClient();
    const tempEmail = `${username}@temp.thegoodloosecoins.app`;

    // Test Supabase Auth signup
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password,
      options: {
        data: {
          username,
          user_type: userType,
        },
      },
    });

    console.log('Auth result:', {
      user: authData?.user ? { id: authData.user.id, email: authData.user.email } : null,
      session: authData?.session ? 'exists' : 'null',
      error: authError ? { message: authError.message, status: authError.status } : null
    });

    return NextResponse.json({
      success: !authError,
      authData: authData ? {
        userId: authData.user?.id,
        userEmail: authData.user?.email,
        hasSession: !!authData.session
      } : null,
      error: authError ? {
        message: authError.message,
        status: authError.status,
        name: authError.name
      } : null
    });

  } catch (error) {
    console.error('🚨 Test signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed', details: error },
      { status: 500 }
    );
  }
}