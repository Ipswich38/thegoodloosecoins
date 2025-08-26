import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Ensure environment variables are clean
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || 'https://wodsdkyipyiuqmhnsxkw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/[\s\n\r]/g, '') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHNka3lpcHlpdXFtaG5zeGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTM0MDAsImV4cCI6MjA3MTQyOTQwMH0.09aiG6Gq2ubEvgHU5qfrUSozhUxWd49c5bPon5iC4XQ';

// Validate the anon key format (more lenient validation)
if (!supabaseAnonKey || supabaseAnonKey === 'undefined' || supabaseAnonKey.length < 10) {
  console.error('Invalid Supabase anon key - key is missing or too short');
} else {
  console.log('✅ Supabase anon key loaded successfully');
}

// Client-side Supabase client
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Server-side client for API routes with automatic cookie handling
export function createClient() {
  const cookieStore = cookies();
  
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'cache-control': 'no-cache',
      },
    },
  });
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          type: 'DONOR' | 'DONEE';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email?: string | null;
          type: 'DONOR' | 'DONEE';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string | null;
          type?: 'DONOR' | 'DONEE';
          created_at?: string;
          updated_at?: string;
        };
      };
      pledges: {
        Row: {
          id: string;
          donor_id: string;
          amount: number;
          status: 'PENDING' | 'TASK1_COMPLETE' | 'TASK2_COMPLETE' | 'COMPLETED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          donor_id: string;
          amount: number;
          status?: 'PENDING' | 'TASK1_COMPLETE' | 'TASK2_COMPLETE' | 'COMPLETED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string;
          amount?: number;
          status?: 'PENDING' | 'TASK1_COMPLETE' | 'TASK2_COMPLETE' | 'COMPLETED';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};