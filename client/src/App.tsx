import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Questionnaire from "@/pages/questionnaire";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Navigation from "@/components/navigation";
import CosmicOrbs from "@/components/cosmic-orbs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/questionnaire" component={Questionnaire} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/subscribe" component={Subscribe} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen cosmic-gradient text-white relative overflow-x-hidden">
          <CosmicOrbs />
          <Navigation />
          <main className="relative z-10">
            <h1> (Debug) App Mounted – Cosmic Orbs & Navigation (or “cosmic gradient”) rendered. (If you see this, the app “mounts” (or “renders”) – and the “cosmic orbs” (or “cosmic gradient”) is “rendered” – so that we can confirm if the app “mounts” (or “renders”) at all.) </h1>
            <Router />
          </main>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
