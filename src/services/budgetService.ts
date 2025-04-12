
import { supabase } from "@/integrations/supabase/client";
import { triggerDataUpdate } from "./utils/dataUtils";

// Fetch budget settings
export const fetchBudgetSettings = async (userId: string) => {
  const { data, error } = await supabase
    .from('budget_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle(); // Use maybeSingle instead of single to avoid errors
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

// Create or update budget settings
export const createOrUpdateBudgetSettings = async (settings: any, userId: string) => {
  // Check if settings exist
  const { data: existingSettings } = await supabase
    .from('budget_settings')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle(); // Use maybeSingle for safer query
    
  if (existingSettings) {
    // Update
    const { data, error } = await supabase
      .from('budget_settings')
      .update({
        ...settings
      })
      .eq('id', existingSettings.id)
      .eq('user_id', userId)
      .select();
      
    if (error) throw error;
    
    // Trigger global event to update UI components
    triggerDataUpdate();
    
    return data?.[0];
  } else {
    // Create
    const { data, error } = await supabase
      .from('budget_settings')
      .insert([
        {
          ...settings,
          user_id: userId
        }
      ])
      .select();
      
    if (error) throw error;
    
    // Trigger global event to update UI components
    triggerDataUpdate();
    
    return data?.[0];
  }
};
