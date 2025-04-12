import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  PieChart, 
  ListPlus, 
  Wallet, 
  User,
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface SideNavigationProps {
  showTrigger?: boolean;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ showTrigger = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
    { path: "/events", icon: ListPlus, label: "Events" },
    { path: "/analytics", icon: PieChart, label: "Analytics" },
    { path: "/budget", icon: Wallet, label: "Budget" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  const getInitials = () => {
    const firstName = profile?.first_name || '';
    const lastName = profile?.last_name || '';
    return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const UserProfileSection = ({ isMobile = false }) => (
    <div className={`p-4 border-b border-white/10 ${collapsed && !isMobile ? "items-center justify-center" : ""}`}>
      <AnimatePresence>
        {(!collapsed || isMobile) ? (
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Avatar className="h-10 w-10 border border-payday-purple">
              <AvatarFallback className="bg-payday-purple/20 text-payday-purple">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-white truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Avatar className="h-8 w-8 border border-payday-purple">
              <AvatarFallback className="bg-payday-purple/20 text-payday-purple text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      {showTrigger && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="flex md:hidden"
          onClick={() => setSheetOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      )}

      {/* Mobile Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-payday-dark-secondary border-r border-white/10">
          <div className="flex flex-col h-full">
            {/* Header with logo - No close button here, let the SheetContent handle it */}
            <div className="flex items-center p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-payday-purple/20 flex items-center justify-center">
                  <span className="font-bold text-payday-purple">P</span>
                </div>
                <h2 className="font-bold text-xl text-white">Payday</h2>
              </div>
            </div>
            
            {/* User profile snippet */}
            <UserProfileSection isMobile={true} />
            
            {/* Navigation items */}
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-2">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.li 
                      key={item.path}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={() => {
                          navigate(item.path);
                          setSheetOpen(false);
                        }}
                        className={`flex items-center w-full gap-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? "bg-payday-purple/20 text-payday-purple" 
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <item.icon size={20} className={isActive ? "text-payday-purple" : ""} />
                        <span>{item.label}</span>
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-payday-purple animate-pulse" />
                        )}
                      </button>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
            
            {/* Version info */}
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500">Payday v1.0.0</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <motion.div 
        className="hidden md:block fixed top-[3.5rem] left-0 h-[calc(100vh-3.5rem)] bg-payday-dark-secondary border-r border-white/10 shadow-xl transition-all duration-300 z-10"
        initial={false}
        animate={{ width: collapsed ? "4rem" : "16rem" }}
      >
        <div className="flex flex-col h-full">
          {/* Collapse/Expand Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -right-3 top-4 bg-payday-dark-secondary border border-white/10 rounded-full z-20 hover:bg-payday-purple/20"
            onClick={toggleCollapsed}
          >
            {collapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </Button>
          
          {/* User profile snippet */}
          <UserProfileSection />
          
          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <motion.li 
                    key={item.path}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => navigate(item.path)}
                      className={`flex items-center w-full ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-payday-purple/20 text-payday-purple" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                      title={collapsed ? item.label : ""}
                    >
                      <item.icon size={20} className={isActive ? "text-payday-purple" : ""} />
                      {!collapsed && <span>{item.label}</span>}
                      {isActive && !collapsed && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-payday-purple animate-pulse" />
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </nav>
          
          {/* Version info */}
          <div className="p-4 text-center">
            {!collapsed && <p className="text-xs text-gray-500">Payday v1.0.0</p>}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default SideNavigation;
