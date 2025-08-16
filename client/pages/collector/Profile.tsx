import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, User, Edit, Save, Lock, QrCode, Camera, MapPin, Phone, Mail, Calendar, Truck, Award, Target, BarChart, Trophy, Star, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { updateUserProfile, uploadAvatar, getUserProfile } from '../../lib/profileService';

export default function CollectorProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    licenseNumber: 'WC2024001',
    vehicleNumber: '',
    experience: '',
    specialization: 'Mixed Waste Collection',
    emergencyContact: '',
    avatar: '/placeholder.svg',
    bio: '',
    zone: 'Mumbai Central',
    shift: 'Morning (6 AM - 2 PM)'
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
        
        // Get user profile from profiles table
        const { data: profile, error } = await supabase
          .from('collector_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        // Handle case where profiles table might not exist yet
        if (error) {
          console.error('Error fetching profile:', error);
          // Still set user data from auth metadata if available
          if (error.code !== 'PGRST116') {
            setProfileData(prev => ({
              ...prev,
              name: user.user_metadata?.name || '',
              email: user.email || '',
              phone: user.user_metadata?.phone || '',
              joinedDate: new Date().toISOString().split('T')[0]
            }));
          }
          return;
        }
        
        // Update profile data with user information
        setProfileData(prev => ({
          ...prev,
          name: profile?.name || user.user_metadata?.name || '',
          email: user.email || '',
          phone: profile?.phone || user.user_metadata?.phone || '',
          address: profile?.address || '',
          vehicleNumber: profile?.vehicle_number || '',
          experience: profile?.experience || '',
          emergencyContact: profile?.emergency_contact || '',
          bio: profile?.bio || '',
          zone: profile?.zone || 'Mumbai Central',
          shift: profile?.shift || 'Morning (6 AM - 2 PM)'
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [navigate]);

  const collectorStats = {
    totalCollections: 0,
    totalWeight: 0,
    pointsEarned: 0,
    efficiency: 0,
    rating: 0,
    streak: 0,
    rank: 'broonze Collector',
    level: 1,
    nextLevelPoints: 0,
    achievements: 0,
    referrals: 0
  };

  const achievements = [
    { id: 1, name: 'Eco Warrior', description: '1000+ collections completed', icon: '🌱', earned: true },
    { id: 2, name: 'Efficiency Master', description: 'Maintained 90%+ efficiency for 30 days', icon: '⚡', earned: true },
    { id: 3, name: 'Team Player', description: 'Successfully referred 3+ collectors', icon: '👥', earned: true },
    { id: 4, name: 'Streak Champion', description: '2 weeks consecutive collections', icon: '🔥', earned: true },
    { id: 5, name: 'Route Optimizer', description: 'Complete route under estimated time 50 times', icon: '📍', earned: false },
    { id: 6, name: 'Point Master', description: 'Earn 50,000 total points', icon: '💎', earned: false }
  ];

  const recentActivity = [
    
  ];

  const handleSaveProfile = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be logged in to update your profile');
        return;
      }
      
      // Try to update profile in Supabase
      const { error } = await supabase
        .from('collector_profiles')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          vehicle_number: profileData.vehicleNumber,
          emergency_contact: profileData.emergencyContact,
          bio: profileData.bio,
          zone: profileData.zone,
          shift: profileData.shift,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      // If there's an error with the collector_profiles table, try to create it
      if (error) {
        console.log('Error updating profile, attempting to create profile:', error);
        
        // Try to insert a new profile
        const { error: insertError } = await supabase
          .from('collector_profiles')
          .insert([{ 
            id: user.id,
            name: profileData.name,
            phone: profileData.phone,
            address: profileData.address,
            vehicle_number: profileData.vehicleNumber,
            emergency_contact: profileData.emergencyContact,
            bio: profileData.bio,
            zone: profileData.zone,
            shift: profileData.shift,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          alert('Failed to update profile. Please try again.');
          return;
        }
      }
      
      // Update user metadata
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          phone: profileData.phone
        }
      });
      
      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
      }
      
      alert('Profile updated successfully!');
      console.log('Saving profile:', profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  const getUserQRCode = () => {
    return `COLLECTOR_${profileData.licenseNumber}_${Date.now()}`;
  };

  const handleChangePassword = () => {
    setShowPasswordDialog(true);
  };

  const handlePrivacySettings = () => {
    setShowPrivacyDialog(true);
  };

  const handleShiftPreferences = () => {
    setShowShiftDialog(true);
  };

  const handleMyQRCode = () => {
    setShowQRDialog(true);
  };

  const handlePasswordSubmit = () => {
    alert('Password changed successfully!');
    setShowPasswordDialog(false);
  };

  const handlePrivacySubmit = () => {
    alert('Privacy settings updated successfully!');
    setShowPrivacyDialog(false);
  };

  const handleShiftSubmit = () => {
    alert('Shift preferences updated successfully!');
    setShowShiftDialog(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    
    try {
      const result = await uploadAvatar(file);
      
      if (result.success && result.url) {
        setProfileData(prev => ({ ...prev, avatar: result.url }));
        console.log('✅ Collector avatar uploaded successfully');
      } else {
        console.error('❌ Collector avatar upload failed:', result.error);
        alert(`Failed to upload avatar: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Collector avatar upload error:', error);
      alert('Failed to upload avatar. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 animate-in slide-in-from-top duration-500">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Collector Profile</h1>
            <p className="text-sm opacity-90">Manage your profile and view performance</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowQRDialog(true)}
              className="text-white hover:bg-white/20"
            >
              <QrCode className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Overview */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                  <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-600">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{profileData.name}</h2>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Trophy className="w-3 h-3 mr-1" />
                    {collectorStats.rank}
                  </Badge>
                  <Badge variant="outline">
                    Level {collectorStats.level}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profileData.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profileData.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profileData.zone}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{profileData.bio}</p>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{collectorStats.totalCollections}</div>
                    <div className="text-xs text-gray-500">Collections</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{collectorStats.efficiency}%</div>
                    <div className="text-xs text-gray-500">Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                      {collectorStats.rating}
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{collectorStats.pointsEarned.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Points</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4 text-center">
              <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{collectorStats.totalWeight.toLocaleString()}</div>
              <div className="text-xs text-gray-500">KG Collected</div>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{collectorStats.streak}</div>
              <div className="text-xs text-gray-500">Day Streak</div>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{collectorStats.achievements}</div>
              <div className="text-xs text-gray-500">Achievements</div>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4 text-center">
              <BarChart className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">{collectorStats.referrals}</div>
              <div className="text-xs text-gray-500">Referrals</div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Information */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{profileData.name}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="license">License Number</Label>
                <p className="font-medium">{profileData.licenseNumber}</p>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{profileData.email}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="phone">Phone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{profileData.phone}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="vehicle">Vehicle Number</Label>
                {isEditing ? (
                  <Input
                    id="vehicle"
                    value={profileData.vehicleNumber}
                    onChange={(e) => setProfileData({...profileData, vehicleNumber: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{profileData.vehicleNumber}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="zone">Collection Zone</Label>
                {isEditing ? (
                  <Select value={profileData.zone} onValueChange={(value) => setProfileData({...profileData, zone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                      <SelectItem value="Mumbai East">Mumbai East</SelectItem>
                      <SelectItem value="Mumbai West">Mumbai West</SelectItem>
                      <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium">{profileData.zone}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  rows={2}
                />
              ) : (
                <p className="font-medium">{profileData.address}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  rows={3}
                />
              ) : (
                <p className="font-medium">{profileData.bio}</p>
              )}
            </div>
            
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveProfile} className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`flex items-center gap-4 p-4 rounded-lg border ${
                  achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${achievement.earned ? 'text-green-800' : 'text-gray-600'}`}>
                      {achievement.name}
                    </h4>
                    <p className={`text-sm ${achievement.earned ? 'text-green-600' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <Badge className="bg-green-100 text-green-800">
                      Earned
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1200">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{activity.activity}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    +{activity.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings & Actions */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1300">
          <CardHeader>
            <CardTitle>Settings & Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={handleChangePassword}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={handlePrivacySettings}
              >
                <Settings className="w-4 h-4 mr-2" />
                Privacy Settings
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={handleShiftPreferences}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Shift Preferences
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={handleMyQRCode}
              >
                <QrCode className="w-4 h-4 mr-2" />
                My QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-red-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-1400">
          <CardContent className="p-4">
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              My Collector QR Code
            </DialogTitle>
            <DialogDescription>
              Your unique collector identification QR code
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-24 h-24 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Collector QR Code</p>
                <p className="text-xs text-gray-400">{getUserQRCode()}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm">
                <strong>License:</strong> {profileData.licenseNumber}<br />
                <strong>Zone:</strong> {profileData.zone}<br />
                <strong>Vehicle:</strong> {profileData.vehicleNumber}
              </p>
            </div>
          </div>
          
          <DialogFooter className="justify-center">
            <Button onClick={() => setShowQRDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your collector account password
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Settings Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Privacy Settings</DialogTitle>
            <DialogDescription>
              Manage your privacy and data sharing preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Location Tracking</p>
                <p className="text-sm text-gray-500">Allow location tracking during work hours</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Performance Analytics</p>
                <p className="text-sm text-gray-500">Share performance data for improvement</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Contact Visibility</p>
                <p className="text-sm text-gray-500">Show contact info to admin</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrivacyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrivacySubmit}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shift Preferences Dialog */}
      <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Shift Preferences</DialogTitle>
            <DialogDescription>
              Update your preferred working hours and schedule
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="preferred-shift">Preferred Shift</Label>
              <Select defaultValue={profileData.shift}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</SelectItem>
                  <SelectItem value="Afternoon (2 PM - 10 PM)">Afternoon (2 PM - 10 PM)</SelectItem>
                  <SelectItem value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="preferred-zone">Preferred Zone</Label>
              <Select defaultValue={profileData.zone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mumbai Central">Mumbai Central</SelectItem>
                  <SelectItem value="Mumbai East">Mumbai East</SelectItem>
                  <SelectItem value="Mumbai West">Mumbai West</SelectItem>
                  <SelectItem value="Mumbai North">Mumbai North</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekend Availability</p>
                <p className="text-sm text-gray-500">Available for weekend shifts</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShiftDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShiftSubmit}>
              Update Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
