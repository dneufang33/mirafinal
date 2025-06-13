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

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    return response.json();
  },

  async register(username: string, email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const response = await apiRequest("POST", "/api/auth/register", { 
      username, 
      email, 
      password, 
      fullName 
    });
    return response.json();
  },

  async logout(): Promise<void> {
    await apiRequest("POST", "/api/auth/logout");
  },

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  }
};
