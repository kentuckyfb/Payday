
import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
}

type PresetRange = "current-month" | "prev-month" | "next-month" | "past-30-days" | "past-90-days" | "year-to-date" | "custom";

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onRangeChange,
}) => {
  const [selectedPreset, setSelectedPreset] = React.useState<PresetRange>("current-month");
  const [calendarOpen, setCalendarOpen] = React.useState(false);
  const [tempStartDate, setTempStartDate] = React.useState<Date>(startDate);
  const [tempEndDate, setTempEndDate] = React.useState<Date>(endDate);

  const handlePresetChange = (preset: PresetRange) => {
    setSelectedPreset(preset);
    
    const today = new Date();
    let start = startDate;
    let end = endDate;
    
    switch (preset) {
      case "current-month":
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case "prev-month":
        start = startOfMonth(subMonths(today, 1));
        end = endOfMonth(subMonths(today, 1));
        break;
      case "next-month":
        start = startOfMonth(addMonths(today, 1));
        end = endOfMonth(addMonths(today, 1));
        break;
      case "past-30-days":
        start = subMonths(today, 1);
        end = today;
        break;
      case "past-90-days":
        start = subMonths(today, 3);
        end = today;
        break;
      case "year-to-date":
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        break;
      case "custom":
        // Don't change dates, just open the calendar
        setCalendarOpen(true);
        return;
    }
    
    setTempStartDate(start);
    setTempEndDate(end);
    onRangeChange(start, end);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // If start date is not set or both dates are set, reset selection to new start date
    if (tempStartDate && tempEndDate) {
      setTempStartDate(date);
      setTempEndDate(undefined as unknown as Date);
    } 
    // If only start date is set and the new date is after start date, set it as end date
    else if (tempStartDate && date > tempStartDate) {
      setTempEndDate(date);
      // Apply the date range and close the calendar
      onRangeChange(tempStartDate, date);
      setCalendarOpen(false);
    }
    // If only start date is set and the new date is before it, set new date as start and old start as end
    else if (tempStartDate && date < tempStartDate) {
      setTempEndDate(tempStartDate);
      setTempStartDate(date);
      // Apply the date range and close the calendar
      onRangeChange(date, tempStartDate);
      setCalendarOpen(false);
    } 
    // If nothing is set, set as start date
    else {
      setTempStartDate(date);
    }
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return "Select date range";
    
    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        value={selectedPreset}
        onValueChange={(value) => handlePresetChange(value as PresetRange)}
      >
        <SelectTrigger className="w-[180px] h-8 bg-payday-dark-secondary border-payday-purple/30">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-payday-dark border-payday-purple/30 z-50">
          <SelectItem value="current-month">Current Month</SelectItem>
          <SelectItem value="prev-month">Previous Month</SelectItem>
          <SelectItem value="next-month">Next Month</SelectItem>
          <SelectItem value="past-30-days">Past 30 Days</SelectItem>
          <SelectItem value="past-90-days">Past 90 Days</SelectItem>
          <SelectItem value="year-to-date">Year to Date</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>
      
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-8 border-payday-purple/30 text-gray-300"
          >
            <CalendarIcon size={16} className="mr-2 text-payday-purple-light" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-auto p-0 bg-payday-dark border-payday-purple/30"
        >
          <Calendar
            mode="range"
            selected={{
              from: tempStartDate,
              to: tempEndDate,
            }}
            onSelect={(range) => {
              if (range?.from) handleDateSelect(range.from);
              if (range?.to) handleDateSelect(range.to);
            }}
            numberOfMonths={2}
            disabled={(date) => date > new Date(2100, 0, 1) || date < new Date(2000, 0, 1)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangeSelector;
