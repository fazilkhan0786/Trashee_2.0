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
import { ArrowLeft, User, Edit, Save, Lock, QrCode, Download, Upload, Eye, Settings, Shield, Key, Bell, Calendar, Camera, MapPin, Phone, Mail, CheckCircle, AlertCircle, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { updateUserProfile, uploadAvatar, getUserProfile } from '../../lib/profileService';

interface QRCode {
  id: string;
  name: string;
  type: 'bin' | 'partner' | 'event' | 'promotional';
  location?: string;
  partnerId?: string;
  status: 'active' | 'inactive' | 'expired';
  scans: number;
  createdAt: string;
  expiryDate?: string;
  qrData: string;
}

export default function AdminProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Super Admin',
    department: 'System Management',
    location: 'Headquarters, Mumbai',
    joinDate: '',
    lastLogin: '',
    permissions: ['User Management', 'System Settings', 'Data Analytics', 'Content Management'],
    avatar: '/placeholder.svg'
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
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
            setAdminData(prev => ({
              ...prev,
              name: user.user_metadata?.name || 'Administrator',
              email: user.email || 'admin@trashee.com',
              phone: user.user_metadata?.phone || '+91 98765 43210',
              joinDate: new Date().toISOString().split('T')[0],
              lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at).toISOString().replace('T', ' ').substring(0, 16) : '2024-01-20 14:30:25'
            }));
          }
          return;
        }
        
        // Update admin data with user information
        setAdminData(prev => ({
          ...prev,
          name: profile?.name || user.user_metadata?.name || 'Administrator',
          email: user.email || 'admin@trashee.com',
          phone: profile?.phone || user.user_metadata?.phone || '+91 98765 43210',
          joinDate: profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : '2023-01-15',
          lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at).toISOString().replace('T', ' ').substring(0, 16) : '2024-01-20 14:30:25'
        }));
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [navigate]);

  const [twoFactorSettings, setTwoFactorSettings] = useState({
    smsEnabled: false,
    emailEnabled: true,
    authenticatorEnabled: false,
    backupCodes: [] as string[]
  });

  const [showDeveloperDialog, setShowDeveloperDialog] = useState(false);
  const [showAddDeveloperDialog, setShowAddDeveloperDialog] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<any>(null);
  const [developerForm, setDeveloperForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    specialization: '',
    experience: '',
    joinDate: ''
  });

  const [developers, setDevelopers] = useState([
    {
      id: 'DEV001',
      name: 'Alex Johnson',
      email: 'alex@trashee.com',
      phone: '+91 98765 11111',
      role: 'Lead Developer',
      specialization: 'Full Stack Development',
      experience: '5 years',
      joinDate: '2022-03-15',
      status: 'active',
      lastActive: '2024-01-20 15:30'
    },
    {
      id: 'DEV002',
      name: 'Sarah Chen',
      email: 'sarah@trashee.com',
      phone: '+91 98765 22222',
      role: 'Frontend Developer',
      specialization: 'React & UI/UX',
      experience: '3 years',
      joinDate: '2023-01-10',
      status: 'active',
      lastActive: '2024-01-20 14:15'
    },
    {
      id: 'DEV003',
      name: 'Mike Rodriguez',
      email: 'mike@trashee.com',
      phone: '+91 98765 33333',
      role: 'Backend Developer',
      specialization: 'Node.js & Databases',
      experience: '4 years',
      joinDate: '2022-08-20',
      status: 'active',
      lastActive: '2024-01-20 13:45'
    }
  ]);

  const [qrCodes, setQRCodes] = useState<QRCode[]>([
    {
      id: 'QR001',
      name: 'Smart Bin - Downtown Plaza',
      type: 'bin',
      location: 'Downtown Plaza, Sector 5',
      status: 'active',
      scans: 1234,
      createdAt: '2024-01-15',
      qrData: 'TRASHEE_BIN_001_DOWNTOWN'
    },
    {
      id: 'QR002',
      name: 'Partner Store - Tech World',
      type: 'partner',
      partnerId: 'P001',
      status: 'active',
      scans: 567,
      createdAt: '2024-01-18',
      qrData: 'TRASHEE_PARTNER_TECHWORLD_001'
    },
    {
      id: 'QR003',
      name: 'Earth Day Promotion',
      type: 'promotional',
      status: 'active',
      scans: 890,
      createdAt: '2024-01-20',
      expiryDate: '2024-04-22',
      qrData: 'TRASHEE_PROMO_EARTHDAY_2024'
    },
    {
      id: 'QR004',
      name: 'Community Cleanup Event',
      type: 'event',
      location: 'Central Park',
      status: 'expired',
      scans: 245,
      createdAt: '2024-01-10',
      expiryDate: '2024-01-15',
      qrData: 'TRASHEE_EVENT_CLEANUP_CP_001'
    }
  ]);

  const systemStats = {
    totalQRs: qrCodes.length,
    activeQRs: qrCodes.filter(qr => qr.status === 'active').length,
    totalScans: qrCodes.reduce((sum, qr) => sum + qr.scans, 0),
    topScannedQR: qrCodes.reduce((max, qr) => qr.scans > max.scans ? qr : max, qrCodes[0])
  };

  const filteredQRs = qrCodes.filter(qr => {
    const matchesType = filterType === 'all' || filterType === '' || qr.type === filterType;
    const matchesStatus = filterStatus === 'all' || filterStatus === '' || qr.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    
    try {
      const result = await uploadAvatar(file);
      
      if (result.success && result.url) {
        setAdminData(prev => ({ ...prev, avatar: result.url }));
        console.log('✅ Admin avatar uploaded successfully');
      } else {
        console.error('❌ Admin avatar upload failed:', result.error);
        alert(`Failed to upload avatar: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Admin avatar upload error:', error);
      alert('Failed to upload avatar. Please try again.');
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('You must be logged in to update your profile');
        return;
      }
      
      // Upload avatar if a new one is selected
      let avatarUrl = null;
      if (avatarFile) {
        const result = await uploadAvatar(avatarFile);
        if (result.success && result.url) {
          avatarUrl = result.url;
        } else {
          console.error('❌ Admin avatar upload failed:', result.error);
          alert(`Failed to upload avatar: ${result.error}`);
          return;
        }
      }
      
      // Build update object (only include fields that should be updated)
      const updates: any = {
        name: adminData.name,
        phone: adminData.phone,
        phone_number: adminData.phone, // Adding phone_number field
        address: adminData.location, // Adding address field
        updated_at: new Date().toISOString()
      };
      
      // Only add avatar_url if we have a valid URL from the upload
      if (avatarUrl) {
        updates.avatar_url = avatarUrl;
      }
      
      // Try to update profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id); // Make sure this is the auth.uid()
        
      // If there's an error with the profiles table, try to create it
      if (error) {
        console.error('Update failed:', error.message);
        console.log('Error updating profile, attempting to create profile:', error);
        
        // Specific handling for avatar URL update errors
        if (error.message.includes('avatar_url')) {
          console.error('Avatar URL update failed:', error.message);
        }
        
        // Try to insert a new profile
        const profileData: any = { 
          id: user.id,
          name: adminData.name,
          phone: adminData.phone,
          phone_number: adminData.phone, // Adding phone_number field
          address: adminData.location, // Adding address field directly
          user_type: user.user_metadata?.user_type || '3', // 3 for Admin
          status: 'active',
          points: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Only add avatar_url if we have a valid URL from the upload
        if (avatarUrl) {
          profileData.avatar_url = avatarUrl;
        }
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([profileData]);
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          // Continue with metadata update even if profile creation fails
        }
      }
      
      // Always update user metadata (this will work even if profiles table doesn't exist)
      const metadataUpdates: any = {
        name: adminData.name,
        phone: adminData.phone,
        phone_number: adminData.phone, // Adding phone_number field
        address: adminData.location, // Adding address field
      };
      
      // Only add avatar_url if we have a valid URL from the upload
      if (avatarUrl) {
        metadataUpdates.avatar_url = avatarUrl;
      }
      
      const { error: metadataError } = await supabase.auth.updateUser({
        data: metadataUpdates
      });
      
      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
        alert('Failed to update profile. Please try again.');
        return;
      }
      
      console.log('Saving profile:', adminData);
      alert('✅ Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    }
  };

  const handleChangePassword = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    console.log('Changing password');
    alert('🔒 Password updated successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordDialog(false);
  };

  const handleToggle2FA = () => {
    console.log('Toggling 2FA', twoFactorSettings);
    alert('🔐 Two-Factor Authentication settings updated!');
    setShow2FADialog(false);
  };

  const handleSMSToggle = () => {
    setTwoFactorSettings(prev => ({
      ...prev,
      smsEnabled: !prev.smsEnabled
    }));
  };

  const handleEmailToggle = () => {
    setTwoFactorSettings(prev => ({
      ...prev,
      emailEnabled: !prev.emailEnabled
    }));
  };

  const handleAuthenticatorSetup = () => {
    // In a real app, this would generate QR code for authenticator setup
    console.log('Setting up authenticator app');
    setTwoFactorSettings(prev => ({
      ...prev,
      authenticatorEnabled: !prev.authenticatorEnabled
    }));
    alert('📱 Authenticator app setup initiated! Scan the QR code with your authenticator app.');
  };

  const generateBackupCodes = () => {
    // Generate random backup codes
    const codes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setTwoFactorSettings(prev => ({
      ...prev,
      backupCodes: codes
    }));
    alert('🔑 Backup codes generated! Please save them securely.');
  };

  const handleAddDeveloper = () => {
    if (!developerForm.name || !developerForm.email || !developerForm.role) {
      alert('Please fill in all required fields');
      return;
    }

    const newDeveloper = {
      id: `DEV${String(developers.length + 1).padStart(3, '0')}`,
      ...developerForm,
      status: 'active',
      lastActive: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setDevelopers(prev => [...prev, newDeveloper]);
    setDeveloperForm({
      name: '',
      email: '',
      phone: '',
      role: '',
      specialization: '',
      experience: '',
      joinDate: ''
    });
    setShowAddDeveloperDialog(false);
    alert('✅ Developer added successfully!');
  };

  const handleEditDeveloper = (developer: any) => {
    setSelectedDeveloper(developer);
    setDeveloperForm(developer);
    setShowAddDeveloperDialog(true);
  };

  const handleUpdateDeveloper = () => {
    if (!selectedDeveloper) return;

    setDevelopers(prev => prev.map(dev => {
      if (dev.id === selectedDeveloper.id) {
        return {
          ...developerForm,
          id: selectedDeveloper.id,
          status: dev.status,
          lastActive: dev.lastActive
        };
      }
      return dev;
    }));
    setSelectedDeveloper(null);
    setShowAddDeveloperDialog(false);
    alert('✅ Developer updated successfully!');
  };

  const handleDeleteDeveloper = (developerId: string) => {
    if (confirm('Are you sure you want to remove this developer?')) {
      setDevelopers(prev => prev.filter(dev => dev.id !== developerId));
      alert('🗑️ Developer removed successfully!');
    }
  };

  const handleUpdateNotifications = () => {
    console.log('Updating notification settings');
    alert('🔔 Notification preferences updated!');
    setShowNotificationDialog(false);
  };

  const handleUpdatePrivacy = () => {
    console.log('Updating privacy settings');
    alert('🛡️ Privacy settings updated!');
    setShowPrivacyDialog(false);
  };

  const handleGenerateQR = () => {
    const newQR: QRCode = {
      id: `QR${String(qrCodes.length + 1).padStart(3, '0')}`,
      name: 'New QR Code',
      type: 'bin',
      status: 'active',
      scans: 0,
      createdAt: new Date().toISOString().split('T')[0],
      qrData: `TRASHEE_NEW_${Date.now()}`
    };
    setQRCodes([...qrCodes, newQR]);
  };

  const handleViewQR = (qr: QRCode) => {
    setSelectedQR(qr);
    setShowQRDialog(true);
  };

  const handleDownloadQR = (qr: QRCode) => {
    console.log('Downloading QR:', qr.id);
    // Implement QR code download functionality
  };

  const handleToggleQRStatus = (qrId: string) => {
    setQRCodes(prev => prev.map(qr => 
      qr.id === qrId 
        ? { ...qr, status: qr.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' | 'expired' }
        : qr
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bin': return '🗑️';
      case 'partner': return '🏪';
      case 'event': return '📅';
      case 'promotional': return '🎁';
      default: return '📱';
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
            onClick={() => {
              try {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/admin/dashboard');
                }
              } catch (error) {
                console.error('Navigation error:', error);
                navigate('/admin/dashboard');
              }
            }}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Admin Profile</h1>
            <p className="text-sm text-gray-500">Manage your profile and account settings</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
            >
              {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {isEditing ? 'Save' : 'Edit'}
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Section */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Administrator Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo & Basic Info */}
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview || adminData.avatar} alt={adminData.name} />
                  <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-600">
                    {adminData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
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
                )}
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={adminData.name}
                        onChange={(e) => setAdminData({...adminData, name: e.target.value})}
                      />
                    ) : (
                      <p className="font-medium">{adminData.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        {adminData.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={adminData.email}
                        onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{adminData.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={adminData.phone}
                        onChange={(e) => setAdminData({...adminData, phone: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{adminData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    {isEditing ? (
                      <Input
                        id="department"
                        value={adminData.department}
                        onChange={(e) => setAdminData({...adminData, department: e.target.value})}
                      />
                    ) : (
                      <p>{adminData.department}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    {isEditing ? (
                      <Input
                        id="location"
                        value={adminData.location}
                        onChange={(e) => setAdminData({...adminData, location: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{adminData.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Information */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <Label>Join Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{adminData.joinDate}</span>
                  </div>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{adminData.lastLogin}</span>
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Permissions */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {adminData.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                    <Key className="w-3 h-3 mr-1" />
                    {permission}
                  </Badge>
                ))}
              </div>
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

        {/* Developer Team Management */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Developer Team
              </div>
              <Button onClick={() => setShowAddDeveloperDialog(true)} className="bg-primary hover:bg-primary/90">
                <User className="w-4 h-4 mr-2" />
                Add Developer
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {developers.map((developer) => (
                <div key={developer.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{developer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{developer.name}</h3>
                        <p className="text-sm text-gray-500">{developer.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={developer.status === 'active' ? 'default' : 'secondary'}>
                        {developer.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDeveloper(developer)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDeveloper(developer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Email:</span> {developer.email}
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span> {developer.phone}
                    </div>
                    <div>
                      <span className="text-gray-500">Specialization:</span> {developer.specialization}
                    </div>
                    <div>
                      <span className="text-gray-500">Experience:</span> {developer.experience}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowDeveloperDialog(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View All Details
              </Button>
            </div>
          </CardContent>
        </Card>

        
        {/* Security Settings */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShowPasswordDialog(true)}
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShow2FADialog(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Two-Factor Authentication
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShowNotificationDialog(true)}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notification Settings
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShowPrivacyDialog(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Privacy Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Update your account password for better security
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Authentication Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Enhance your account security with 2FA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">SMS Authentication</h4>
                <p className="text-sm text-gray-500">Receive codes via SMS</p>
              </div>
              <div className="flex items-center gap-2">
                {twoFactorSettings.smsEnabled && (
                  <Badge variant="default" className="text-xs">Active</Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSMSToggle}
                >
                  {twoFactorSettings.smsEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Email Authentication</h4>
                <p className="text-sm text-gray-500">Receive codes via email</p>
              </div>
              <div className="flex items-center gap-2">
                {twoFactorSettings.emailEnabled && (
                  <Badge variant="default" className="text-xs">Active</Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailToggle}
                >
                  {twoFactorSettings.emailEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Authenticator App</h4>
                <p className="text-sm text-gray-500">Use Google Authenticator or similar</p>
              </div>
              <div className="flex items-center gap-2">
                {twoFactorSettings.authenticatorEnabled && (
                  <Badge variant="default" className="text-xs">Active</Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAuthenticatorSetup}
                >
                  {twoFactorSettings.authenticatorEnabled ? 'Reconfigure' : 'Setup'}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Backup Codes</h4>
                <p className="text-sm text-gray-500">Emergency recovery codes</p>
              </div>
              <div className="flex items-center gap-2">
                {twoFactorSettings.backupCodes.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {twoFactorSettings.backupCodes.length} codes
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateBackupCodes}
                >
                  Generate
                </Button>
              </div>
            </div>

            {(twoFactorSettings.smsEnabled || twoFactorSettings.emailEnabled || twoFactorSettings.authenticatorEnabled) && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">2FA Protected</span>
                </div>
                <p className="text-sm text-green-700">
                  Your admin account is secured with two-factor authentication
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FADialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleToggle2FA}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </DialogTitle>
            <DialogDescription>
              Manage how you receive notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-500">System alerts and updates</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">SMS Alerts</h4>
                <p className="text-sm text-gray-500">Critical system alerts</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-500">Browser notifications</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-gray-500">System analytics summary</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateNotifications}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Privacy Settings Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Privacy Settings
            </DialogTitle>
            <DialogDescription>
              Control your data and privacy preferences
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Profile Visibility</h4>
                <p className="text-sm text-gray-500">Who can see your profile</p>
              </div>
              <Select defaultValue="private">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="team">Team Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data Collection</h4>
                <p className="text-sm text-gray-500">Allow analytics data collection</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Activity Logging</h4>
                <p className="text-sm text-gray-500">Log admin activities</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Session Management</h4>
                <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrivacyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePrivacy}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code View Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedQR && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-4">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">QR Code Preview</p>
                    <p className="text-xs text-gray-400 mt-1">{selectedQR.qrData}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{selectedQR.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Type:</span>
                  <Badge variant="outline">{selectedQR.type}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(selectedQR.status)}>
                    {selectedQR.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Scans:</span>
                  <span>{selectedQR.scans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Created:</span>
                  <span>{selectedQR.createdAt}</span>
                </div>
                {selectedQR.location && (
                  <div className="flex justify-between">
                    <span className="font-medium">Location:</span>
                    <span>{selectedQR.location}</span>
                  </div>
                )}
                {selectedQR.expiryDate && (
                  <div className="flex justify-between">
                    <span className="font-medium">Expires:</span>
                    <span>{selectedQR.expiryDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>
              Close
            </Button>
            <Button onClick={() => selectedQR && handleDownloadQR(selectedQR)}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Developer Dialog */}
      <Dialog open={showAddDeveloperDialog} onOpenChange={setShowAddDeveloperDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {selectedDeveloper ? 'Edit Developer' : 'Add Developer'}
            </DialogTitle>
            <DialogDescription>
              {selectedDeveloper ? 'Update developer information' : 'Add a new developer to the team'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dev-name">Name *</Label>
                <Input
                  id="dev-name"
                  placeholder="Full Name"
                  value={developerForm.name}
                  onChange={(e) => setDeveloperForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="dev-role">Role *</Label>
                <Select
                  value={developerForm.role}
                  onValueChange={(value) => setDeveloperForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead Developer">Lead Developer</SelectItem>
                    <SelectItem value="Senior Developer">Senior Developer</SelectItem>
                    <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                    <SelectItem value="Backend Developer">Backend Developer</SelectItem>
                    <SelectItem value="Full Stack Developer">Full Stack Developer</SelectItem>
                    <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
                    <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="dev-email">Email *</Label>
              <Input
                id="dev-email"
                type="email"
                placeholder="developer@trashee.com"
                value={developerForm.email}
                onChange={(e) => setDeveloperForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="dev-phone">Phone</Label>
              <Input
                id="dev-phone"
                placeholder="+91 98765 43210"
                value={developerForm.phone}
                onChange={(e) => setDeveloperForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="dev-specialization">Specialization</Label>
              <Input
                id="dev-specialization"
                placeholder="React, Node.js, etc."
                value={developerForm.specialization}
                onChange={(e) => setDeveloperForm(prev => ({ ...prev, specialization: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dev-experience">Experience</Label>
                <Input
                  id="dev-experience"
                  placeholder="5 years"
                  value={developerForm.experience}
                  onChange={(e) => setDeveloperForm(prev => ({ ...prev, experience: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="dev-joinDate">Join Date</Label>
                <Input
                  id="dev-joinDate"
                  type="date"
                  value={developerForm.joinDate}
                  onChange={(e) => setDeveloperForm(prev => ({ ...prev, joinDate: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDeveloperDialog(false);
              setSelectedDeveloper(null);
              setDeveloperForm({
                name: '',
                email: '',
                phone: '',
                role: '',
                specialization: '',
                experience: '',
                joinDate: ''
              });
            }}>
              Cancel
            </Button>
            <Button onClick={selectedDeveloper ? handleUpdateDeveloper : handleAddDeveloper}>
              {selectedDeveloper ? 'Update' : 'Add'} Developer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Developer Details Dialog */}
      <Dialog open={showDeveloperDialog} onOpenChange={setShowDeveloperDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Developer Team Details
            </DialogTitle>
            <DialogDescription>
              Complete overview of the development team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            {developers.map((developer) => (
              <Card key={developer.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>{developer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{developer.name}</h3>
                        <p className="text-sm text-gray-600">{developer.role}</p>
                        <Badge variant={developer.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                          {developer.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>ID: {developer.id}</p>
                      <p>Last Active: {developer.lastActive}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p>{developer.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p>{developer.phone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Specialization:</span>
                      <p>{developer.specialization}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Experience:</span>
                      <p>{developer.experience}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Join Date:</span>
                      <p>{developer.joinDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowDeveloperDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
