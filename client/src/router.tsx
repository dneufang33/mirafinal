import { Router, Route, Switch } from "wouter";
import Home from "./pages/home";
import Questionnaire from "./pages/questionnaire";
import Dashboard from "./pages/dashboard";
import Admin from "./pages/admin";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import Navigation from "./components/navigation";

export default function AppRouter() {
  return (
    <Router>
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/questionnaire" component={Questionnaire} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin" component={Admin} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
      </Switch>
    </Router>
  );
} 