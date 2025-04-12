
import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const Analytics = () => {
  const { user } = useAuth();
  const [timeFrame, setTimeFrame] = useState("weekly");
  const [incomeData, setIncomeData] = useState<any[]>([]);
  const [eventTypeData, setEventTypeData] = useState<any[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Fetch events
        const { data: events, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Process data for different time frames
        processIncomeData(events || []);
        processEventTypes(events || []);
        processHourlyDistribution(events || []);
        
      } catch (error: any) {
        console.error("Error fetching analytics data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [user, timeFrame]);
  
  const processIncomeData = (events: any[]) => {
    if (events.length === 0) {
      // Default empty data structure based on timeFrame
      if (timeFrame === "weekly") {
        setIncomeData(DAYS.map(day => ({ name: day, income: 0 })));
      } else if (timeFrame === "monthly") {
        setIncomeData(Array.from({ length: 4 }, (_, i) => ({ name: `Week ${i+1}`, income: 0 })));
      } else {
        setIncomeData(MONTHS.map(month => ({ name: month, income: 0 })));
      }
      return;
    }
    
    // Real data processing based on paid events
    // This is simplified - in a real app you'd do more sophisticated calculations
    if (timeFrame === "weekly") {
      const weeklyData = DAYS.map(day => ({ name: day, income: 0 }));
      
      events.forEach(event => {
        if (event.is_paid && event.hourly_rate) {
          const eventDate = new Date(event.date);
          const dayIndex = eventDate.getDay();
          const startTime = event.start_time.split(':');
          const endTime = event.end_time.split(':');
          const hours = parseFloat(endTime[0]) - parseFloat(startTime[0]) + 
                      (parseFloat(endTime[1]) - parseFloat(startTime[1])) / 60;
          
          weeklyData[dayIndex].income += hours * event.hourly_rate;
        }
      });
      
      setIncomeData(weeklyData);
    } else if (timeFrame === "monthly") {
      // Simplified monthly calculation
      const monthlyData = Array.from({ length: 4 }, (_, i) => ({ name: `Week ${i+1}`, income: 0 }));
      
      // This is very simplified - in a real app, you'd calculate the actual week
      events.forEach(event => {
        if (event.is_paid && event.hourly_rate) {
          const eventDate = new Date(event.date);
          const weekIndex = Math.floor(eventDate.getDate() / 7);
          const startTime = event.start_time.split(':');
          const endTime = event.end_time.split(':');
          const hours = parseFloat(endTime[0]) - parseFloat(startTime[0]) + 
                      (parseFloat(endTime[1]) - parseFloat(startTime[1])) / 60;
          
          if (weekIndex < 4) {
            monthlyData[weekIndex].income += hours * event.hourly_rate;
          }
        }
      });
      
      setIncomeData(monthlyData);
    } else {
      // Yearly
      const yearlyData = MONTHS.map(month => ({ name: month, income: 0 }));
      
      events.forEach(event => {
        if (event.is_paid && event.hourly_rate) {
          const eventDate = new Date(event.date);
          const monthIndex = eventDate.getMonth();
          const startTime = event.start_time.split(':');
          const endTime = event.end_time.split(':');
          const hours = parseFloat(endTime[0]) - parseFloat(startTime[0]) + 
                      (parseFloat(endTime[1]) - parseFloat(startTime[1])) / 60;
          
          yearlyData[monthIndex].income += hours * event.hourly_rate;
        }
      });
      
      setIncomeData(yearlyData);
    }
  };
  
  const processEventTypes = (events: any[]) => {
    if (events.length === 0) {
      setEventTypeData([]);
      return;
    }
    
    // Group events by their tags
    const eventsByType: Record<string, number> = {};
    let totalEvents = 0;
    
    events.forEach(event => {
      if (event.tags && event.tags.length > 0) {
        // Use the first tag as the type
        const type = event.tags[0];
        eventsByType[type] = (eventsByType[type] || 0) + 1;
        totalEvents++;
      } else {
        eventsByType["Other"] = (eventsByType["Other"] || 0) + 1;
        totalEvents++;
      }
    });
    
    // Convert to percentage and format for PieChart
    const colors = ["#9b87f5", "#6E59A5", "#D6BCFA", "#7E69AB", "#8B5CF6", "#333"];
    const typesData = Object.entries(eventsByType).map(([name, count], index) => ({
      name,
      value: Math.round((count / totalEvents) * 100),
      color: colors[index % colors.length]
    }));
    
    setEventTypeData(typesData);
  };
  
  const processHourlyDistribution = (events: any[]) => {
    if (events.length === 0) {
      setHourlyDistribution([
        { name: "Morning (6-12)", hours: 0 },
        { name: "Afternoon (12-17)", hours: 0 },
        { name: "Evening (17-22)", hours: 0 },
        { name: "Night (22-6)", hours: 0 },
      ]);
      return;
    }
    
    // Initialize distribution
    const distribution = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };
    
    // Calculate hours for each time period
    events.forEach(event => {
      const startHour = parseInt(event.start_time.split(':')[0]);
      const endHour = parseInt(event.end_time.split(':')[0]);
      const duration = endHour - startHour;
      
      // Very simplified allocation - in a real app this would be more precise
      if (startHour >= 6 && startHour < 12) {
        distribution.morning += duration;
      } else if (startHour >= 12 && startHour < 17) {
        distribution.afternoon += duration;
      } else if (startHour >= 17 && startHour < 22) {
        distribution.evening += duration;
      } else {
        distribution.night += duration;
      }
    });
    
    setHourlyDistribution([
      { name: "Morning (6-12)", hours: distribution.morning },
      { name: "Afternoon (12-17)", hours: distribution.afternoon },
      { name: "Evening (17-22)", hours: distribution.evening },
      { name: "Night (22-6)", hours: distribution.night },
    ]);
  };
  
  // Calculate total income
  const calculateTotalIncome = () => {
    return incomeData.reduce((sum, entry) => sum + entry.income, 0).toFixed(2);
  };
  
  // Calculate average income
  const calculateAvgIncome = () => {
    const nonZeroEntries = incomeData.filter(entry => entry.income > 0);
    if (nonZeroEntries.length === 0) return "0.00";
    return (nonZeroEntries.reduce((sum, entry) => sum + entry.income, 0) / nonZeroEntries.length).toFixed(2);
  };
  
  // Calculate total hours
  const calculateTotalHours = () => {
    return hourlyDistribution.reduce((sum, entry) => sum + entry.hours, 0);
  };
  
  return (
    <AppLayout>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Analytics & Insights</h1>
        
        <Select value={timeFrame} onValueChange={setTimeFrame}>
          <SelectTrigger className="w-[120px] bg-payday-dark-secondary border-payday-purple/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Income Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="glass-card p-4">
          <h3 className="text-sm text-gray-400">Total Income</h3>
          <p className="text-xl font-bold text-payday-purple-light">
            ${calculateTotalIncome()}
          </p>
        </Card>
        <Card className="glass-card p-4">
          <h3 className="text-sm text-gray-400">Avg. {timeFrame === "weekly" ? "Daily" : timeFrame === "monthly" ? "Weekly" : "Monthly"}</h3>
          <p className="text-xl font-bold text-payday-purple-light">
            ${calculateAvgIncome()}
          </p>
        </Card>
      </div>
      
      {/* Main Analytics Tabs */}
      <Tabs defaultValue="income" className="mb-20">
        <TabsList className="grid grid-cols-3 bg-payday-dark-secondary mb-4">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income">
          <Card className="glass-card p-4 mb-6">
            <h3 className="text-sm font-semibold mb-2">Income Breakdown</h3>
            <div className="h-64">
              {incomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#221F26", borderColor: "#6E59A5", color: "#fff" }}
                      formatter={(value) => [`$${value}`, "Income"]}
                    />
                    <Bar dataKey="income" fill="#9b87f5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No income data available
                </div>
              )}
            </div>
          </Card>
          
          <Card className="glass-card p-4 mb-6">
            <h3 className="text-sm font-semibold mb-2">Trends Over Time</h3>
            <div className="h-48">
              {incomeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={incomeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#221F26", borderColor: "#6E59A5", color: "#fff" }}
                      formatter={(value) => [`$${value}`, "Income"]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#9b87f5" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#6E59A5" }}
                      activeDot={{ r: 6, fill: "#D6BCFA" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No income trend data available
                </div>
              )}
            </div>
          </Card>
          
          <Card className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-2">Income by Event Type</h3>
            <div className="h-64 flex items-center justify-center">
              {eventTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#221F26", borderColor: "#6E59A5", color: "#fff" }}
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400">
                  No event type data available
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="time">
          <Card className="glass-card p-4 mb-6">
            <h3 className="text-sm font-semibold mb-2">Working Hours Distribution</h3>
            <div className="h-64">
              {hourlyDistribution.some(item => item.hours > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#221F26", borderColor: "#6E59A5", color: "#fff" }}
                      formatter={(value) => [`${value} hours`, "Duration"]}
                    />
                    <Bar dataKey="hours" fill="#6E59A5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No working hours data available
                </div>
              )}
            </div>
          </Card>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="glass-card p-4">
              <h3 className="text-sm text-gray-400">Total Hours</h3>
              <p className="text-xl font-bold text-payday-purple-light">
                {calculateTotalHours()}h
              </p>
            </Card>
            <Card className="glass-card p-4">
              <h3 className="text-sm text-gray-400">Avg. Hourly Rate</h3>
              <p className="text-xl font-bold text-payday-purple-light">
                ${calculateTotalHours() > 0 ? (calculateTotalIncome() / calculateTotalHours()).toFixed(2) : "0.00"}
              </p>
            </Card>
          </div>
          
          <Card className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-2">Productivity Hours</h3>
            {eventTypeData.length > 0 ? (
              <>
                <div className="flex items-center justify-between p-2 border-b border-white/10 mb-2">
                  <span>Most productive time</span>
                  <span className="font-semibold text-payday-purple-light">
                    {hourlyDistribution.reduce((prev, current) => (prev.hours > current.hours) ? prev : current).name}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 border-b border-white/10 mb-2">
                  <span>Longest shifts</span>
                  <span className="font-semibold text-payday-purple-light">
                    {incomeData.length > 0 ? 
                      `${incomeData.reduce((prev, current) => (prev.income > current.income) ? prev : current).name}` : 
                      "No data"}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-10 text-center text-gray-400">
                No productivity data available yet
              </div>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="events">
          <Card className="glass-card p-4 mb-6">
            <h3 className="text-sm font-semibold mb-2">Event Type Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              {eventTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {eventTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#221F26", borderColor: "#6E59A5", color: "#fff" }}
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400">
                  No event data available
                </div>
              )}
            </div>
          </Card>
          
          <Card className="glass-card p-4 mb-6">
            <h3 className="text-sm font-semibold mb-2">Events by Tag</h3>
            {eventTypeData.length > 0 ? (
              eventTypeData.map((type, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-b border-white/10 mb-2">
                  <span>{type.name}</span>
                  <span className="font-semibold text-payday-purple-light">
                    {Math.round(type.value)}%
                  </span>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-gray-400">
                No event tag data available
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Analytics;
