
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// Trigger a global data update event
export const triggerDataUpdate = () => {
  window.dispatchEvent(new Event('appDataUpdated'));
};

// Function to listen for data changes
export const setupDataListeners = (userId: string) => {
  // Set up real-time listeners for user's data
  const eventChannel = supabase
    .channel('public:events')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'events',
      filter: `user_id=eq.${userId}`
    }, () => {
      triggerDataUpdate();
    })
    .subscribe();

  const expenseChannel = supabase
    .channel('public:expenses')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'expenses',
      filter: `user_id=eq.${userId}`
    }, () => {
      triggerDataUpdate();
    })
    .subscribe();
    
  const budgetChannel = supabase
    .channel('public:budget_settings')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public',
      table: 'budget_settings',
      filter: `user_id=eq.${userId}`
    }, () => {
      triggerDataUpdate();
    })
    .subscribe();
    
  // Return cleanup function
  return () => {
    supabase.removeChannel(eventChannel);
    supabase.removeChannel(expenseChannel);
    supabase.removeChannel(budgetChannel);
  };
};

// Format date for database queries
export const formatDateForQuery = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Refresh all data
export const refreshAllData = () => {
  triggerDataUpdate();
};
