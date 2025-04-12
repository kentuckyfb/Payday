
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { BugIcon, Send } from "lucide-react";

interface BugReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BugReportDialog: React.FC<BugReportDialogProps> = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both a title and description");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // In a real application, you would send this data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Bug report submitted successfully", {
        description: "Thank you for helping us improve Payday!",
      });
      
      // Reset form and close dialog
      setTitle("");
      setDescription("");
      onOpenChange(false);
      
    } catch (error) {
      toast.error("Failed to submit bug report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-payday-dark-secondary border-payday-purple/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BugIcon size={18} className="text-payday-purple-light" />
            Report a Bug
          </DialogTitle>
          <DialogDescription>
            Help us improve Payday by reporting any issues you encounter.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bug-title">Issue Title</Label>
            <Input
              id="bug-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              className="bg-payday-dark border-payday-purple/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bug-description">Description</Label>
            <Textarea
              id="bug-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about what happened and steps to reproduce"
              rows={5}
              className="bg-payday-dark border-payday-purple/30"
            />
          </div>

          <DialogFooter className="sm:justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-payday-purple/30"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-payday-purple hover:bg-payday-purple-dark flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Report
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BugReportDialog;
