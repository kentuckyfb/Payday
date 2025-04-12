
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Category {
  name: string;
  color: string;
  budget: number;
  spent: number;
}

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  expenseCategory: string;
  setExpenseCategory: (category: string) => void;
  expenseAmount: string;
  setExpenseAmount: (amount: string) => void;
  expenseDescription: string;
  setExpenseDescription: (description: string) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AddExpenseDialog: React.FC<AddExpenseDialogProps> = ({
  open,
  onOpenChange,
  categories,
  expenseCategory,
  setExpenseCategory,
  expenseAmount,
  setExpenseAmount,
  expenseDescription,
  setExpenseDescription,
  dueDate,
  setDueDate,
  onSubmit,
}) => {
  const today = new Date();
  // Calculate if expense is completed or pending based on the due date
  const expenseStatus = dueDate && dueDate <= today ? 'completed' : 'pending';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-payday-dark border-payday-purple/30 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription className="text-gray-400">
            Track your spending by adding expenses
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="expense-category">Category</Label>
              <Select 
                value={expenseCategory} 
                onValueChange={setExpenseCategory}
                required
              >
                <SelectTrigger className="bg-payday-dark-secondary border-payday-purple/30">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-payday-dark border-payday-purple/30 text-white">
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: category.color }}></span>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="expense-amount">Amount ($)</Label>
              <Input
                id="expense-amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                className="bg-payday-dark-secondary border-payday-purple/30"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="expense-description">Description</Label>
              <Input
                id="expense-description"
                placeholder="What did you spend on?"
                className="bg-payday-dark-secondary border-payday-purple/30"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Due Date (Optional)</Label>
                {dueDate && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      expenseStatus === 'completed' 
                        ? 'border-green-500 text-green-400' 
                        : 'border-amber-500 text-amber-400'
                    }`}
                  >
                    <Clock size={12} className="mr-1" />
                    {format(dueDate, "MMM d, yyyy")}
                    {expenseStatus === 'completed' ? ' (Completed)' : ' (Pending)'}
                  </Badge>
                )}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-payday-dark-secondary border-payday-purple/30",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Set due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-payday-dark border-payday-purple/30" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="bg-payday-dark text-white"
                  />
                  {dueDate && (
                    <div className="p-2 border-t border-payday-purple/30 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDueDate(undefined)}
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-400 mt-1">
                {dueDate 
                  ? dueDate <= today 
                    ? "Date is today or in the past - will be marked as completed" 
                    : "Future date - will be marked as pending until completed"
                  : "Expenses with due dates will be marked as pending or completed based on the date"}
              </p>
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
              type="submit"
              className="bg-payday-purple hover:bg-payday-purple-dark"
            >
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseDialog;
