
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Repeat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchEvents } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { addMonths, format } from "date-fns";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recurringDisplayPeriod, setRecurringDisplayPeriod] = useState(3); // Months to display recurring events
  const { user } = useAuth();
  
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  
  // Calculate days in month and first day of month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Calculate days from previous month to display
  const prevMonthDays = firstDayOfMonth;
  
  // Calculate days from next month to display (to fill a 6-row grid)
  const totalDaysToShow = 42; // 6 rows of 7 days
  const nextMonthDays = totalDaysToShow - daysInMonth - prevMonthDays;
  
  // Fetch events with improved recurring event handling
  const loadEvents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const eventsData = await fetchEvents(user.id, recurringDisplayPeriod);
      
      // Transform the data to match the format needed by the calendar
      const transformedEvents = eventsData.map(event => {
        const eventDate = new Date(event.date);
        
        return {
          id: event.id,
          title: event.title,
          day: eventDate.getDate(),
          month: eventDate.getMonth(),
          year: eventDate.getFullYear(),
          startTime: event.start_time.substring(0, 5),
          endTime: event.end_time.substring(0, 5),
          color: event.is_paid ? "#9b87f5" : "#6E59A5",
          isRecurring: event.is_recurring,
          recurrenceType: event.recurrence_type,
          isRecurrenceInstance: event.isRecurrenceInstance,
          recurringEndDate: event.recurring_end_date
        };
      });
      
      setEvents(transformedEvents);
    } catch (error: any) {
      console.error("Error fetching events:", error.message);
      toast.error(`Failed to load events: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadEvents();
    
    // Set up an event listener for data updates
    const handleDataUpdate = () => {
      loadEvents();
    };
    
    window.addEventListener('appDataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('appDataUpdated', handleDataUpdate);
    };
  }, [user, currentDate, recurringDisplayPeriod]);
  
  // Previous Month
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  // Next Month
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  // Handle recurring display period change
  const handleRecurringPeriodChange = (value: string) => {
    setRecurringDisplayPeriod(parseInt(value));
  };
  
  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    return events.filter(event => 
      event.day === day && 
      event.month === month && 
      event.year === year
    );
  };
  
  // Get formatted recurrence type text
  const getRecurrenceText = (type: string | null) => {
    if (!type) return "";
    
    switch (type) {
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "weekdays": return "Weekdays";
      case "weekends": return "Weekends";
      case "monthly": return "Monthly";
      case "yearly": return "Yearly";
      default: return type;
    }
  };
  
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </Button>
          <h2 className="text-lg font-semibold">
            {MONTHS[month]} {year}
          </h2>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight size={20} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-[100px] h-8 bg-payday-dark-secondary border-payday-purple/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-payday-dark border-payday-purple/30 z-50">
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            size="sm" 
            className="bg-payday-purple hover:bg-payday-purple-dark"
            onClick={() => navigate("/events/new")}
          >
            <Plus size={16} className="mr-1" />
            New
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Show recurring events for:</span>
          <Select 
            value={recurringDisplayPeriod.toString()} 
            onValueChange={handleRecurringPeriodChange}
          >
            <SelectTrigger className="w-[120px] h-8 bg-payday-dark-secondary border-payday-purple/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-payday-dark border-payday-purple/30 z-50">
              <SelectItem value="1">1 month</SelectItem>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">1 year</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-400">
            (Until {format(addMonths(new Date(), recurringDisplayPeriod), 'MMM d, yyyy')})
          </span>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-payday-purple"></div>
        </div>
      ) : (
        <div className="mb-20">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-gray-400 text-sm py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Previous month days */}
            {Array.from({ length: prevMonthDays }).map((_, i) => (
              <div 
                key={`prev-${i}`} 
                className="h-24 p-1 bg-payday-dark-secondary/50 rounded-lg opacity-30"
              >
                <span className="text-xs text-gray-500">
                  {new Date(year, month - 1, new Date(year, month, 0).getDate() - prevMonthDays + i + 1).getDate()}
                </span>
              </div>
            ))}
            
            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = 
                day === new Date().getDate() && 
                month === new Date().getMonth() && 
                year === new Date().getFullYear();
              const dayEvents = getEventsForDay(day);
              
              return (
                <div 
                  key={`current-${i}`} 
                  className={`h-24 p-1 rounded-lg transition-all cursor-pointer ${
                    isToday 
                      ? "ring-1 ring-payday-purple bg-payday-purple/10" 
                      : "bg-payday-dark-secondary/50 hover:bg-payday-dark-secondary"
                  }`}
                  onClick={() => navigate(`/calendar/day/${year}/${month + 1}/${day}`)}
                >
                  <div className="flex justify-between">
                    <span className={`text-sm font-medium ${isToday ? "text-payday-purple-light" : ""}`}>
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-xs bg-payday-purple/20 text-payday-purple-light px-1.5 rounded-full">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(event => (
                      <div 
                        key={event.id}
                        className="text-xs p-1 rounded truncate flex items-center gap-1"
                        style={{ backgroundColor: `${event.color}20`, color: event.color }}
                      >
                        {event.isRecurring && <Repeat size={10} className="flex-shrink-0" />}
                        <span className="truncate">{event.startTime} {event.title}</span>
                      </div>
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-center text-gray-400">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Next month days */}
            {Array.from({ length: nextMonthDays }).map((_, i) => (
              <div 
                key={`next-${i}`} 
                className="h-24 p-1 bg-payday-dark-secondary/50 rounded-lg opacity-30"
              >
                <span className="text-xs text-gray-500">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Calendar;
