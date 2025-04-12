
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Settings } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ExpensesList from "@/components/budget/ExpensesList";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { fetchBudgetSettings, createOrUpdateBudgetSettings, fetchExpenses, createExpense, markExpenseCompleted, deleteExpense, calculateIncomeFromEvents } from "@/services";
import { BudgetCategory, Expense, ExpenseStatus } from "@/types/app";
import BudgetOverview from "@/components/budget/BudgetOverview";

const Budget = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [income, setIncome] = useState<number>(0);
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { name: "Food", color: "#EF4444", budget: 0, spent: 0 },
    { name: "Transportation", color: "#3B82F6", budget: 0, spent: 0 },
    { name: "Entertainment", color: "#10B981", budget: 0, spent: 0 },
    { name: "Utilities", color: "#A855F7", budget: 0, spent: 0 },
    { name: "Rent", color: "#F59E0B", budget: 0, spent: 0 },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategory, setExpenseCategory] = useState<string>("");
  const [expenseDescription, setExpenseDescription] = useState<string>("");
  const [amount, setAmount] = useState<number | string>(0);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingExpense, setAddingExpense] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    getBudgetData();
    
    // Listen for income updates from BudgetOverview component
    const handleIncomeUpdate = (event: CustomEvent) => {
      if (event.detail && typeof event.detail.income === 'number') {
        setIncome(event.detail.income);
      }
    };
    
    window.addEventListener('incomeUpdated', handleIncomeUpdate as EventListener);
    return () => {
      window.removeEventListener('incomeUpdated', handleIncomeUpdate as EventListener);
    };
  }, [user]);
  
  const getBudgetData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Fetch budget settings
      const budgetSettings = await fetchBudgetSettings(user.id);
      if (budgetSettings) {
        setIncome(budgetSettings.income || 0);
        
        // Transform string categories to BudgetCategory objects if needed
        if (budgetSettings.categories && Array.isArray(budgetSettings.categories)) {
          // Check if we received an array of strings or already formatted objects
          if (budgetSettings.categories.length > 0 && typeof budgetSettings.categories[0] === 'string') {
            // Convert string array to BudgetCategory objects
            const categoryObjects = budgetSettings.categories.map((catName: string) => {
              // Find if this category exists in our default list to get its color
              const existingCategory = categories.find(c => c.name === catName);
              return {
                name: catName,
                color: existingCategory?.color || getRandomColor(),
                budget: 0,
                spent: 0
              };
            });
            setCategories(categoryObjects);
          } else {
            // It's already the right format
            setCategories(budgetSettings.categories as unknown as BudgetCategory[]);
          }
        }
      } else {
        // If no budget settings exist, initialize with calculated income
        await initializeWithCalculatedIncome();
      }
      
      // Fetch expenses
      const expensesData = await fetchExpenses(user.id);
      // Need to map database expenses to our Expense type to ensure correct status typing
      const typedExpenses: Expense[] = expensesData.map(expense => ({
        ...expense,
        status: (expense.status as ExpenseStatus) || 'pending'
      }));
      setExpenses(typedExpenses);
    } catch (error: any) {
      console.error("Error fetching budget data:", error);
      toast.error(`Failed to load budget data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize budget with calculated income
  const initializeWithCalculatedIncome = async () => {
    if (!user) return;
    
    try {
      // Get current month's start and end dates
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Calculate income from paid events
      const calculatedIncome = await calculateIncomeFromEvents(user.id, firstDay, lastDay);
      if (calculatedIncome > 0) {
        setIncome(calculatedIncome);
        
        // Save the calculated income to budget settings
        await createOrUpdateBudgetSettings({
          income: calculatedIncome,
          categories: categories,
        }, user.id);
      }
    } catch (error) {
      console.error("Error initializing with calculated income:", error);
    }
  };
  
  // Helper function to generate a random color when needed
  const getRandomColor = (): string => {
    const colors = ["#EF4444", "#3B82F6", "#10B981", "#A855F7", "#F59E0B", "#EC4899", "#6366F1"];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const handleUpdateIncome = (newIncome: number) => {
    setIncome(newIncome);
    if (user) {
      // Save the new income value to the database
      createOrUpdateBudgetSettings({
        income: newIncome,
        categories: categories,
      }, user.id).catch(error => {
        console.error("Error updating income:", error);
      });
    }
  };
  
  const handleSaveSettings = async () => {
    if (!user) return;
    
    setSaving(true);
    
    try {
      await createOrUpdateBudgetSettings({
        income: income,
        categories: categories,
      }, user.id);
      
      toast.success("Budget settings saved successfully");
      setShowSettings(false);
      
      // Refresh data
      getBudgetData();
    } catch (error: any) {
      console.error("Error saving budget settings:", error);
      toast.error(`Failed to save budget settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddExpense = async () => {
    if (!user) return;
    
    if (!expenseCategory) {
      toast.error('Please select a category');
      return;
    }
    
    if (!expenseDescription) {
      toast.error('Please enter a description');
      return;
    }
    
    if (!amount || (typeof amount === 'number' && amount <= 0) || (typeof amount === 'string' && parseFloat(amount) <= 0)) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setAddingExpense(true);
    
    try {
      // Convert amount to number to ensure it's stored as a number
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      await createExpense({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        category: expenseCategory,
        amount: numericAmount,  // Make sure this is a number
        description: expenseDescription,
        status: 'pending' as ExpenseStatus,
        due_date: dueDate ? dueDate.toISOString().split('T')[0] : null
      }, user.id);
      
      // Reset form
      setExpenseCategory('');
      setExpenseDescription('');
      setAmount(0);
      setDueDate(null);
      setShowAddExpenseForm(false);
      
      // Refresh data
      getBudgetData();
      
      toast.success('Expense added successfully');
    } catch (error: any) {
      console.error('Error adding expense:', error);
      toast.error(`Failed to add expense: ${error.message}`);
    } finally {
      setAddingExpense(false);
    }
  };

  const handleMarkCompleted = async (id: string) => {
    if (!user) return;
    
    try {
      await markExpenseCompleted(id, user.id);
      getBudgetData();
      toast.success('Expense marked as completed');
    } catch (error: any) {
      console.error('Error marking expense as completed:', error);
      toast.error(`Failed to update expense: ${error.message}`);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteExpense(id, user.id);
      getBudgetData();
      toast.success('Expense deleted successfully');
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      toast.error(`Failed to delete expense: ${error.message}`);
    }
  };
  
  const totalBudget = categories.reduce((sum, category) => sum + category.budget, 0);
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = income - totalSpent;
  const expensePercentage = income > 0 ? Math.round((totalSpent / income) * 100) : 0;
  const savingsPercentage = income > 0 ? Math.round((remainingBudget / income) * 100) : 0;
  
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Budget</h1>
        <Button 
          variant="ghost" 
          className="h-8 text-payday-purple-light"
          onClick={() => setShowSettings(true)}
        >
          <Settings size={16} className="mr-2" />
          Settings
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-payday-purple"></div>
        </div>
      ) : (
        <>
          <BudgetOverview
            income={income}
            totalSpent={totalSpent}
            savings={remainingBudget}
            expensePercentage={expensePercentage}
            savingsPercentage={savingsPercentage}
            onIncomeUpdate={handleUpdateIncome}
          />
          
          <ExpensesList 
            expenses={expenses} 
            onAddExpense={() => setShowAddExpenseForm(true)}
            onDeleteExpense={handleDeleteExpense}
            onMarkCompleted={handleMarkCompleted}
          />
        </>
      )}
      
      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-payday-dark-secondary border-payday-purple/30">
          <DialogHeader>
            <DialogTitle>Budget Settings</DialogTitle>
            <DialogDescription>
              Manage your income and budget categories.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="income" className="text-right">
                Income
              </Label>
              <Input 
                id="income" 
                value={income} 
                onChange={(e) => setIncome(parseFloat(e.target.value) || 0)} 
                className="col-span-3" 
                type="number"
              />
            </div>
            
            <h3 className="text-sm font-medium">Categories</h3>
            {categories.map((category, index) => (
              <div key={index} className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor={`category-name-${index}`} className="text-right">
                  {category.name}
                </Label>
                <Input 
                  id={`category-name-${index}`} 
                  value={category.budget} 
                  onChange={(e) => {
                    const newCategories = [...categories];
                    newCategories[index].budget = parseFloat(e.target.value) || 0;
                    setCategories(newCategories);
                  }} 
                  className="col-span-3" 
                  type="number"
                />
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Expense Modal */}
      <Dialog open={showAddExpenseForm} onOpenChange={setShowAddExpenseForm}>
        <DialogContent className="bg-payday-dark-secondary border-payday-purple/30">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>
              Add a new expense to your budget.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select onValueChange={setExpenseCategory}>
                <SelectTrigger className="col-span-3 bg-payday-dark-secondary border-payday-purple/30">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-payday-dark border-payday-purple/30">
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input 
                id="description" 
                value={expenseDescription} 
                onChange={(e) => setExpenseDescription(e.target.value)} 
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input 
                id="amount" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3" 
                type="number"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due-date" className="text-right">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowAddExpenseForm(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddExpense} disabled={addingExpense}>
              {addingExpense ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Adding...
                </div>
              ) : (
                "Add Expense"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Budget;

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
