import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  User,
  Camera,
  Shield,
  Lock,
  Bell,
  HelpCircle,
  LogOut,
  Edit,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Calendar,
  QrCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { updateUserProfile, uploadAvatar, getUserProfile } from '../../lib/profileService';

export default function ConsumerProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [supportType, setSupportType] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinedDate: '',
    level: 'Level 1',
    totalPoints: 0,
    profilePicture: '/placeholder.svg'
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    locationTracking: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Load user data when component mounts
  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }
        
        try {
          // Get user profile from profiles table
          const profileResult = await getUserProfile(user.id);
          
          if (profileResult.success && profileResult.profile) {
            const profile = profileResult.profile;
            
            // Update profile data with user information
            setProfileData(prev => ({
              ...prev,
              name: profile?.full_name || profile?.name || user.user_metadata?.name || '',
              email: user.email || '',
              phone: profile?.phone_number || profile?.phone || user.user_metadata?.phone || '',
              address: profile?.address || '',
              joinedDate: profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : '',
              totalPoints: profile?.points || 0,
              // Prioritize database avatar_url, then user metadata, then placeholder
              profilePicture: profile?.avatar_url || user.user_metadata?.avatar_url || '/placeholder.svg'
            }));
            
            // If we have an avatar_url in the database but not in user metadata, sync it
            if (profile?.avatar_url && !user.user_metadata?.avatar_url) {
              try {
                await supabase.auth.updateUser({
                  data: { avatar_url: profile.avatar_url }
                });
              } catch (error) {
                console.warn('Failed to sync avatar_url to user metadata:', error);
              }
            }
          } else {
            console.error('Error fetching profile:', profileResult.error);
            // Profile fetch failed, but we already have basic user info from auth
            setProfileData(prev => ({
              ...prev,
              name: user.user_metadata?.name || '',
              email: user.email || '',
              phone: user.user_metadata?.phone || '',
              joinedDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              totalPoints: 0,
              // Use user metadata avatar if available, otherwise placeholder
              profilePicture: user.user_metadata?.avatar_url || '/placeholder.svg'
            }));
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Profile fetch failed, but we already have basic user info from auth
          setProfileData(prev => ({
            ...prev,
            name: user.user_metadata?.name || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || '',
            joinedDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            totalPoints: 0,
            // Use user metadata avatar if available, otherwise placeholder
            profilePicture: user.user_metadata?.avatar_url || '/placeholder.svg'
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [navigate]);

  const handleAvatarUpload = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be logged in to upload an avatar');
        return null;
      }
      
      const result = await uploadAvatar(file);
      
      if (result.success && result.url) {
        return result.url;
      } else {
        alert(`Failed to upload avatar: ${result.error}`);
        return null;
      }
    } catch (error) {
      console.error('Error in avatar upload:', error);
      alert('An unexpected error occurred during upload. Please try again.');
      return null;
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        profilePicture: previewUrl
      }));
    }
  };
  
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be logged in to update your profile');
        return;
      }
      
      // Upload avatar if a new one was selected
      let avatarUrl = profileData.profilePicture;
      if (avatarFile) {
        const uploadResult = await uploadAvatar(avatarFile);
        if (uploadResult.success && uploadResult.url) {
          avatarUrl = uploadResult.url;
          
          // Immediately update the UI to show the new avatar
          setProfileData(prev => ({
            ...prev,
            profilePicture: avatarUrl
          }));
        } else {
          console.warn('Avatar upload failed:', uploadResult.error);
          alert(`Failed to upload avatar: ${uploadResult.error}`);
          return; // Don't proceed with profile update if avatar upload fails
        }
      }

      // Update profile in database
      const result = await updateUserProfile(user.id, {
        full_name: profileData.name,
        phone_number: profileData.phone,
        address: profileData.address,
        avatar_url: avatarUrl
      });

      if (result.success) {
        alert('Profile updated successfully!');
        
        // Update local state with the saved data
        setProfileData(prev => ({
          ...prev,
          profilePicture: avatarUrl
        }));

        // Also update user metadata for immediate consistency
        try {
          await supabase.auth.updateUser({
            data: { 
              name: profileData.name,
              phone: profileData.phone,
              avatar_url: avatarUrl
            }
          });
        } catch (error) {
          console.warn('Failed to update user metadata:', error);
        }

        // Clear the avatar file state
        setAvatarFile(null);
        setIsEditing(false);
      } else {
        alert(`Failed to update profile: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in profile update process:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    console.log('Changing password');
    setShowChangePassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const handleSecuritySettingChange = (setting: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
  };

  const handle2FASetup = () => {
    console.log('Setting up 2FA');
    setShow2FASetup(false);
    setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }));
  };

  const handleDisable2FA = () => {
    console.log('Disabling 2FA');
    setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: false }));
    setShow2FASetup(false);
  };

  const handleSupportAction = (type: string) => {
    setSupportType(type);
    if (type === 'chat') {
      // Simulate opening chat
      alert('Opening live chat support...');
    } else if (type === 'email') {
      setShowSupportDialog(true);
    } else if (type === 'faq') {
      // Navigate to FAQ page
      window.open('https://help.trashee.com/faq', '_blank');
    } else if (type === 'report') {
      setShowSupportDialog(true);
    }
  };

  const handleSupportSubmit = () => {
    console.log('Submitting support request:', { type: supportType, message: supportMessage });
    alert('Support request submitted successfully! We will get back to you within 24 hours.');
    setShowSupportDialog(false);
    setSupportMessage('');
    setSupportType('');
  };

  const handleAppInfo = (type: string) => {
    if (type === 'terms') {
      window.open('https://trashee.com/terms', '_blank');
    } else if (type === 'privacy') {
      window.open('https://trashee.com/privacy', '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Profile & Settings</h1>
            <p className="text-sm text-gray-500">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            {/* Profile Header */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profileData.profilePicture} alt="Profile" />
                      <AvatarFallback className="text-xl">JD</AvatarFallback>
                    </Avatar>
                    <label htmlFor="avatar-upload">
                      <Button 
                        size="sm" 
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        type="button"
                        asChild
                      >
                        <div>
                          <Camera className="w-4 h-4" />
                          <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </div>
                      </Button>
                    </label>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{profileData.name}</h2>
                    <p className="text-gray-600">{profileData.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary">{profileData.level}</Badge>
                      <span className="text-sm text-gray-500">
                        {profileData.totalPoints} points earned
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button 
                  variant={isEditing ? "default" : "outline"} 
                  size="sm"
                  onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Member Since</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <Input value={profileData.joinedDate} disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            {/* Password Section */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Password & Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowChangePassword(true)}>
                    Change Password
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">
                      {securitySettings.twoFactorEnabled ? 'Enabled - Extra security for your account' : 'Add an extra layer of security'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {securitySettings.twoFactorEnabled && (
                      <Badge variant="default">Enabled</Badge>
                    )}
                    <Button 
                      variant={securitySettings.twoFactorEnabled ? "outline" : "default"}
                      onClick={() => setShow2FASetup(true)}
                    >
                      {securitySettings.twoFactorEnabled ? 'Manage' : 'Enable'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive updates and offers via email</p>
                  </div>
                  <Switch 
                    checked={securitySettings.emailNotifications}
                    onCheckedChange={(checked) => handleSecuritySettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Get real-time alerts on your device</p>
                  </div>
                  <Switch 
                    checked={securitySettings.pushNotifications}
                    onCheckedChange={(checked) => handleSecuritySettingChange('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Alerts</h3>
                    <p className="text-sm text-gray-500">Important updates via text message</p>
                  </div>
                  <Switch 
                    checked={securitySettings.smsAlerts}
                    onCheckedChange={(checked) => handleSecuritySettingChange('smsAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Location Tracking</h3>
                    <p className="text-sm text-gray-500">Help us find nearby bins and offers</p>
                  </div>
                  <Switch 
                    checked={securitySettings.locationTracking}
                    onCheckedChange={(checked) => handleSecuritySettingChange('locationTracking', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4">
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Customer Care
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleSupportAction('chat')}
                  >
                    <div className="text-left">
                      <h3 className="font-medium">Live Chat Support</h3>
                      <p className="text-sm text-gray-500">Get instant help from our team</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleSupportAction('email')}
                  >
                    <div className="text-left">
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-sm text-gray-500">Send us your questions and feedback</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleSupportAction('faq')}
                  >
                    <div className="text-left">
                      <h3 className="font-medium">FAQ & Help Center</h3>
                      <p className="text-sm text-gray-500">Find answers to common questions</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handleSupportAction('report')}
                  >
                    <div className="text-left">
                      <h3 className="font-medium">Report a Problem</h3>
                      <p className="text-sm text-gray-500">Let us know about any issues</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* App Information */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
              <CardHeader>
                <CardTitle>App Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">App Version:</span>
                  <span>2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span>January 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Build:</span>
                  <span>210.1.5</span>
                </div>
                <hr />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAppInfo('terms')}
                  >
                    Terms of Service
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAppInfo('privacy')}
                  >
                    Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Card className="border-red-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
              <CardContent className="p-4">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowChangePassword(false)}>
                Cancel
              </Button>
              <Button onClick={handlePasswordChange}>
                Change Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                {securitySettings.twoFactorEnabled 
                  ? 'Manage your two-factor authentication settings'
                  : 'Secure your account with two-factor authentication'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {!securitySettings.twoFactorEnabled ? (
                <>
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your authenticator app
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input
                      id="verificationCode"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-green-800">2FA Enabled</h3>
                        <p className="text-sm text-green-600">Your account is protected</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDisable2FA}
                  >
                    Disable Two-Factor Authentication
                  </Button>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShow2FASetup(false)}>
                Cancel
              </Button>
              {!securitySettings.twoFactorEnabled && (
                <Button onClick={handle2FASetup}>
                  Enable 2FA
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Support Request Dialog */}
      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {supportType === 'email' ? 'Contact Support' : 'Report a Problem'}
            </DialogTitle>
            <DialogDescription>
              {supportType === 'email'
                ? 'Send us your questions and we\'ll get back to you.'
                : 'Tell us about the issue you\'re experiencing.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                placeholder={supportType === 'email'
                  ? 'How can we help you?'
                  : 'Describe the problem you\'re experiencing...'
                }
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupportDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSupportSubmit}
              disabled={!supportMessage.trim()}
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
