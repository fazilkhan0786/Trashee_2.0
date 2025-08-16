import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Trash2, MapPin, Clock, CheckCircle, AlertTriangle, Truck, Scale, Camera, Plus, Play, Pause, Calendar, Target, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CollectionTask {
  id: string;
  binId: string;
  binName: string;
  location: string;
  address: string;
  fillLevel: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedWeight: number;
  wasteType: 'regular' | 'organic' | 'recyclable' | 'hazardous';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  scheduledTime: string;
  completedAt?: string;
  actualWeight?: number;
  notes?: string;
  photos?: string[];
}

export default function CollectorCollectTrash() {
  const navigate = useNavigate();
  const [activeTask, setActiveTask] = useState<CollectionTask | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [collectionWeight, setCollectionWeight] = useState('');
  const [collectionNotes, setCollectionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [tasks, setTasks] = useState<CollectionTask[]>([
    
  ]);

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'skipped', label: 'Skipped' }
  ];

  const filteredTasks = tasks.filter(task => {
    return filterStatus === 'all' || filterStatus === '' || task.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWasteTypeIcon = (type: string) => {
    switch (type) {
      case 'regular': return '🗑️';
      case 'organic': return '🍃';
      case 'recyclable': return '♻️';
      case 'hazardous': return '⚠️';
      default: return '📦';
    }
  };

  const getWasteTypeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'bg-gray-100 text-gray-800';
      case 'organic': return 'bg-green-100 text-green-800';
      case 'recyclable': return 'bg-blue-100 text-blue-800';
      case 'hazardous': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartTask = (task: CollectionTask) => {
    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: 'in_progress' as const } : t
    ));
    setActiveTask(task);
  };

  const handleCompleteTask = () => {
    if (!activeTask || !collectionWeight) return;

    setTasks(prev => prev.map(task => 
      task.id === activeTask.id 
        ? { 
            ...task, 
            status: 'completed' as const, 
            completedAt: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }),
            actualWeight: Number(collectionWeight),
            notes: collectionNotes
          }
        : task
    ));

    setShowCompleteDialog(false);
    setActiveTask(null);
    setCollectionWeight('');
    setCollectionNotes('');
  };

  const handleSkipTask = (taskId: string, reason: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'skipped' as const, notes: reason }
        : task
    ));
  };

  const handleTakePhoto = (taskId?: string) => {
    // Simulate photo capture functionality
    console.log('Taking photo for task:', taskId || activeTask?.id);

    // In a real app, this would open camera or file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera on mobile

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Simulate photo processing
        const reader = new FileReader();
        reader.onload = () => {
          alert(`📸 Photo captured successfully!\n\nPhoto saved for task: ${taskId || activeTask?.binName}\nFile size: ${(file.size / 1024).toFixed(1)} KB`);
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    totalWeight: tasks.filter(t => t.actualWeight).reduce((sum, t) => sum + (t.actualWeight || 0), 0),
    avgEfficiency: 85,
    onTimeCompletion: 92
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 animate-in slide-in-from-top duration-500">
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
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              Collect Trash
            </h1>
            <p className="text-sm opacity-90">Manage your waste collection tasks</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalTasks}</p>
                  <p className="text-xs text-gray-500">Total Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedTasks}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pendingTasks}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Scale className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalWeight}</p>
                  <p className="text-xs text-gray-500">KG Collected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgEfficiency}%</p>
                  <p className="text-xs text-gray-500">Efficiency</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-50 slide-in-from-bottom-4 duration-1000">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.onTimeCompletion}%</p>
                  <p className="text-xs text-gray-500">On Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Task Card */}
        {activeTask && (
          <Card className="border-l-4 border-l-blue-500 bg-blue-50 animate-in fade-in-50 slide-in-from-bottom-4 duration-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-800">Active Collection Task</h3>
                  <p className="text-lg font-bold">{activeTask.binName}</p>
                  <p className="text-sm text-blue-600">{activeTask.address}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-blue-100 text-blue-800 mb-2">
                    In Progress
                  </Badge>
                  <div className="text-sm text-blue-600">
                    Scheduled: {activeTask.scheduledTime}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  onClick={() => setShowCompleteDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTakePhoto()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task, index) => (
            <Card key={task.id} className={`hover:shadow-lg transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4 delay-${(index + 1) * 100}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getWasteTypeIcon(task.wasteType)}</span>
                      <div>
                        <h3 className="font-semibold">{task.binName}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>ID: {task.binId}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.scheduledTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {task.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{task.address}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Fill Level:</span>
                        <span className="font-medium ml-1">{task.fillLevel}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Est. Weight:</span>
                        <span className="font-medium ml-1">{task.estimatedWeight} kg</span>
                      </div>
                      {task.actualWeight && (
                        <div>
                          <span className="text-gray-500">Actual Weight:</span>
                          <span className="font-medium ml-1">{task.actualWeight} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getWasteTypeColor(task.wasteType)}>
                        {task.wasteType}
                      </Badge>
                    </div>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
                
                {/* Progress Bar for Fill Level */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Fill Level</span>
                    <span>{task.fillLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        task.fillLevel >= 90 ? 'bg-red-500' : 
                        task.fillLevel >= 70 ? 'bg-orange-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${task.fillLevel}%` }}
                    />
                  </div>
                </div>

                {/* Task Notes */}
                {task.notes && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Notes: {task.notes}</p>
                  </div>
                )}

                {/* Completion Info */}
                {task.completedAt && (
                  <div className="mb-3 p-2 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-700">
                      Completed at {task.completedAt} - Collected {task.actualWeight} kg
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-3 border-t">
                  <div className="text-xs text-gray-500">
                    Priority: {task.priority} | Type: {task.wasteType}
                  </div>
                  
                  <div className="flex gap-2">
                    {task.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartTask(task)}
                          className="text-blue-600"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSkipTask(task.id, 'Access blocked')}
                          className="text-orange-600"
                        >
                          Skip
                        </Button>
                      </>
                    )}
                    
                    {task.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveTask(task);
                          setShowCompleteDialog(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Complete
                      </Button>
                    )}

                    {task.status === 'completed' && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Trash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No collection tasks found</p>
            <p className="text-sm text-gray-400">Check back later for new assignments</p>
          </div>
        )}
      </div>

      {/* Complete Task Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Complete Collection Task
            </DialogTitle>
            <DialogDescription>
              Record the collection details for {activeTask?.binName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="weight">Actual Weight Collected (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="Enter weight in kg"
                value={collectionWeight}
                onChange={(e) => setCollectionWeight(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Collection Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any observations or issues..."
                value={collectionNotes}
                onChange={(e) => setCollectionNotes(e.target.value)}
                rows={3}
              />
            </div>

            {activeTask && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Task Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{activeTask.binName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Weight:</span>
                    <span>{activeTask.estimatedWeight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waste Type:</span>
                    <Badge className={getWasteTypeColor(activeTask.wasteType)} variant="outline">
                      {activeTask.wasteType}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteTask}
              disabled={!collectionWeight}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
