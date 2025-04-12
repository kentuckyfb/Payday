
import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft, ChevronRight, BugIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import BugReportDialog from "@/components/BugReportDialog";

const Profile: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const { setTheme, theme } = useTheme();
  const [darkMode, setDarkMode] = useState(theme === "dark");
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [bugReportOpen, setBugReportOpen] = useState(false);

  useEffect(() => {
    setTheme(darkMode ? "dark" : "light");
  }, [darkMode, setTheme]);

  const handleSignOut = () => {
    toast.success("Signed out successfully");
    signOut();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleReportBug = () => {
    setBugReportOpen(true);
  };

  const getInitials = () => {
    const firstName = profile?.first_name || '';
    const lastName = profile?.last_name || '';
    return firstName.charAt(0).toUpperCase() + lastName.charAt(0).toUpperCase();
  };

  const settingsSection = (
    <motion.div 
      className="glass-card p-6 mb-6 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-xl font-semibold mb-4 text-white">Settings</h2>
      <div className="space-y-6">
        <motion.div 
          className="flex justify-between items-center"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div>
            <h3 className="font-medium text-white">Notifications</h3>
            <p className="text-sm text-gray-400">Receive alerts for upcoming shifts</p>
          </div>
          <Switch checked={notifications} onCheckedChange={(checked) => {
            setNotifications(checked);
            toast.success(checked ? "Notifications enabled" : "Notifications disabled");
          }} />
        </motion.div>
        
        <motion.div 
          className="flex justify-between items-center"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div>
            <h3 className="font-medium text-white">Dark Mode</h3>
            <p className="text-sm text-gray-400">Use dark theme</p>
          </div>
          <Switch checked={darkMode} onCheckedChange={(checked) => {
            setDarkMode(checked);
            toast.success(checked ? "Dark mode enabled" : "Light mode disabled");
          }} />
        </motion.div>
        
        <motion.div 
          className="flex justify-between items-center"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div>
            <h3 className="font-medium text-white">Report a Bug</h3>
            <p className="text-sm text-gray-400">Help us improve Payday</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReportBug}
            className="gap-2 text-payday-purple-light border-payday-purple/20 hover:bg-payday-purple/10"
          >
            <BugIcon size={16} />
            Report Bug
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="container max-w-3xl mx-auto">
      <motion.div 
        className="flex items-center mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleGoBack}
          className="mr-2 text-gray-400 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft size={18} />
          <span className="sr-only">Go back</span>
        </Button>
        <h1 className="text-2xl font-bold text-gradient">Profile</h1>
      </motion.div>
      
      <motion.div 
        className="glass-card p-6 mb-6 rounded-xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Your Profile</h1>
            <p className="text-gray-400">Manage your account settings and preferences</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleSignOut}
          >
            <LogOut size={14} className="mr-1" />
            Sign Out
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Avatar className="h-24 w-24 border-2 border-payday-purple shadow-lg">
              <AvatarFallback className="bg-payday-purple/20 text-payday-purple-light text-xl">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-semibold text-white">
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p className="text-gray-400">{profile?.email}</p>
            <motion.div className="mt-4" whileHover={{ scale: 1.02 }}>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-payday-purple-light border-payday-purple/20 hover:bg-payday-purple/10"
                onClick={() => setEditProfileOpen(true)}
              >
                Edit Profile
                <ChevronRight size={14} />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {settingsSection}

      {/* Dialogs */}
      <EditProfileDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
      <BugReportDialog open={bugReportOpen} onOpenChange={setBugReportOpen} />
    </div>
  );
};

export default Profile;
