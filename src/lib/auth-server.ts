import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  type: 'DONOR' | 'DONEE';
}

export async function getCurrentUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const authToken = request.cookies.get('supabase-auth-token')?.value;
    const refreshToken = request.cookies.get('supabase-refresh-token')?.value;

    if (!authToken) {
      return null;
    }

    const supabase = createClient();

    // Set the session using the tokens
    if (authToken && refreshToken) {
      await supabase.auth.setSession({
        access_token: authToken,
        refresh_token: refreshToken,
      });
    }

    // Get current user from Supabase Auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(authToken);

    if (userError || !user) {
      return null;
    }

    // Get user profile from our users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Profile fetch error:', profileError);
      return null;
    }

    // Create profile if it doesn't exist
    if (!userProfile) {
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
          email: user.email,
          type: user.user_metadata?.user_type || 'DONOR',
        })
        .select()
        .single();

      if (createError || !newProfile) {
        console.error('❌ Profile creation error:', createError);
        return null;
      }

      return {
        id: user.id,
        username: newProfile.username,
        email: user.email!,
        type: newProfile.type,
      };
    }

    return {
      id: user.id,
      username: userProfile.username,
      email: user.email!,
      type: userProfile.type,
    };

  } catch (error) {
    console.error('🚨 getCurrentUser error:', error);
    return null;
  }
}

export function createSupabaseClient() {
  return createClient();
}