
import React from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles } from "lucide-react";

interface ForecastData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

interface ForecastChartProps {
  forecastData: ForecastData[];
}

const ForecastChart: React.FC<ForecastChartProps> = ({ forecastData }) => {
  return (
    <Card className="glass-card p-4 mb-6">
      <div className="flex items-center mb-4">
        <Sparkles size={20} className="text-payday-purple-light mr-2" />
        <h3 className="text-sm font-semibold">3-Month Forecast</h3>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip 
              contentStyle={{ backgroundColor: "#221F26", borderColor: "#6E59A5", color: "#fff" }}
              formatter={(value) => [`$${value}`, ""]}
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#9b87f5" 
              strokeWidth={2}
              dot={{ r: 4, fill: "#9b87f5" }}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#f87171" 
              strokeWidth={2}
              dot={{ r: 4, fill: "#f87171" }}
              name="Expenses"
            />
            <Line 
              type="monotone" 
              dataKey="savings" 
              stroke="#34d399" 
              strokeWidth={2}
              dot={{ r: 4, fill: "#34d399" }}
              name="Savings"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ForecastChart;
