import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import AdminPanel from "@/components/admin-panel";

const Admin = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    setLocation("/");
    return null;
  }

  return <AdminPanel />;
};

export default Admin;
