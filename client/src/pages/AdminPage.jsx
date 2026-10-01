import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Shield, Activity, RefreshCw, UserPlus, CheckCircle2, 
  AlertTriangle, UserCheck, Package, Truck, HeartHandshake, 
  MapPin, Phone, Award, ClipboardList, PlusCircle, Trash2, Edit3, X, CheckSquare, Square
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Active view tab: 'users' | 'teams' | 'audit'
  const [activeTab, setActiveTab] = useState('users');

  // User filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected users for bulk team assembly
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // Modals state
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  // Selected target for task/logistics/edit modals
  const [activeUserTarget, setActiveUserTarget] = useState(null);

  // Form states for Create Response Team
  const [teamForm, setTeamForm] = useState({
    name: '',
    type: 'Search & Rescue',
    leaderName: '',
    contactPhone: '',
    vehicleType: 'All-Terrain Rescue Vehicle',
    district: 'Chennai',
    equipmentText: 'Trauma First-Aid Kits, Inflatable Boats, Chainsaws, Satellite Radio'
  });

  // Form state for Assign Task
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'Shelter Relief',
    priority: 'High',
    location: '',
    description: ''
  });

  // Form state for Coordinate Logistics Supply
  const [logisticsForm, setLogisticsForm] = useState({
    warehouse: 'Central Staging Warehouse - Chennai',
    destinationShelter: 'Shelter #2 - Coastal Relief Center',
    waterQuantity: 2000,
    foodQuantity: 1500,
    medicalQuantity: 40,
    instructions: 'Priority delivery before outer cyclone storm bands cross the coastline.'
  });

  // Form state for Edit User
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    role: 'volunteer',
    phone: '',
    district: '',
    availability: 'available'
  });

  const { socket, lastUpdated } = useSocket();

  useEffect(() => {
    fetchAdminData();
  }, [lastUpdated]);

  // Real-time socket listener for new registrations and team updates
  useEffect(() => {
    if (!socket) return;

    socket.on('admin:user_registered', (newUser) => {
      setUsers(prev => [newUser, ...prev]);
      showNotification(`New ${newUser.role} registered: ${newUser.name}`, 'info');
    });

    socket.on('teams:refresh', () => {
      fetchAdminData();
    });

    socket.on('user:task_assigned', () => {
      fetchAdminData();
    });

    return () => {
      socket.off('admin:user_registered');
      socket.off('teams:refresh');
      socket.off('user:task_assigned');
    };
  }, [socket]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchAdminData = async () => {
    try {
      const [uRes, tRes, logRes] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/teams'),
        axios.get('/api/admin/audit-logs')
      ]);
      if (uRes.data.success) setUsers(uRes.data.data);
      if (tRes.data.success) setTeams(tRes.data.data);
      if (logRes.data.success) setAuditLogs(logRes.data.data);
    } catch (err) {
      console.error('[Admin Data Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFeeds = async () => {
    setSyncing(true);
    try {
      const res = await axios.post('/api/cyclones/sync-live');
      if (res.data.success) {
        showNotification(`Weather telemetry synced! ${res.data.data?.length || 0} active systems tracked.`);
      }
    } catch (err) {
      showNotification('Feed sync failed. Please check network.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Selection toggle
  const toggleSelectUser = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(x => x !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const selectAllFiltered = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u._id));
    }
  };

  // Open modal for assembling response team with selected users
  const openTeamModal = () => {
    const selectedUsers = users.filter(u => selectedUserIds.includes(u._id));
    const firstUser = selectedUsers[0];
    setTeamForm({
      name: `Coastal Rapid Taskforce ${teams.length + 1}`,
      type: 'Search & Rescue',
      leaderName: firstUser ? firstUser.name : 'Commander Rajesh',
      contactPhone: firstUser && firstUser.phone ? firstUser.phone : '+91 98400 99999',
      vehicleType: 'Amphibious Rescue Boat & Truck',
      district: firstUser && firstUser.district ? firstUser.district : 'Chennai',
      equipmentText: 'Trauma First-Aid Kits, Inflatable Boats, Chainsaws, Satellite Radio'
    });
    setIsTeamModalOpen(true);
  };

  // Submit new response team creation
  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      const equipmentArray = teamForm.equipmentText.split(',').map(s => s.trim()).filter(Boolean);
      const res = await axios.post('/api/admin/create-team', {
        name: teamForm.name,
        type: teamForm.type,
        leaderName: teamForm.leaderName,
        contactPhone: teamForm.contactPhone,
        vehicleType: teamForm.vehicleType,
        district: teamForm.district,
        memberIds: selectedUserIds,
        equipment: equipmentArray
      });

      if (res.data.success) {
        showNotification(res.data.message);
        setIsTeamModalOpen(false);
        setSelectedUserIds([]);
        fetchAdminData();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to assemble team.', 'error');
    }
  };

  // Open Assign Task Modal
  const openTaskModal = (user) => {
    setActiveUserTarget(user);
    setTaskForm({
      title: `Shelter Aid & Evacuation Support - ${user.district || 'Sector'}`,
      category: user.role === 'responder' ? 'Search & Rescue' : user.role === 'coordinator' ? 'Logistics Supply' : 'Shelter Relief',
      priority: 'High',
      location: user.district || 'North Coastal Sector',
      description: `Assist in verified operations under command directive. Maintain active radio check-in.`
    });
    setIsTaskModalOpen(true);
  };

  // Submit Assign Task
  const handleAssignTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/admin/assign-task', {
        userId: activeUserTarget._id,
        title: taskForm.title,
        description: taskForm.description,
        category: taskForm.category,
        priority: taskForm.priority,
        location: taskForm.location
      });

      if (res.data.success) {
        showNotification(res.data.message);
        setIsTaskModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to assign task.', 'error');
    }
  };

  // Open Logistics Coordination Modal
  const openLogisticsModal = (user) => {
    setActiveUserTarget(user);
    setLogisticsForm({
      warehouse: 'Central Staging Warehouse - Chennai',
      destinationShelter: `${user.district || 'Coastal'} Multi-Purpose Cyclone Shelter #3`,
      waterQuantity: 2500,
      foodQuantity: 1800,
      medicalQuantity: 50,
      instructions: 'Urgent convoy dispatch required before gale wind cutoff.'
    });
    setIsLogisticsModalOpen(true);
  };

  // Submit Logistics Assignment
  const handleAssignLogisticsSubmit = async (e) => {
    e.preventDefault();
    try {
      const supplies = [
        { item: 'Drinking Water (1L Pouches)', quantity: Number(logisticsForm.waterQuantity), unit: 'packets' },
        { item: 'Ready-to-Eat Emergency Meals (MRE)', quantity: Number(logisticsForm.foodQuantity), unit: 'rations' },
        { item: 'Medical Trauma First-Aid Packs', quantity: Number(logisticsForm.medicalQuantity), unit: 'kits' }
      ];

      const res = await axios.put('/api/admin/assign-logistics', {
        userId: activeUserTarget._id,
        warehouse: logisticsForm.warehouse,
        destinationShelter: logisticsForm.destinationShelter,
        supplies,
        instructions: logisticsForm.instructions
      });

      if (res.data.success) {
        showNotification(res.data.message);
        setIsLogisticsModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to assign logistics.', 'error');
    }
  };

  // Open Edit User Modal
  const openEditUserModal = (user) => {
    setActiveUserTarget(user);
    setEditUserForm({
      name: user.name || '',
      role: user.role || 'volunteer',
      phone: user.phone || '',
      district: user.district || 'Chennai',
      availability: user.availability || 'available'
    });
    setIsEditUserModalOpen(true);
  };

  // Submit Edit User
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/admin/users/${activeUserTarget._id}`, editUserForm);
      if (res.data.success) {
        showNotification(`User ${editUserForm.name} profile updated.`);
        setIsEditUserModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      showNotification('Failed to update user.', 'error');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to remove user "${name}" from the system?`)) return;
    try {
      const res = await axios.delete(`/api/admin/users/${userId}`);
      if (res.data.success) {
        showNotification(`User ${name} has been removed.`);
        fetchAdminData();
      }
    } catch (err) {
      showNotification('Failed to delete user.', 'error');
    }
  };

  // Mark task as completed
  const handleCompleteTask = async (userId) => {
    try {
      const res = await axios.put('/api/admin/update-task-status', {
        userId,
        status: 'Completed'
      });
      if (res.data.success) {
        showNotification('Task marked as Completed. User is now Available.');
        fetchAdminData();
      }
    } catch (err) {
      showNotification('Failed to update task status.', 'error');
    }
  };

  // Filtering users
  const filteredUsers = users.filter(u => {
    if (roleFilter !== 'all' && u.role?.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (districtFilter !== 'all' && u.district?.toLowerCase() !== districtFilter.toLowerCase()) return false;
    if (availabilityFilter !== 'all' && u.availability !== availabilityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phone?.toLowerCase().includes(q);
      const matchSkill = u.skills?.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchPhone && !matchSkill) return false;
    }
    return true;
  });

  // KPI calculations
  const volunteerCount = users.filter(u => u.role === 'volunteer').length;
  const responderCount = users.filter(u => u.role === 'responder').length;
  const coordinatorCount = users.filter(u => u.role === 'coordinator').length;
  const citizenCount = users.filter(u => u.role === 'citizen').length;
  const activeTaskCount = users.filter(u => u.assignedTask && u.assignedTask.status === 'In-Progress').length;

  const districtsList = [
    'all', 'Chennai', 'Cuddalore', 'Nagapattinam', 'Kancheepuram', 'Villupuram', 
    'Balasore', 'Puri', 'Ganjam', 'Kendrapara', 'Bhadrak', 
    'Kolkata', 'South 24 Parganas', 'Visakhapatnam'
  ];

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-mono shadow-2xl border backdrop-blur-md animate-fade-in ${
          notification.type === 'error'
            ? 'border-rose-500/40 bg-rose-950/90 text-rose-200'
            : notification.type === 'info'
            ? 'border-cyan-500/40 bg-cyan-950/90 text-cyan-200'
            : 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200'
        }`}>
          {notification.type === 'error' ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-900 p-0.5 shadow-md">
            <img src="/logo.png" alt="EOC Admin Logo" className="h-full w-full object-contain rounded-lg" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-wider text-white font-mono">
              EOC Personnel, Volunteer Teams & Logistics Command
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Coordinate volunteers, assemble tactical response teams, assign operational tasks & manage relief logistics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncFeeds}
            disabled={syncing}
            className="flex items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25 transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Live Satellite Telemetry'}
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold">Total Users</span>
            <Users className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">{users.length}</div>
          <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">Platform Registered</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold">Volunteers</span>
            <HeartHandshake className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">{volunteerCount}</div>
          <div className="text-[10px] text-emerald-300/80 font-mono mt-0.5">Community Force</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold">Responders</span>
            <Shield className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">{responderCount}</div>
          <div className="text-[10px] text-rose-300/80 font-mono mt-0.5">NDRF / Rescue Units</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold">Logistics</span>
            <Package className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">{coordinatorCount}</div>
          <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">Supply Coordinators</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold">Formed Teams</span>
            <Award className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-400">{teams.length}</div>
          <div className="text-[10px] text-purple-300/80 font-mono mt-0.5">Response Squads</div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-3.5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-mono uppercase font-bold">Active Tasks</span>
            <ClipboardList className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-400">{activeTaskCount}</div>
          <div className="text-[10px] text-blue-300/80 font-mono mt-0.5">In Progress</div>
        </div>
      </div>

      {/* Main View Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`rounded-lg px-4 py-2 text-xs font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="h-4 w-4" />
            Personnel Directory ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`rounded-lg px-4 py-2 text-xs font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'teams'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Award className="h-4 w-4" />
            Formed Response Teams ({teams.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`rounded-lg px-4 py-2 text-xs font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 border border-cyan-400/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Shield className="h-4 w-4" />
            Audit Ledger ({auditLogs.length})
          </button>
        </div>

        {/* Bulk Action Button for Selected Users */}
        {selectedUserIds.length > 0 && activeTab === 'users' && (
          <div className="flex items-center gap-2 bg-slate-900 border border-cyan-500/40 rounded-xl px-3 py-1.5 animate-pulse">
            <span className="text-xs font-mono text-cyan-300 font-bold">
              {selectedUserIds.length} Selected
            </span>
            <button
              onClick={openTeamModal}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1 text-xs font-bold text-white hover:brightness-110 font-mono shadow"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Assemble into Response Team
            </button>
          </div>
        )}
      </div>

      {/* ================= TAB 1: PERSONNEL DIRECTORY ================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-[#131D31]/80 p-3 rounded-xl border border-slate-800">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">Search Personnel</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, skills..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">Role Filter</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="all">All Roles ({users.length})</option>
                <option value="volunteer">Volunteers ({volunteerCount})</option>
                <option value="responder">Responders ({responderCount})</option>
                <option value="coordinator">Logistics ({coordinatorCount})</option>
                <option value="citizen">Citizens ({citizenCount})</option>
                <option value="officer">Officers</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">Coastal District</label>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                {districtsList.map(d => (
                  <option key={d} value={d}>{d === 'all' ? 'All Districts' : d}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">Duty Status</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
              >
                <option value="all">All Availability</option>
                <option value="available">Available (Ready)</option>
                <option value="assigned">Assigned to Team</option>
                <option value="on-duty">On-Duty Task</option>
                <option value="standby">Standby</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <button
                  onClick={selectAllFiltered}
                  className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold"
                >
                  {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  Select All ({filteredUsers.length})
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  Showing {filteredUsers.length} of {users.length} registered personnel
                </span>
              </div>

              <button
                onClick={openTeamModal}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 font-mono transition"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Assemble Response Team
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[11px]">
                  <tr>
                    <th className="p-3 w-8"></th>
                    <th className="p-3">User & Contact</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">District</th>
                    <th className="p-3">Skills & Capabilities</th>
                    <th className="p-3">Team & Availability</th>
                    <th className="p-3">Active Operational Task</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-500 font-mono">
                        No registered users found matching the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelected = selectedUserIds.includes(u._id);
                      return (
                        <tr key={u._id} className={`hover:bg-slate-800/40 transition ${isSelected ? 'bg-cyan-950/20' : ''}`}>
                          {/* Selection Checkbox */}
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectUser(u._id)}
                              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          {/* User & Contact */}
                          <td className="p-3">
                            <div className="font-bold text-white text-xs">{u.name}</div>
                            <div className="text-[11px] text-slate-400">{u.email}</div>
                            {u.phone && (
                              <div className="text-[10px] text-cyan-400/80 flex items-center gap-1 mt-0.5">
                                <Phone className="h-2.5 w-2.5" /> {u.phone}
                              </div>
                            )}
                          </td>

                          {/* Role Badge */}
                          <td className="p-3">
                            <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border ${
                              u.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : u.role === 'officer'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : u.role === 'responder'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : u.role === 'coordinator'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : u.role === 'volunteer'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          {/* District */}
                          <td className="p-3">
                            <div className="flex items-center gap-1 text-slate-300">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span>{u.district || 'Coastal'}</span>
                            </div>
                          </td>

                          {/* Skills */}
                          <td className="p-3 max-w-[200px]">
                            {u.skills && u.skills.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {u.skills.slice(0, 3).map((sk, idx) => (
                                  <span key={idx} className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-300 border border-slate-700/80">
                                    {sk}
                                  </span>
                                ))}
                                {u.skills.length > 3 && (
                                  <span className="text-[9px] text-slate-500 font-bold">
                                    +{u.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[10px] italic">General Assistance</span>
                            )}
                          </td>

                          {/* Team & Availability */}
                          <td className="p-3">
                            <div className="mb-1">
                              <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                u.availability === 'available'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : u.availability === 'on-duty'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              }`}>
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {u.availability || 'available'}
                              </span>
                            </div>
                            {u.assignedTeam ? (
                              <div className="text-[10px] text-purple-300 truncate max-w-[130px] font-semibold">
                                {u.assignedTeam.name || 'Assigned Squad'}
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-500">Unassigned</div>
                            )}
                          </td>

                          {/* Assigned Task */}
                          <td className="p-3 max-w-[220px]">
                            {u.assignedTask && u.assignedTask.title ? (
                              <div className="rounded border border-slate-800 bg-slate-900/90 p-1.5 text-[10px] space-y-0.5">
                                <div className="font-bold text-white truncate flex items-center justify-between">
                                  <span>{u.assignedTask.title}</span>
                                  <span className={`text-[8px] uppercase px-1 rounded ${
                                    u.assignedTask.status === 'Completed'
                                      ? 'bg-emerald-950 text-emerald-300'
                                      : 'bg-amber-950 text-amber-300'
                                  }`}>
                                    {u.assignedTask.status}
                                  </span>
                                </div>
                                <div className="text-slate-400 text-[9px] truncate">
                                  {u.assignedTask.location} • {u.assignedTask.category}
                                </div>
                                {u.assignedTask.status !== 'Completed' && (
                                  <button
                                    onClick={() => handleCompleteTask(u._id)}
                                    className="text-[9px] text-cyan-400 hover:underline font-bold mt-0.5"
                                  >
                                    ✓ Mark Done
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500 text-[10px] italic">No active task</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Assign Task Button */}
                              <button
                                onClick={() => openTaskModal(u)}
                                title="Assign Operational Task"
                                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition"
                              >
                                <ClipboardList className="h-4 w-4" />
                              </button>

                              {/* Coordinate Logistics Button (Coordinator / Volunteer) */}
                              {(u.role === 'coordinator' || u.role === 'volunteer' || u.role === 'responder') && (
                                <button
                                  onClick={() => openLogisticsModal(u)}
                                  title="Coordinate Logistics Supply"
                                  className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition"
                                >
                                  <Truck className="h-4 w-4" />
                                </button>
                              )}

                              {/* Edit User Button */}
                              <button
                                onClick={() => openEditUserModal(u)}
                                title="Edit Role / Profile"
                                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>

                              {/* Delete User Button */}
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                title="Delete User"
                                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: FORMED RESPONSE TEAMS ================= */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Activated Tactical & Volunteer Response Teams ({teams.length})
            </h3>

            <button
              onClick={openTeamModal}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:brightness-110 font-mono shadow transition"
            >
              <PlusCircle className="h-4 w-4" />
              Assemble New Response Team
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.length === 0 ? (
              <div className="col-span-full p-12 text-center border border-slate-800 rounded-xl bg-slate-900/40 text-slate-500 font-mono">
                No response teams currently assembled. Use "Assemble New Response Team" to group volunteers and responders.
              </div>
            ) : (
              teams.map((t) => (
                <div key={t._id} className="rounded-xl border border-slate-800 bg-[#131D31]/95 p-4 shadow-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                        {t.teamId} • {t.type}
                      </span>
                      <h4 className="text-sm font-bold text-white font-mono mt-0.5">{t.name}</h4>
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 font-mono uppercase">
                      {t.status || 'AVAILABLE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono border-y border-slate-800/80 py-2">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Leader / Commander:</span>
                      <span className="font-semibold text-slate-200">{t.leaderName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Emergency Contact:</span>
                      <span className="font-semibold text-slate-200">{t.contactPhone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Allocated Vehicle:</span>
                      <span className="font-semibold text-slate-200 truncate block">{t.vehicle?.type || 'Truck'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Personnel Count:</span>
                      <span className="font-semibold text-cyan-400">{t.membersCount || t.members?.length || 1} Members</span>
                    </div>
                  </div>

                  {/* Member Details */}
                  {t.memberDetails && t.memberDetails.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">Assigned Personnel</span>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {t.memberDetails.map((m, idx) => (
                          <span key={idx} className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
                            👤 {m.name} ({m.role})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {t.equipment && t.equipment.length > 0 && (
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-1 uppercase font-bold">Gear & Equipment</span>
                      <div className="flex flex-wrap gap-1">
                        {t.equipment.map((eq, idx) => (
                          <span key={idx} className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[9px] text-cyan-300 font-mono">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: AUDIT TRAIL ================= */}
      {activeTab === 'audit' && (
        <div className="rounded-xl border border-slate-800 bg-[#131D31]/95 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
              Immutable Security & Operations Audit Trail
            </h3>
            <span className="text-xs text-slate-400 font-mono">Real-time statutory activity ledger</span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase sticky top-0">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">Action Executed</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40">
                    <td className="p-3 text-slate-400">{new Date(log.timestamp || log.createdAt).toLocaleString()}</td>
                    <td className="p-3 font-bold text-white">{log.userName}</td>
                    <td className="p-3 text-cyan-400 uppercase">{log.userRole}</td>
                    <td className="p-3 text-slate-300">{log.module}</td>
                    <td className="p-3 font-semibold text-rose-300">{log.action}</td>
                    <td className="p-3">
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                        {log.status || 'LOGGED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: ASSEMBLE RESPONSE TEAM ================= */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#131D31] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                  Assemble Response Team with Selected Personnel
                </h3>
              </div>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Squad / Response Team Name</label>
                <input
                  type="text"
                  required
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="e.g. Coastal Rapid Volunteer Squad Alpha"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Squad Operational Type</label>
                  <select
                    value={teamForm.type}
                    onChange={(e) => setTeamForm({ ...teamForm, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Search & Rescue">Search & Rescue</option>
                    <option value="Medical Response">Medical Response</option>
                    <option value="Logistics & Supply">Logistics & Supply</option>
                    <option value="Engineering & Debris">Engineering & Debris</option>
                    <option value="Fire & Rescue">Fire & Rescue</option>
                    <option value="Communication & Radio">Communication & Radio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Coastal District</label>
                  <select
                    value={teamForm.district}
                    onChange={(e) => setTeamForm({ ...teamForm, district: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {districtsList.filter(d => d !== 'all').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Team Leader Name</label>
                  <input
                    type="text"
                    required
                    value={teamForm.leaderName}
                    onChange={(e) => setTeamForm({ ...teamForm, leaderName: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={teamForm.contactPhone}
                    onChange={(e) => setTeamForm({ ...teamForm, contactPhone: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Vehicle</label>
                <input
                  type="text"
                  value={teamForm.vehicleType}
                  onChange={(e) => setTeamForm({ ...teamForm, vehicleType: e.target.value })}
                  placeholder="e.g. Amphibious Inflatable Motorboat / All-Terrain Truck"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Specialized Equipment (Comma Separated)</label>
                <input
                  type="text"
                  value={teamForm.equipmentText}
                  onChange={(e) => setTeamForm({ ...teamForm, equipmentText: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Selected Members Preview */}
              <div>
                <span className="text-slate-400 block mb-1">
                  Selected Personnel to Include: ({selectedUserIds.length})
                </span>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 rounded-lg border border-slate-800 bg-slate-950/60">
                  {selectedUserIds.map(id => {
                    const u = users.find(x => x._id === id);
                    if (!u) return null;
                    return (
                      <span key={id} className="rounded bg-cyan-950 border border-cyan-800 px-2 py-0.5 text-[10px] text-cyan-200">
                        {u.name} ({u.role})
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 font-extrabold text-white hover:brightness-110 shadow-md"
                >
                  Confirm & Assemble Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ASSIGN OPERATIONAL TASK ================= */}
      {isTaskModalOpen && activeUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#131D31] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                    Assign Operational Task
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Assigning to: {activeUserTarget.name} ({activeUserTarget.role})
                  </p>
                </div>
              </div>
              <button onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignTaskSubmit} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Conduct Door-to-Door Evacuation Verification"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Shelter Relief">Shelter Relief</option>
                    <option value="Evacuation Assistance">Evacuation Assistance</option>
                    <option value="Search & Rescue">Search & Rescue</option>
                    <option value="Medical Aid">Medical Aid</option>
                    <option value="Logistics Supply">Logistics Supply</option>
                    <option value="Debris Clearing">Debris Clearing</option>
                    <option value="Public Safety">Public Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Critical">Critical (Immediate)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Location / Shelter / Sector</label>
                <input
                  type="text"
                  required
                  value={taskForm.location}
                  onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })}
                  placeholder="e.g. Balasore Cyclone Safe Haven #3"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Operational Instructions</label>
                <textarea
                  rows="3"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Specific field directives for the assigned personnel..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 font-extrabold text-white hover:brightness-110 shadow-md"
                >
                  Dispatch Task Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: COORDINATE LOGISTICS SUPPLY ================= */}
      {isLogisticsModalOpen && activeUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#131D31] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                    Coordinate Logistics Supply
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Assigning Coordinator: {activeUserTarget.name}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsLogisticsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignLogisticsSubmit} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Origin Staging Warehouse</label>
                <select
                  value={logisticsForm.warehouse}
                  onChange={(e) => setLogisticsForm({ ...logisticsForm, warehouse: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Central Staging Warehouse - Chennai">Central Staging Warehouse - Chennai</option>
                  <option value="Cuddalore Coastal Supply Depot">Cuddalore Coastal Supply Depot</option>
                  <option value="Nagapattinam Emergency Stockpile Hub">Nagapattinam Emergency Stockpile Hub</option>
                  <option value="Balasore Port Logistics Center">Balasore Port Logistics Center</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Destination Shelter / Distribution Point</label>
                <input
                  type="text"
                  required
                  value={logisticsForm.destinationShelter}
                  onChange={(e) => setLogisticsForm({ ...logisticsForm, destinationShelter: e.target.value })}
                  placeholder="e.g. Ennore Cyclone Shelter #4"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Water (Pouches)</label>
                  <input
                    type="number"
                    value={logisticsForm.waterQuantity}
                    onChange={(e) => setLogisticsForm({ ...logisticsForm, waterQuantity: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Food Rations</label>
                  <input
                    type="number"
                    value={logisticsForm.foodQuantity}
                    onChange={(e) => setLogisticsForm({ ...logisticsForm, foodQuantity: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Trauma Kits</label>
                  <input
                    type="number"
                    value={logisticsForm.medicalQuantity}
                    onChange={(e) => setLogisticsForm({ ...logisticsForm, medicalQuantity: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Convoy Transit Instructions</label>
                <textarea
                  rows="2"
                  value={logisticsForm.instructions}
                  onChange={(e) => setLogisticsForm({ ...logisticsForm, instructions: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsLogisticsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-4 py-2 font-extrabold text-white hover:bg-amber-500 shadow-md"
                >
                  Allocate Logistics Waybill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: EDIT USER ROLE / STATUS ================= */}
      {isEditUserModalOpen && activeUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#131D31] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono">
                Manage User Profile & Role
              </h3>
              <button onClick={() => setIsEditUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={editUserForm.name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Designation</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="responder">Responder (NDRF/SDRF)</option>
                  <option value="coordinator">Logistics Coordinator</option>
                  <option value="citizen">Public Citizen</option>
                  <option value="officer">Operations Officer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coastal District</label>
                <input
                  type="text"
                  value={editUserForm.district}
                  onChange={(e) => setEditUserForm({ ...editUserForm, district: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Availability</label>
                <select
                  value={editUserForm.availability}
                  onChange={(e) => setEditUserForm({ ...editUserForm, availability: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                >
                  <option value="available">Available</option>
                  <option value="assigned">Assigned to Team</option>
                  <option value="on-duty">On-Duty Task</option>
                  <option value="standby">Standby</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 font-extrabold text-white hover:brightness-110 shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
