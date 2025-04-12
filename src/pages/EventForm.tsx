
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createEvent, fetchEvent, updateEvent } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Event, RecurrenceType } from "@/types/app";

interface EventFormProps {}

const EventForm: React.FC<EventFormProps> = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "17:00",
    description: "",
    isRecurring: false,
    recurrenceType: "daily" as RecurrenceType,
    isPaid: false,
    hourlyRate: "50",
    tags: [] as string[],
  });
  
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [recurringEndDate, setRecurringEndDate] = useState<string | null>(null);
  
  useEffect(() => {
    const loadEvent = async () => {
      if (!isEditMode || !id || !user) return;
      
      try {
        setLoading(true);
        const event = await fetchEvent(id, user.id);
        
        if (event) {
          setFormData({
            title: event.title,
            date: event.date,
            startTime: event.start_time,
            endTime: event.end_time,
            description: event.description || "",
            isRecurring: event.is_recurring || false,
            recurrenceType: (event.recurrence_type as RecurrenceType) || "daily",
            isPaid: event.is_paid || false,
            hourlyRate: event.hourly_rate?.toString() || "50",
            tags: event.tags || [],
          });
          setAvailableTags(event.tags || []);
          setRecurringEndDate(event.recurring_end_date || null);
        }
      } catch (error: any) {
        toast.error(`Failed to load event: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadEvent();
  }, [isEditMode, id, user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag]);
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag("");
    }
  };
  
  const handleTagSelection = (tag: string) => {
    if (formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    } else {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);

      const eventData = {
        title: formData.title,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        description: formData.description,
        is_recurring: formData.isRecurring,
        recurrence_type: formData.isRecurring ? formData.recurrenceType : null,
        is_paid: formData.isPaid,
        hourly_rate: formData.isPaid ? parseFloat(formData.hourlyRate) : undefined,
        tags: formData.tags,
        recurring_end_date: recurringEndDate
      };

      if (isEditMode && id) {
        await updateEvent(id, eventData, user.id);
        toast.success("Event updated successfully");
      } else {
        await createEvent(eventData, user.id);
        toast.success("Event created successfully");
      }

      navigate(-1);
    } catch (error: any) {
      toast.error(`Failed to save event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AppLayout>
      <div className="container py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Back
          </Button>
          <h1 className="text-2xl font-bold mt-2">{isEditMode ? "Edit Event" : "New Event"}</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="bg-payday-dark-secondary border-payday-purple/30"
              placeholder="Event title"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="bg-payday-dark-secondary border-payday-purple/30"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="bg-payday-dark-secondary border-payday-purple/30"
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="bg-payday-dark-secondary border-payday-purple/30"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="bg-payday-dark-secondary border-payday-purple/30"
              placeholder="Event description"
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isRecurring">Recurring Event</Label>
              <Checkbox
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: !!checked }))}
              />
            </div>
            
            {formData.isRecurring && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="recurrenceType">Recurrence Type</Label>
                <Select 
                  value={formData.recurrenceType} 
                  onValueChange={(value) => handleSelectChange("recurrenceType", value as RecurrenceType)}
                >
                  <SelectTrigger className="bg-payday-dark-secondary border-payday-purple/30">
                    <SelectValue placeholder="Select recurrence type" />
                  </SelectTrigger>
                  <SelectContent className="bg-payday-dark border-payday-purple/30">
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="weekends">Weekends</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {formData.isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="recurringEndDate">Recurring Until</Label>
              <Input
                id="recurringEndDate"
                type="date"
                value={recurringEndDate || ''}
                onChange={(e) => setRecurringEndDate(e.target.value || null)}
                min={formData.date}
                className="bg-payday-dark-secondary border-payday-purple/30"
                placeholder="Select end date (optional)"
              />
              <p className="text-xs text-gray-400">
                If not specified, this event will recur indefinitely in the calendar.
              </p>
            </div>
          )}
          
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isPaid">Paid Event</Label>
              <Checkbox
                id="isPaid"
                name="isPaid"
                checked={formData.isPaid}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPaid: !!checked }))}
              />
            </div>
            
            {formData.isPaid && (
              <div className="space-y-2 mt-2">
                <Label htmlFor="hourlyRate">Hourly Rate</Label>
                <Input
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="bg-payday-dark-secondary border-payday-purple/30"
                  placeholder="Enter hourly rate"
                  required
                />
              </div>
            )}
          </div>
          
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={formData.tags.includes(tag) ? "default" : "outline"}
                  className={formData.tags.includes(tag)
                    ? "bg-payday-purple hover:bg-payday-purple-dark cursor-pointer"
                    : "border-payday-purple/30 text-gray-300 hover:text-white cursor-pointer"
                  }
                  onClick={() => handleTagSelection(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center">
              <Input
                type="text"
                placeholder="New tag"
                className="bg-payday-dark-secondary border-payday-purple/30 mr-2"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
                <Plus size={16} className="mr-1" />
                Add Tag
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="bg-payday-purple hover:bg-payday-purple-dark w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              "Save Event"
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default EventForm;
