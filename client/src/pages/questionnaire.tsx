import { useState } from "react";
import { useLocation } from "wouter";
import QuestionnaireForm from "@/components/questionnaire-form";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Please enter your full name").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
});

const Questionnaire = () => {
  const { user, isAuthenticated, login, register, isLoginPending, isRegisterPending } = useAuth();
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      username: "",
    },
  });

  const onAuthSubmit = (values: z.infer<typeof authSchema>) => {
    if (isLogin) {
      login({ email: values.email, password: values.password });
    } else {
      if (!values.username || !values.fullName) {
        toast({
          title: "Missing Information",
          description: "Please provide all required information.",
          variant: "destructive",
        });
        return;
      }
      register({
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="max-w-md w-full mx-4">
          <Card className="mystical-card">
            <CardHeader className="text-center">
              <CardTitle className="font-playfair text-3xl text-yellow-400 mb-2">
                {isLogin ? "Welcome Back" : "Begin Your Journey"}
              </CardTitle>
              <p className="text-white/70">
                {isLogin 
                  ? "Sign in to access your cosmic sanctuary" 
                  : "Create your account to unlock celestial wisdom"
                }
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAuthSubmit)} className="space-y-6">
                  {!isLogin && (
                    <>
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-yellow-400">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="cosmic-input"
                                placeholder="Your sacred name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-yellow-400">Username</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="cosmic-input"
                                placeholder="Choose your mystical username"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-yellow-400">Email</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            className="cosmic-input"
                            placeholder="your@email.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-yellow-400">Password</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="password"
                            className="cosmic-input"
                            placeholder="Your secret cosmic key"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isLogin && (
                    <div className="text-right">
                      <Button
                        variant="link"
                        onClick={() => setLocation("/forgot-password")}
                        className="text-yellow-400 hover:text-yellow-300 p-0"
                      >
                        Forgot your cosmic key?
                      </Button>
                    </div>
                  )}

                  <Button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-purple-900 font-semibold py-3 rounded-full hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300"
                    disabled={isLoginPending || isRegisterPending}
                  >
                    {isLoginPending || isRegisterPending 
                      ? "Connecting to the cosmos..." 
                      : isLogin 
                        ? "Enter Sacred Space" 
                        : "Begin Cosmic Journey"
                    }
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        form.reset();
                      }}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      {isLogin 
                        ? "New soul? Create your cosmic account" 
                        : "Already have an account? Sign in"
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <QuestionnaireForm />;
};

export default Questionnaire;
