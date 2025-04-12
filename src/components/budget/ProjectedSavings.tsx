
import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ProjectedSavingsProps {
  savings: number;
}

const ProjectedSavings: React.FC<ProjectedSavingsProps> = ({ savings }) => {
  return (
    <Card className="glass-card p-4 mb-6">
      <div className="flex items-center mb-4">
        <TrendingUp size={20} className="text-payday-purple-light mr-2" />
        <h3 className="text-sm font-semibold">Projected Savings</h3>
      </div>
      
      <div className="flex items-center justify-between p-2 border-b border-white/10 mb-2">
        <span>By end of month</span>
        <span className="font-semibold text-green-400">${savings}</span>
      </div>
      <div className="flex items-center justify-between p-2 border-b border-white/10 mb-2">
        <span>3 months</span>
        <span className="font-semibold text-green-400">${savings * 3}</span>
      </div>
      <div className="flex items-center justify-between p-2 border-b border-white/10 mb-2">
        <span>6 months</span>
        <span className="font-semibold text-green-400">${savings * 6}</span>
      </div>
      <div className="flex items-center justify-between p-2">
        <span>12 months</span>
        <span className="font-semibold text-green-400">${savings * 12}</span>
      </div>
    </Card>
  );
};

export default ProjectedSavings;
