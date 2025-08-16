import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Recycle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createUserProfile, getUserProfile } from '@/lib/profileService';

interface UserTypeSelectionProps {
  userId: string;
  onComplete?: () => void;
}

export default function UserTypeSelection({ userId, onComplete }: UserTypeSelectionProps) {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [loading, setLoading] = useState(false);

  const userTypes = [
    { value: '0', label: 'Consumer', description: 'Scan bins and earn rewards' },
    { value: '1', label: 'Partner', description: 'Local business partner' },
    { value: '2', label: 'Collector', description: 'Trash collection service' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userType) {
        alert('Please select a user type');
        setLoading(false);
        return;
      }

      // Update the user metadata with the selected user type
      const { data: userData, error } = await supabase.auth.updateUser({
        data: { user_type: userType }
      });

      if (error) {
        throw error;
      }
      
      // Check if user already has a profile
      const { success, profile } = await getUserProfile(userId);
      
      // If no profile exists, create one
      if (!success || !profile) {
        // Get user's current metadata
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const profileData = {
            name: user.user_metadata?.name || '',
            phone: user.user_metadata?.phone || '',
            user_type: userType
          };
          
          await createUserProfile(userId, profileData);
        }
      }

      // Navigate to the appropriate dashboard based on user type
      switch (userType) {
        case '0': // Consumer
          navigate('/consumer/home');
          break;
        case '1': // Partner
          navigate('/partner/home');
          break;
        case '2': // Collector
          navigate('/collector/home');
          break;
        default:
          navigate('/consumer/home');
      }

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      alert('Failed to update user type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
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
              Please select your account type to continue
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}