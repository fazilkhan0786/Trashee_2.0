import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft, User, Camera, Shield, HelpCircle,
  LogOut, Edit, Save, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { updateUserProfile, uploadAvatar } from '../../lib/profileService';

export default function ConsumerProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    avatar_url: '/placeholder.svg',
  });

  const [points, setPoints] = useState(0);

  const [securitySettings, setSecuritySettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_alerts: false,
    location_tracking: true,
  });
  
  useEffect(() => {
    async function loadUserData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      const [profileRes, pointsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_points').select('points').eq('user_id', user.id).single()
      ]);

      const { data: profile, error: profileError } = profileRes;
      const { data: pointsData, error: pointsError } = pointsRes;
      
      if (profileError) console.error("Error fetching profile:", profileError.message);
      if (pointsError) console.error("Error fetching points:", pointsError.message);

      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          email: user.email || '',
          phone: profile.phone_number || '',
          address: profile.address || '',
          avatar_url: profile.avatar_url || '/placeholder.svg',
        });
        
        setSecuritySettings({
          email_notifications: profile.email_notifications ?? true,
          push_notifications: profile.push_notifications ?? true,
          sms_alerts: profile.sms_alerts ?? false,
          location_tracking: profile.location_tracking ?? true,
        });
      }

      if (pointsData) {
        setPoints(pointsData.points || 0);
      }

      setLoading(false);
    }
    
    loadUserData();
  }, [navigate]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileData(prev => ({ ...prev, avatar_url: previewUrl }));
    }
  };
  
  const handleProfileUpdate = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in');
      setLoading(false);
      return;
    }

    let newAvatarUrl = profileData.avatar_url;
    if (avatarFile) {
      const uploadResult = await uploadAvatar(avatarFile);
      if (uploadResult.success && uploadResult.url) {
        newAvatarUrl = uploadResult.url;
      } else {
        alert(`Failed to upload avatar: ${uploadResult.error}`);
        setLoading(false);
        return;
      }
    }

    const updates = {
      full_name: profileData.full_name,
      phone_number: profileData.phone,
      address: profileData.address,
      avatar_url: newAvatarUrl,
      ...securitySettings
    };

    const result = await updateUserProfile(user.id, updates);

    if (result.success) {
      alert('Profile updated successfully!');
      setProfileData(prev => ({...prev, avatar_url: newAvatarUrl}));
      setAvatarFile(null);
      setIsEditing(false);
    } else {
      alert(`Failed to update profile: ${result.error}`);
    }
    setLoading(false);
  };
  
  // ✅ INTEGRATED: Your new password reset function
  const handlePasswordReset = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            // It's best practice to have a dedicated page for this
            redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) {
            alert(`Error sending reset email: ${error.message}`);
        } else {
            alert('A password reset link has been sent to your email address.');
        }
    } else {
        alert('Could not find your email to send a reset link.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-emerald-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-emerald-600" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-emerald-800">Profile & Settings</h1>
            <p className="text-sm text-emerald-600/80">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-emerald-50 rounded-xl p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-lg">
              <User className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-lg">
              <Shield className="w-4 h-4" /> Security
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-lg">
              <HelpCircle className="w-4 h-4" /> Support
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white/30 shadow-lg">
                      <AvatarImage src={profileData.avatar_url} alt="Profile" />
                      <AvatarFallback className="text-xl bg-emerald-700 text-white">
                        {profileData.full_name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-white text-emerald-700 hover:bg-emerald-50 shadow-md flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
                      </div>
                    </label>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{profileData.full_name}</h2>
                    <p className="text-emerald-100">{profileData.email}</p>
                    <Badge className="bg-white/20 text-white border-0 mt-2">
                      {points.toLocaleString()} points earned
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-md border border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-emerald-800">Personal Information</CardTitle>
                <Button onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}>
                  {isEditing ? <><Save className="w-4 h-4 mr-2" />Save</> : <><Edit className="w-4 h-4 mr-2" />Edit</>}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={profileData.full_name} onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={profileData.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={profileData.phone} onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={profileData.address} onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))} disabled={!isEditing} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* ✅ INTEGRATED: Your new password reset card */}
            <Card className="rounded-2xl shadow-md border border-emerald-100">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" />Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h3 className="font-medium">Reset Password</h3>
                            <p className="text-sm text-gray-500">A password reset link will be sent to your email.</p>
                        </div>
                        <Button variant="outline" onClick={handlePasswordReset}>Send Reset Link</Button>
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-md border border-emerald-100">
              <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(securitySettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <Label htmlFor={key} className="font-medium capitalize">{key.replace(/_/g, ' ')}</Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => isEditing && setSecuritySettings(prev => ({ ...prev, [key]: checked }))}
                      disabled={!isEditing}
                    />
                  </div>
                ))}
                {!isEditing && <p className="text-sm text-gray-500 mt-2">Click the "Edit" button in the Profile tab to change these settings.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card className="rounded-2xl shadow-md border border-emerald-100">
              <CardHeader className="bg-emerald-50 rounded-t-2xl">
                <CardTitle className="text-emerald-800">App Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm p-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">App Version:</span>
                  <span>1.0.7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>September 13, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Offered By</span>
                  <span>Dprofiz</span>
                </div>
                <hr />
                <div className="flex gap-2">
                  <a href="https://dprofiz.com/terms-and-conditions.html" target="_blank" rel="noopener noreferrer" className='flex-1'>
                    <Button variant="outline" size="sm" className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                      Terms of Service
                    </Button>
                  </a>
                  <a href="https://dprofiz.com/privacy-policy.html" target="_blank" rel="noopener noreferrer" className='flex-1'>
                    <Button variant="outline" size="sm" className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                      Privacy Policy
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200 rounded-2xl shadow-md">
              <CardContent className="p-4">
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}