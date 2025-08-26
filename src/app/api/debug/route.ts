import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting debug test...');
    
    const { username = 'debugtest123', password = 'debugpass123', userType = 'DONOR' } = await request.json();
    
    const supabase = createClient();
    
    // Test 1: Basic connection
    console.log('Test 1: Testing Supabase connection...');
    const { data: connectionTest, error: connectionError } = await supabase.from('users').select('count').limit(1);
    console.log('Connection result:', { data: connectionTest, error: connectionError });
    
    // Test 2: Try signup
    console.log('Test 2: Testing auth signup...');
    const tempEmail = `${username}@temp.thegoodloosecoins.app`;
    console.log('Using temp email:', tempEmail);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: tempEmail,
      password,
      options: {
        data: {
          username,
          user_type: userType,
        }
      },
    });
    
    console.log('Auth signup result:', {
      user: authData?.user ? {
        id: authData.user.id,
        email: authData.user.email,
        confirmed_at: authData.user.email_confirmed_at,
        user_metadata: authData.user.user_metadata
      } : null,
      session: authData?.session ? 'exists' : 'null',
      error: authError
    });
    
    // Test 3: If signup succeeded, try inserting to users table
    if (authData?.user && !authError) {
      console.log('Test 3: Testing users table insert...');
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username,
          email: null,
          type: userType,
        });
      
      console.log('Users table insert result:', { data: insertData, error: insertError });
    }
    
    return NextResponse.json({
      success: true,
      results: {
        connectionTest: { data: connectionTest, error: connectionError },
        authTest: {
          user: authData?.user ? {
            id: authData.user.id,
            email: authData.user.email,
            confirmed: !!authData.user.email_confirmed_at
          } : null,
          hasSession: !!authData?.session,
          error: authError
        }
      }
    });

  } catch (error) {
    console.error('🚨 Debug test failed:', error);
    return NextResponse.json(
      { success: false, error: 'Debug test failed', details: error },
      { status: 500 }
    );
  }
}