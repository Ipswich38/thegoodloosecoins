import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Test accounts with 6-digit passcodes
const TEST_ACCOUNTS = [
  {
    id: 'donor_001',
    username: 'testdonor',
    email: 'donor@test.com',
    passcode: '123456',
    type: 'DONOR'
  },
  {
    id: 'donee_001', 
    username: 'testdonee',
    email: 'donee@test.com',
    passcode: '654321',
    type: 'DONEE'
  },
  {
    id: 'admin_001',
    username: 'admin',
    email: 'admin@test.com', 
    passcode: '999999',
    type: 'DONOR'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { username, passcode } = await request.json();

    console.log('Login attempt:', { username, passcode: passcode ? '***' : 'missing' });

    // Validate input
    if (!username || !passcode) {
      return NextResponse.json(
        { success: false, error: 'Username and passcode are required' },
        { status: 400 }
      );
    }

    // Validate passcode format (6 digits)
    if (!/^\d{6}$/.test(passcode)) {
      return NextResponse.json(
        { success: false, error: 'Passcode must be exactly 6 digits' },
        { status: 400 }
      );
    }

    // Find matching account
    const account = TEST_ACCOUNTS.find(acc => 
      acc.username.toLowerCase() === username.toLowerCase() && 
      acc.passcode === passcode
    );

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or passcode' },
        { status: 401 }
      );
    }

    console.log('Login successful for:', account.username);

    // Create session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: account.id,
        username: account.username,
        email: account.email,
        type: account.type
      }
    });

    // Set authentication cookies
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });

    response.cookies.set('user-id', account.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });

    response.cookies.set('user-type', account.type, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}