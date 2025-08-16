import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff, Recycle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import UserTypeSelection from '@/components/UserTypeSelection';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [userId, setUserId] = useState('');

  const userTypes = [
    { value: '0', label: 'Consumer', description: 'Scan bins and earn rewards' },
    { value: '1', label: 'Partner', description: 'Local business partner' },
    { value: '2', label: 'Collector', description: 'Trash collection service' },
    { value: '3', label: 'Admin', description: 'System administrator' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    // Supabase email/password login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(`Login failed: ${error.message}`);
      return;
    }

    // Determine destination by user_type metadata if available, otherwise ask selection
    const userMeta = data.session?.user.user_metadata as any;
    const metaUserType = userMeta?.user_type ?? userType;

    if (!metaUserType) {
      setUserId(data.session!.user.id);
      setShowUserTypeSelection(true);
      return;
    }

    switch (metaUserType) {
      case '0':
        navigate('/consumer/home');
        break;
      case '1':
        navigate('/partner/home');
        break;
      case '2':
        navigate('/collector/home');
        break;
      case '3':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/consumer/home');
    }
  };

  // On mount: if session exists and has user_type, redirect to respective home
  useEffect(() => {
    const checkUserSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session?.user) return;

      const metaType = data.session.user.user_metadata?.user_type;
      if (!metaType) {
        setUserId(data.session.user.id);
        setShowUserTypeSelection(true);
        return;
      }

      switch (metaType) {
        case '0':
          navigate('/consumer/home');
          break;
        case '1':
          navigate('/partner/home');
          break;
        case '2':
          navigate('/collector/home');
          break;
        case '3':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/consumer/home');
      }
    };

    checkUserSession();
  }, [navigate]);

  const handleSocialLogin = async (provider: string) => {
    try {
      const options: any = {
        provider: provider as any,
        options: {
          redirectTo: `${window.location.origin}`
        }
      };
      
      // Add Facebook-specific configuration
      if (provider === 'facebook') {
        options.options.scopes = 'email,public_profile';
        // The callback URL is already configured in Supabase: https://ascqdjqxiuygvvmawyrx.supabase.co/auth/v1/callback
        // Facebook client ID: 701661469570996
      }

      const { data, error } = await supabase.auth.signInWithOAuth(options);

      if (error) {
        console.error(`Error signing in with ${provider}:`, error.message);
        alert(`Failed to sign in with ${provider}: ${error.message}`);
      } else {
        console.log(`Redirecting to ${provider} login...`);
        // The redirect will happen automatically
      }
    } catch (err) {
      console.error(`Unexpected error with ${provider} sign-in:`, err);
      alert(`An unexpected error occurred with ${provider} sign-in. Please try again.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      {showUserTypeSelection ? (
        <UserTypeSelection 
          userId={userId} 
          onComplete={() => setShowUserTypeSelection(false)}
        />
      ) : (
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary p-3 rounded-full">
              <Recycle className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-green-800">Welcome to Trashee</CardTitle>
            <CardDescription className="text-gray-600">
              Smart waste management for a cleaner tomorrow
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">Account Type</Label>
              <Select value={userType} onValueChange={setUserType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your account type" />
                </SelectTrigger>
                <SelectContent>
                  {userTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-gray-500">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              className="p-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('facebook')}
              className="p-3 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('apple')}
              className="p-3"
            >
              <svg className="w-4 h-4" fill="#000" viewBox="0 0 24 24">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
