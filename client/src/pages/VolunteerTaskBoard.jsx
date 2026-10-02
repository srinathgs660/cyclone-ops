import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardCheck, Users, MapPin, AlertCircle, PlusCircle, CheckCircle2, 
  Award, ShieldAlert, Sparkles, Filter, Clock, Phone, ChevronRight, X, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const CATEGORIES = [
  'All Categories',
  'Ration Distribution',
  'Tree & Road Clearing',
  'Elderly Assistance',
  'Sandbagging & Flood Defense',
  'Shelter Logistics',
  'Medical First Response'
];

const VolunteerTaskBoard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [completionModalTask, setCompletionModalTask] = useState(null);
  const [proofNotes, setProofNotes] = useState('');
  const [proofImageName, setProofImageName] = useState('');
  const [notification, setNotification] = useState(null);

  // New task form state (for Officers/Coordinators)
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    category: 'Ration Distribution',
    priority: 'HIGH',
    location: '',
    district: 'Chennai',
    volunteersNeeded: 4
  });
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);

  const canBroadcast = user && ['admin', 'officer', 'coordinator'].includes(user.role);

  useEffect(() => {
    fetchTasks();
  }, [selectedCategory, statusFilter]);

  // Socket.IO real-time listeners for live task board synchronization
  useEffect(() => {
    if (!socket) return;

    socket.on('volunteer:new_task', (data) => {
      showNotification(`🚨 New Micro-Task Broadcasted: ${data.title}`);
      fetchTasks();
    });

    socket.on('volunteer:task_accepted', (data) => {
      showNotification(`🤝 ${data.volunteerName} joined task squad (${data.assignedCount}/${data.needed})`);
      fetchTasks();
    });

    socket.on('volunteer:task_completed', (data) => {
      showNotification(`✅ Task Verified Completed: ${data.taskTitle}`);
      fetchTasks();
    });

    return () => {
      socket.off('volunteer:new_task');
      socket.off('volunteer:task_accepted');
      socket.off('volunteer:task_completed');
    };
  }, [socket]);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory === 'All Categories' ? '' : selectedCategory;
      const res = await axios.get('/api/volunteer-tasks', {
        params: {
          category: categoryParam || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter
        }
      });
      if (res.data && res.data.data) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching volunteer tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastTask = async (e) => {
    e.preventDefault();
    if (!newTaskForm.title || !newTaskForm.location || !newTaskForm.description) {
      showNotification('Please fill in all required fields.', 'error');
      return;
    }

    try {
      setSubmittingBroadcast(true);
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/volunteer-tasks', newTaskForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        showNotification(`Broadcast dispatched to volunteer squads!`, 'success');
        setIsBroadcastModalOpen(false);
        setNewTaskForm({
          title: '',
          description: '',
          category: 'Ration Distribution',
          priority: 'HIGH',
          location: '',
          district: 'Chennai',
          volunteersNeeded: 4
        });
        fetchTasks();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to broadcast task', 'error');
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  const handleAcceptTask = async (taskId, taskTitle) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Please sign in to accept volunteer assignments.', 'error');
        return;
      }
      const res = await axios.post(`/api/volunteer-tasks/${taskId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showNotification(`You joined the squad for "${taskTitle}"!`, 'success');
        fetchTasks();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error accepting assignment', 'error');
    }
  };

  const handleCompleteTask = async (e) => {
    e.preventDefault();
    if (!completionModalTask) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/volunteer-tasks/${completionModalTask._id}/complete`, {
        proofNotes: proofNotes || `Task completed at ${new Date().toLocaleTimeString()} by ${user?.name}.`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        showNotification(`Assignment marked completed! +50 Volunteer Points awarded.`, 'success');
        setCompletionModalTask(null);
        setProofNotes('');
        setProofImageName('');
        fetchTasks();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to submit proof', 'error');
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  const getCategoryIconColor = (category) => {
    switch (category) {
      case 'Ration Distribution': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Tree & Road Clearing': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Elderly Assistance': return 'text-pink-400 bg-pink-500/10 border-pink-500/30';
      case 'Sandbagging & Flood Defense': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      default: return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    }
  };

  // Check if current user is assigned to a specific task
  const isUserAssigned = (task) => {
    if (!user || !task.volunteersAssigned) return false;
    return task.volunteersAssigned.some(v => v.userId === user._id || v.userId?._id === user._id);
  };

  const isUserCompleted = (task) => {
    if (!user || !task.volunteersAssigned) return false;
    const v = task.volunteersAssigned.find(a => a.userId === user._id || a.userId?._id === user._id);
    return v && v.status === 'COMPLETED';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 rounded-xl border border-cyan-500/40 bg-[#0F172A] p-4 text-sm text-cyan-200 shadow-2xl animate-in slide-in-from-top-4">
          <Sparkles className="h-5 w-5 text-cyan-400 shrink-0" />
          <span className="font-semibold">{notification.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold font-mono text-emerald-300 border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                COMMUNITY ACTION NETWORK
              </span>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-1 text-xs font-mono text-indigo-300 border border-indigo-500/30">
                NDMA VOLUNTEER SQUAD
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
              <ClipboardCheck className="h-6 w-6 text-emerald-400 shrink-0" />
              Volunteer Micro-Tasking Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Dispatching targeted disaster relief operations to on-the-ground volunteers. Accept nearby missions, assist vulnerable families, clear roads, and upload completion proofs.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {canBroadcast && (
              <button
                onClick={() => setIsBroadcastModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950/50 hover:from-emerald-500 hover:to-teal-500 transition"
              >
                <PlusCircle className="h-4 w-4" />
                Broadcast Micro-Task
              </button>
            )}
          </div>
        </div>

        {/* Volunteer Badges & Stats Bar */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Coastal Guardian</span>
            </div>
            <p className="text-lg font-bold text-white font-mono mt-1">Level 3</p>
            <p className="text-[10px] text-slate-500">250 Squad Points</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <ClipboardCheck className="h-4 w-4 text-emerald-400" />
              <span>Active Tasks</span>
            </div>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-1">
              {tasks.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}
            </p>
            <p className="text-[10px] text-slate-500">Live in Sector</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>Squad Mobilized</span>
            </div>
            <p className="text-lg font-bold text-cyan-300 font-mono mt-1">
              {tasks.reduce((acc, t) => acc + (t.volunteersAssigned?.length || 0), 0)}
            </p>
            <p className="text-[10px] text-slate-500">Volunteers Deployed</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <CheckCircle2 className="h-4 w-4 text-teal-400" />
              <span>Completed Ops</span>
            </div>
            <p className="text-lg font-bold text-teal-300 font-mono mt-1">
              {tasks.filter(t => t.status === 'COMPLETED').length}
            </p>
            <p className="text-[10px] text-slate-500">100% Verified</p>
          </div>
        </div>
      </div>

      {/* Filter and Category Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
          {CATEGORIES.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="OPEN">Open Only</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-3 text-cyan-400 font-mono text-sm">
            <span className="h-4 w-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            Loading live volunteer dispatch board...
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <ClipboardCheck className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-slate-300 font-mono">No Tasks Matching Criteria</h3>
          <p className="text-xs text-slate-500 mt-1">All sector tasks are currently staffed or no tasks match this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const assignedCount = task.volunteersAssigned?.length || 0;
            const neededCount = task.volunteersNeeded || 4;
            const progressPct = Math.min(100, Math.round((assignedCount / neededCount) * 100));
            const userJoined = isUserAssigned(task);
            const userDone = isUserCompleted(task);

            return (
              <div 
                key={task._id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-gradient-to-b from-[#131D31] to-[#0F172A] p-4 shadow-lg hover:border-slate-700 transition"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono ${getCategoryIconColor(task.category)}`}>
                      {task.category}
                    </span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono ${getPriorityStyle(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2.5 font-mono line-clamp-2">
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                    {task.description}
                  </p>

                  {/* Location & District */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{task.location}, {task.district}</span>
                  </div>

                  {/* Progress Bar of Volunteers Assigned */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Volunteers Squad</span>
                      <span className="text-cyan-300 font-bold">{assignedCount} / {neededCount} Joined</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          progressPct >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* List of assigned volunteers if any */}
                  {assignedCount > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Field Team:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.volunteersAssigned.map((v, i) => (
                          <span 
                            key={i} 
                            className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                              v.status === 'COMPLETED'
                                ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {v.name} {v.status === 'COMPLETED' ? '✓' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {userDone ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 font-mono text-xs font-bold border border-teal-500/40">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </span>
                  ) : userJoined ? (
                    <button
                      onClick={() => setCompletionModalTask(task)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold hover:bg-emerald-500 transition shadow"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Submit Proof
                    </button>
                  ) : task.status === 'COMPLETED' ? (
                    <span className="text-[11px] font-mono text-slate-500">Operation Closed</span>
                  ) : (
                    <button
                      onClick={() => handleAcceptTask(task._id, task.title)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition shadow-sm"
                    >
                      Accept Task
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast New Task Modal (Officer / Admin) */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0F172A] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white font-mono">Broadcast Volunteer Micro-Task</h3>
              </div>
              <button 
                onClick={() => setIsBroadcastModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Chainsaw Squad Needed to Clear Poonamallee Road"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Operational Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed instructions for volunteers, equipment needed, safety protocol..."
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={newTaskForm.category}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="Ration Distribution">Ration Distribution</option>
                    <option value="Tree & Road Clearing">Tree & Road Clearing</option>
                    <option value="Elderly Assistance">Elderly Assistance</option>
                    <option value="Sandbagging & Flood Defense">Sandbagging & Flood Defense</option>
                    <option value="Shelter Logistics">Shelter Logistics</option>
                    <option value="Medical First Response">Medical First Response</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate)</option>
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MEDIUM">MEDIUM Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Location / Landmark *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Triplicane High School Shelter"
                    value={newTaskForm.location}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, location: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">Volunteers Needed</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newTaskForm.volunteersNeeded}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, volunteersNeeded: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBroadcast}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition disabled:opacity-50"
                >
                  {submittingBroadcast ? 'Broadcasting...' : 'Broadcast to Volunteers'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion & Proof Modal (Volunteer) */}
      {completionModalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-[#0F172A] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-teal-400" />
                <h3 className="text-base font-bold text-white font-mono">Submit Task Verification Proof</h3>
              </div>
              <button 
                onClick={() => setCompletionModalTask(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteTask} className="mt-4 space-y-4">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <p className="text-xs font-bold text-white font-mono">{completionModalTask.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">{completionModalTask.location}</p>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  On-Site Field Notes & Outcome *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g., Road cleared of fallen banyan branches. Ambulance passage restored. 2 bags of debris moved."
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Photo Proof Simulation */}
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                  Photo Verification (Optional / Mobile Camera)
                </label>
                <div className="rounded-lg border border-dashed border-slate-700 bg-slate-800/40 p-4 text-center cursor-pointer hover:border-cyan-500/50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    id="proof-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProofImageName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    <Camera className="mx-auto h-8 w-8 text-slate-500 mb-1" />
                    {proofImageName ? (
                      <p className="text-xs font-mono text-emerald-400">Attached: {proofImageName}</p>
                    ) : (
                      <>
                        <p className="text-xs text-slate-300 font-semibold">Tap to take photo or choose file</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Captures GPS & timestamp for audit</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCompletionModalTask(null)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 transition shadow"
                >
                  Confirm & Submit Proof
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerTaskBoard;
