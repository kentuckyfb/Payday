
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  LogOut,
  Menu
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SideNavigation from "./SideNavigation";
import { motion } from "framer-motion";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if on root path
    if (location.pathname === "/") {
      navigate("/", { replace: true });
    }
    
    // Trigger data refresh when layout mounts
    window.dispatchEvent(new Event('appDataUpdated'));
  }, [location.pathname, navigate]);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/calendar":
        return "Calendar";
      case "/events":
        return "Events";
      case "/analytics":
        return "Analytics";
      case "/budget":
        return "Budget";
      case "/profile":
        return "Profile";
      default:
        return "Payday";
    }
  };

  const getInitials = () => {
    const firstName = profile?.first_name || '';
    const lastName = profile?.last_name || '';
    return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="flex flex-col min-h-screen bg-payday-dark w-full">
      <header className="px-4 py-3 sticky top-0 z-20 bg-payday-dark/90 backdrop-blur-lg border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SideNavigation />
          <motion.h1 
            className="text-xl font-bold text-gradient"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {getPageTitle()}
          </motion.h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden md:flex text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleSignOut}
          >
            <LogOut size={14} className="mr-1" />
            Sign Out
          </Button>
          
          <Avatar 
            className="h-8 w-8 border border-payday-purple cursor-pointer" 
            onClick={() => navigate('/profile')}
          >
            <AvatarFallback className="bg-payday-purple/20 text-payday-purple-light text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
      
      <div className="flex flex-1 w-full relative">
        {/* Content area with better centered positioning */}
        <motion.main 
          className="flex-1 w-full px-4 py-6 pb-20 md:pb-6 md:px-6 max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AppLayout;
