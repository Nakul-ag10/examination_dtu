import React, { useState } from 'react';
import { useAuth, UserRole } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !role) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password, role);
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('dtu5.jpg')`,
        }}
      >
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[3px]"></div>
      </div>

      {/* DTU Logo Placeholder */}
      <div className="absolute top-8 left-8 z-10">
        <div className="w-24 h-24 flex items-center justify-center shadow-2xl  transition-transform hover:scale-105">
          {/* <span className="text-white font-bold text-xl">DTU</span> */}
          <img src="dtu-logo.webp" alt="DTU-logo" />
        </div>
      </div>

      {/* Glassmorphism Card */}
      <Card className="w-full max-w-md mx-4 shadow-2xl border border-white/20 bg-white/90 backdrop-blur-xl animate-in fade-in duration-500 z-10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription>Please Enter your Credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role || ''} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger id="role" className="transition-all hover:border-primary">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Time Table Incharge">Time Table Incharge</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username / Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="transition-all hover:border-primary focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="transition-all hover:border-primary focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
