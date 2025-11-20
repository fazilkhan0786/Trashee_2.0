import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function UserTypeSelection({ userId: _unusedProp }: { userId?: string }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState<{ name: string; email: string; phone: string; password: string } | null>(null);
  const [userType, setUserType] = useState<'consumer' | 'provider' | 'admin' | string>('consumer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('pending_signup');
      if (!raw) {
        // nothing pending — go back to signup
        navigate('/signup'); // or setShowUserTypeSelection(false) depending on your routing
        return;
      }
      setPending(JSON.parse(raw));
    } catch (err) {
      console.error('Failed to read pending signup', err);
      navigate('/signup');
    }
  }, [navigate]);

  const handleConfirm = async () => {
    if (!pending) return;
    setLoading(true);
    setMessage(null);

    try {
      // Call supabase.auth.signUp AFTER user_type is selected
      const { data, error } = await supabase.auth.signUp({
        email: pending.email,
        password: pending.password,
        options: {
          data: {
            full_name: pending.name,
            phone_number: pending.phone,
            user_type: userType
          }
        }
      });

      if (error) throw error;

      // Supabase v2 returns data.user (the created user) and data.session (maybe null)
      const newUser = data?.user;
      if (!newUser || !newUser.id) {
        // rare: if user object not returned, show a message and stop.
        setMessage('Signup succeeded but user info not returned. Please check your email to confirm and then login.');
        // cleanup
        sessionStorage.removeItem('pending_signup');
        setLoading(false);
        navigate('/login');
        return;
      }

      // Insert profile row in profiles table (use upsert to avoid conflicts)
      const profile = {
        id: newUser.id,
        full_name: pending.name,
        phone_number: pending.phone,
        email: pending.email,
        user_type: userType
      };

      const { data: pData, error: pErr } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });

      if (pErr) {
        // If this fails due to RLS or constraints, surface error
        console.error('profile insert error', pErr);
        // you can still allow signup to continue; consider cleaning up user if critical
        setMessage('Signed up but failed to create profile: ' + pErr.message);
      } else {
        setMessage('Signup successful! A confirmation email has been sent. Please verify your email.');
      }

      // cleanup pending data
      sessionStorage.removeItem('pending_signup');

      // optionally redirect to login or to a "check your email" screen
      setLoading(false);
      navigate('/login');
    } catch (err: any) {
      console.error('Signup/confirm error', err);
      setMessage('Signup failed: ' + (err.message || String(err)));
      setLoading(false);
    }
  };

  if (!pending) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Select your user type</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Hello <strong>{pending.name}</strong>, choose which account type describes you.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => setUserType('consumer')}
              className={`p-4 rounded border ${userType === 'consumer' ? 'border-emerald-600 bg-emerald-50' : ''}`}
            >
              Consumer
            </button>
            <button
              onClick={() => setUserType('provider')}
              className={`p-4 rounded border ${userType === 'provider' ? 'border-emerald-600 bg-emerald-50' : ''}`}
            >
              Provider
            </button>
            <button
              onClick={() => setUserType('admin')}
              className={`p-4 rounded border ${userType === 'admin' ? 'border-emerald-600 bg-emerald-50' : ''}`}
            >
              Admin
            </button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConfirm} disabled={loading}>
              {loading ? 'Creating account...' : 'Confirm & Create Account'}
            </Button>
            <Button variant="ghost" onClick={() => { navigate('/signup'); }}>
              Back
            </Button>
          </div>

          {message && <div className="mt-4 text-sm">{message}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
