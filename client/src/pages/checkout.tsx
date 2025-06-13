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

const CheckoutForm = () => {
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
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase! Your sacred reading awaits.",
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
        className="w-full bg-gradient-to-r from-yellow-400 to-pink-400 text-purple-900 font-semibold py-3 rounded-full hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-300"
      >
        {isLoading ? "Processing Sacred Payment..." : "Complete Sacred Reading - $89"}
      </Button>
    </form>
  );
};

const Checkout = () => {
  const [clientSecret, setClientSecret] = useState("");
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/questionnaire");
      return;
    }

    apiRequest("POST", "/api/create-payment-intent", { amount: 89 })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
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

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-5xl font-bold mb-6">
            <span className="text-yellow-400 font-dancing text-3xl block mb-2">Complete Your</span>
            Sacred Reading Purchase
          </h1>
          <p className="text-xl text-white/70">
            Unlock your complete cosmic blueprint with detailed insights and guidance
          </p>
        </div>

        <Card className="mystical-card">
          <CardHeader>
            <CardTitle className="font-playfair text-2xl text-yellow-400 text-center">
              Sacred Reading - $89
            </CardTitle>
            <div className="text-center text-white/70">
              <ul className="space-y-2 mt-4">
                <li>✨ Complete Birth Chart Analysis</li>
                <li>🌙 12-Month Cosmic Forecast</li>
                <li>💕 Love & Relationship Insights</li>
                <li>📄 Downloadable PDF Report</li>
              </ul>
            </div>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Checkout;
