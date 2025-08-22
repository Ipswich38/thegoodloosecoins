import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wodsdkyipyiuqmhnsxkw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZHNka3lpcHlpdXFtaG5zeGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTM0MDAsImV4cCI6MjA3MTQyOTQwMH0.09aiG6Gq2ubEvgHU5qfrUSozhUxWd49c5bPon5iC4XQ';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Server-side client for API routes - simplified version for API routes
export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
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