
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Wallet } from "lucide-react";
import { BudgetCategory } from "@/types/app";

interface BudgetCategoriesProps {
  categories: BudgetCategory[];
}

const BudgetCategories: React.FC<BudgetCategoriesProps> = ({ categories }) => {
  return (
    <>
      {categories.length > 0 ? (
        categories.map((category, index) => (
          <Card key={index} className="glass-card p-4 mb-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <p className="font-medium">{category.name}</p>
              </div>
              <p className="text-right">
                <span className="font-bold">${category.spent}</span>
                <span className="text-gray-400 text-sm ml-1">/ ${category.budget}</span>
              </p>
            </div>
            
            <div className="w-full bg-payday-dark-secondary rounded-full h-2 mb-1">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${category.budget > 0 ? Math.min(100, (category.spent / category.budget) * 100) : 0}%`,
                  backgroundColor: category.color
                }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>
                {category.budget > 0 ? Math.round((category.spent / category.budget) * 100) : 0}% used
              </span>
              <span>
                ${category.budget - category.spent} left
              </span>
            </div>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Wallet size={40} className="mx-auto mb-2 opacity-50" />
          <p>No budget categories yet</p>
          <p className="text-sm mt-1">Add a category to get started</p>
        </div>
      )}
      
      <Button 
        variant="outline" 
        className="w-full mt-4 border-dashed border-payday-purple/30"
      >
        <PlusCircle size={16} className="mr-2 text-payday-purple-light" />
        Add Budget Category
      </Button>
    </>
  );
};

export default BudgetCategories;
