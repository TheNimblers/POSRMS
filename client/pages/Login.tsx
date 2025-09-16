import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Users, ChefHat, BarChart3, Shield } from "lucide-react";
import { useAuth, UserRole } from '@/contexts/AuthContext';

const roleDescriptions = {
  waiter: {
    icon: Users,
    title: 'Waiter',
    description: 'Manage tables, take orders, and serve customers',
    redirect: '/waiter'
  },
  kitchen: {
    icon: ChefHat,
    title: 'Kitchen',
    description: 'View and manage food orders',
    redirect: '/kitchen'
  },
  bar: {
    icon: ChefHat,
    title: 'Bar',
    description: 'View and manage drink orders',
    redirect: '/bar'
  },
  manager: {
    icon: BarChart3,
    title: 'Manager',
    description: 'Manage restaurant operations and staff',
    redirect: '/manager'
  },
  admin: {
    icon: Shield,
    title: 'Administrator',
    description: 'Full system access and control',
    redirect: '/admin'
  },
  team: {
    icon: Shield,
    title: 'POSRMS Team',
    description: 'SaaS platform management',
    redirect: '/team'
  }
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const roleInfo = roleDescriptions[user.role];
      navigate(roleInfo.redirect);
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
      setError('Invalid username or password');
    }
  };

  const demoCredentials = [
    { role: 'waiter', username: 'waiter1', description: 'Demo waiter account' },
    { role: 'kitchen', username: 'kitchen1', description: 'Kitchen staff account' },
    { role: 'bar', username: 'bar1', description: 'Bar staff account' },
    { role: 'manager', username: 'manager1', description: 'Restaurant manager' },
    { role: 'admin', username: 'admin1', description: 'System administrator' },
    { role: 'team', username: 'team1', description: 'POSRMS team member' }
  ];

  const fillDemoCredentials = (username: string) => {
    setUsername(username);
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-2xl font-bold text-gray-900">🍽️ POSRMS</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/team/login">
                <Button variant="outline" size="sm">POSRMS Owner Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Form */}
          <Card className="w-full max-w-md mx-auto lg:mx-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Restaurant Staff Login
              </CardTitle>
              <p className="text-center text-gray-600">
                Access your dashboard to manage restaurant operations
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account? Contact your manager to create one.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Demo Accounts
              </CardTitle>
              <p className="text-gray-600">
                Try different roles with these demo accounts (password: "password")
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {demoCredentials.map((demo) => {
                  const roleInfo = roleDescriptions[demo.role as UserRole];
                  const IconComponent = roleInfo.icon;
                  
                  return (
                    <Card 
                      key={demo.role} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => fillDemoCredentials(demo.username)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 rounded-full p-2">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm">
                              {roleInfo.title}
                            </h3>
                            <p className="text-xs text-gray-600">
                              {demo.username}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {demo.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  How to use demo accounts:
                </h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Click on any demo account card above</li>
                  <li>2. Credentials will auto-fill in the login form</li>
                  <li>3. Click "Sign In" to access that role's dashboard</li>
                  <li>4. Explore the features available to each role</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Descriptions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">System Roles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(roleDescriptions).map(([role, info]) => {
              const IconComponent = info.icon;
              return (
                <Card key={role}>
                  <CardContent className="p-6 text-center">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{info.title}</h3>
                    <p className="text-gray-600 text-sm">{info.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
