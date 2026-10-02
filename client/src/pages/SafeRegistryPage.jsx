import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { 
  HeartHandshake, Search, CheckCircle2, ShieldCheck, MapPin, 
  Phone, Users, PlusCircle, AlertCircle, RefreshCw, X, QrCode, 
  Building, ChevronDown, Globe, Compass, Check
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { FALLBACK_OFFLINE_SHELTERS } from '../utils/offlineManager';

// Comprehensive Worldwide Disaster / Cyclone Hierarchy
const GLOBAL_LOCATIONS = {
  'India': {
    states: [
      'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'West Bengal', 'Kerala',
      'Gujarat', 'Maharashtra', 'Karnataka', 'Puducherry', 'Andaman & Nicobar',
      'Goa', 'Lakshadweep', 'Assam', 'Bihar', 'Other / Custom State'
    ],
    districts: {
      'Tamil Nadu': ['Chennai Coastal Zone', 'Chengalpattu', 'Tiruvallur', 'Cuddalore', 'Nagapattinam', 'Kanchipuram', 'Villupuram', 'Thanjavur', 'Ramanathapuram', 'Thoothukudi', 'Tirunelveli', 'Kanyakumari', 'Other District'],
      'Andhra Pradesh': ['Visakhapatnam', 'Nellore', 'Krishna', 'East Godavari', 'West Godavari', 'Guntur', 'Prakasam', 'Srikakulam', 'Vizianagaram', 'Other District'],
      'Odisha': ['Puri', 'Ganjam', 'Balasore', 'Bhadrak', 'Kendrapara', 'Jagatsinghpur', 'Cuttack', 'Bhubaneswar', 'Other District'],
      'West Bengal': ['South 24 Parganas', 'North 24 Parganas', 'Purba Medinipur', 'Howrah', 'Kolkata', 'Other District'],
      'Gujarat': ['Kutch', 'Jamnagar', 'Porbandar', 'Devbhumi Dwarka', 'Gir Somnath', 'Surat', 'Valsad', 'Other District'],
      'Kerala': ['Ernakulam', 'Alappuzha', 'Thiruvananthapuram', 'Kollam', 'Kozhikode', 'Kannur', 'Other District'],
      'Maharashtra': ['Mumbai Coastal', 'Thane', 'Raigad', 'Ratnagiri', 'Sindhudurg', 'Palghar', 'Other District']
    }
  },
  'United States': {
    states: ['Florida', 'Texas', 'Louisiana', 'North Carolina', 'South Carolina', 'Georgia', 'Mississippi', 'Alabama', 'Hawaii', 'Puerto Rico', 'Other / Custom State'],
    districts: {
      'Florida': ['Miami-Dade County', 'Broward County', 'Palm Beach County', 'Monroe County (Keys)', 'Hillsborough County', 'Pinellas County', 'Lee County', 'Collier County', 'Other County'],
      'Texas': ['Harris County (Houston)', 'Galveston County', 'Nueces County (Corpus Christi)', 'Cameron County', 'Jefferson County', 'Brazoria County', 'Other County'],
      'Louisiana': ['Orleans Parish', 'Jefferson Parish', 'Plaquemines Parish', 'Terrebonne Parish', 'Lafourche Parish', 'Cameron Parish', 'Other Parish'],
      'North Carolina': ['Dare County (Outer Banks)', 'Carteret County', 'New Hanover County', 'Brunswick County', 'Other County'],
      'Puerto Rico': ['San Juan', 'Ponce', 'Mayagüez', 'Arecibo', 'Bayamón', 'Other Municipality']
    }
  },
  'Bangladesh': {
    states: ['Chittagong Division', 'Barisal Division', 'Khulna Division', 'Dhaka Division', 'Sylhet Division', 'Other Division'],
    districts: {
      'Chittagong Division': ["Cox's Bazar", 'Chittagong Coastal', 'Noakhali', 'Feni', 'Other District'],
      'Barisal Division': ['Bhola', 'Patuakhali', 'Barguna', 'Pirojpur', 'Barisal', 'Other District'],
      'Khulna Division': ['Bagerhat', 'Satkhira', 'Khulna', 'Jessore', 'Other District']
    }
  },
  'Philippines': {
    states: ['Eastern Visayas (Region VIII)', 'Bicol Region (Region V)', 'Central Luzon (Region III)', 'Cagayan Valley (Region II)', 'National Capital Region (NCR)', 'Caraga (Region XIII)', 'Other Region'],
    districts: {
      'Eastern Visayas (Region VIII)': ['Leyte', 'Tacloban City', 'Eastern Samar', 'Northern Samar', 'Southern Leyte', 'Other City/District'],
      'Bicol Region (Region V)': ['Albay (Legazpi)', 'Camarines Sur', 'Catanduanes', 'Sorsogon', 'Other City/District'],
      'National Capital Region (NCR)': ['Manila', 'Quezon City', 'Pasay', 'Taguig', 'Other City/District']
    }
  },
  'Japan': {
    states: ['Okinawa Prefecture', 'Kagoshima Prefecture', 'Nagasaki Prefecture', 'Tokyo Metropolis', 'Osaka Prefecture', 'Other Prefecture'],
    districts: {
      'Okinawa Prefecture': ['Naha', 'Okinawa City', 'Uruma', 'Miyakojima', 'Ishigaki', 'Other City'],
      'Kagoshima Prefecture': ['Kagoshima City', 'Amami', 'Kirishima', 'Other City']
    }
  },
  'Australia': {
    states: ['Queensland', 'Western Australia', 'Northern Territory', 'New South Wales', 'Other State'],
    districts: {
      'Queensland': ['Cairns Regional', 'Townsville City', 'Mackay Regional', 'Whitsunday Regional', 'Rockhampton', 'Brisbane', 'Other Shire'],
      'Western Australia': ['Pilbara (Karratha/Port Hedland)', 'Kimberley (Broome)', 'Gascoyne (Exmouth)', 'Other Shire'],
      'Northern Territory': ['Darwin City', 'Palmerston', 'Katherine', 'Other Council']
    }
  },
  'Mexico': {
    states: ['Quintana Roo', 'Yucatán', 'Baja California Sur', 'Veracruz', 'Guerrero', 'Oaxaca', 'Other State'],
    districts: {
      'Quintana Roo': ['Cancún (Benito Juárez)', 'Playa del Carmen', 'Cozumel', 'Tulum', 'Chetumal', 'Other Municipality'],
      'Baja California Sur': ['Los Cabos', 'La Paz', 'Comondú', 'Other Municipality'],
      'Guerrero': ['Acapulco de Juárez', 'Zihuatanejo', 'Other Municipality']
    }
  },
  'Vietnam': {
    states: ['Central Coastal Region', 'Red River Delta', 'Mekong Delta', 'Other Region'],
    districts: {
      'Central Coastal Region': ['Da Nang', 'Quang Nam', 'Thua Thien Hue', 'Quang Binh', 'Quang Ngai', 'Binh Dinh', 'Khanh Hoa (Nha Trang)', 'Other Province']
    }
  },
  'Indonesia': {
    states: ['Sumatra', 'Java', 'Bali & Nusa Tenggara', 'Sulawesi', 'Other Province'],
    districts: {
      'Sumatra': ['Aceh Coastal', 'North Sumatra (Medan)', 'West Sumatra (Padang)', 'Lampung', 'Other Regency'],
      'Java': ['Jakarta Coastal', 'West Java', 'Central Java', 'East Java', 'Other Regency']
    }
  },
  'Sri Lanka': {
    states: ['Northern Province', 'Eastern Province', 'Southern Province', 'Western Province', 'Other Province'],
    districts: {
      'Northern Province': ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu'],
      'Eastern Province': ['Trincomalee', 'Batticaloa', 'Ampara'],
      'Western Province': ['Colombo', 'Gampaha', 'Kalutara']
    }
  },
  'United Kingdom': {
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    districts: {
      'England': ['Cornwall', 'Devon', 'Dorset', 'Hampshire', 'Greater London', 'Other County']
    }
  },
  'Canada': {
    states: ['Nova Scotia', 'Newfoundland and Labrador', 'New Brunswick', 'British Columbia', 'Other Province'],
    districts: {
      'Nova Scotia': ['Halifax Regional', 'Cape Breton', 'Other County']
    }
  },
  'Global / Other Country': {
    states: ['Other Province / Territory'],
    districts: {
      'Other Province / Territory': ['Local Evacuation Sector']
    }
  }
};

const SafeRegistryPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [stats, setStats] = useState({ totalCheckins: 0, totalPeopleSafe: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Available shelters list (fetched from API or fallback)
  const [allShelters, setAllShelters] = useState([]);
  const [shelterSearchTerm, setShelterSearchTerm] = useState('');
  const [isShelterDropdownOpen, setIsShelterDropdownOpen] = useState(false);
  const shelterDropdownRef = useRef(null);

  // Form State for "I Am Safe" with Global Location
  const [checkinForm, setCheckinForm] = useState({
    citizenName: '',
    phone: '',
    country: 'India',
    customCountry: '',
    state: 'Tamil Nadu',
    customState: '',
    district: 'Chennai Coastal Zone',
    customDistrict: '',
    shelterName: 'Chennai Girls Higher Secondary School Shelter',
    shelterId: null,
    familyMembersCount: 1,
    familyMembersNames: '',
    medicalAssistanceRequired: false,
    status: 'SAFE_IN_SHELTER',
    notes: 'All safe, dry rations received.'
  });

  const [submitting, setSubmitting] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchRecentCheckins();
    fetchSheltersList();

    const handleClickOutside = (e) => {
      if (shelterDropdownRef.current && !shelterDropdownRef.current.contains(e.target)) {
        setIsShelterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Real-time socket listener for incoming safe check-ins
  useEffect(() => {
    if (!socket) return;
    socket.on('registry:safe_checkin', (data) => {
      setRecentCheckins(prev => [data, ...prev.slice(0, 24)]);
      setStats(prev => ({
        totalCheckins: prev.totalCheckins + 1,
        totalPeopleSafe: prev.totalPeopleSafe + (data.familyMembersCount || 1)
      }));
      showNotification(`Verified Safe Check-in: ${data.citizenName} & family in ${data.district || 'Shelter'}`);
    });

    return () => {
      socket.off('registry:safe_checkin');
    };
  }, [socket]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSheltersList = async () => {
    try {
      const res = await axios.get('/api/shelters');
      if (res.data && res.data.data && res.data.data.length > 0) {
        setAllShelters(res.data.data);
      } else {
        setAllShelters(FALLBACK_OFFLINE_SHELTERS);
      }
    } catch (e) {
      setAllShelters(FALLBACK_OFFLINE_SHELTERS);
    }
  };

  const fetchRecentCheckins = async () => {
    try {
      const res = await axios.get('/api/registry/recent');
      if (res.data.success) {
        setRecentCheckins(res.data.data || []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Failed to load recent checkins:', err.message);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const countryParam = countryFilter === 'all' ? '' : countryFilter;
      const res = await axios.get(`/api/registry/search?q=${encodeURIComponent(searchQuery)}&country=${encodeURIComponent(countryParam)}`);
      if (res.data.success) {
        setSearchResults(res.data.data || []);
      }
    } catch (err) {
      showNotification('Search failed. Please check network.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // When Country changes, update state and district defaults
  const handleCountryChange = (newCountry) => {
    const loc = GLOBAL_LOCATIONS[newCountry];
    const firstState = loc?.states?.[0] || 'Default State';
    const firstDist = loc?.districts?.[firstState]?.[0] || 'Default District';
    setCheckinForm(prev => ({
      ...prev,
      country: newCountry,
      customCountry: '',
      state: firstState,
      customState: '',
      district: firstDist,
      customDistrict: ''
    }));
  };

  // When State changes, update district defaults
  const handleStateChange = (newState) => {
    const distList = GLOBAL_LOCATIONS[checkinForm.country]?.districts?.[newState];
    const firstDist = distList?.[0] || 'Default District';
    setCheckinForm(prev => ({
      ...prev,
      state: newState,
      customState: '',
      district: firstDist,
      customDistrict: ''
    }));
  };

  // Handle selecting a shelter from searchable dropdown
  const handleSelectShelter = (sh) => {
    setCheckinForm(prev => {
      const updated = {
        ...prev,
        shelterName: sh.name,
        shelterId: sh._id || null
      };
      if (sh.district) updated.district = sh.district;
      if (sh.state) updated.state = sh.state;
      if (sh.country) updated.country = sh.country;
      return updated;
    });
    setIsShelterDropdownOpen(false);
    setShelterSearchTerm('');
  };

  // Filter shelters according to search term in dropdown
  const filteredShelters = useMemo(() => {
    const term = shelterSearchTerm.toLowerCase().trim();
    if (!term) return allShelters;
    return allShelters.filter(s => 
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.district && s.district.toLowerCase().includes(term)) ||
      (s.address && s.address.toLowerCase().includes(term))
    );
  }, [allShelters, shelterSearchTerm]);

  const handleCheckinSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const namesArray = checkinForm.familyMembersNames
        ? checkinForm.familyMembersNames.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const resolvedCountry = checkinForm.country === 'Global / Other Country' && checkinForm.customCountry.trim()
        ? checkinForm.customCountry.trim()
        : checkinForm.country;

      const resolvedState = checkinForm.state === 'Other / Custom State' && checkinForm.customState.trim()
        ? checkinForm.customState.trim()
        : checkinForm.state;

      const resolvedDistrict = checkinForm.district === 'Other District' && checkinForm.customDistrict.trim()
        ? checkinForm.customDistrict.trim()
        : checkinForm.district;

      const res = await axios.post('/api/registry/safe-checkin', {
        ...checkinForm,
        country: resolvedCountry,
        state: resolvedState,
        district: resolvedDistrict,
        familyMembersCount: parseInt(checkinForm.familyMembersCount) || 1,
        familyMembersNames: namesArray
      });

      if (res.data.success) {
        showNotification(res.data.message);
        setIsCheckinModalOpen(false);
        setCheckinForm({
          citizenName: '',
          phone: '',
          country: 'India',
          customCountry: '',
          state: 'Tamil Nadu',
          customState: '',
          district: 'Chennai Coastal Zone',
          customDistrict: '',
          shelterName: 'Chennai Girls Higher Secondary School Shelter',
          shelterId: null,
          familyMembersCount: 1,
          familyMembersNames: '',
          medicalAssistanceRequired: false,
          status: 'SAFE_IN_SHELTER',
          notes: ''
        });
        fetchRecentCheckins();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Check-in failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const availableStates = GLOBAL_LOCATIONS[checkinForm.country]?.states || ['Other / Custom State'];
  const availableDistricts = GLOBAL_LOCATIONS[checkinForm.country]?.districts?.[checkinForm.state] || ['Other District'];

  return (
    <div className="space-y-6">
      
      {/* Notifications Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-mono font-bold text-white shadow-2xl animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍👩‍👧‍👦</span>
            <h2 className="text-xl font-extrabold tracking-wider text-white uppercase font-mono">
              Global Citizen "I Am Safe" & Missing Persons Registry
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Worldwide public verification registry for evacuated families across all countries, states, and districts. Relatives can confirm safety without clogging 108/112/911 emergency phone lines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCheckinModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold font-mono uppercase text-slate-950 shadow-lg shadow-emerald-950/40 hover:brightness-110 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>I Am Safe (Check-in)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 light-adapt-box shadow-sm">
          <p className="text-[10px] uppercase text-slate-400 font-mono">Citizens Confirmed Safe</p>
          <p className="mt-1 text-2xl font-black text-emerald-400 font-mono">
            {stats.totalPeopleSafe.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Across Global Shelters</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 light-adapt-box shadow-sm">
          <p className="text-[10px] uppercase text-slate-400 font-mono">Family Units Checked In</p>
          <p className="mt-1 text-2xl font-black text-cyan-300 font-mono">
            {stats.totalCheckins.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Searchable by Phone/Name</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 light-adapt-box shadow-sm">
          <p className="text-[10px] uppercase text-slate-400 font-mono">Global Coverage</p>
          <p className="mt-1 text-base font-bold text-indigo-400 font-mono flex items-center gap-1.5">
            <Globe className="h-4 w-4" />
            <span>Multi-Country / State</span>
          </p>
          <span className="text-[10px] text-slate-500">Universal Geo-Registry</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#131D31]/90 p-4 light-adapt-box shadow-sm">
          <p className="text-[10px] uppercase text-slate-400 font-mono">Privacy Protection</p>
          <p className="mt-1 text-base font-bold text-amber-300 font-mono">
            Masked Contacts
          </p>
          <span className="text-[10px] text-slate-500">Prevents Unsolicited Scams</span>
        </div>
      </div>

      {/* RELATIVE SEARCH PORTAL BOX */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-[#131D31] to-[#0B1120] p-6 shadow-2xl light-adapt-box space-y-4">
        <div className="max-w-xl">
          <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Search className="h-5 w-5 text-cyan-400" />
            <span>Search for Family Members or Relatives Worldwide</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Search by relative's name, mobile number, shelter name, district, or state to confirm their location and safety status.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. Meenakshi, +91 98400, Saidapet, or Miami"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none shadow-inner"
            />
          </div>

          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="w-full sm:w-56 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
          >
            <option value="all">🌍 All Countries / Worldwide</option>
            {Object.keys(GLOBAL_LOCATIONS).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-6 py-2.5 text-xs font-bold text-white uppercase font-mono tracking-wider transition shadow-lg shadow-cyan-900/40 disabled:opacity-50"
          >
            {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Search Registry</span>
          </button>
        </form>

        {/* Search Results Display */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-slate-800 pt-4 animate-fadeIn">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
              Found {searchResults.length} Verified Match(es):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((r) => (
                <div key={r._id} className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{r.citizenName}</span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                      ✓ SAFE & VERIFIED
                    </span>
                  </div>
                  <div className="text-slate-300 space-y-1 text-[11px]">
                    <p className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-cyan-400" />
                      <strong>Shelter:</strong> {r.shelterName}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-rose-400" />
                      <strong>Region:</strong> {r.district}, {r.state} ({r.country})
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-amber-400" />
                      <strong>Family Safe:</strong> {r.familyMembersCount} person(s)
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-400" />
                      <strong>Verified Contact:</strong> {r.phoneMasked}
                    </p>
                    {r.notes && (
                      <p className="rounded bg-slate-900/60 p-2 text-slate-300 border border-slate-800 italic mt-1">
                        "{r.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RECENT LIVE CHECK-IN STREAM */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Live Verified Safety Feed (Global)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Auto-refreshed via WebSockets
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recentCheckins.slice(0, 12).map((item, idx) => (
            <div key={item._id || idx} className="rounded-xl border border-slate-800 bg-[#131D31]/80 p-3.5 space-y-2 text-xs font-mono shadow-sm hover:border-slate-700 transition">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{item.citizenName}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.phoneMasked || '+91 98****3210'}</p>
                </div>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  {item.familyMembersCount || 1} Safe
                </span>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-slate-800/80">
                <p className="flex items-center gap-1.5 text-cyan-300 font-semibold truncate">
                  <Building className="h-3 w-3 shrink-0" />
                  <span className="truncate">{item.shelterName}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-400 truncate">
                  <MapPin className="h-3 w-3 shrink-0 text-rose-400" />
                  <span className="truncate">{item.district}{item.state ? `, ${item.state}` : ''}{item.country ? ` (${item.country})` : ''}</span>
                </p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                  <span>Checked In</span>
                  <span>{new Date(item.checkedInAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* "I AM SAFE" CHECK-IN MODAL WITH GLOBAL LOCATION & SEARCHABLE SHELTER DROPDOWN */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-[#0F172A] p-5 sm:p-6 shadow-2xl text-slate-100 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5 text-emerald-400" />
                  Citizen Safety Check-In Form
                </h3>
                <p className="text-xs text-slate-400">
                  Record your shelter location so relatives can verify your safety anywhere in the world.
                </p>
              </div>
              <button 
                onClick={() => setIsCheckinModalOpen(false)} 
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCheckinSubmit} className="space-y-3.5 text-xs font-mono">
              
              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Your Full Name *</label>
                  <input 
                    type="text"
                    required
                    value={checkinForm.citizenName}
                    onChange={e => setCheckinForm({...checkinForm, citizenName: e.target.value})}
                    placeholder="e.g. S. Meenakshi / John Miller"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Mobile Phone Number *</label>
                  <input 
                    type="tel"
                    required
                    value={checkinForm.phone}
                    onChange={e => setCheckinForm({...checkinForm, phone: e.target.value})}
                    placeholder="+91 98400 99999 / +1 305 555 0199"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Family Members Count & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Total Family Members</label>
                  <input 
                    type="number"
                    min="1"
                    max="30"
                    value={checkinForm.familyMembersCount}
                    onChange={e => setCheckinForm({...checkinForm, familyMembersCount: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Current Status</label>
                  <select 
                    value={checkinForm.status}
                    onChange={e => setCheckinForm({...checkinForm, status: e.target.value})}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="SAFE_IN_SHELTER">Safe in Evacuation Shelter</option>
                    <option value="SAFE_AT_RELATIVE">Safe at Relative / Friend Home</option>
                    <option value="EVACUATING">En Route to High-Ground Refuge</option>
                  </select>
                </div>
              </div>

              {/* GLOBAL LOCATION SELECTOR: Country -> State -> District */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs uppercase">
                  <Globe className="h-4 w-4" />
                  <span>Geographical Location Hierarchy</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 1. Country Selection */}
                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Country *</label>
                    <select
                      value={checkinForm.country}
                      onChange={e => handleCountryChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-white focus:border-cyan-400 focus:outline-none text-xs"
                    >
                      {Object.keys(GLOBAL_LOCATIONS).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* 2. State / Province Selection */}
                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">State / Province *</label>
                    <select
                      value={checkinForm.state}
                      onChange={e => handleStateChange(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-white focus:border-cyan-400 focus:outline-none text-xs"
                    >
                      {availableStates.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. District / County Selection */}
                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">District / City *</label>
                    <select
                      value={checkinForm.district}
                      onChange={e => setCheckinForm({...checkinForm, district: e.target.value})}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-2 text-white focus:border-cyan-400 focus:outline-none text-xs"
                    >
                      {availableDistricts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Custom inputs if "Other" was selected for Country, State, or District */}
                {(checkinForm.country === 'Global / Other Country' || checkinForm.state === 'Other / Custom State' || checkinForm.district === 'Other District') && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                    {checkinForm.country === 'Global / Other Country' && (
                      <div>
                        <label className="text-slate-400 block mb-1 text-[10px]">Type Country Name</label>
                        <input
                          type="text"
                          required
                          value={checkinForm.customCountry}
                          onChange={e => setCheckinForm({...checkinForm, customCountry: e.target.value})}
                          placeholder="e.g. Fiji / Jamaica"
                          className="w-full rounded-lg border border-cyan-500/50 bg-slate-900 px-2 py-1.5 text-white text-xs"
                        />
                      </div>
                    )}
                    {checkinForm.state === 'Other / Custom State' && (
                      <div>
                        <label className="text-slate-400 block mb-1 text-[10px]">Type State / Region</label>
                        <input
                          type="text"
                          required
                          value={checkinForm.customState}
                          onChange={e => setCheckinForm({...checkinForm, customState: e.target.value})}
                          placeholder="e.g. Northern Division"
                          className="w-full rounded-lg border border-cyan-500/50 bg-slate-900 px-2 py-1.5 text-white text-xs"
                        />
                      </div>
                    )}
                    {checkinForm.district === 'Other District' && (
                      <div>
                        <label className="text-slate-400 block mb-1 text-[10px]">Type District / City</label>
                        <input
                          type="text"
                          required
                          value={checkinForm.customDistrict}
                          onChange={e => setCheckinForm({...checkinForm, customDistrict: e.target.value})}
                          placeholder="e.g. Suva / Kingston"
                          className="w-full rounded-lg border border-cyan-500/50 bg-slate-900 px-2 py-1.5 text-white text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SEARCHABLE SHELTER DROPDOWN BOX (WITH INTEGRATED SEARCH BAR) */}
              <div className="space-y-1 relative" ref={shelterDropdownRef}>
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 block font-semibold flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-emerald-400" />
                    <span>Shelter / Evacuation Center *</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Dropdown with instant search</span>
                </div>

                {/* Clickable Display Trigger for Dropdown */}
                <div 
                  onClick={() => setIsShelterDropdownOpen(!isShelterDropdownOpen)}
                  className="w-full flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white cursor-pointer hover:border-cyan-400 transition"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="truncate font-semibold">{checkinForm.shelterName || 'Select an evacuation shelter...'}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isShelterDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu Container */}
                {isShelterDropdownOpen && (
                  <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl border border-slate-700 bg-[#131D31] shadow-2xl overflow-hidden animate-fadeIn">
                    
                    {/* Embedded Search Bar */}
                    <div className="p-2 border-b border-slate-800 bg-[#0F172A] sticky top-0">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          autoFocus
                          value={shelterSearchTerm}
                          onChange={e => setShelterSearchTerm(e.target.value)}
                          placeholder="Search shelter by name, city, or district..."
                          className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                        />
                        {shelterSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setShelterSearchTerm('')}
                            className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filtered Shelters List */}
                    <div className="max-h-52 overflow-y-auto divide-y divide-slate-800/60">
                      {filteredShelters.length === 0 ? (
                        <div className="p-4 text-center">
                          <p className="text-xs text-slate-400">No registered shelters match "{shelterSearchTerm}"</p>
                          <button
                            type="button"
                            onClick={() => {
                              setCheckinForm(prev => ({ ...prev, shelterName: shelterSearchTerm, shelterId: null }));
                              setIsShelterDropdownOpen(false);
                            }}
                            className="mt-2 text-xs font-bold text-cyan-400 hover:underline"
                          >
                            + Use "{shelterSearchTerm}" as unlisted shelter name
                          </button>
                        </div>
                      ) : (
                        filteredShelters.map((sh, idx) => {
                          const isSelected = checkinForm.shelterName === sh.name;
                          return (
                            <div
                              key={sh._id || idx}
                              onClick={() => handleSelectShelter(sh)}
                              className={`p-2.5 flex items-start justify-between cursor-pointer transition hover:bg-slate-800/80 ${
                                isSelected ? 'bg-cyan-500/15 border-l-4 border-cyan-400' : ''
                              }`}
                            >
                              <div className="space-y-0.5 truncate pr-2">
                                <p className="font-bold text-slate-100 text-xs truncate flex items-center gap-1.5">
                                  <span>{sh.name}</span>
                                  {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400 shrink-0" />}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {sh.address ? `${sh.address} • ` : ''}{sh.district || ''}{sh.state ? `, ${sh.state}` : ''}
                                </p>
                              </div>
                              {sh.capacity && (
                                <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-mono text-cyan-300 border border-slate-700 shrink-0">
                                  {sh.capacity} cap
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Quick custom shelter option */}
                    <div className="p-2 border-t border-slate-800 bg-[#0F172A] text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const custom = prompt('Enter the name of your community hall, school, or shelter:');
                          if (custom && custom.trim()) {
                            setCheckinForm(prev => ({ ...prev, shelterName: custom.trim(), shelterId: null }));
                            setIsShelterDropdownOpen(false);
                          }
                        }}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        + Type custom / unlisted shelter name
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Message for family */}
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">Message for Family</label>
                <textarea 
                  rows={2}
                  value={checkinForm.notes}
                  onChange={e => setCheckinForm({...checkinForm, notes: e.target.value})}
                  placeholder="e.g. All 4 of us arrived safely, children are fine, dry rations received."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-bold font-mono text-slate-950 uppercase tracking-wider transition hover:brightness-110 disabled:opacity-50 shadow-lg shadow-emerald-950/40"
              >
                {submitting ? 'Confirming Registration...' : '✓ Confirm "I Am Safe" Check-In'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SafeRegistryPage;
