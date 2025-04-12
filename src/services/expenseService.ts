
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { formatDateForQuery, triggerDataUpdate } from "./utils/dataUtils";

// Fetch expenses
export const fetchExpenses = async (userId: string, dateRange?: { start: Date; end: Date }) => {
  let query = supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId);
  
  // Apply date filtering if a range is provided
  if (dateRange) {
    const startDateStr = formatDateForQuery(dateRange.start);
    const endDateStr = formatDateForQuery(dateRange.end);
    query = query.gte('date', startDateStr).lte('date', endDateStr);
  }
  
  // Order by date
  query = query.order('date', { ascending: false });
  
  const { data, error } = await query;
    
  if (error) throw error;
  return data || [];
};

// Create a new expense
export const createExpense = async (expense: any, userId: string) => {
  // Ensure status is set and amount is a number
  const expenseWithStatus = {
    ...expense,
    user_id: userId,
    status: expense.status || 'pending',
    amount: typeof expense.amount === 'string' ? parseFloat(expense.amount) : expense.amount
  };

  const { data, error } = await supabase
    .from('expenses')
    .insert([expenseWithStatus])
    .select();
    
  if (error) throw error;
  
  // Trigger global event to update UI components
  triggerDataUpdate();
  
  return data?.[0];
};

// Update an existing expense
export const updateExpense = async (id: string, expense: any, userId: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      ...expense
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select();
    
  if (error) throw error;
  
  // Trigger global event to update UI components
  triggerDataUpdate();
  
  return data?.[0];
};

// Mark an expense as completed
export const markExpenseCompleted = async (id: string, userId: string) => {
  const { data, error } = await supabase
    .from('expenses')
    .update({
      status: 'completed'
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select();
    
  if (error) throw error;
  
  // Trigger global event to update UI components
  triggerDataUpdate();
  
  return data?.[0];
};

// Delete an expense
export const deleteExpense = async (id: string, userId: string) => {
  // Remove any dash and date suffix for recurring instance IDs
  const actualId = id.includes('-') ? id.split('-')[0] : id;
  
  // Ensure we're passing the complete UUID, not a partial one
  if (!actualId.includes('-') && actualId.length < 36) {
    throw new Error(`Invalid event ID format for deletion: ${actualId}`);
  }
  
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', actualId)
    .eq('user_id', userId);
    
  if (error) throw error;
  
  // Trigger global event to update UI components
  triggerDataUpdate();
  
  return true;
};
