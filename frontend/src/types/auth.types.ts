export interface User {
  id: string;
  email: string;
  name: string;
  photo_url?: string;
  created_at: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  email: string;
  name: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isBackendAvailable?: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserRegister) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
