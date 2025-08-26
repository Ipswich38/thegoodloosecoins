import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.log('❌ No valid session found');
      return NextResponse.json(
        { success: false, error: 'No valid session' },
        { status: 401 }
      );
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch error:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to load user profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        username: userProfile.username,
        email: session.user.email,
        type: userProfile.type,
        birth_year: userProfile.birth_year,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
      },
    });

  } catch (error) {
    console.error('🚨 Session check error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}