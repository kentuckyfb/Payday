
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth listener FIRST to prevent missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only synchronous state updates here
      setSession(session);
      setUser(session?.user ?? null);
      
      // Use setTimeout to avoid potential deadlocks
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        // Don't throw the error, just log it
        setProfile(null);
      } else {
        setProfile(data || null);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success('Signed in successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error signing in:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setIsLoading(true);
      
      // Create auth user
      const { data: { user }, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      });
      
      if (error) throw error;
      
      if (user) {
        // Create user profile
        const { error: profileError } = await supabase.from('users').insert({
          id: user.id,
          email: email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone || null,
          default_hourly_rate: userData.defaultHourlyRate || 0,
          default_working_hours: userData.defaultWorkingHours || 8
        });
        
        if (profileError) throw profileError;

        // We DON'T need to sign in the user after signup because onAuthStateChange will handle it
        
        toast.success('Account created successfully!');
        navigate('/');
      }
    } catch (error: any) {
      let errorMessage = error.message;
      if (errorMessage.includes('already registered')) {
        errorMessage = 'This email is already registered. Please sign in instead.';
      }
      toast.error(errorMessage);
      console.error('Error signing up:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast.success('Signed out successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error signing out:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    try {
      setIsLoading(true);
      
      if (!user) throw new Error('No user logged in');
      
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile({
        ...profile,
        ...data
      });
      
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error updating profile:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
