
import React from "react";

interface CategoryBadgeProps {
  category: string;
  size?: "sm" | "md";
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = "md" }) => {
  const getColor = () => {
    switch (category.toLowerCase()) {
      case "food":
        return "bg-payday-purple/20 text-payday-purple-light";
      case "transport":
        return "bg-blue-500/20 text-blue-300";
      case "fun":
        return "bg-pink-500/20 text-pink-300";
      case "utilities":
        return "bg-yellow-500/20 text-yellow-300";
      case "work":
        return "bg-green-500/20 text-green-300";
      case "education":
        return "bg-orange-500/20 text-orange-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };
  
  return (
    <span className={`${size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-0.5"} rounded-full ${getColor()}`}>
      {category}
    </span>
  );
};

export default CategoryBadge;
