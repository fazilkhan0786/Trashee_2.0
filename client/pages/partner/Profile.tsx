import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Store,
  Upload,
  FileText,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { updateUserProfile, uploadAvatar, getUserProfile } from '../../lib/profileService';

export default function PartnerProfile() {
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
    address: 'Green Electronics Store, Mall Road, Block A',
    joinedDate: '',
    level: 'Partner',
    totalPoints: 0,
    profilePicture: '/placeholder.svg'
  });

  const [shopData, setShopData] = useState({
    shopName: '',
    shopDescription: 'Eco-friendly electronics and sustainable technology solutions',
    shopAddress: 'Mall Road, Block A, Green District',
    sinceDate: '',
    shopImage: '/placeholder.svg',
    taxCertificate: null as File | null,
    businessLicense: null as File | null
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    emailNotifications: true,
    pushNotifications: true,
    salesNotifications: true,
    couponAlerts: true,
    smsAlerts: true
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
          .from('profiles')
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
            
            // Update shop data
            setShopData(prev => ({
              ...prev,
              shopName: user.user_metadata?.name || '',
              sinceDate: new Date().toISOString().split('T')[0]
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
          joinedDate: profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : ''
        }));
        
        // Update shop data
        setShopData(prev => ({
          ...prev,
          shopName: profile?.name || user.user_metadata?.name || '',
          sinceDate: profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : ''
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [navigate]);
  
  // Security settings are already defined above, no need for duplicate declaration

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async () => {
    // Validate required business documents
    if (!shopData.taxCertificate) {
      alert('Tax Certificate is required. Please upload your tax certificate before saving.');
      return;
    }
    if (!shopData.businessLicense) {
      alert('Business License is required. Please upload your business license before saving.');
      return;
    }

    try {
      setLoading(true);
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be logged in to update your profile');
        return;
      }
      
      // Try to update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      // If there's an error with the profiles table, try to create it
      if (error) {
        console.log('Error updating profile, attempting to create profile:', error);
        
        // Try to insert a new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: user.id,
              name: profileData.name,
              phone: profileData.phone,
              user_type: user.user_metadata?.user_type || '1', // 1 for Partner
              status: 'active',
              points: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Continue with metadata update even if profile creation fails
        }
      }
      
      // Always update user metadata (this will work even if profiles table doesn't exist)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          phone: profileData.phone
        }
      });
      
      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
        alert('Failed to update profile. Please try again.');
        return;
      }
      
      alert('Profile updated successfully!');
      console.log('Profile updated:', profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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

  const handlePartnerSupportAction = (type: string) => {
    setSupportType(type);
    if (type === 'manager') {
      // Simulate contacting success manager
      alert('Connecting you with your Partner Success Manager...\n\nYour dedicated manager will contact you within 30 minutes.');
    } else if (type === 'analytics') {
      // Navigate to analytics help
      window.open('https://partner.trashee.com/analytics-guide', '_blank');
    } else if (type === 'coupon-guide') {
      // Navigate to coupon guide
      window.open('https://partner.trashee.com/coupon-guide', '_blank');
    } else if (type === 'technical') {
      setShowSupportDialog(true);
    }
  };

  const handlePartnerSupportSubmit = () => {
    console.log('Submitting partner support request:', { type: supportType, message: supportMessage });
    alert('Technical support request submitted successfully!\n\nOur technical team will contact you within 4 hours.');
    setShowSupportDialog(false);
    setSupportMessage('');
    setSupportType('');
  };

  const handleSecuritySettingChange = (setting: string, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setShopData(prev => ({ ...prev, [field]: file }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    
    try {
      const result = await uploadAvatar(file);
      
      if (result.success && result.url) {
        setProfileData(prev => ({ ...prev, profilePicture: result.url }));
        console.log('✅ Partner avatar uploaded successfully');
      } else {
        console.error('❌ Partner avatar upload failed:', result.error);
        alert(`Failed to upload avatar: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Partner avatar upload error:', error);
      alert('Failed to upload avatar. Please try again.');
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
            <h1 className="text-xl font-bold">Partner Profile & Settings</h1>
            <p className="text-sm text-gray-500">Manage your partner account and shop details</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-1 text-xs">
              <User className="w-3 h-3" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-1 text-xs">
              <Store className="w-3 h-3" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-1 text-xs">
              <Shield className="w-3 h-3" />
              Security
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-1 text-xs">
              <HelpCircle className="w-3 h-3" />
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
                      <AvatarFallback className="text-xl">MR</AvatarFallback>
                    </Avatar>
                    <Button 
                      size="sm" 
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      type="file"
                      accept=".jpg, .jpeg, .png"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar"
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      className="absolute -bottom-2 -right-12 rounded-full w-8 h-8 p-0"
                      onClick={() => document.getElementById('avatar')?.click()}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{profileData.name}</h2>
                    <p className="text-gray-600">{profileData.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Award className="w-3 h-3 mr-1" />
                        {profileData.level}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {profileData.totalPoints} points earned
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
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
                    <Label>Partner Since</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <Input value={profileData.joinedDate} disabled />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shop Tab */}
          <TabsContent value="shop" className="space-y-4">
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Shop Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopImage">Shop Image</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 rounded-lg">
                      <AvatarImage src={shopData.shopImage} alt="Shop" />
                      <AvatarFallback>GE</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input
                    id="shopName"
                    value={shopData.shopName}
                    onChange={(e) => setShopData(prev => ({ ...prev, shopName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shopDescription">Shop Description</Label>
                  <Textarea
                    id="shopDescription"
                    value={shopData.shopDescription}
                    onChange={(e) => setShopData(prev => ({ ...prev, shopDescription: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="shopAddress">Shop Address</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <Input
                      id="shopAddress"
                      value={shopData.shopAddress}
                      onChange={(e) => setShopData(prev => ({ ...prev, shopAddress: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Since Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <Input value={shopData.sinceDate} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
              <CardHeader>
                <CardTitle>Business Documents <span className="text-red-500">*</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <span className="font-medium">Required:</span> Both tax certificate and business license are mandatory for partner verification and compliance.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Tax Certificate <span className="text-red-500">*</span></Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload tax certificate</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('taxCertificate', e.target.files?.[0] || null)}
                      className="hidden"
                      id="taxCertificate"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('taxCertificate')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    {shopData.taxCertificate && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ {shopData.taxCertificate.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Business License <span className="text-red-500">*</span></Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload business license</p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload('businessLicense', e.target.files?.[0] || null)}
                      className="hidden"
                      id="businessLicense"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('businessLicense')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    {shopData.businessLicense && (
                      <p className="text-xs text-green-600 mt-2">
                        ✓ {shopData.businessLicense.name}
                      </p>
                    )}
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
                    <p className="text-sm text-gray-500">Last changed 15 days ago</p>
                  </div>
                  <Button variant="outline" onClick={() => setShowChangePassword(true)}>
                    Change Password
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">
                      {securitySettings.twoFactorEnabled ? 'Enabled - Your partner account is protected' : 'Add an extra layer of security'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Enabled</Badge>
                    <Button variant="outline" onClick={() => setShow2FASetup(true)}>
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Partner Notification Settings */}
            <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Partner Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Business updates and offers</p>
                  </div>
                  <Switch 
                    checked={securitySettings.emailNotifications}
                    onCheckedChange={(checked) => handleSecuritySettingChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sales Notifications</h3>
                    <p className="text-sm text-gray-500">When your coupons are sold</p>
                  </div>
                  <Switch 
                    checked={securitySettings.salesNotifications}
                    onCheckedChange={(checked) => handleSecuritySettingChange('salesNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Coupon Alerts</h3>
                    <p className="text-sm text-gray-500">Approval status and expiry reminders</p>
                  </div>
                  <Switch 
                    checked={securitySettings.couponAlerts}
                    onCheckedChange={(checked) => handleSecuritySettingChange('couponAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-500">Real-time partner alerts</p>
                  </div>
                  <Switch 
                    checked={securitySettings.pushNotifications}
                    onCheckedChange={(checked) => handleSecuritySettingChange('pushNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Alerts</h3>
                    <p className="text-sm text-gray-500">Important business updates</p>
                  </div>
                  <Switch 
                    checked={securitySettings.smsAlerts}
                    onCheckedChange={(checked) => handleSecuritySettingChange('smsAlerts', checked)}
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
                  Partner Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handlePartnerSupportAction('manager')}
                  >
                    <div className="text-left">
                      <h3 className="font-medium">Partner Success Manager</h3>
                      <p className="text-sm text-gray-500">Dedicated support for business growth</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handlePartnerSupportAction('analytics')}
                  >
                    <div className="text-left">
                      <h3 className="font-medium">Business Analytics Help</h3>
                      <p className="text-sm text-gray-500">Understand your performance metrics</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handlePartnerSupportAction('coupon-guide')}
                  >
                    <div className="text-left">
                      <h3 className="font-medium">Coupon Management Guide</h3>
                      <p className="text-sm text-gray-500">Best practices for creating offers</p>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start h-auto p-4"
                    onClick={() => handlePartnerSupportAction('technical')}
                  >
                    <div className="text-left">
                      <h3 className="font-medium">Technical Support</h3>
                      <p className="text-sm text-gray-500">Report issues or get technical help</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Card className="border-red-200 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
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
                Update your partner account password
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

      {/* Partner Support Dialog */}
      <Dialog open={showSupportDialog} onOpenChange={setShowSupportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Technical Support</DialogTitle>
            <DialogDescription>
              Describe the technical issue you're experiencing and our team will help you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="support-message">Issue Description</Label>
              <Textarea
                id="support-message"
                placeholder="Please describe the technical issue you're facing..."
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
              onClick={handlePartnerSupportSubmit}
              disabled={!supportMessage.trim()}
            >
              Submit Support Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Manage your two-factor authentication settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">SMS Authentication</h3>
                <p className="text-sm text-gray-500">Receive codes via SMS</p>
              </div>
              <Switch
                checked={securitySettings.twoFactorEnabled}
                onCheckedChange={(checked) => {
                  setSecuritySettings(prev => ({
                    ...prev,
                    twoFactorEnabled: checked
                  }));
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Authenticator App</h3>
                <p className="text-sm text-gray-500">Use Google Authenticator or similar</p>
              </div>
              <Button variant="outline" size="sm">
                Setup
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Backup Codes</h3>
                <p className="text-sm text-gray-500">Download recovery codes</p>
              </div>
              <Button variant="outline" size="sm">
                Generate
              </Button>
            </div>

            {securitySettings.twoFactorEnabled && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">2FA Active</span>
                </div>
                <p className="text-sm text-green-700">
                  Your account is protected with two-factor authentication
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FASetup(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('2FA settings updated:', securitySettings);
              setShow2FASetup(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
