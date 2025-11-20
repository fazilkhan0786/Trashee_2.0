import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Edit, Save, Camera, MapPin, Phone, Mail, LogOut, 
  Briefcase, Shield, HelpCircle, Lock, User, ExternalLink 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function CollectorProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    emergency_contact: '',
    address: '',
    licenseNumber: '',
    vehicleNumber: '',
    experience: '',
    specialization: '',
    avatar_url: '/placeholder.svg',
    bio: '',
    zone: 'Ahmedabad Central',
    shift: 'Morning (6 AM - 2 PM)'
  });
  
  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login', { replace: true });
          return;
        }
        
        setUserId(user.id);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            *,
            collector_details (
              *
            )
          `)
          .eq('id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') throw error;
        
        if (profile) {
          const collectorDetails = profile.collector_details || {};
            
          setProfileData({
            name: profile.full_name || '',
            email: user.email || profile.email || '',
            phone: profile.phone_number || '',
            emergency_contact: collectorDetails.emergency_contact || '',
            address: profile.address || '',
            licenseNumber: collectorDetails.license_number || '',
            vehicleNumber: collectorDetails.vehicle_number || '',
            experience: collectorDetails.experience || '',
            specialization: collectorDetails.specialization || '',
            bio: collectorDetails.bio || '',
            zone: collectorDetails.zone || 'Ahmedabad Central',
            shift: collectorDetails.shift || 'Morning (6 AM - 2 PM)',
            avatar_url: profile.avatar_url || '/placeholder.svg'
          });
        } else {
          setProfileData(prev => ({ ...prev, email: user.email || '' }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
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

  const handleSaveProfile = async () => {
    if (!userId) {
      alert('User not found. Please log in again.');
      return;
    }
    setLoading(true);

    let newAvatarUrl = profileData.avatar_url;

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true });

      if (uploadError) {
        alert(`Failed to upload avatar: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      newAvatarUrl = data.publicUrl;
    }

    const profileUpdates = {
      id: userId,
      full_name: profileData.name,
      phone_number: profileData.phone,
      address: profileData.address,
      avatar_url: newAvatarUrl,
      email: profileData.email,
      updated_at: new Date().toISOString(),
    };

    const collectorUpdates = {
      id: userId,
      emergency_contact: profileData.emergency_contact,
      license_number: profileData.licenseNumber,
      vehicle_number: profileData.vehicleNumber,
      experience: profileData.experience,
      specialization: profileData.specialization,
      bio: profileData.bio,
      zone: profileData.zone,
      shift: profileData.shift,
    };

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileUpdates);

      if (profileError) throw profileError;

      const { error: collectorError } = await supabase
        .from('collector_details')
        .upsert(collectorUpdates);

      if (collectorError) throw collectorError;

      alert('Profile updated successfully!');
      setProfileData(prev => ({ ...prev, avatar_url: newAvatarUrl }));
      setAvatarFile(null);
      setIsEditing(false);

    } catch (error: any) {
      alert(`Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) {
        alert(`Error sending reset email: ${error.message}`);
      } else {
        alert('A password reset link has been sent to your email.');
      }
    } else {
      alert('Could not find your email to send a reset link.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-6 shadow-lg">
        <div className="flex items-center gap-4 max-w-5xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:bg-white/20 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Collector Profile</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <Tabs defaultValue="profile" className="space-y-8">
          {/* Tab List */}
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-gray-100">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-200 rounded-xl py-3 px-4 font-medium"
            >
              <User className="w-5 h-5" /> Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-200 rounded-xl py-3 px-4 font-medium"
            >
              <Shield className="w-5 h-5" /> Security
            </TabsTrigger>
            <TabsTrigger
              value="support"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all duration-200 rounded-xl py-3 px-4 font-medium"
            >
              <HelpCircle className="w-5 h-5" /> Support
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-8">
            {/* Hero Avatar Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-3xl shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-white/40 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                    <AvatarImage src={profileData.avatar_url} alt="Profile" className="object-cover" />
                    <AvatarFallback className="text-2xl bg-blue-700 text-white font-bold">
                      {profileData.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
                      <div className="rounded-full w-12 h-12 p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 flex items-center justify-center transition-all duration-200 shadow-lg border border-white/30">
                        <Camera className="w-5 h-5" />
                        <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      </div>
                    </label>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-2">{profileData.name || 'Unnamed Collector'}</h2>
                  <p className="text-blue-100 text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5" /> {profileData.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Main Profile Card */}
            <Card className="rounded-3xl shadow-xl border border-gray-100 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-6">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  Collector Information
                </CardTitle>
                <Button
                  onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" /> Edit Profile
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Personal Details */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-800 border-b border-gray-200 pb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="font-medium text-gray-800 py-2 px-3 bg-gray-50 rounded-lg">
                          {profileData.name || 'Not set'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 font-medium">Email</Label>
                      <p className="font-medium text-gray-800 py-2 px-3 bg-gray-50 rounded-lg">{profileData.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="font-medium text-gray-800 py-2 px-3 bg-gray-50 rounded-lg">
                          {profileData.phone || 'Not set'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact" className="text-gray-700 font-medium">Emergency Contact</Label>
                      {isEditing ? (
                        <Input
                          id="emergency_contact"
                          value={profileData.emergency_contact}
                          onChange={(e) => setProfileData({ ...profileData, emergency_contact: e.target.value })}
                          className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Contact number in case of emergency"
                        />
                      ) : (
                        <p className="font-medium text-gray-800 py-2 px-3 bg-gray-50 rounded-lg">
                          {profileData.emergency_contact || 'Not set'}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="address" className="text-gray-700 font-medium">Address</Label>
                      {isEditing ? (
                        <Textarea
                          id="address"
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          rows={3}
                          placeholder="Enter your full address"
                        />
                      ) : (
                        <p className="font-medium text-gray-800 py-3 px-3 bg-gray-50 rounded-lg whitespace-pre-line">
                          {profileData.address || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-800 border-b border-gray-200 pb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" /> Professional Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber" className="text-gray-700 font-medium">License Number</Label>
                      {isEditing ? (
                        <Input
                          id="licenseNumber"
                          value={profileData.licenseNumber}
                          onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                          className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Enter license number"
                        />
                      ) : (
                        <p className="font-medium text-gray-800 py-2 px-3 bg-gray-50 rounded-lg">
                          {profileData.licenseNumber || 'Not set'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicle" className="text-gray-700 font-medium">Vehicle Number</Label>
                      {isEditing ? (
                        <Input
                          id="vehicle"
                          value={profileData.vehicleNumber}
                          onChange={(e) => setProfileData({ ...profileData, vehicleNumber: e.target.value })}
                          className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          placeholder="Enter vehicle registration"
                        />
                      ) : (
                        <p className="font-medium text-gray-800 py-2 px-3 bg-gray-50 rounded-lg">
                          {profileData.vehicleNumber || 'Not set'}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="experience" className="text-gray-700 font-medium">Experience</Label>
                      {isEditing ? (
                        <Textarea
                          id="experience"
                          value={profileData.experience}
                          onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                          className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          rows={4}
                          placeholder="Years of experience, certifications, training, etc."
                        />
                      ) : (
                        <p className="font-medium text-gray-800 py-3 px-3 bg-gray-50 rounded-lg whitespace-pre-line">
                          {profileData.experience || 'Not set'}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="specialization" className="text-gray-700 font-medium">Specialization</Label>
                      {isEditing ? (
                        <Textarea
                          id="specialization"
                          value={profileData.specialization}
                          onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                          className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                          rows={4}
                          placeholder="Hazardous waste, recyclables, organic, etc."
                        />
                      ) : (
                        <p className="font-medium text-gray-800 py-3 px-3 bg-gray-50 rounded-lg whitespace-pre-line">
                          {profileData.specialization || 'Not set'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Operational Details */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-800 border-b border-gray-200 pb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" /> Operational Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="zone" className="text-gray-700 font-medium">Collection Zone</Label>
                      {isEditing ? (
                        <Select value={profileData.zone} onValueChange={(value) => setProfileData({ ...profileData, zone: value })}>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                            <SelectValue placeholder="Select zone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ahmedabad Central">Ahmedabad Central</SelectItem>
                            <SelectItem value="Ahmedabad East">Ahmedabad East</SelectItem>
                            <SelectItem value="Ahmedabad West">Ahmedabad West</SelectItem>
                            <SelectItem value="Ahmedabad North">Ahmedabad North</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-gray-800 py-2 px-3 bg-gray-50 rounded-lg">
                          {profileData.zone}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shift" className="text-gray-700 font-medium">Shift</Label>
                      {isEditing ? (
                        <Select value={profileData.shift} onValueChange={(value) => setProfileData({ ...profileData, shift: value })}>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Morning (6 AM - 2 PM)">Morning (6 AM - 2 PM)</SelectItem>
                            <SelectItem value="Afternoon (2 PM - 10 PM)">Afternoon (2 PM - 10 PM)</SelectItem>
                            <SelectItem value="Night (10 PM - 6 AM)">Night (10 PM - 6 AM)</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="font-medium text-gray-800 py-2 px-3 bg-gray-50 rounded-lg">
                          {profileData.shift}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-700 font-medium">Bio / Notes</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      rows={5}
                      placeholder="Tell us about yourself — your passion for waste management, goals, etc."
                    />
                  ) : (
                    <p className="font-medium text-gray-800 py-4 px-3 bg-gray-50 rounded-lg whitespace-pre-line">
                      {profileData.bio || 'Not set'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-8">
            <Card className="rounded-3xl shadow-xl border border-gray-100 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-blue-600" /> Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-6 border border-gray-200 rounded-2xl bg-gray-50">
                  <div>
                    <h3 className="font-semibold text-gray-800">Reset Password</h3>
                    <p className="text-gray-600 mt-1">We’ll send a secure reset link to your registered email.</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handlePasswordReset}
                    className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
                  >
                    Send Reset Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-8">
            {/* Support Info */}
            <Card className="rounded-3xl shadow-xl border border-gray-100 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-lg leading-relaxed">
                  For urgent assistance or technical issues, please contact your assigned route manager. 
                  Our team is here to ensure your daily operations run smoothly.
                </p>
              </CardContent>
            </Card>

            {/* Legal & Policies */}
            <Card className="rounded-3xl shadow-xl border border-gray-100 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-600" /> Legal & Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-between border-gray-300 hover:bg-gray-50 transition-all"
                  asChild
                >
                  <a href="https://dprofiz.com/privacy-policy.html" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                    <ExternalLink className="w-5 h-5 text-gray-500" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between border-gray-300 hover:bg-gray-50 transition-all"
                  asChild
                >
                  <a href="https://dprofiz.com/terms-and-conditions.html" target="_blank" rel="noopener noreferrer">
                    Terms & Conditions
                    <ExternalLink className="w-5 h-5 text-gray-500" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Logout Card */}
            <Card className="rounded-3xl shadow-xl border border-red-200 bg-white hover:shadow-red-100/50 transition-shadow">
              <CardContent className="p-6">
                <Button
                  variant="destructive"
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full flex items-center justify-center gap-2 text-white font-medium shadow-lg hover:shadow-red-500/30 transition-all transform hover:scale-105"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-md rounded-3xl shadow-2xl border-0">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-gray-800">Confirm Logout</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Are you sure you want to logout? You’ll need to sign in again to access your profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-6">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all transform hover:scale-105"
            >
              <LogOut className="w-5 h-5 mr-2" /> Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}