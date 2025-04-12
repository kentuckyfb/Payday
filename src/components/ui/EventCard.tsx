
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, DollarSign, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  tags?: string[];
  wage?: number;
  isRecurring?: boolean;
  isRecurrenceInstance?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  date,
  startTime,
  endTime,
  tags = [],
  wage,
  isRecurring = false,
  isRecurrenceInstance = false,
  onClick,
  onDelete,
}) => {
  const navigate = useNavigate();
  
  // Calculate duration in hours
  const calculateDuration = () => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);
    
    let hours = endHour - startHour;
    let minutes = endMin - startMin;
    
    if (minutes < 0) {
      hours -= 1;
      minutes += 60;
    }
    
    if (hours < 0) {
      hours += 24; // Handle overnight events
    }
    
    const totalHours = hours + minutes / 60;
    return totalHours.toFixed(1);
  };
  
  // Calculate earnings if wage is provided
  const calculateEarnings = () => {
    if (!wage) return null;
    
    const duration = parseFloat(calculateDuration());
    const earnings = duration * wage;
    return earnings.toFixed(2);
  };
  
  // Format time to be more readable
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };
  
  // Handle click event
  const handleClick = (e: React.MouseEvent) => {
    // If onClick is provided, use it, otherwise navigate to event details
    if (onClick) {
      onClick();
    } else {
      navigate(`/events/${id}`);
    }
  };
  
  // Handle delete event
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };
  
  return (
    <Card 
      className="glass-card p-4 mb-3 cursor-pointer hover:bg-payday-dark-secondary/70 transition-colors"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{date}</p>
          
          <div className="flex items-center mt-2 text-sm text-gray-300">
            <Clock size={14} className="mr-1" />
            <span>
              {formatTime(startTime)} - {formatTime(endTime)} ({calculateDuration()}h)
            </span>
          </div>
          
          {wage && (
            <div className="flex items-center mt-1 text-sm text-green-400">
              <DollarSign size={14} className="mr-1" />
              <span>${calculateEarnings()}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          {isRecurring && (
            <Badge variant="outline" className="mb-2 border-payday-purple text-payday-purple-light">
              Recurring
            </Badge>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete event</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="bg-payday-dark-secondary text-xs"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};

export default EventCard;
