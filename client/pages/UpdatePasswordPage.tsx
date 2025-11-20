import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

// ✅ This is the final, complete version.
export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event detected, session is now active.');
        setSession(session);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccessMessage('Your password has been updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to update password. The recovery link may be invalid or expired.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-emerald-100 rounded-2xl animate-in fade-in-50">
        
        {/* ✅ RESTORED: The CardHeader with title and description */}
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-800">Set a New Password</CardTitle>
          <CardDescription className="text-emerald-600">
            Please enter and confirm your new password below.
          </CardDescription>
        </CardHeader>

        {/* ✅ RESTORED: The CardContent with the full form */}
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading || !!successMessage}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading || !!successMessage}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white"
              disabled={loading || !!successMessage}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>

        {/* ✅ RESTORED: The CardFooter for showing messages */}
        <CardFooter>
          {error && (
            <div className="w-full text-center text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="w-full text-center text-emerald-700 bg-emerald-50 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          )}
        </CardFooter>
        
      </Card>
    </div>
  );
}