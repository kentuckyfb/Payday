
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { useNavigate, useParams } from "react-router-dom";
import { fetchEvent } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  Repeat,
  DollarSign,
  FileText,
  Pencil,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import DeleteEventDialog from "@/components/events/DeleteEventDialog";
import type { Event } from "@/types/app";

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    const loadEvent = async () => {
      if (!id || !user) return;
      
      try {
        setLoading(true);
        const eventData = await fetchEvent(id, user.id);
        setEvent(eventData as Event);
      } catch (error: any) {
        console.error("Event loading error:", error);
        toast.error(`Error loading event: ${error.message}`);
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    
    loadEvent();
  }, [id, user, navigate]);
  
  const handleDeleteEvent = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleEventDeleted = () => {
    navigate("/events");
    window.dispatchEvent(new Event('appDataUpdated'));
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-payday-purple"></div>
        </div>
      </AppLayout>
    );
  }
  
  if (!event) {
    return (
      <AppLayout>
        <div className="text-center py-8">
          <p>Event not found</p>
          <Button 
            variant="link" 
            onClick={() => navigate("/events")}
            className="mt-4"
          >
            Back to Events
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${event.start_time}`);
    const end = new Date(`2000-01-01T${event.end_time}`);
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    return durationHours.toFixed(1);
  };
  
  const calculateEarnings = () => {
    if (!event.hourly_rate) return null;
    const hours = parseFloat(calculateDuration());
    return (hours * event.hourly_rate).toFixed(2);
  };
  
  // Use date-fns to format the date
  let formattedDate;
  try {
    // Ensure the date is properly formatted before parsing
    formattedDate = format(parseISO(event.date), 'EEEE, MMMM d, yyyy');
  } catch (error) {
    // Fallback if there's an issue with date formatting
    formattedDate = event.date;
  }
  
  return (
    <AppLayout>
      <div className="mb-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">{event.title}</h1>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2">
        {event.is_recurring && (
          <Badge className="bg-payday-purple">
            Recurring
          </Badge>
        )}
        {event.is_paid && (
          <Badge className="bg-green-600">
            Paid
          </Badge>
        )}
        {event.tags && event.tags.map((tag: string) => (
          <Badge key={tag} variant="outline" className="border-payday-purple/30">
            {tag}
          </Badge>
        ))}
      </div>
      
      <div className="grid gap-4 mb-6">
        <Card className="glass-card p-4">
          <div className="flex items-center mb-3">
            <CalendarIcon size={18} className="mr-2 text-payday-purple-light" />
            <span className="font-medium">Date</span>
          </div>
          <p>{formattedDate}</p>
        </Card>
        
        <Card className="glass-card p-4">
          <div className="flex items-center mb-3">
            <Clock size={18} className="mr-2 text-payday-purple-light" />
            <span className="font-medium">Time</span>
          </div>
          <p>
            {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)} 
            <span className="text-gray-400 ml-2">({calculateDuration()} hours)</span>
          </p>
        </Card>
        
        {event.is_recurring && (
          <Card className="glass-card p-4">
            <div className="flex items-center mb-3">
              <Repeat size={18} className="mr-2 text-payday-purple-light" />
              <span className="font-medium">Recurrence</span>
            </div>
            <p className="capitalize">{event.recurrence_type}</p>
            {event.recurring_end_date && (
              <p className="text-sm text-gray-400 mt-1">
                Until {format(parseISO(event.recurring_end_date), 'MMMM d, yyyy')}
              </p>
            )}
          </Card>
        )}
        
        {event.is_paid && (
          <Card className="glass-card p-4">
            <div className="flex items-center mb-3">
              <DollarSign size={18} className="mr-2 text-payday-purple-light" />
              <span className="font-medium">Payment</span>
            </div>
            <p>
              ${event.hourly_rate}/hour 
              <span className="text-gray-400 ml-2">(Total: ${calculateEarnings()})</span>
            </p>
          </Card>
        )}
        
        {event.description && (
          <Card className="glass-card p-4">
            <div className="flex items-center mb-3">
              <FileText size={18} className="mr-2 text-payday-purple-light" />
              <span className="font-medium">Description</span>
            </div>
            <p className="whitespace-pre-wrap">{event.description}</p>
          </Card>
        )}
      </div>
      
      <div className="flex gap-4 mb-10">
        <Button
          variant="outline"
          className="flex-1 border-payday-purple/30"
          onClick={() => navigate(`/events/${event.id}/edit`)}
        >
          <Pencil size={16} className="mr-2" />
          Edit
        </Button>
        <Button 
          variant="destructive" 
          className="flex-1"
          onClick={handleDeleteEvent}
        >
          <Trash2 size={16} className="mr-2" />
          Delete
        </Button>
      </div>
      
      <DeleteEventDialog 
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        event={event}
        onEventDeleted={handleEventDeleted}
      />
    </AppLayout>
  );
};

export default EventDetail;
