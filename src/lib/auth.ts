import { supabase } from '@/lib/supabase';
import { User } from '@/types/auth';

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.success ? data.user : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await fetch('/api/auth', {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error signing out:', error);
  }
}

export function isValidUserType(type: string): type is 'DONOR' | 'DONEE' {
  return type === 'DONOR' || type === 'DONEE';
}

export function getRedirectPath(userType: 'DONOR' | 'DONEE'): string {
  return `/dashboard/${userType.toLowerCase()}`;
}

// Client-side auth state management
export class AuthStateManager {
  private static instance: AuthStateManager;
  private user: User | null = null;
  private isLoading = false;
  private listeners: Array<(user: User | null) => void> = [];

  private constructor() {}

  static getInstance(): AuthStateManager {
    if (!AuthStateManager.instance) {
      AuthStateManager.instance = new AuthStateManager();
    }
    return AuthStateManager.instance;
  }

  subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.user));
  }

  async initialize(): Promise<User | null> {
    if (this.isLoading) return this.user;
    
    this.isLoading = true;
    try {
      this.user = await getCurrentUser();
      this.notify();
      return this.user;
    } finally {
      this.isLoading = false;
    }
  }

  async signOut(): Promise<void> {
    await signOut();
    this.user = null;
    this.notify();
  }

  setUser(user: User | null): void {
    this.user = user;
    this.notify();
  }

  getUser(): User | null {
    return this.user;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }
}