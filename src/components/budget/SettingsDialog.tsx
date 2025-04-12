
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
  applyToAll: boolean;
  setApplyToAll: (apply: boolean) => void;
  onSave: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  hourlyRate,
  setHourlyRate,
  applyToAll,
  setApplyToAll,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-payday-dark border-payday-purple/30 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize your rate and budget settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="hourly-rate">Default Hourly Rate ($)</Label>
            <Input
              id="hourly-rate"
              type="number"
              placeholder="15.00"
              step="0.01"
              min="0.01"
              className="bg-payday-dark-secondary border-payday-purple/30"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="apply-to-all"
              checked={applyToAll}
              onChange={() => setApplyToAll(!applyToAll)}
              className="w-4 h-4 rounded border-payday-purple/30 bg-payday-dark-secondary"
            />
            <Label htmlFor="apply-to-all" className="text-sm">
              Apply to all past events (will update analytics)
            </Label>
          </div>
          
          <div className="text-xs text-gray-400 bg-payday-purple/10 p-2 rounded">
            <p>Note: Changing the hourly rate applies to future events by default. Check the box above to apply it to past events as well.</p>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="border-payday-purple/30"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            className="bg-payday-purple hover:bg-payday-purple-dark"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
