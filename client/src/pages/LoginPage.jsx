import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, Lock, Mail, ArrowRight, User, Phone, MapPin, 
  CheckCircle, Users, HeartHandshake, Package, Truck, AlertTriangle,
  LogIn, UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ defaultMode }) => {
  const location = useLocation();
  const isInitialSignup = defaultMode === 'signup' || location.pathname === '/signup';

  const [mode, setMode] = useState(isInitialSignup ? 'signup' : 'login');
  
  // Login form state (empty defaults for production security)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('volunteer');
  const [regPhone, setRegPhone] = useState('');
  const [regDistrict, setRegDistrict] = useState('Chennai');
  const [selectedSkills, setSelectedSkills] = useState(['First Aid & CPR', 'Food Logistics']);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const districtsList = [
    'Chennai', 'Cuddalore', 'Nagapattinam', 'Kancheepuram', 'Villupuram', 
    'Balasore', 'Puri', 'Ganjam', 'Kendrapara', 'Bhadrak', 
    'Kolkata', 'South 24 Parganas', 'East Medinipur', 
    'Srikakulam', 'Visakhapatnam', 'Kakinada', 'Machilipatnam'
  ];

  const availableSkills = [
    'First Aid & CPR',
    'Boat Rescue & Swimming',
    'Heavy Vehicle / Truck Driving',
    'Food Logistics & Rations',
    'HAM Radio & Communications',
    'Debris Clearing & Chainsaws',
    'Medical Doctor / Paramedic',
    'Shelter Welfare & Care',
    'Crowd Management & Evacuation'
  ];

  const roleCards = [
    {
      role: 'citizen',
      title: 'Public Citizen',
      desc: 'Access emergency SOS, real-time threat radar & safe shelter navigation',
      icon: User,
      color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30'
    },
    {
      role: 'volunteer',
      title: 'Community Volunteer',
      desc: 'Join response teams, shelter relief, ration supply & field assistance',
      icon: HeartHandshake,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      role: 'coordinator',
      title: 'Logistics Coordinator',
      desc: 'Manage warehouse inventory, relief convoy manifests & shelter supply chain',
      icon: Package,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
    },
    {
      role: 'responder',
      title: 'Emergency Responder',
      desc: 'Tactical search & rescue squads (NDRF / SDRF), amphibious boats & medical triage',
      icon: Shield,
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30'
    }
  ];

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password);
      const role = data?.user?.role;
      if (role === 'citizen' || role === 'volunteer') {
        navigate('/dashboard/citizen');
      } else if (role === 'coordinator') {
        navigate('/dashboard/relief');
      } else if (role === 'responder') {
        navigate('/dashboard/incidents');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      return setError('Passwords do not match.');
    }

    if (regPassword.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setSubmitting(true);
    try {
      const payload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone: regPhone,
        district: regDistrict,
        skills: selectedSkills
      };

      const res = await register(payload);

      if (res?.requiresApproval) {
        setSuccessMsg(res.message || 'Registration submitted! Your operational account is pending approval by an EOC Administrator or Officer. You can log in once approved.');
        setTimeout(() => {
          setMode('login');
          setEmail(regEmail);
          setPassword('');
        }, 3000);
        return;
      }

      setSuccessMsg(`Welcome aboard, ${res.user.name}! Your account has been registered.`);

      setTimeout(() => {
        if (regRole === 'citizen') {
          navigate('/dashboard/citizen');
        } else {
          navigate('/dashboard');
        }
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1120] p-4 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg space-y-5">
        {/* Brand */}
        <div className="text-center">
          <button
            onClick={() => navigate('/welcome')}
            className="inline-flex items-center gap-1.5 mb-3 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-[11px] font-mono text-cyan-400 hover:bg-slate-750 transition"
          >
            ← View Platform Overview & Animations
          </button>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl p-1 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-400/40 shadow-2xl shadow-cyan-900/40 backdrop-blur-md">
            <img src="/logo.png" alt="CycloneCommand Logo" className="h-full w-full object-contain rounded-2xl" />
          </div>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-wider text-white font-mono">
            CycloneCommand EOC
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            National Disaster Operations Command & Multi-Agency Response Platform
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="flex rounded-xl border border-slate-700 bg-slate-900/90 p-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-extrabold uppercase tracking-wider font-mono transition-all duration-200 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40'
                : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <LogIn className="h-4 w-4 text-white" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-extrabold uppercase tracking-wider font-mono transition-all duration-200 ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40'
                : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <UserPlus className="h-4 w-4 text-white" />
            <span>Sign Up / Register</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-slate-800 bg-[#131D31]/95 p-6 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300 font-mono flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-950/30 p-3 text-xs text-emerald-300 font-mono flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= SIGN IN MODE ================= */}
          {mode === 'login' && (
            <div>
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Identifier</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@cycloneops.gov"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Passphrase</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Authenticating...' : 'Access Command System'}
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              </form>
            </div>
          )}

          {/* ================= SIGN UP / REGISTER MODE ================= */}
          {mode === 'signup' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              {/* Role Selection Grid */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2 font-mono uppercase text-[11px]">
                  Select Operational Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roleCards.map((rc) => {
                    const IconComp = rc.icon;
                    const isSelected = regRole === rc.role;
                    return (
                      <button
                        key={rc.role}
                        type="button"
                        onClick={() => setRegRole(rc.role)}
                        className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition ${
                          isSelected
                            ? `border-cyan-400 bg-gradient-to-br ${rc.color} shadow-lg ring-1 ring-cyan-400`
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <IconComp className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {rc.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {rc.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98400 12345"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ramesh@example.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Coastal District Location */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned / Resident Coastal District</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  >
                    {districtsList.map(d => (
                      <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Skills / Capabilities (especially for Volunteers, Responders, Logistics) */}
              {regRole !== 'citizen' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-300 font-semibold font-mono text-[11px] uppercase">
                      Specialized Skills & Capabilities
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {selectedSkills.length} Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1.5 rounded-lg border border-slate-800 bg-slate-950/40">
                    {availableSkills.map(sk => {
                      const isSelected = selectedSkills.includes(sk);
                      return (
                        <button
                          key={sk}
                          type="button"
                          onClick={() => toggleSkill(sk)}
                          className={`rounded-md px-2 py-1 text-[10px] font-mono transition border ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-200'
                              : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {sk}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 mt-2"
              >
                {submitting ? 'Registering...' : `Complete Registration as ${roleCards.find(r => r.role === regRole)?.title || 'Member'}`}
                <ArrowRight className="h-4 w-4 text-white" />
              </button>

              <div className="text-center pt-2">
                <span className="text-slate-400 text-xs">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-cyan-400 font-bold hover:underline font-mono text-xs"
                >
                  Sign In here
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center text-[11px] text-slate-500 font-mono">
          Strictly for authorized disaster management personnel & registered citizens. Security logs active.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
