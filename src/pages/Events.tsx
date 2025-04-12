
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { fetchEventsWithoutRecurringInstances } from "@/services";
import { format } from "date-fns";
import type { Event } from "@/types/app";

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await fetchEventsWithoutRecurringInstances(user.id);
        setEvents(data as Event[]);
      } catch (error: any) {
        toast.error(`Failed to load events: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    
    // Listen for data updates
    const handleDataUpdate = () => {
      console.log("Data updated event triggered, refreshing events");
      fetchEvents();
    };
    
    window.addEventListener('appDataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('appDataUpdated', handleDataUpdate);
    };
  }, [user]);

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Events</h1>
        <Button onClick={() => navigate("/events/new")} className="bg-payday-purple hover:bg-payday-purple-dark">
          <Plus size={16} className="mr-2" />
          New Event
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-payday-purple"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-gray-400 mb-4">No events found</p>
          <Button onClick={() => navigate("/events/new")} variant="outline">Create your first event</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="glass-card p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-medium">{event.title}</h2>
                <div className="flex flex-wrap gap-1">
                  {event.is_recurring && (
                    <span className="bg-payday-purple px-2 py-0.5 rounded text-xs font-medium">
                      Recurring
                    </span>
                  )}
                  {event.is_paid && (
                    <span className="bg-green-600 px-2 py-0.5 rounded text-xs font-medium">
                      Paid
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-400">
                <div className="flex items-center gap-x-4">
                  <div>{format(new Date(event.date), 'MMM d, yyyy')}</div>
                  <div>{event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}</div>
                </div>
                
                {event.is_recurring && (
                  <div className="mt-1">
                    <span className="capitalize">{event.recurrence_type}</span>
                    {event.recurring_end_date && (
                      <span className="ml-1">
                        until {format(new Date(event.recurring_end_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                )}
                
                {event.is_paid && event.hourly_rate && (
                  <div className="mt-1">
                    ${event.hourly_rate}/hr
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Events;
