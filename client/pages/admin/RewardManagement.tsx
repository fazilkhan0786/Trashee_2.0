import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Search, Filter, Gift, Trophy, Star, Plus, Edit, Eye, Trash2, Coins, Target, Calendar, Users, BarChart, Crown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'badge' | 'coupon' | 'premium' | 'special';
  category: 'scanning' | 'referral' | 'streak' | 'milestone' | 'seasonal' | 'challenge';
  pointsCost?: number;
  pointsReward?: number;
  status: 'active' | 'inactive' | 'draft';
  conditions: string;
  validFrom: string;
  validUntil?: string;
  maxClaims?: number;
  claimedCount: number;
  icon: string;
  color: string;
  createdAt: string;
  lastUpdated: string;
}

export default function AdminRewardManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [newReward, setNewReward] = useState<Partial<Reward>>({
    type: 'points',
    category: 'scanning',
    status: 'draft',
    icon: '🎁',
    color: '#3b82f6'
  });

  const [rewards, setRewards] = useState<Reward[]>([
    
  ]);

  const rewardTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'points', label: 'Points' },
    { value: 'badge', label: 'Badge' },
    { value: 'coupon', label: 'Coupon' },
    { value: 'premium', label: 'Premium' },
    { value: 'special', label: 'Special' }
  ];

  const rewardCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'scanning', label: 'Scanning' },
    { value: 'referral', label: 'Referral' },
    { value: 'streak', label: 'Streak' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'challenge', label: 'Challenge' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' }
  ];

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || typeFilter === '' || reward.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || categoryFilter === '' || reward.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || statusFilter === '' || reward.status === statusFilter;
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'points': return 'bg-blue-100 text-blue-800';
      case 'badge': return 'bg-purple-100 text-purple-800';
      case 'coupon': return 'bg-orange-100 text-orange-800';
      case 'premium': return 'bg-yellow-100 text-yellow-800';
      case 'special': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (reward: Reward) => {
    setSelectedReward(reward);
    setShowDetailsDialog(true);
  };

  const handleToggleStatus = (rewardId: string) => {
    setRewards(prev => prev.map(reward => 
      reward.id === rewardId 
        ? { ...reward, status: reward.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' | 'draft' }
        : reward
    ));
  };

  const handleDeleteReward = (rewardId: string) => {
    setRewards(prev => prev.filter(reward => reward.id !== rewardId));
  };

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setNewReward({
      name: reward.name,
      description: reward.description,
      type: reward.type,
      category: reward.category,
      pointsReward: reward.pointsReward,
      pointsCost: reward.pointsCost,
      status: reward.status,
      conditions: reward.conditions,
      validFrom: reward.validFrom,
      validUntil: reward.validUntil,
      maxClaims: reward.maxClaims,
      icon: reward.icon,
      color: reward.color
    });
    setShowDetailsDialog(false);
    setShowEditDialog(true);
  };

  const handleUpdateReward = () => {
    if (!editingReward || !newReward.name || !newReward.description || !newReward.conditions) return;

    const updatedReward: Reward = {
      ...editingReward,
      name: newReward.name,
      description: newReward.description,
      type: newReward.type as any,
      category: newReward.category as any,
      pointsReward: newReward.pointsReward,
      pointsCost: newReward.pointsCost,
      status: newReward.status as any,
      conditions: newReward.conditions,
      validFrom: newReward.validFrom || editingReward.validFrom,
      validUntil: newReward.validUntil,
      maxClaims: newReward.maxClaims,
      icon: newReward.icon || editingReward.icon,
      color: newReward.color || editingReward.color,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setRewards(prev => prev.map(reward =>
      reward.id === editingReward.id ? updatedReward : reward
    ));
    setShowEditDialog(false);
    setEditingReward(null);
    setNewReward({
      type: 'points',
      category: 'scanning',
      status: 'draft',
      icon: '🎁',
      color: '#3b82f6'
    });
  };

  const handleAddReward = () => {
    if (!newReward.name || !newReward.description || !newReward.conditions) return;

    const reward: Reward = {
      id: `REW-${String(rewards.length + 1).padStart(3, '0')}`,
      name: newReward.name,
      description: newReward.description,
      type: newReward.type as any,
      category: newReward.category as any,
      pointsReward: newReward.pointsReward,
      pointsCost: newReward.pointsCost,
      status: newReward.status as any,
      conditions: newReward.conditions,
      validFrom: newReward.validFrom || new Date().toISOString().split('T')[0],
      validUntil: newReward.validUntil,
      maxClaims: newReward.maxClaims,
      claimedCount: 0,
      icon: newReward.icon || '🎁',
      color: newReward.color || '#3b82f6',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setRewards([...rewards, reward]);
    setShowAddDialog(false);
    setNewReward({
      type: 'points',
      category: 'scanning',
      status: 'draft',
      icon: '🎁',
      color: '#3b82f6'
    });
  };

  const stats = {
    totalRewards: rewards.length,
    activeRewards: rewards.filter(r => r.status === 'active').length,
    totalClaims: rewards.reduce((sum, r) => sum + r.claimedCount, 0),
    pointsDistributed: rewards.filter(r => r.type === 'points').reduce((sum, r) => sum + (r.claimedCount * (r.pointsReward || 0)), 0),
    badgesAwarded: rewards.filter(r => r.type === 'badge').reduce((sum, r) => sum + r.claimedCount, 0),
    couponsIssued: rewards.filter(r => r.type === 'coupon').reduce((sum, r) => sum + r.claimedCount, 0)
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
          <div className="flex-1">
            <h1 className="text-xl font-bold">Reward Management</h1>
            <p className="text-sm text-gray-500">Create and manage user rewards and achievements</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Reward
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalRewards}</p>
                  <p className="text-xs text-gray-500">Total Rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeRewards}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalClaims.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Total Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pointsDistributed.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Points Given</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.badgesAwarded}</p>
                  <p className="text-xs text-gray-500">Badges Awarded</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.couponsIssued}</p>
                  <p className="text-xs text-gray-500">Coupons Issued</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {rewardTypes.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {rewardCategories.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((reward, index) => (
            <Card key={reward.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${reward.color}20`, color: reward.color }}
                      >
                        {reward.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{reward.name}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge className={getTypeColor(reward.type)}>
                            {reward.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {reward.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(reward.status)}>
                      {reward.status}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>

                  {/* Reward Details */}
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      <strong>Conditions:</strong> {reward.conditions}
                    </div>
                    
                    {reward.pointsReward && (
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{reward.pointsReward} points reward</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Claims:</span>
                      <span className="font-medium">
                        {reward.claimedCount}
                        {reward.maxClaims && ` / ${reward.maxClaims}`}
                      </span>
                    </div>
                  </div>

                  {/* Validity */}
                  <div className="text-xs text-gray-500 border-t pt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Valid from {reward.validFrom}</span>
                      {reward.validUntil && <span>to {reward.validUntil}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(reward)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditReward(reward)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(reward.id)}
                    >
                      {reward.status === 'active' ? '⏸️' : '▶���'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReward(reward.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No rewards found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Reward Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Reward Details - {selectedReward?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReward && (
            <div className="space-y-6">
              {/* Reward Overview */}
              <div className="flex items-start gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${selectedReward.color}20`, color: selectedReward.color }}
                >
                  {selectedReward.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedReward.name}</h3>
                  <p className="text-gray-600 mt-1">{selectedReward.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getTypeColor(selectedReward.type)}>
                      {selectedReward.type}
                    </Badge>
                    <Badge variant="outline">
                      {selectedReward.category}
                    </Badge>
                    <Badge className={getStatusColor(selectedReward.status)}>
                      {selectedReward.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedReward.claimedCount}</div>
                  <div className="text-xs text-gray-600">Total Claims</div>
                </div>
                {selectedReward.maxClaims && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{selectedReward.maxClaims - selectedReward.claimedCount}</div>
                    <div className="text-xs text-gray-600">Remaining</div>
                  </div>
                )}
                {selectedReward.pointsReward && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{selectedReward.pointsReward}</div>
                    <div className="text-xs text-gray-600">Points Reward</div>
                  </div>
                )}
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedReward.pointsReward ? (selectedReward.claimedCount * selectedReward.pointsReward).toLocaleString() : '-'}
                  </div>
                  <div className="text-xs text-gray-600">Points Distributed</div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Conditions</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedReward.conditions}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Validity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Valid From:</span>
                      <span className="font-medium">{selectedReward.validFrom}</span>
                    </div>
                    {selectedReward.validUntil && (
                      <div className="flex justify-between">
                        <span>Valid Until:</span>
                        <span className="font-medium">{selectedReward.validUntil}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span className="font-medium">{selectedReward.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-medium">{selectedReward.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            <Button onClick={() => selectedReward && handleEditReward(selectedReward)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Reward Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Reward
            </DialogTitle>
            <DialogDescription>
              Design a new reward to motivate user engagement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rewardName">Reward Name</Label>
                <Input 
                  id="rewardName" 
                  placeholder="Enter reward name"
                  value={newReward.name || ''}
                  onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="rewardIcon">Icon (Emoji)</Label>
                <Input 
                  id="rewardIcon" 
                  placeholder="🎁"
                  value={newReward.icon || ''}
                  onChange={(e) => setNewReward({...newReward, icon: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe what this reward is for..."
                value={newReward.description || ''}
                onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Reward Type</Label>
                <Select 
                  value={newReward.type} 
                  onValueChange={(value) => setNewReward({...newReward, type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="badge">Badge</SelectItem>
                    <SelectItem value="coupon">Coupon</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newReward.category} 
                  onValueChange={(value) => setNewReward({...newReward, category: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scanning">Scanning</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newReward.status} 
                  onValueChange={(value) => setNewReward({...newReward, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {newReward.type === 'points' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pointsReward">Points Reward</Label>
                  <Input 
                    id="pointsReward" 
                    type="number" 
                    placeholder="100"
                    value={newReward.pointsReward || ''}
                    onChange={(e) => setNewReward({...newReward, pointsReward: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="maxClaims">Max Claims (Optional)</Label>
                  <Input 
                    id="maxClaims" 
                    type="number" 
                    placeholder="Unlimited"
                    value={newReward.maxClaims || ''}
                    onChange={(e) => setNewReward({...newReward, maxClaims: Number(e.target.value)})}
                  />
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="conditions">Conditions to Earn</Label>
              <Textarea 
                id="conditions" 
                placeholder="Describe what users need to do to earn this reward..."
                value={newReward.conditions || ''}
                onChange={(e) => setNewReward({...newReward, conditions: e.target.value})}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">Valid From</Label>
                <Input 
                  id="validFrom" 
                  type="date"
                  value={newReward.validFrom || ''}
                  onChange={(e) => setNewReward({...newReward, validFrom: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="validUntil">Valid Until (Optional)</Label>
                <Input 
                  id="validUntil" 
                  type="date"
                  value={newReward.validUntil || ''}
                  onChange={(e) => setNewReward({...newReward, validUntil: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddReward}
              disabled={!newReward.name || !newReward.description || !newReward.conditions}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reward Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Reward - {editingReward?.name}
            </DialogTitle>
            <DialogDescription>
              Update reward details and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editRewardName">Reward Name</Label>
                <Input
                  id="editRewardName"
                  placeholder="Enter reward name"
                  value={newReward.name || ''}
                  onChange={(e) => setNewReward({...newReward, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editRewardIcon">Icon (Emoji)</Label>
                <Input
                  id="editRewardIcon"
                  placeholder="🎁"
                  value={newReward.icon || ''}
                  onChange={(e) => setNewReward({...newReward, icon: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                placeholder="Describe what this reward is for..."
                value={newReward.description || ''}
                onChange={(e) => setNewReward({...newReward, description: e.target.value})}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editType">Reward Type</Label>
                <Select
                  value={newReward.type}
                  onValueChange={(value) => setNewReward({...newReward, type: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="badge">Badge</SelectItem>
                    <SelectItem value="coupon">Coupon</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select
                  value={newReward.category}
                  onValueChange={(value) => setNewReward({...newReward, category: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scanning">Scanning</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={newReward.status}
                  onValueChange={(value) => setNewReward({...newReward, status: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newReward.type === 'points' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPointsReward">Points Reward</Label>
                  <Input
                    id="editPointsReward"
                    type="number"
                    placeholder="100"
                    value={newReward.pointsReward || ''}
                    onChange={(e) => setNewReward({...newReward, pointsReward: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="editMaxClaims">Max Claims (Optional)</Label>
                  <Input
                    id="editMaxClaims"
                    type="number"
                    placeholder="Unlimited"
                    value={newReward.maxClaims || ''}
                    onChange={(e) => setNewReward({...newReward, maxClaims: Number(e.target.value)})}
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="editConditions">Conditions to Earn</Label>
              <Textarea
                id="editConditions"
                placeholder="Describe what users need to do to earn this reward..."
                value={newReward.conditions || ''}
                onChange={(e) => setNewReward({...newReward, conditions: e.target.value})}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editValidFrom">Valid From</Label>
                <Input
                  id="editValidFrom"
                  type="date"
                  value={newReward.validFrom || ''}
                  onChange={(e) => setNewReward({...newReward, validFrom: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="editValidUntil">Valid Until (Optional)</Label>
                <Input
                  id="editValidUntil"
                  type="date"
                  value={newReward.validUntil || ''}
                  onChange={(e) => setNewReward({...newReward, validUntil: e.target.value})}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditingReward(null);
              setNewReward({
                type: 'points',
                category: 'scanning',
                status: 'draft',
                icon: '🎁',
                color: '#3b82f6'
              });
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateReward}
              disabled={!newReward.name || !newReward.description || !newReward.conditions}
            >
              <Edit className="w-4 h-4 mr-2" />
              Update Reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
