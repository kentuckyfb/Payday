
import React, { useEffect, useState } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/ui/StatCard";
import EventCard from "@/components/ui/EventCard";
import PlaceholderMessage from "@/components/budget/PlaceholderMessage";
import { 
  Calendar, 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  Clock, 
  Plus, 
  ArrowRight,
  CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchEvents } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface FinancialData {
  thisWeek: number;
  thisMonth: number;
  workingHours: number;
  forecast: number;
  income: number;
  expenses: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialData>({
    thisWeek: 0,
    thisMonth: 0,
    workingHours: 0,
    forecast: 0,
    income: 0,
    expenses: 0
  });

  // Load data
  const loadData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch events from Supabase
      const eventsData = await fetchEvents(user.id);
      
      // Transform events data
      const transformedEvents = eventsData.map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
        startTime: event.start_time.substring(0, 5),
        endTime: event.end_time.substring(0, 5),
        wage: event.hourly_rate,
        tags: event.tags || [],
        isRecurring: event.is_recurring,
        rawDate: event.date // Keep raw date for calculations
      }));
      
      // Sort events by date
      transformedEvents.sort((a, b) => {
        return new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime();
      });
      
      setEvents(transformedEvents);
      
      // Calculate financial data based on events
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Default hourly rate for work events without specific wage
      const defaultHourlyRate = 15;
      
      // Function to calculate hours between two times
      const calculateHours = (start: string, end: string) => {
        const [startHour, startMin] = start.split(":").map(Number);
        const [endHour, endMin] = end.split(":").map(Number);
        return (endHour - startHour) + (endMin - startMin) / 60;
      };
      
      let weeklyEarnings = 0;
      let monthlyEarnings = 0;
      let totalHours = 0;
      let totalExpenses = 0;
      
      eventsData.forEach(event => {
        const eventDate = new Date(event.date);
        const hours = calculateHours(event.start_time, event.end_time);
        
        // Only count work events with wage or "Work" tag
        const isWorkEvent = event.tags && event.tags.includes("Work");
        
        if (isWorkEvent && event.hourly_rate) {
          if (eventDate >= oneWeekAgo && eventDate <= now) {
            weeklyEarnings += event.hourly_rate * hours;
            totalHours += hours;
          }
          
          if (eventDate >= startOfMonth && eventDate <= now) {
            monthlyEarnings += event.hourly_rate * hours;
          }
        } else if (isWorkEvent && !event.hourly_rate) {
          // Use default hourly rate for work events without specific wage
          if (eventDate >= oneWeekAgo && eventDate <= now) {
            weeklyEarnings += defaultHourlyRate * hours;
            totalHours += hours;
          }
          
          if (eventDate >= startOfMonth && eventDate <= now) {
            monthlyEarnings += defaultHourlyRate * hours;
          }
        }
      });
      
      // Calculate forecast (simple projection based on current month earnings)
      const dayOfMonth = now.getDate();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const forecastMultiplier = daysInMonth / dayOfMonth;
      const forecastedEarnings = monthlyEarnings * forecastMultiplier;
      
      // Fetch expenses (to be implemented with expenses functionality)
      // For now, we'll estimate expenses as a percentage of income
      totalExpenses = monthlyEarnings * 0.4; // Mock data: 40% of income used for expenses
      
      setFinancialData({
        thisWeek: parseFloat(weeklyEarnings.toFixed(2)),
        thisMonth: parseFloat(monthlyEarnings.toFixed(2)),
        workingHours: Math.round(totalHours),
        forecast: Math.round(forecastedEarnings),
        income: parseFloat(monthlyEarnings.toFixed(2)),
        expenses: parseFloat(totalExpenses.toFixed(2))
      });
    } catch (error: any) {
      console.error("Error loading data:", error.message);
      toast.error(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up an event listener for data updates
    const handleDataUpdate = () => {
      loadData();
    };
    
    window.addEventListener('appDataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('appDataUpdated', handleDataUpdate);
    };
  }, [user]);

  // Get future events (today and onwards)
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.rawDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    })
    .slice(0, 3); // Limit to 3 upcoming events

  return (
    <AppLayout>
      {/* Welcome Section */}
      <section className="mb-6 mt-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-gray-400">Here's your financial summary</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-payday-purple/20 text-payday-purple-light"
            onClick={() => navigate("/events/new")}
          >
            <Plus size={20} />
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-payday-purple"></div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <section className="mb-6 grid grid-cols-2 gap-3">
            <StatCard
              title="This Week"
              value={`$${financialData.thisWeek.toFixed(2)}`}
              icon={<DollarSign size={20} />}
            />
            <StatCard
              title="This Month"
              value={`$${financialData.thisMonth.toFixed(2)}`}
              icon={<Wallet size={20} />}
            />
            <StatCard
              title="Working Hours"
              value={`${financialData.workingHours}h`}
              icon={<Clock size={20} />}
            />
            <StatCard
              title="Forecast"
              value={`$${financialData.forecast}`}
              icon={<TrendingUp size={20} />}
            />
          </section>

          {/* Upcoming Events */}
          <section className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Upcoming Events</h2>
              <Button 
                variant="ghost" 
                className="text-payday-purple-light px-0 flex items-center"
                onClick={() => navigate("/calendar")}
              >
                <span>View Calendar</span>
                <ArrowRight size={16} className="ml-1" />
              </Button>
            </div>
            
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  {...event}
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              ))
            ) : (
              <PlaceholderMessage 
                icon={<CalendarDays size={40} />}
                message="No upcoming events"
                subMessage="Add an event to get started"
              />
            )}
          </section>

          {/* Monthly Overview */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Monthly Overview</h2>
            <Card className="glass-card p-4">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm">Income</p>
                  <p className="text-lg font-bold text-green-400">${financialData.income.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Expenses</p>
                  <p className="text-lg font-bold text-red-400">${financialData.expenses.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Balance</p>
                  <p className="text-lg font-bold">${(financialData.income - financialData.expenses).toFixed(2)}</p>
                </div>
              </div>
              
              {/* Simplified visualization */}
              <div className="h-4 bg-payday-dark-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-payday-purple to-payday-purple-light"
                  style={{ width: `${Math.min(100, (financialData.income / (financialData.income + financialData.expenses)) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">0%</span>
                <span className="text-xs text-gray-400">50%</span>
                <span className="text-xs text-gray-400">100%</span>
              </div>
            </Card>
          </section>

          {/* Quick Links */}
          <section className="grid grid-cols-3 gap-3 mb-10">
            <Button
              variant="outline"
              className="flex flex-col items-center glass-card h-24 border-white/10 transition-transform hover:scale-105"
              onClick={() => navigate("/events/new")}
            >
              <Plus size={20} className="mb-2 text-payday-purple" />
              <span className="text-xs text-center">New Event</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center glass-card h-24 border-white/10 transition-transform hover:scale-105"
              onClick={() => navigate("/budget")}
            >
              <Wallet size={20} className="mb-2 text-payday-purple" />
              <span className="text-xs text-center">Manage Budget</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col items-center glass-card h-24 border-white/10 transition-transform hover:scale-105"
              onClick={() => navigate("/analytics")}
            >
              <TrendingUp size={20} className="mb-2 text-payday-purple" />
              <span className="text-xs text-center">Analytics</span>
            </Button>
          </section>
        </>
      )}
    </AppLayout>
  );
};

export default Dashboard;
