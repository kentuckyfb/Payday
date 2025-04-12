
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, ShoppingCart, Wallet, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { calculateIncomeFromEvents } from "@/services";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BudgetOverviewProps {
  income: number;
  totalSpent: number;
  savings: number;
  expensePercentage: number;
  savingsPercentage: number;
  onIncomeUpdate?: (newIncome: number) => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  income,
  totalSpent,
  savings,
  expensePercentage,
  savingsPercentage,
  onIncomeUpdate,
}) => {
  const { user } = useAuth();
  const [calculatedIncome, setCalculatedIncome] = useState<number | null>(null);
  const [isUsingCalculated, setIsUsingCalculated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const updatePaidEventsIncome = async () => {
      if (!user) return;
      setIsLoading(true);
      
      // Get current month's start and end dates
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      try {
        // Calculate income from paid events
        const eventIncome = await calculateIncomeFromEvents(user.id, firstDay, lastDay);
        setCalculatedIncome(eventIncome);
        
        // If this is the first load and the manual income is 0, use the calculated income
        if (income === 0 && eventIncome > 0 && !isUsingCalculated) {
          setIsUsingCalculated(true);
          if (onIncomeUpdate) {
            onIncomeUpdate(eventIncome);
          }
          
          // Dispatch an event to notify the budget page that income has been updated
          const incomeUpdateEvent = new CustomEvent('incomeUpdated', { 
            detail: { income: eventIncome } 
          });
          window.dispatchEvent(incomeUpdateEvent);
        }
      } catch (error) {
        console.error("Error calculating income from events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    updatePaidEventsIncome();
    
    // Listen for data updates
    const handleDataUpdate = () => {
      updatePaidEventsIncome();
    };
    
    window.addEventListener('appDataUpdated', handleDataUpdate);
    return () => {
      window.removeEventListener('appDataUpdated', handleDataUpdate);
    };
  }, [user, income, onIncomeUpdate, isUsingCalculated]);
  
  const handleUseCalculatedIncome = () => {
    if (calculatedIncome !== null && onIncomeUpdate) {
      setIsUsingCalculated(true);
      onIncomeUpdate(calculatedIncome);
      toast.success("Using income from paid events");
    }
  };
  
  // Use the manual income value as the primary display value
  const displayIncome = income;
  const displaySavings = income - totalSpent;
  const displaySavingsPercentage = income > 0 
    ? Math.round((income - totalSpent) / income * 100)
    : savingsPercentage;
  
  return (
    <Card className="glass-card p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Monthly Overview</h2>
        <span className="text-sm text-gray-400">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <DollarSign size={20} className="text-green-400" />
          </div>
          <p className="text-sm text-gray-400">Income</p>
          <p className="text-xl font-bold text-green-400">${displayIncome.toFixed(2)}</p>
          
          {calculatedIncome !== null && calculatedIncome !== income && (
            <div className="mt-1">
              <p className="text-xs text-gray-400">
                Calculated: ${calculatedIncome.toFixed(2)}
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs mt-1 h-7 text-payday-purple-light"
                onClick={handleUseCalculatedIncome}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-current mr-1"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <RefreshCw size={12} className="mr-1" />
                    <span>Use calculated</span>
                  </div>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <ShoppingCart size={20} className="text-red-400" />
          </div>
          <p className="text-sm text-gray-400">Expenses</p>
          <p className="text-xl font-bold text-red-400">${totalSpent.toFixed(2)}</p>
        </div>
        
        <div className="text-center">
          <div className="flex justify-center mb-1">
            <Wallet size={20} className="text-payday-purple-light" />
          </div>
          <p className="text-sm text-gray-400">Balance</p>
          <p className="text-xl font-bold text-payday-purple-light">${displaySavings.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm">Budget Usage</p>
          <p className="text-sm">{expensePercentage}%</p>
        </div>
        <Progress value={expensePercentage} className="h-2" />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm">Savings Goal</p>
          <p className="text-sm">{displaySavingsPercentage}%</p>
        </div>
        <Progress value={displaySavingsPercentage} className="h-2 bg-payday-dark-secondary [&>div]:bg-green-400" />
      </div>
    </Card>
  );
};

export default BudgetOverview;
