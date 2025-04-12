
import { supabase } from "@/integrations/supabase/client";
import type { Event } from "@/types/app";
import { format } from "date-fns";
import { formatDateForQuery, triggerDataUpdate } from "./utils/dataUtils";

// Fetch events with recurring events expanded
export const fetchEvents = async (userId: string, recurringMonths = 3, dateRange?: { start: Date; end: Date }) => {
  let query = supabase
    .from('events')
    .select('*')
    .eq('user_id', userId);
  
  // Apply date filtering if a range is provided
  if (dateRange) {
    const startDateStr = formatDateForQuery(dateRange.start);
    const endDateStr = formatDateForQuery(dateRange.end);
    query = query.gte('date', startDateStr).lte('date', endDateStr);
  }
  
  // Order by date
  query = query.order('date', { ascending: true });
  
  const { data, error } = await query;
    
  if (error) throw error;
  
  // Process recurring events to generate instances
  const processedEvents = [];
  
  for (const event of data || []) {
    // Always add the original event
    processedEvents.push(event);
    
    // Generate recurring event instances if this is a recurring event
    // Only for calendar view, not for events list
    if (event.is_recurring && event.recurrence_type) {
      const additionalEvents = generateRecurringEventInstances(
        event, 
        recurringMonths,
        dateRange?.end || new Date(new Date().setMonth(new Date().getMonth() + recurringMonths))
      );
      processedEvents.push(...additionalEvents);
    }
  }
  
  return processedEvents;
};

// Special function that only returns original events, no recurring instances
// This is used for the events list to prevent duplicate events
export const fetchEventsWithoutRecurringInstances = async (userId: string, dateRange?: { start: Date; end: Date }) => {
  let query = supabase
    .from('events')
    .select('*')
    .eq('user_id', userId);
  
  // Apply date filtering if a range is provided
  if (dateRange) {
    const startDateStr = formatDateForQuery(dateRange.start);
    const endDateStr = formatDateForQuery(dateRange.end);
    query = query.gte('date', startDateStr).lte('date', endDateStr);
  }
  
  // Order by date
  query = query.order('date', { ascending: true });
  
  const { data, error } = await query;
    
  if (error) throw error;
  
  return data || [];
};

