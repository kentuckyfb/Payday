
import React from "react";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Category {
  name: string;
  color: string;
  budget: number;
  spent: number;
}

interface ExpenseChartProps {
  categories: Category[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ categories }) => {
  return (
    <Card className="glass-card p-4 mb-6">
      <h3 className="text-sm font-semibold mb-4">Expense Breakdown</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={categories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip 
              contentStyle={{ backgroundColor: "#221F26", borderColor: "#6E59A5", color: "#fff" }}
              formatter={(value) => [`$${value}`, "Amount"]}
            />
            <Bar dataKey="spent" fill="#9b87f5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ExpenseChart;
