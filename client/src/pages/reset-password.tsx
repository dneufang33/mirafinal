import { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/lib/auth";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const resetToken = searchParams.get("token");
    if (!resetToken) {
      toast({
        title: "Invalid Reset Link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
      setLocation("/forgot-password");
    }
    setToken(resetToken);
  }, [searchParams, setLocation, toast]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    if (!token) return;

    try {
      setIsSubmitting(true);
      await authService.resetPassword(token, values.password);
      toast({
        title: "Password Reset Successful",
        description: "Your cosmic password has been reset. You can now log in with your new password.",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-4">
        <Card className="mystical-card">
          <CardHeader className="text-center">
            <CardTitle className="font-playfair text-3xl text-yellow-400 mb-2">
              Create New Cosmic Password
            </CardTitle>
            <p className="text-white/70">
              Enter your new password below
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-400">New Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          className="cosmic-input"
                          placeholder="Your new cosmic key"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-400">Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="password"
                          className="cosmic-input"
                          placeholder="Confirm your cosmic key"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-purple-900 font-semibold py-3 rounded-full hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Resetting Password..." : "Reset Password"}
                </Button>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setLocation("/login")}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword; 