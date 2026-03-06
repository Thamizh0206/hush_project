import { useAuth } from "@/lib/auth-context";
import AuthSection from "@/components/AuthSection";
import Dashboard from "@/components/Dashboard";

const Index = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <AuthSection />;
};

export default Index;
