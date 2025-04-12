
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
  default_hourly_rate?: number;
  default_working_hours?: number;
}

export const useUser = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setProfile(data);
      } catch (err: any) {
        console.error("Error fetching user profile:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select();

      if (error) {
        throw error;
      }

      setProfile(prevProfile => ({
        ...prevProfile,
        ...updates
      }));

      return data;
    } catch (err: any) {
      console.error("Error updating user profile:", err.message);
      toast.error(`Failed to update profile: ${err.message}`);
      throw err;
    }
  };

  return { profile, loading, error, updateUserProfile };
};
