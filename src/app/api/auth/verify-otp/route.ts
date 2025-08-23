import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, userData } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { success: false, error: 'Verification failed' },
        { status: 400 }
      );
    }

    // If userData is provided, this is completing a signup process
    if (userData) {
      const { username, type, password } = userData;
      
      // First create the user in Supabase Auth if they don't exist
      let authUser = data.user;
      if (!authUser || !authUser.email_confirmed_at) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              user_type: type,
            },
          },
        });

        if (signUpError || !signUpData.user) {
          return NextResponse.json(
            { success: false, error: 'Failed to create user account' },
            { status: 400 }
          );
        }
        authUser = signUpData.user;
      }
      
      // Create user in our database
      try {
        const user = await prisma.user.create({
          data: {
            id: authUser.id,
            username,
            email,
            type: type as 'DONOR' | 'DONEE',
          },
          select: {
            id: true,
            username: true,
            email: true,
            type: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        const response = NextResponse.json({
          success: true,
          user: {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          },
          message: 'Email verified and account activated successfully',
        });

        // Set session cookies
        if (data.session) {
          response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: data.session.expires_in || 3600,
            path: '/',
          });

          response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 604800, // 7 days
            path: '/',
          });
        }

        return response;
      } catch (dbError) {
        console.error('Database creation error during OTP verification:', dbError);
        // Even if DB fails, return success since auth worked
        return NextResponse.json({
          success: true,
          user: {
            id: data.user.id,
            username,
            email,
            type,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          message: 'Email verified and account activated successfully',
        });
      }
    }

    // Regular OTP verification (for login or other purposes)
    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });

    // Set session cookies
    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.session.expires_in || 3600,
        path: '/',
      });

      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}