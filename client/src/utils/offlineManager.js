/**
 * Offline-First "Grid-Down" Emergency Manager
 * Handles local caching of shelters, first-aid vaults, emergency numbers,
 * and background queued SOS dispatch upon network reconnection.
 */
import axios from 'axios';

const OFFLINE_SHELTERS_KEY = 'cyclone_offline_shelters';
const OFFLINE_SOS_QUEUE_KEY = 'cyclone_offline_sos_queue';
const OFFLINE_FIRST_AID_KEY = 'cyclone_offline_first_aid';

// Standard baseline emergency shelters cached for offline grid-down situations
export const FALLBACK_OFFLINE_SHELTERS = [
  {
    name: 'Chennai Girls Higher Secondary School Shelter',
    address: 'Rotary Nagar, Triplicane, Chennai',
    district: 'Chennai',
    coordinates: [80.278, 13.059],
    capacity: 650,
    features: ['High Ground (+4.5m)', 'Diesel Generator', 'RO Drinking Water', 'First-Aid Bay'],
    contactPhone: '044-25619206'
  },
  {
    name: 'Government Model Higher Secondary School Shelter',
    address: 'Saidapet High Road, Chennai',
    district: 'Chennai',
    coordinates: [80.221, 13.018],
    capacity: 900,
    features: ['Reinforced Concrete Roof', 'Medical Triage Post', 'Amphibious Vehicle Parking'],
    contactPhone: '044-24351120'
  },
  {
    name: 'Ennore Port Maritime Community Shelter',
    address: 'Kattupalli Expressway, Ennore',
    district: 'Tiruvallur',
    coordinates: [80.320, 13.235],
    capacity: 800,
    features: ['Anti-Storm Surge Seawall (+6.0m)', 'Emergency Ham Radio Check-in', 'Satellite Phone'],
    contactPhone: '044-27950001'
  },
  {
    name: 'Mahabalipuram Multi-Purpose Cyclone Shelter',
    address: 'East Coast Road, Mahabalipuram',
    district: 'Chengalpattu',
    coordinates: [80.190, 12.615],
    capacity: 500,
    features: ['Coast Guard Station Adjacent', 'Solar Battery Inverter', 'Community Kitchen'],
    contactPhone: '044-27442220'
  },
  {
    name: 'Cuddalore Port Cyclone Relief Center',
    address: 'Silver Beach Road, Cuddalore Port',
    district: 'Cuddalore',
    coordinates: [79.765, 11.745],
    capacity: 750,
    features: ['Reinforced Stilt Construction (+5.2m)', 'Motorized Rescue Boat Staging'],
    contactPhone: '04142-230005'
  }
];

export const EMERGENCY_BROADCAST_FREQUENCIES = [
  { agency: 'All India Radio (AIR) Chennai Primary', frequency: '720 kHz AM (MW)', purpose: 'Official Cyclone Landfall Bulletins' },
  { agency: 'AIR FM Rainbow Chennai', frequency: '101.4 MHz FM', purpose: 'Community Evacuation & Shelter Status' },
  { agency: 'Disaster Ham Radio Emergency Net', frequency: '145.500 MHz (VHF FM)', purpose: 'Volunteer & NDRF Emergency Relay' },
  { agency: 'State Emergency Operations Center (TNSDMA)', frequency: 'Toll-Free 1070 / 1077', purpose: 'National 24/7 Disaster Helpline' },
  { agency: 'Ambulance & Fire Rescue', frequency: '108 / 101', purpose: 'Trauma & Flood Extraction Triage' }
];

export const OFFLINE_FIRST_AID_GUIDE = [
  {
    title: 'Severe Bleeding & Puncture Wounds',
    action: 'Apply firm direct pressure with clean cloth. Elevate wound above heart. Do not remove embedded metal objects—stabilize with cloth roll around object.'
  },
  {
    title: 'Hypothermia & Prolonged Flood Immersion',
    action: 'Remove soaked clothing immediately. Wrap in dry blankets, plastic sheets, or tarpaulin. Provide warm sweetened liquids if conscious. Never rub frostbitten skin.'
  },
  {
    title: 'Electrocution & Fallen Power Lines',
    action: 'Assume all flooded water near fallen cables is live. Maintain 10-meter distance. Do not touch victim until main grid is confirmed tripped. Use dry wooden pole only in extreme emergency.'
  },
  {
    title: 'Emergency Water Purification Without Power',
    action: 'Boil vigorously for 3 minutes. If fuel is unavailable, add 4 drops of unscented household chlorine bleach per 1 liter of clear water, stir, and wait 30 minutes before drinking.'
  }
];

// Save shelters to local storage for offline use
export function cacheSheltersOffline(shelters) {
  try {
    if (Array.isArray(shelters) && shelters.length > 0) {
      localStorage.setItem(OFFLINE_SHELTERS_KEY, JSON.stringify(shelters));
    }
  } catch (e) {}
}

export function getCachedShelters() {
  try {
    const raw = localStorage.getItem(OFFLINE_SHELTERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return FALLBACK_OFFLINE_SHELTERS;
}

// Queue SOS during grid-down offline situations
export function queueOfflineSos(sosData) {
  try {
    const queue = getQueuedOfflineSos();
    const item = {
      ...sosData,
      queuedAt: new Date().toISOString(),
      offlineId: `offline-sos-${Date.now()}`
    };
    queue.push(item);
    localStorage.setItem(OFFLINE_SOS_QUEUE_KEY, JSON.stringify(queue));
    return item;
  } catch (e) {
    return null;
  }
}

export function getQueuedOfflineSos() {
  try {
    const raw = localStorage.getItem(OFFLINE_SOS_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Flush and transmit queued SOS messages when internet connection resumes
export async function syncOfflineSosQueue(onSuccess) {
  const queue = getQueuedOfflineSos();
  if (queue.length === 0) return;

  const successfulIds = [];
  for (const item of queue) {
    try {
      await axios.post('/api/citizen/sos', {
        name: item.name || 'Offline Citizen',
        phone: item.phone,
        type: item.type || 'RESCUE',
        location: item.location || 'Reported via Offline Grid-Down Queue',
        peopleCount: item.peopleCount || 1,
        message: `[OFFLINE SYNCED]: ${item.message || 'Queued during cell network failure.'}`,
        coordinates: item.coordinates
      });
      successfulIds.push(item.offlineId);
    } catch (e) {
      console.warn('[OfflineManager] Sync retry failed for SOS item:', e.message);
    }
  }

  const remaining = queue.filter(x => !successfulIds.includes(x.offlineId));
  localStorage.setItem(OFFLINE_SOS_QUEUE_KEY, JSON.stringify(remaining));

  if (successfulIds.length > 0 && typeof onSuccess === 'function') {
    onSuccess(successfulIds.length);
  }
}
