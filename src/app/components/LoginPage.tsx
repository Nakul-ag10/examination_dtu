import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { Loader2, GraduationCap } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('dtu5.jpg')` }}
      >
        <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[3px]"></div>
      </div>

      {/* DTU Logo */}
      <div className="absolute top-8 left-8 z-10">
        <div className="w-24 h-24 flex items-center justify-center shadow-2xl transition-transform hover:scale-105">
          <img src="dtu-logo.webp" alt="DTU-logo" />
        </div>
      </div>

      {/* Glassmorphism Card */}
      <Card className="w-full max-w-md mx-4 shadow-2xl border border-white/20 bg-white/90 backdrop-blur-xl animate-in fade-in duration-500 z-10">
        <CardHeader className="space-y-1 text-center pb-4">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">DTU Examination Portal</CardTitle>
          <CardDescription className="text-sm">Board of Studies Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="transition-all hover:border-primary focus:border-primary"
                autoComplete="email"
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
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-2">
              Contact your administrator if you don't have access.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
