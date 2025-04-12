
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    defaultHourlyRate: "15.00",
    defaultWorkingHours: "8"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, isLoading } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6) 
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) 
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    await signUp(formData.email, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      defaultHourlyRate: parseFloat(formData.defaultHourlyRate),
      defaultWorkingHours: parseInt(formData.defaultWorkingHours)
    });
  };

  return (
    <div className="min-h-screen bg-payday-dark flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md mb-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient">Payday</h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>
        
        <Card className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="bg-payday-dark-secondary border-payday-purple/30"
                  required
                />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="bg-payday-dark-secondary border-payday-purple/30"
                  required
                />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-payday-dark-secondary border-payday-purple/30"
                required
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="bg-payday-dark-secondary border-payday-purple/30"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-payday-dark-secondary border-payday-purple/30"
                required
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-payday-dark-secondary border-payday-purple/30"
                required
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="defaultHourlyRate">Default Hourly Rate ($)</Label>
                <Input
                  id="defaultHourlyRate"
                  name="defaultHourlyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.defaultHourlyRate}
                  onChange={handleChange}
                  className="bg-payday-dark-secondary border-payday-purple/30"
                />
              </div>
              
              <div>
                <Label htmlFor="defaultWorkingHours">Default Working Hours</Label>
                <Input
                  id="defaultWorkingHours"
                  name="defaultWorkingHours"
                  type="number"
                  min="1"
                  max="24"
                  value={formData.defaultWorkingHours}
                  onChange={handleChange}
                  className="bg-payday-dark-secondary border-payday-purple/30"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-payday-purple hover:bg-payday-purple-dark"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-payday-purple-light hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
