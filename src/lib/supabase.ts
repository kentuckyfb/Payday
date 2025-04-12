
// This file is deprecated - use @/integrations/supabase/client.ts instead
import { supabase } from '@/integrations/supabase/client';

// Re-export the client
export { supabase };

// Tables type definition for reference
export type Tables = {
  users: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    default_hourly_rate: number | null;
    default_working_hours: number | null;
    created_at: string;
  };
  events: {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    date: string;
    start_time: string;
    end_time: string;
    is_recurring: boolean;
    recurrence_type: string | null;
    tags: string[] | null;
    is_paid: boolean;
    hourly_rate: number | null;
    created_at: string;
  };
  expenses: {
    id: string;
    user_id: string;
    date: string;
    category: string;
    amount: number;
    description: string;
    created_at: string;
  };
  budget_settings: {
    id: string;
    user_id: string;
    income: number;
    savings_goal: number;
    categories: string[];
    created_at: string;
  };
};
