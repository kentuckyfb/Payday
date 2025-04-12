
// Common type definitions for the application

// Event recurrence types
export type RecurrenceType = 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'monthly' | 'yearly';

// Event type definition
export interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
  recurrence_type?: RecurrenceType | null;
  recurring_end_date?: string | null;
  tags?: string[];
  is_paid?: boolean;
  hourly_rate?: number;
  created_at?: string;
  isRecurrenceInstance?: boolean;
}

// Expense status types
export type ExpenseStatus = 'pending' | 'completed';

// Budget category type
export interface BudgetCategory {
  name: string;
  color: string;
  budget: number;
  spent: number;
}

// Expense type
export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  status?: ExpenseStatus;
  due_date?: string | null;
}
