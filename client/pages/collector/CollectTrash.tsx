import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Trash2, MapPin, Clock, CheckCircle, AlertTriangle, Scale, Camera, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

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
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTask, setActiveTask] = useState<CollectionTask | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [collectionWeight, setCollectionWeight] = useState('');
  const [collectionNotes, setCollectionNotes] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from('collection_tasks')
        .select('*')
        .eq('collector_id', user.id)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      
      const formattedData = data.map(task => ({
        ...task,
        binId: task.bin_id,
        binName: task.bin_name,
        fillLevel: task.fill_level,
        estimatedWeight: task.estimated_weight,
        wasteType: task.waste_type,
        scheduledTime: new Date(task.scheduled_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        completedAt: task.completed_at,
        actualWeight: task.actual_weight
      }));

      setTasks(formattedData);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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
      case 'pending': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-200';
      case 'in_progress': return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-300';
      case 'completed': return 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-200';
      case 'skipped': return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white border-gray-300';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-600 text-white border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gradient-to-r from-gray-400 to-slate-500 text-gray-800 border-gray-200';
      case 'medium': return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-blue-800 border-blue-200';
      case 'high': return 'bg-gradient-to-r from-orange-400 to-red-500 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-gradient-to-r from-red-500 to-rose-600 text-red-800 border-red-200';
      default: return 'bg-gradient-to-r from-gray-400 to-slate-500 text-gray-800 border-gray-200';
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
      case 'regular': return 'bg-gradient-to-r from-gray-400 to-slate-500 text-gray-800 border-gray-200';
      case 'organic': return 'bg-gradient-to-r from-emerald-400 to-green-500 text-emerald-800 border-emerald-200';
      case 'recyclable': return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-blue-800 border-blue-200';
      case 'hazardous': return 'bg-gradient-to-r from-red-500 to-rose-600 text-red-800 border-red-200';
      default: return 'bg-gradient-to-r from-gray-400 to-slate-500 text-gray-800 border-gray-200';
    }
  };

  const updateTaskStatus = async (taskId: string, updates: Partial<CollectionTask>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

    const { error } = await supabase
      .from('collection_tasks')
      .update({
        status: updates.status,
        notes: updates.notes,
        completed_at: updates.completedAt,
        actual_weight: updates.actualWeight
      })
      .eq('id', taskId);

    if (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleStartTask = (task: CollectionTask) => {
    const updates = { status: 'in_progress' as const };
    updateTaskStatus(task.id, updates);
    setActiveTask({ ...task, ...updates });
  };

  const handleCompleteTask = () => {
    if (!activeTask || !collectionWeight) return;

    const updates = {
      status: 'completed' as const,
      completedAt: new Date().toISOString(),
      actualWeight: Number(collectionWeight),
      notes: collectionNotes
    };
    
    updateTaskStatus(activeTask.id, updates);

    setShowCompleteDialog(false);
    setActiveTask(null);
    setCollectionWeight('');
    setCollectionNotes('');
  };

  const handleSkipTask = (taskId: string, reason: string) => {
    const updates = { status: 'skipped' as const, notes: reason };
    updateTaskStatus(taskId, updates);
  };
  
  const handleTakePhoto = (taskId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        uploadPhoto(file, taskId);
      }
    };
    input.click();
  };

  const uploadPhoto = async (file: File, taskId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to upload photos.');

      const fileName = `${user.id}/${taskId}-${Date.now()}.png`;
      const { data, error } = await supabase.storage
        .from('task_photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('task_photos')
        .getPublicUrl(fileName);
        
      const { error: updateError } = await supabase
        .from('collection_tasks')
        .update({ photos: [publicUrl] })
        .eq('id', taskId);

      if (updateError) throw updateError;
      
      alert('📸 Photo uploaded successfully!');
      
      fetchTasks(); 

    } catch (error: any) {
      console.error('Error uploading photo:', error);
      alert(`Upload failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
     return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Failed to load tasks</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchTasks} className="bg-red-600 hover:bg-red-700 w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="p-2 text-white hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                <Trash2 className="w-6 h-6" />
                Collect Trash
              </h1>
              <p className="text-blue-100 mt-1">Manage your eco-friendly waste collection tasks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Enhanced Active Task Card */}
        {activeTask && (
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 ring-2 ring-blue-200/50">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 p-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-2xl text-blue-800 mb-2">{activeTask.binName}</h3>
                  <p className="text-blue-600 font-medium mb-1">{activeTask.address}</p>
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md">
                    🚛 In Progress
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-600 font-semibold">
                    Scheduled: {activeTask.scheduledTime}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Button 
                  onClick={() => setShowCompleteDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <Button variant="outline" onClick={() => handleTakePhoto(activeTask.id)} className="border-blue-300 hover:bg-blue-50 flex-1">
                  <Camera className="w-4 h-4 mr-2" /> Take Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Filter */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-gray-800">Filter Tasks</h3>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-64 border-blue-200 focus:ring-blue-500 bg-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white shadow-xl border-blue-100">
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-blue-50">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
                  <div className="flex-1 lg:pr-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-2xl shadow-lg ${getWasteTypeColor(task.wasteType).replace('text-', 'bg-')}`}>
                        <span className="text-3xl">{getWasteTypeIcon(task.wasteType)}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{task.binName}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-2">
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                            <span>ID: {task.binId}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />{task.scheduledTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />{task.location}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3 font-medium">{task.address}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <Scale className="w-4 h-4 text-gray-500" />
                            <span>Est. {task.estimatedWeight} kg</span>
                          </div>
                          {task.actualWeight && (
                            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                              <Scale className="w-4 h-4 text-blue-600" />
                              <span>Actual {task.actualWeight} kg</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 p-2 bg-cyan-50 rounded-lg">
                            Fill: <span className="font-bold">{task.fillLevel}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 mt-4 lg:mt-0">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Badge className={`${getPriorityColor(task.priority)} shadow-md px-3 py-2 text-sm font-medium border`}>
                        {task.priority.toUpperCase()}
                      </Badge>
                      <Badge className={`${getWasteTypeColor(task.wasteType)} shadow-md px-3 py-2 text-sm font-medium border`}>
                        {task.wasteType}
                      </Badge>
                    </div>
                    <Badge className={`${getStatusColor(task.status)} shadow-lg px-4 py-2 text-base font-bold`}>
                      {task.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">Fill Level Progress</span>
                    <span className="font-bold text-lg">{task.fillLevel}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                    <div 
                      className={`h-3 rounded-full transition-all duration-700 ease-out shadow-lg ${
                        task.fillLevel >= 90 ? 'bg-gradient-to-r from-red-500 to-rose-600' : 
                        task.fillLevel >= 70 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 
                        'bg-gradient-to-r from-blue-500 to-cyan-500'
                      }`} 
                      style={{ width: `${task.fillLevel}%` }} 
                    />
                  </div>
                </div>

                {task.notes && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border-l-4 border-gray-300 shadow-sm">
                    <p className="text-sm text-gray-700">📝 <strong>Notes:</strong> {task.notes}</p>
                  </div>
                )}
                {task.completedAt && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-l-4 border-blue-400 shadow-sm">
                    <p className="text-sm font-medium text-blue-700">
                      ✅ Completed - Collected <strong>{task.actualWeight} kg</strong>
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-2 sm:mb-0">
                    Priority: <span className="font-semibold capitalize">{task.priority}</span> | 
                    Type: <span className="font-semibold capitalize">{task.wasteType}</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {task.status === 'pending' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleStartTask(task)} 
                          className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all"
                        >
                          <Play className="w-4 h-4 mr-2" /> Start
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleSkipTask(task.id, 'Access blocked')} 
                          className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-all"
                        >
                          Skip
                        </Button>
                      </>
                    )}
                    {task.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        onClick={() => { setActiveTask(task); setShowCompleteDialog(true); }} 
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-md"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Complete
                      </Button>
                    )}
                    {task.status === 'completed' && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                        <CheckCircle className="w-4 h-4 mr-1" /> Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTasks.length === 0 && !loading && (
          <Card className="text-center py-12 border-0 shadow-xl rounded-3xl bg-white">
            <Trash2 className="w-20 h-20 text-blue-200 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Collection Tasks</h3>
            <p className="text-gray-500 text-lg">All caught up! Check back later for new assignments.</p>
            <Button onClick={fetchTasks} variant="outline" className="mt-4 border-blue-300 text-blue-600 hover:bg-blue-50">
              Refresh
            </Button>
          </Card>
        )}
      </div>

      {/* Enhanced Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-lg rounded-3xl shadow-xl border-0 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-blue-800">
              <div className="p-2 bg-blue-100 rounded-2xl">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              Complete Collection
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Finalize details for <strong>{activeTask?.binName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-sm font-semibold text-gray-700">
                Actual Weight (kg) <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="weight" 
                type="number" 
                placeholder="e.g., 45.5" 
                value={collectionWeight} 
                onChange={(e) => setCollectionWeight(e.target.value)}
                className={`ring-2 ${collectionWeight ? 'ring-blue-200' : 'ring-red-200'}`} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                placeholder="Any special observations..." 
                value={collectionNotes} 
                onChange={(e) => setCollectionNotes(e.target.value)} 
                rows={3}
                className="resize-none"
              />
            </div>
            {activeTask && (
              <Card className="border-0 bg-blue-50 rounded-3xl">
                <CardContent className="p-5">
                  <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-800">
                    📋 Task Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex justify-between"><span className="font-medium">Bin:</span><span>{activeTask.binName}</span></div>
                    <div className="flex justify-between"><span className="font-medium">Est. Weight:</span><span>{activeTask.estimatedWeight} kg</span></div>
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <Badge className={`${getWasteTypeColor(activeTask.wasteType)} text-xs`}>{activeTask.wasteType}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowCompleteDialog(false)}
              className="border-gray-300 hover:bg-gray-50 flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCompleteTask} 
              disabled={!collectionWeight} 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg disabled:opacity-50 flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}