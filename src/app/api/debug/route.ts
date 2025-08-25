import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test connection
    const userCount = await prisma.user.count();
    
    // Test create (and immediately delete)
    const testUser = await prisma.user.create({
      data: {
        username: 'test_' + Date.now(),
        email: `test_${Date.now()}@test.com`,
        type: 'DONOR'
      }
    });
    
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Database working perfectly',
      userCount,
      testUserId: testUser.id
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}