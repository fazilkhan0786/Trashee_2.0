import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search, Filter, Users, UserCheck, UserX, MoreHorizontal, Eye, Ban, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'consumer' | 'partner' | 'collector';
  status: 'active' | 'blocked' | 'pending';
  joinedDate: string;
  totalPoints: number;
  scanCount: number;
  lastActive: string;
}

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showScanHistory, setShowScanHistory] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState({
    total: 0,
    consumer: 0,
    partner: 0,
    collector: 0,
    active: 0,
    pending: 0,
    blocked: 0
  });

  // Fetch users from Supabase
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        // Get all users from auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('Error fetching users:', authError);
          return;
        }
        
        // Get all profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        // Handle case where profiles table might not exist yet
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          // Still process users from auth
          if (authUsers) {
            const mappedUsers = authUsers.users.map(user => ({
              id: user.id,
              name: user.user_metadata?.name || 'Unknown',
              email: user.email || 'No email',
              type: user.user_metadata?.user_type as 'consumer' | 'partner' | 'collector' || 'consumer',
              status: 'active' as 'active' | 'blocked' | 'pending',
              joinedDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
              totalPoints: 0,
              scanCount: 0,
              lastActive: user.last_sign_in_at ? new Date(user.last_sign_in_at).toISOString().split('T')[0] : ''
            }));
            
            setUsers(mappedUsers);
            
            // Set user counts
            const totalCount = mappedUsers.length;
            const activeCount = mappedUsers.filter(user => user.status === 'active').length;
            const blockedCount = mappedUsers.filter(user => user.status === 'blocked').length;
            const pendingCount = mappedUsers.filter(user => user.status === 'pending').length;
            
            const consumerCount = mappedUsers.filter(user => user.type === 'consumer').length;
            const partnerCount = mappedUsers.filter(user => user.type === 'partner').length;
            const collectorCount = mappedUsers.filter(user => user.type === 'collector').length;
            
            setUserCount({
              total: totalCount,
              active: activeCount,
              blocked: blockedCount,
              pending: pendingCount,
              consumer: consumerCount,
              partner: partnerCount,
              collector: collectorCount
            });
          }
          setLoading(false);
          return;
        }
        
        // Map auth users to our User interface
        const mappedUsers = authUsers.users.map(authUser => {
          const profile = profiles?.find(p => p.id === authUser.id);
          const userType = authUser.user_metadata?.user_type || '0';
          
          // Map user_type number to string
          let type: 'consumer' | 'partner' | 'collector' = 'consumer';
          if (userType === '1') type = 'partner';
          if (userType === '2') type = 'collector';
          
          // Calculate last active time
          const lastSignIn = authUser.last_sign_in_at ? new Date(authUser.last_sign_in_at) : null;
          const now = new Date();
          const diffMs = lastSignIn ? now.getTime() - lastSignIn.getTime() : 0;
          const diffHrs = diffMs / (1000 * 60 * 60);
          
          let lastActive = 'Never';
          if (lastSignIn) {
            if (diffHrs < 1) lastActive = 'Less than an hour ago';
            else if (diffHrs < 24) lastActive = `${Math.floor(diffHrs)} hours ago`;
            else if (diffHrs < 48) lastActive = '1 day ago';
            else if (diffHrs < 168) lastActive = `${Math.floor(diffHrs / 24)} days ago`;
            else lastActive = `${Math.floor(diffHrs / 24 / 7)} weeks ago`;
          }
          
          return {
            id: authUser.id,
            name: profile?.name || authUser.user_metadata?.name || 'Unknown',
            email: authUser.email || '',
            type,
            status: profile?.status || 'pending',
            joinedDate: authUser.created_at ? new Date(authUser.created_at).toISOString().split('T')[0] : '',
            totalPoints: profile?.points || 0,
            scanCount: profile?.scan_count || 0,
            lastActive
          } as User;
        });
        
        setUsers(mappedUsers);
        
        // Update user counts
        setUserCount({
          total: mappedUsers.length,
          consumer: mappedUsers.filter(u => u.type === 'consumer').length,
          partner: mappedUsers.filter(u => u.type === 'partner').length,
          collector: mappedUsers.filter(u => u.type === 'collector').length,
          active: mappedUsers.filter(u => u.status === 'active').length,
          pending: mappedUsers.filter(u => u.status === 'pending').length,
          blocked: mappedUsers.filter(u => u.status === 'blocked').length
        });
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || user.type === filterType;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleBlockUser = (user: User) => {
    setSelectedUser(user);
    setShowBlockConfirm(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirm(true);
  };

  const confirmBlock = () => {
    console.log('Blocking user:', selectedUser?.id);
    setShowBlockConfirm(false);
    setSelectedUser(null);
  };

  const confirmDelete = () => {
    console.log('Deleting user:', selectedUser?.id);
    setShowDeleteConfirm(false);
    setSelectedUser(null);
  };

  const sendPoints = (userId: string, points: number) => {
    console.log('Sending points:', { userId, points });
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'consumer': return 'bg-blue-100 text-blue-800';
      case 'partner': return 'bg-purple-100 text-purple-800';
      case 'collector': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-xl font-bold">User Management</h1>
            <p className="text-sm text-gray-500">Manage consumers, partners, and collectors</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-800">{loading ? '...' : userCount.total}</span>
              </div>
              <p className="text-sm text-blue-600">Total Users</p>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-800">{loading ? '...' : userCount.active}</span>
              </div>
              <p className="text-sm text-green-600">Active Users</p>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <UserX className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold text-red-800">{loading ? '...' : userCount.blocked}</span>
              </div>
              <p className="text-sm text-red-600">Blocked Users</p>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Plus className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-800">{loading ? '...' : userCount.pending}</span>
              </div>
              <p className="text-sm text-yellow-600">Pending Approval</p>
            </CardContent>
          </Card>
        </div>

        {/* User Type Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-400">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-blue-800">{loading ? '...' : userCount.consumer}</span>
              </div>
              <p className="text-sm text-blue-600">Consumers</p>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-500">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-purple-800">{loading ? '...' : userCount.partner}</span>
              </div>
              <p className="text-sm text-purple-600">Partners</p>
            </CardContent>
          </Card>
          
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-600">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl font-bold text-orange-800">{loading ? '...' : userCount.collector}</span>
              </div>
              <p className="text-sm text-orange-600">Collectors</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="flex-1">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="User Type" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="consumer">Consumers</SelectItem>
                  <SelectItem value="partner">Partners</SelectItem>
                  <SelectItem value="collector">Collectors</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700 delay-100">
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map((user, index) => (
                <div key={user.id} className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 2) * 100}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getUserTypeColor(user.type)}>
                          {user.type}
                        </Badge>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium">{user.totalPoints} points</p>
                    <p className="text-sm text-gray-500">{user.scanCount} scans</p>
                    <p className="text-xs text-gray-400">Active: {user.lastActive}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetails(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {user.status === 'active' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBlockUser(user)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Ban className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Manage {selectedUser.name}'s account
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <Badge className={getUserTypeColor(selectedUser.type)}>
                    {selectedUser.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-600">Joined:</span>
                  <p className="font-medium">{selectedUser.joinedDate}</p>
                </div>
                <div>
                  <span className="text-gray-600">Last Active:</span>
                  <p className="font-medium">{selectedUser.lastActive}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Points:</span>
                  <p className="font-medium">{selectedUser.totalPoints}</p>
                </div>
                <div>
                  <span className="text-gray-600">Scan Count:</span>
                  <p className="font-medium">{selectedUser.scanCount}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Admin Actions</h4>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Points to send" 
                      className="flex-1"
                      id="pointsInput"
                    />
                    <Button 
                      size="sm"
                      onClick={() => {
                        const input = document.getElementById('pointsInput') as HTMLInputElement;
                        const points = parseInt(input?.value || '0');
                        if (points > 0) {
                          sendPoints(selectedUser.id, points);
                          input.value = '';
                        }
                      }}
                    >
                      Send Points
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowScanHistory(true)}
                    >
                      View Scan History
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowCoupons(true)}
                    >
                      View Coupons
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Block Confirmation Modal */}
      {showBlockConfirm && selectedUser && (
        <Dialog open={showBlockConfirm} onOpenChange={setShowBlockConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Block User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to block {selectedUser.name}? They won't be able to access the app.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlockConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmBlock}>
                Block User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Delete User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete {selectedUser.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Scan History Dialog */}
      {showScanHistory && selectedUser && (
        <Dialog open={showScanHistory} onOpenChange={setShowScanHistory}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Scan History - {selectedUser.name}
              </DialogTitle>
              <DialogDescription>
                Complete scan activity record for this user
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedUser.scanCount}</div>
                  <div className="text-xs text-blue-600">Total Scans</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedUser.totalPoints}</div>
                  <div className="text-xs text-green-600">Points Earned</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">15</div>
                  <div className="text-xs text-orange-600">This Month</div>
                </div>
              </div>

              {/* Recent Scans */}
              <div>
                <h4 className="font-semibold mb-3">Recent Scan Activity</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Search className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Smart Bin #{String(i + 1).padStart(3, '0')}</p>
                          <p className="text-xs text-gray-500">Downtown Plaza, Sector {i + 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">+{10 + i * 5} points</p>
                        <p className="text-xs text-gray-500">{i + 1} day{i === 0 ? '' : 's'} ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowScanHistory(false)}>
                Close
              </Button>
              <Button>
                <Search className="w-4 h-4 mr-2" />
                Export History
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Coupons Dialog */}
      {showCoupons && selectedUser && (
        <Dialog open={showCoupons} onOpenChange={setShowCoupons}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Coupon Usage - {selectedUser.name}
              </DialogTitle>
              <DialogDescription>
                Coupon redemption history and available coupons
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Tabs defaultValue="redeemed" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="redeemed">Redeemed Coupons</TabsTrigger>
                  <TabsTrigger value="available">Available Coupons</TabsTrigger>
                </TabsList>

                <TabsContent value="redeemed" className="space-y-3">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">20% Off Electronics</p>
                            <p className="text-xs text-gray-500">Green Electronics Store</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-100 text-green-800 text-xs">Redeemed</Badge>
                          <p className="text-xs text-gray-500 mt-1">{i + 1} week{i === 0 ? '' : 's'} ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="available" className="space-y-3">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Array.from({ length: 4 }, (_, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Plus className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">15% Off Books</p>
                            <p className="text-xs text-gray-500">Tech Hub Store</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">Available</Badge>
                          <p className="text-xs text-gray-500 mt-1">Expires in {7 - i} days</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">6</div>
                  <div className="text-xs text-gray-600">Total Redeemed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">4</div>
                  <div className="text-xs text-gray-600">Available</div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCoupons(false)}>
                Close
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Send Coupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
