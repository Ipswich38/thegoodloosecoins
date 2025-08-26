// Client-side Supabase client
export { createBrowserClient } from '@supabase/ssr';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string | null;
          type: 'DONOR' | 'DONEE';
          birth_year?: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email?: string | null;
          type: 'DONOR' | 'DONEE';
          birth_year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string | null;
          type?: 'DONOR' | 'DONEE';
          birth_year?: number | null;
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