import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Shield, Globe, BarChart3, Users } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function TeamLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in as team member
  useEffect(() => {
    if (user && user.role === 'team') {
      navigate('/team');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    const success = await login(username, password);
    if (!success) {
      setError('Invalid credentials or insufficient permissions');
    } else if (user && user.role !== 'team') {
      setError('This login is for POSRMS team members only');
    }
  };

  const fillDemoCredentials = () => {
    setUsername('team1');
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center text-white">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-2xl font-bold">🍽️ POSRMS</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  Restaurant Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">POSRMS Team Portal</h2>
            <p className="mt-2 text-lg text-gray-300">
              Secure access for SaaS administrators and platform managers
            </p>
          </div>

          {/* Login Form */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center text-white">
                Team Member Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your team username"
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                  />
                </div>

                {error && (
                  <Alert variant="destructive" className="bg-red-500/20 border-red-500/20 text-red-100">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-white text-gray-900 hover:bg-gray-100" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Access Team Portal'
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-2">Demo Access</h3>
                <p className="text-xs text-gray-300 mb-3">
                  Use demo credentials to explore the team dashboard
                </p>
                <Button 
                  onClick={fillDemoCredentials}
                  variant="outline" 
                  size="sm" 
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Use Demo Account (team1)
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  Restricted access for authorized POSRMS team members only
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <Globe className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white">Multi-Restaurant</h3>
                <p className="text-xs text-gray-300">Manage all restaurant locations</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white">Analytics</h3>
                <p className="text-xs text-gray-300">Platform-wide insights</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white">Subscriptions</h3>
                <p className="text-xs text-gray-300">Billing & customer management</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
