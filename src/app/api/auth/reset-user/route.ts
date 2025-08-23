import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Create admin client using service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Only allow specific test emails to be reset
    const allowedEmails = [
      'fernandez.cherwin@gmail.com',
      'kreativloops@gmail.com',
    ];

    if (!allowedEmails.includes(email)) {
      return NextResponse.json(
        { success: false, error: 'Email not authorized for reset' },
        { status: 403 }
      );
    }

    try {
      // First, find the user in Supabase
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        console.error('Error listing users:', listError);
        return NextResponse.json(
          { success: false, error: 'Failed to list users' },
          { status: 500 }
        );
      }

      const user = users.users.find(u => u.email === email);
      
      if (user) {
        // Delete from Supabase Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.error('Error deleting user from Supabase:', deleteError);
          return NextResponse.json(
            { success: false, error: 'Failed to delete user from auth' },
            { status: 500 }
          );
        }

        // Delete from our database if exists
        try {
          await prisma.user.delete({
            where: { email },
          });
        } catch (dbError) {
          // It's okay if user doesn't exist in our database
          console.log('User not found in database, which is fine');
        }

        return NextResponse.json({
          success: true,
          message: `User ${email} has been reset and can now sign up again`,
        });
      } else {
        return NextResponse.json({
          success: true,
          message: `No user found with email ${email} - already available for signup`,
        });
      }
    } catch (adminError) {
      console.error('Admin operation error:', adminError);
      return NextResponse.json(
        { success: false, error: 'Failed to perform admin operation' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Reset user error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}