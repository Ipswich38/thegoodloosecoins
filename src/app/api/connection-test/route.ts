import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('=== CONNECTION TEST ===');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DIRECT_URL exists:', !!process.env.DIRECT_URL);
    
    // Try to connect and do a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Raw query result:', result);
    
    // Try user count
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    // Check if we can create and delete a test user
    const testUser = await prisma.user.create({
      data: {
        username: `test_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        type: 'DONOR'
      }
    });
    
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'All database operations successful',
      userCount,
      testUserId: testUser.id,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL
      }
    });
    
  } catch (error) {
    console.error('Connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}