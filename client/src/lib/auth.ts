import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  user: User;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      if (!response.ok) {
        const error = await response.json();
        throw new AuthError(error.message || "Failed to login");
      }
      return response.json();
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Network error occurred");
    }
  },

  async register(username: string, email: string, password: string, fullName?: string): Promise<AuthResponse> {
    try {
      const response = await apiRequest("POST", "/api/auth/register", { 
        username, 
        email, 
        password, 
        fullName 
      });
      if (!response.ok) {
        const error = await response.json();
        throw new AuthError(error.message || "Failed to register");
      }
      return response.json();
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Network error occurred");
    }
  },

  async logout(): Promise<void> {
    try {
      const response = await apiRequest("POST", "/api/auth/logout");
      if (!response.ok) {
        const error = await response.json();
        throw new AuthError(error.message || "Failed to logout");
      }
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Network error occurred");
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      if (!response.ok) {
        const error = await response.json();
        throw new AuthError(error.message || "Failed to get user");
      }
      return response.json();
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Network error occurred");
    }
  },

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await apiRequest("POST", "/api/auth/forgot-password", { email });
      if (!response.ok) {
        const error = await response.json();
        throw new AuthError(error.message || "Failed to request password reset");
      }
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Network error occurred");
    }
  },

  async resetPassword(token: string, password: string): Promise<void> {
    try {
      const response = await apiRequest("POST", "/api/auth/reset-password", { token, password });
      if (!response.ok) {
        const error = await response.json();
        throw new AuthError(error.message || "Failed to reset password");
      }
    } catch (error: any) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("Network error occurred");
    }
  },
};
