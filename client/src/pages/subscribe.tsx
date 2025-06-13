import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Subscription Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to the Lunar Oracle!",
        description: "Your subscription is active. Welcome to your cosmic journey!",
      });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="cosmic-input" />
      <Button 
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 font-semibold py-3 rounded-full hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300"
      >
        {isLoading ? "Activating Your Subscription..." : "Start Lunar Oracle - $29/month"}
      </Button>
    </form>
  );
};

const Subscribe = () => {
  const [clientSecret, setClientSecret] = useState("");
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [plan, setPlan] = useState("lunar");

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/questionnaire");
      return;
    }

    // Get plan from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get('plan');
    if (planParam) {
      setPlan(planParam);
    }

    apiRequest("POST", "/api/get-or-create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating subscription:", error);
      });
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const planDetails = {
    lunar: {
      name: "Lunar Oracle",
      price: "$29/month",
      features: [
        "Everything in Sacred Reading",
        "Daily Whispers & Insights", 
        "Monthly Ritual Suggestions",
        "Real-time Transit Updates"
      ]
    },
    empress: {
      name: "Cosmic Empress",
      price: "$89/month", 
      features: [
        "Everything in Lunar Oracle",
        "Weekly Video Readings",
        "Access to Sacred Circle",
        "Priority Oracle Support"
      ]
    }
  };

  const currentPlan = planDetails[plan as keyof typeof planDetails] || planDetails.lunar;

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-5xl font-bold mb-6">
            <span className="text-yellow-400 font-dancing text-3xl block mb-2">Subscribe to</span>
            {currentPlan.name}
          </h1>
          <p className="text-xl text-white/70">
            Join thousands on their ongoing cosmic journey
          </p>
        </div>

        <Card className="mystical-card">
          <CardHeader>
            <CardTitle className="font-playfair text-2xl text-yellow-400 text-center">
              {currentPlan.name} - {currentPlan.price}
            </CardTitle>
            <div className="text-center text-white/70">
              <ul className="space-y-2 mt-4">
                {currentPlan.features.map((feature, index) => (
                  <li key={index}>✨ {feature}</li>
                ))}
              </ul>
            </div>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Subscribe;