// Fetch a single event by ID
export const fetchEvent = async (id: string, userId: string) => {
  try {
    // For recurring instances, the ID format will be originalId-date
    // We need to extract just the original ID for fetching from the database
    let eventId = id;
    let isRecurrenceInstance = false;
    
    if (id.includes('-')) {
      const parts = id.split('-');
      // Check if this is a recurring instance with date suffix
      if (parts.length > 4) { // UUID has 5 parts when split by '-'
        eventId = parts.slice(0, 5).join('-'); // Take first 5 parts to form the UUID
        isRecurrenceInstance = true;
      } else {
        eventId = id;
      }
    }
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
    if (!data) throw new Error("Event not found");
    
    // If this is a recurring instance, we need to add the flag
    if (isRecurrenceInstance) {
      data.isRecurrenceInstance = true;
    }
    
    return data as Event;
  } catch (error) {
    console.error("Error in fetchEvent:", error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (event: Partial<Event>, userId: string) => {
  const eventData = {
    ...event,
    user_id: userId,
    date: event.date || new Date().toISOString().split('T')[0], // Required field
    start_time: event.start_time || '09:00:00', // Required field
    end_time: event.end_time || '10:00:00', // Required field
    title: event.title || 'Untitled Event' // Required field
  };

  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select();
    
  if (error) throw error;
  
  // Trigger global event to update UI components
  triggerDataUpdate();
  
  return data?.[0];
};

// Update an existing event
export const updateEvent = async (id: string, event: Partial<Event>, userId: string) => {
  // Ensure required fields are present
  const eventData = { ...event };
  if (!eventData.date) {
    const { data } = await supabase.from('events').select('date').eq('id', id).single();
    eventData.date = data?.date;
  }
  if (!eventData.start_time) {
    const { data } = await supabase.from('events').select('start_time').eq('id', id).single();
    eventData.start_time = data?.start_time;
  }
  if (!eventData.end_time) {
    const { data } = await supabase.from('events').select('end_time').eq('id', id).single();
    eventData.end_time = data?.end_time;
  }
  if (!eventData.title) {
    const { data } = await supabase.from('events').select('title').eq('id', id).single();
    eventData.title = data?.title;
  }

  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', id)
    .eq('user_id', userId)
    .select();
    
  if (error) throw error;
  
  // Trigger global event to update UI components
  triggerDataUpdate();
  
  return data?.[0];
};

// Delete an event
export const deleteEvent = async (id: string, userId: string) => {
  try {
    // Remove any dash and date suffix for recurring instance IDs
    const actualId = id.includes('-') ? id.split('-')[0] : id;
    
    // If we have a short ID, we need to format it properly
    const formattedEventId = actualId.length === 8 
      ? `${actualId}-0000-0000-0000-000000000000`
      : actualId;
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', formattedEventId)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Trigger global event to update UI components
    triggerDataUpdate();
    
    return true;
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    throw error;
  }
};

// Generate recurring event instances for calendar display
export const generateRecurringEventInstances = (event: any, months = 3, customEndDate?: Date) => {
  const additionalEvents = [];
  const baseDate = new Date(event.date);
  const today = new Date();
  
  // Show events for the specified number of months
  const defaultEndDate = new Date();
  defaultEndDate.setMonth(today.getMonth() + months);
  
  // Use custom end date if provided, otherwise use default calculation
  let endDate = customEndDate || defaultEndDate;
  
  // If there's a recurring end date, use that as the end date if it's earlier
  if (event.recurring_end_date) {
    const recurringEndDate = new Date(event.recurring_end_date);
    if (recurringEndDate < endDate) {
      endDate = new Date(recurringEndDate.getTime());
    }
  }
  
  let currentDate = new Date(baseDate);
  currentDate.setDate(currentDate.getDate() + 1); // Start from the next day
  
  while (currentDate <= endDate) {
    let shouldAdd = false;
    
    switch (event.recurrence_type) {
      case 'daily':
        shouldAdd = true;
        break;
      case 'weekly':
        // Same day of the week
        shouldAdd = currentDate.getDay() === baseDate.getDay();
        break;
      case 'weekdays':
        // Monday to Friday (0 = Sunday, 6 = Saturday)
        shouldAdd = currentDate.getDay() > 0 && currentDate.getDay() < 6;
        break;
      case 'weekends':
        // Saturday and Sunday
        shouldAdd = currentDate.getDay() === 0 || currentDate.getDay() === 6;
        break;
      case 'monthly':
        // Same day of the month
        shouldAdd = currentDate.getDate() === baseDate.getDate();
        break;
      case 'yearly':
        // Same day and month
        shouldAdd = 
          currentDate.getDate() === baseDate.getDate() && 
          currentDate.getMonth() === baseDate.getMonth();
        break;
    }
    
    if (shouldAdd) {
      additionalEvents.push({
        ...event,
        id: `${event.id}-${currentDate.toISOString().split('T')[0]}`,
        date: currentDate.toISOString().split('T')[0],
        isRecurrenceInstance: true
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return additionalEvents;
};

// Get events for specific date
export const getEventsForDate = async (userId: string, date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Get original events on this date
  const { data: originalEvents, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr);
    
  if (error) throw error;
  
  // Get recurring events that might occur on this date
  const { data: recurringEvents } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .eq('is_recurring', true);
  
  const recurringInstancesForDate = [];
  
  // For each recurring event, check if it occurs on the specified date
  for (const event of recurringEvents || []) {
    const baseDate = new Date(event.date);
    const targetDate = new Date(date);
    let shouldInclude = false;
    
    switch (event.recurrence_type) {
      case 'daily':
        shouldInclude = true;
        break;
      case 'weekly':
        shouldInclude = targetDate.getDay() === baseDate.getDay();
        break;
      case 'weekdays':
        shouldInclude = targetDate.getDay() > 0 && targetDate.getDay() < 6;
        break;
      case 'weekends':
        shouldInclude = targetDate.getDay() === 0 || targetDate.getDay() === 6;
        break;
      case 'monthly':
        shouldInclude = targetDate.getDate() === baseDate.getDate();
        break;
      case 'yearly':
        shouldInclude = 
          targetDate.getDate() === baseDate.getDate() && 
          targetDate.getMonth() === baseDate.getMonth();
        break;
    }
    
    // Check if the date is after the original event date
    const isAfterOriginal = targetDate > baseDate;
    
    // Check if the date is before the recurring end date (if specified)
    const isBeforeEnd = !event.recurring_end_date || 
      targetDate <= new Date(event.recurring_end_date);
    
    if (shouldInclude && isAfterOriginal && isBeforeEnd) {
      recurringInstancesForDate.push({
        ...event,
        id: `${event.id}-${dateStr}`,
        date: dateStr,
        isRecurrenceInstance: true
      });
    }
  }
  
  return [...(originalEvents || []), ...recurringInstancesForDate];
};

// Calculate income from events
export const calculateIncomeFromEvents = async (userId: string, startDate: Date, endDate: Date) => {
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');
  
  // Get all events in date range (including recurring instances)
  const events = await fetchEvents(userId, 12, { start: startDate, end: endDate });
  
  if (!events || events.length === 0) return 0;
  
  // Get user's default hourly rate
  const { data: user } = await supabase
    .from('users')
    .select('default_hourly_rate')
    .eq('id', userId)
    .single();
    
  const defaultRate = user?.default_hourly_rate || 15;
  
  // Calculate total income from all event instances (original + recurring)
  const totalIncome = events.reduce((total, event) => {
    // Skip events outside the date range
    const eventDate = new Date(event.date);
    if (eventDate < startDate || eventDate > endDate) return total;
    
    // Calculate duration
    const startTimeParts = event.start_time.split(':').map(Number);
    const endTimeParts = event.end_time.split(':').map(Number);
    
    let hours = endTimeParts[0] - startTimeParts[0];
    let minutes = endTimeParts[1] - startTimeParts[1];
    
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    const duration = hours + (minutes / 60);
    const hourlyRate = event.hourly_rate || defaultRate;
    
    // Only count paid events
    if (event.is_paid) {
      return total + (duration * hourlyRate);
    }
    
    return total;
  }, 0);
  
  return totalIncome;
};

// Calculate monthly income
export const calculateMonthlyIncome = async (userId: string, month: number, year: number) => {
  const startDate = new Date(year, month, 1); // First day of the month
  const endDate = new Date(year, month + 1, 0); // Last day of the month
  
  return calculateIncomeFromEvents(userId, startDate, endDate);
};
