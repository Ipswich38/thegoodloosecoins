import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🚫 OTP ROUTE DISABLED - NO EMAIL VERIFICATION ALLOWED');
  
  // COMPLETELY DISABLED - OTP verification is bypassed
  return NextResponse.json({
    success: false,
    error: 'Email verification is temporarily disabled. Please signup directly.',
    disabled: true
  }, { status: 501 }); // 501 Not Implemented
}