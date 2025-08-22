export interface User {
  id: string;
  username: string;
  email: string | null;
  type: 'DONOR' | 'DONEE';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
  type: 'DONOR' | 'DONEE';
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}