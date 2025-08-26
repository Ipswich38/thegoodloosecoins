import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log('🔍 Checking session with cookies');
  
  try {
    const authToken = request.cookies.get('supabase-auth-token')?.value;
    const refreshToken = request.cookies.get('supabase-refresh-token')?.value;

    console.log('🍪 Session cookies:', {
      hasAuthToken: !!authToken,
      hasRefreshToken: !!refreshToken,
      authTokenLength: authToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0,
    });

    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Set the session using the tokens
    if (authToken && refreshToken) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: authToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        return NextResponse.json(
          { success: false, error: 'Invalid session' },
          { status: 401 }
        );
      }
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(authToken);

    if (userError || !user) {
      console.error('❌ Auth error:', userError);
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Profile fetch error:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to load user profile' },
        { status: 500 }
      );
    }

    // Create profile if it doesn't exist
    let finalUserProfile = userProfile;
    
    if (!finalUserProfile) {
      console.log('👤 Creating missing profile for user:', user.id);
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
          email: user.email,
          type: user.user_metadata?.user_type || 'DONOR',
          birth_year: user.user_metadata?.birth_year || null,
        });

      if (createError) {
        console.error('❌ Profile creation error:', createError);
      }

      // Retry fetching profile
      const { data: retryProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      finalUserProfile = retryProfile;
    }

    if (!finalUserProfile) {
      return NextResponse.json(
        { success: false, error: 'Failed to load user profile' },
        { status: 500 }
      );
    }
    
    console.log('✅ Session check successful:', user.email, finalUserProfile.type);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: finalUserProfile.username,
        email: user.email,
        type: finalUserProfile.type,
        birth_year: finalUserProfile.birth_year,
        createdAt: finalUserProfile.created_at,
        updatedAt: finalUserProfile.updated_at,
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