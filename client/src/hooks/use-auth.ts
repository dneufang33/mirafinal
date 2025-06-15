import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, type User, AuthError } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => authService.getCurrentUser().then(res => res.user),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in to your cosmic sanctuary.",
      });
    },
    onError: (error: any) => {
      const message = error instanceof AuthError 
        ? error.message 
        : "An unexpected error occurred. Please try again.";
      toast({
        title: "Authentication Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: ({ username, email, password, fullName }: { 
      username: string; 
      email: string; 
      password: string; 
      fullName?: string; 
    }) => authService.register(username, email, password, fullName),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({
        title: "Welcome to Mira!",
        description: "Your cosmic journey begins now. The stars have been waiting for you.",
      });
    },
    onError: (error: any) => {
      const message = error instanceof AuthError 
        ? error.message 
        : "An unexpected error occurred. Please try again.";
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      toast({
        title: "Until we meet again",
        description: "You have been signed out of your cosmic sanctuary.",
      });
    },
    onError: (error: any) => {
      const message = error instanceof AuthError 
        ? error.message 
        : "An unexpected error occurred while signing out.";
      toast({
        title: "Sign Out Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  };
}
