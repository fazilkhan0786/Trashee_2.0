import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Recycle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import UserTypeSelection from '@/components/UserTypeSelection';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const [userId, setUserId] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // STEP 1: Listener triggers
        console.log('DEBUG STEP 1: onAuthStateChange triggered with event:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          // STEP 2: Sign-in detected
          console.log('DEBUG STEP 2: SIGNED_IN event detected for user:', user.id);
          setLoading(true);

          // STEP 3: About to fetch profile
          console.log('DEBUG STEP 3: Fetching profile from Supabase...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            // STEP 4 (ERROR): An error occurred
            console.error('DEBUG STEP 4 (ERROR): Error fetching profile:', profileError);
          }

          // STEP 5: Log the result of the fetch
          console.log('DEBUG STEP 5: Profile data received from Supabase:', profile);

          if (profile?.user_type) {
            // STEP 6: Profile has a user_type
            console.log('DEBUG STEP 6: User profile has a user_type:', profile.user_type);
            const userType = profile.user_type.toLowerCase();
            let path;

            switch (userType) {
              case 'admin':
                path = '/admin/dashboard';
                break;
              case 'partner':
                path = '/partner/home';
                break;
              case 'collector':
                path = '/collector/home';
                break;
              case 'consumer':
                path = '/consumer/home';
                break;
              default:
                console.log('DEBUG: Unknown user_type:', userType);
                setLoading(false);
                return; 
            }
            
            // STEP 7: Preparing to navigate
            console.log('DEBUG STEP 7: Preparing to navigate to:', path);
            navigate(path);
            console.log('DEBUG STEP 8: Navigation call has been made.');

          } else {
            // STEP 9 (ELSE): Profile has no user_type
            console.log('DEBUG STEP 9: User profile has NO user_type. Showing selection screen.');
            setUserId(user.id);
            setShowUserTypeSelection(true);
          }
          
          // STEP 10: Final step
          console.log('DEBUG STEP 10: Setting loading to false.');
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isMounted, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      alert(`Error signing in with Google: ${error.message}`);
      setLoading(false);
    }
  };

  if (showUserTypeSelection) {
    return <UserTypeSelection userId={userId} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <Recycle className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Welcome to Trashee</CardTitle>
          <CardDescription className="text-emerald-100 mt-2">
            Smart waste management for a cleaner tomorrow
          </CardDescription>
        </div>
        
        <CardContent className="space-y-6 p-6">
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 text-gray-500 hover:text-gray-700 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                Forgot Password?
              </Link>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200" 
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleGoogleLogin} 
              className="p-3 flex items-center justify-center gap-3 w-full max-w-xs border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-medium">Sign in with Google</span>
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}