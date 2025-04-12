
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { deleteEvent } from "@/services"; // Updated import
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Event } from "@/types/app";
import { useNavigate } from "react-router-dom";

interface DeleteEventDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  event: Event | null;
  onEventDeleted: () => void;
}

const DeleteEventDialog: React.FC<DeleteEventDialogProps> = ({
  open,
  setOpen,
  event,
  onEventDeleted,
}) => {
  const [deleteOption, setDeleteOption] = useState<string>("this");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || !event) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      
      // For recurring events, we need to handle the event ID differently
      // If it's a recurrence instance, we need to extract the original ID
      const eventId = event.isRecurrenceInstance ? event.id.split('-')[0] : event.id;
      
      await deleteEvent(eventId, user.id);
      
      toast.success("Event deleted successfully");
      setOpen(false);
      onEventDeleted();
      
      // Force navigation back to events list to ensure UI is updated
      navigate('/events');
    } catch (error: any) {
      console.error("Delete event error:", error);
      toast.error(`Failed to delete event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="bg-payday-dark-secondary border-payday-purple/30">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Event</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold">{event?.title}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {event?.is_recurring && (
          <div className="my-4">
            <RadioGroup value={deleteOption} onValueChange={setDeleteOption}>
              <div className="flex items-center space-x-2 mb-2">
                <RadioGroupItem value="this" id="this" />
                <Label htmlFor="this">Delete this occurrence only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Delete the entire recurring event</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel className="border-payday-purple/30">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteEventDialog;
