import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection and user existence...');
    
    // Test database connection
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    // Check for our test users
    const testUsers = await prisma.user.findMany({
      where: {
        username: {
          in: ['testdonor', 'testdonee', 'admin']
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        type: true,
        createdAt: true
      }
    });
    
    console.log('👥 Test users found:', testUsers);
    
    // Create missing users if they don't exist
    const missingUsers = [];
    const expectedUsers = [
      { username: 'testdonor', email: 'donor@test.com', type: 'DONOR' },
      { username: 'testdonee', email: 'donee@test.com', type: 'DONEE' },
      { username: 'admin', email: 'admin@test.com', type: 'DONOR' }
    ];
    
    for (const expectedUser of expectedUsers) {
      const exists = testUsers.find(u => u.username === expectedUser.username);
      if (!exists) {
        try {
          const newUser = await prisma.user.create({
            data: {
              username: expectedUser.username,
              email: expectedUser.email,
              type: expectedUser.type as any
            }
          });
          console.log(`✅ Created missing user: ${newUser.username}`);
          missingUsers.push(`Created: ${newUser.username}`);
        } catch (createError) {
          console.error(`❌ Error creating user ${expectedUser.username}:`, createError);
          missingUsers.push(`Failed to create: ${expectedUser.username} - ${createError}`);
        }
      }
    }
    
    // Get updated user list
    const allTestUsers = await prisma.user.findMany({
      where: {
        username: {
          in: ['testdonor', 'testdonee', 'admin']
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        type: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      success: true,
      database: {
        totalUsers: userCount,
        testUsers: allTestUsers,
        missingUsers: missingUsers.length > 0 ? missingUsers : ['All test users exist']
      },
      accessCodes: {
        testdonor: '123456',
        testdonee: '654321',
        admin: '999999'
      },
      message: 'Database connection successful'
    });
    
  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check database connection and credentials'
    }, { status: 500 });
  }
}