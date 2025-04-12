
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, Trash2, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CategoryBadge from "@/components/ui/CategoryBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Expense } from "@/types/app";

interface ExpensesListProps {
  expenses: Expense[];
  onAddExpense: () => void;
  onDeleteExpense: (id: string) => Promise<void>;
  onMarkCompleted: (id: string) => Promise<void>;
}

const ExpensesList: React.FC<ExpensesListProps> = ({ 
  expenses, 
  onAddExpense, 
  onDeleteExpense,
  onMarkCompleted 
}) => {
  const [activeTab, setActiveTab] = useState("pending");
  
  const pendingExpenses = expenses.filter(expense => expense.status !== 'completed');
  const completedExpenses = expenses.filter(expense => expense.status === 'completed');
  
  const handleDeleteExpense = async (id: string) => {
    try {
      await onDeleteExpense(id);
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };
  
  const handleMarkCompleted = async (id: string) => {
    try {
      await onMarkCompleted(id);
      toast.success("Expense marked as completed");
    } catch (error) {
      toast.error("Failed to update expense status");
    }
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Expenses</h3>
        <Button 
          variant="ghost" 
          className="h-8 text-payday-purple-light"
          onClick={onAddExpense}
        >
          <Plus size={16} className="mr-1" />
          Add
        </Button>
      </div>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-2 mb-4 bg-payday-dark-secondary">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {pendingExpenses.length > 0 ? (
            pendingExpenses.map((expense) => (
              <Card key={expense.id} className="glass-card p-3 mb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">{expense.description}</p>
                      {expense.due_date && (
                        <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500">
                          <Clock size={12} className="mr-1" />
                          Due: {new Date(expense.due_date).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="mr-2">{expense.date}</span>
                      <CategoryBadge category={expense.category} />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <p className="font-bold text-right mr-4">${expense.amount}</p>
                    <div className="flex">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                            onClick={() => handleMarkCompleted(expense.id)}
                          >
                            <CheckCircle2 size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Mark as completed</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDeleteExpense(expense.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete expense</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <ShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
              <p>No pending expenses</p>
              <p className="text-sm mt-1">All caught up!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedExpenses.length > 0 ? (
            completedExpenses.map((expense) => (
              <Card key={expense.id} className="glass-card p-3 mb-2">
                <div className="flex justify-between items-center opacity-80">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="mr-2">{expense.date}</span>
                      <CategoryBadge category={expense.category} />
                      <Badge variant="outline" className="ml-2 border-green-500 text-green-500">
                        <CheckCircle2 size={12} className="mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold text-right mr-4">${expense.amount}</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete expense</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle2 size={40} className="mx-auto mb-2 opacity-50" />
              <p>No completed expenses</p>
              <p className="text-sm mt-1">Your completed expenses will appear here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpensesList;
