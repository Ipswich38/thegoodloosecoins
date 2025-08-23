import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🚫 VERIFY OTP ROUTE DISABLED - EMAIL VERIFICATION BYPASSED');
  
  // COMPLETELY DISABLED - OTP verification is bypassed
  return NextResponse.json({
    success: false,
    error: 'Email verification is temporarily disabled. Users are logged in directly upon signup.',
    disabled: true
  }, { status: 501 }); // 501 Not Implemented
}