// Comprehensive in-memory repository populated from the master disaster seed data
// Automatically activated whenever remote MongoDB Atlas is temporarily unreachable / whitelist-blocked

const mockAgencies = [
  { _id: '6a9fb634e3261447d0177ec8', name: 'National Disaster Response Force (NDRF)', code: 'NDRF', type: 'RESCUE', contactPhone: '+91 11 2436 3260', coverageRegions: ['Tamil Nadu', 'Andhra Pradesh', 'Odisha'] },
  { _id: '6a9fb634e3261447d0177ec9', name: 'India Meteorological Department (IMD)', code: 'IMD', type: 'GOVERNMENT', contactPhone: '+91 44 2256 1234', coverageRegions: ['Bay of Bengal', 'Arabian Sea'] },
  { _id: '6a9fb634e3261447d0177eca', name: 'Tamil Nadu State Disaster Management Authority (TNSDMA)', code: 'TNSDMA', type: 'GOVERNMENT', contactPhone: '+91 44 2853 8550', coverageRegions: ['All 38 Districts of Tamil Nadu'] },
  { _id: '6a9fb634e3261447d0177ecb', name: 'Indian Coast Guard - Eastern Region', code: 'ICG', type: 'MILITARY', contactPhone: '+91 44 2346 0405', coverageRegions: ['Coromandel Coast'] },
  { _id: '6a9fb634e3261447d0177ecc', name: 'Indian Red Cross Society', code: 'IRCS', type: 'NGO', contactPhone: '+91 44 2819 1234', coverageRegions: ['Coastal Tamil Nadu'] }
];

const mockCyclones = [
  {
    _id: '6a9fb636e3261447d0177ee8',
    name: 'Cyclone Amara',
    source: 'IMD RSMC New Delhi',
    externalId: 'BOB-04-2026',
    category: 'Category 3',
    currentLocation: { type: 'Point', coordinates: [81.65, 12.75] },
    windSpeed: 175,
    windSpeedUnit: 'km/h',
    pressure: 962,
    movementSpeed: 18,
    movementDirection: 'WNW',
    pastTrack: [
      { time: new Date(Date.now() - 24 * 3600 * 1000), coordinates: [84.20, 11.20], windSpeed: 95, pressure: 994 },
      { time: new Date(Date.now() - 18 * 3600 * 1000), coordinates: [83.45, 11.65], windSpeed: 120, pressure: 984 },
      { time: new Date(Date.now() - 12 * 3600 * 1000), coordinates: [82.80, 12.05], windSpeed: 145, pressure: 975 },
      { time: new Date(Date.now() - 6 * 3600 * 1000), coordinates: [82.15, 12.40], windSpeed: 165, pressure: 968 }
    ],
    forecastTrack: [
      { time: new Date(Date.now() + 6 * 3600 * 1000), coordinates: [81.05, 12.98], windSpeed: 185, pressure: 955, category: 'Category 3', uncertaintyRadiusKm: 35 },
      { time: new Date(Date.now() + 12 * 3600 * 1000), coordinates: [80.52, 13.15], windSpeed: 195, pressure: 950, category: 'Category 3 / 4', uncertaintyRadiusKm: 48 },
      { time: new Date(Date.now() + 18 * 3600 * 1000), coordinates: [80.25, 13.28], windSpeed: 205, pressure: 945, category: 'Category 4 (Landfall)', uncertaintyRadiusKm: 65 },
      { time: new Date(Date.now() + 24 * 3600 * 1000), coordinates: [79.80, 13.40], windSpeed: 155, pressure: 968, category: 'Category 2 (Inland)', uncertaintyRadiusKm: 85 },
      { time: new Date(Date.now() + 36 * 3600 * 1000), coordinates: [79.10, 13.60], windSpeed: 90, pressure: 990, category: 'Severe Depression', uncertaintyRadiusKm: 110 }
    ],
    affectedRegions: ['Chennai Urban', 'Thiruvallur', 'Kancheepuram', 'Chengalpattu', 'Nellore'],
    status: 'ACTIVE',
    landfallEstimate: {
      time: new Date(Date.now() + 18 * 3600 * 1000),
      locationName: 'North Chennai / Ennore Coastal Sector',
      coordinates: [80.25, 13.28],
      confidence: 'HIGH'
    },
    intensityRadius: { galeWindKm: 210, stormWindKm: 110, hurricaneWindKm: 55 }
  },
  {
    _id: '6a9fb636e3261447d0177ee9',
    name: 'Cyclone Varun',
    source: 'IMD Arabian Sea Wing',
    externalId: 'ARB-02-2026',
    category: 'Category 1',
    currentLocation: { type: 'Point', coordinates: [70.20, 17.50] },
    windSpeed: 125,
    windSpeedUnit: 'km/h',
    pressure: 984,
    movementSpeed: 14,
    movementDirection: 'NW',
    pastTrack: [
      { time: new Date(Date.now() - 12 * 3600 * 1000), coordinates: [71.10, 16.80], windSpeed: 100, pressure: 992 }
    ],
    forecastTrack: [
      { time: new Date(Date.now() + 12 * 3600 * 1000), coordinates: [69.40, 18.20], windSpeed: 135, pressure: 980, category: 'Category 1', uncertaintyRadiusKm: 50 },
      { time: new Date(Date.now() + 24 * 3600 * 1000), coordinates: [68.50, 19.00], windSpeed: 145, pressure: 975, category: 'Category 1', uncertaintyRadiusKm: 75 }
    ],
    affectedRegions: ['Gujarat Coast', 'North Maharashtra'],
    status: 'ACTIVE',
    intensityRadius: { galeWindKm: 160, stormWindKm: 75, hurricaneWindKm: 35 }
  }
];

const mockRiskZones = [
  {
    _id: '6a9fb637e3261447d0177eea',
    name: 'Coastal Sector A - Marina & Royapuram',
    region: 'Chennai North & Central Coast',
    riskLevel: 'CRITICAL',
    riskScore: 94,
    center: { type: 'Point', coordinates: [80.2900, 13.0800] },
    radiusKm: 8,
    population: 182400,
    vulnerablePopulation: 42000,
    infrastructureExposure: { hospitals: 6, schools: 18, powerStations: 3, bridges: 4, ports: 2 },
    shelterCount: 6,
    shelterCapacityPercent: 78,
    roadAccessibilityPercent: 62,
    evacuationPriority: 'CRITICAL',
    priorityScore: 96,
    cycloneDistanceKm: 135,
    floodRiskLevel: 'VERY HIGH',
    stormSurgeHeightMeters: 3.8
  },
  {
    _id: '6a9fb637e3261447d0177eeb',
    name: 'Coastal Sector B - Ennore Port & Basin',
    region: 'Thiruvallur Coastline',
    riskLevel: 'CRITICAL',
    riskScore: 89,
    center: { type: 'Point', coordinates: [80.3200, 13.2300] },
    radiusKm: 12,
    population: 145000,
    vulnerablePopulation: 31000,
    infrastructureExposure: { hospitals: 3, schools: 14, powerStations: 5, bridges: 3, ports: 3 },
    shelterCount: 5,
    shelterCapacityPercent: 65,
    roadAccessibilityPercent: 58,
    evacuationPriority: 'CRITICAL',
    priorityScore: 92,
    cycloneDistanceKm: 120,
    floodRiskLevel: 'EXTREME',
    stormSurgeHeightMeters: 4.2
  },
  {
    _id: '6a9fb637e3261447d0177eec',
    name: 'Coastal Sector C - Kovalam & Mahabalipuram',
    region: 'Chengalpattu Coastal Belt',
    riskLevel: 'VERY_HIGH',
    riskScore: 78,
    center: { type: 'Point', coordinates: [80.2400, 12.7800] },
    radiusKm: 15,
    population: 92000,
    vulnerablePopulation: 18500,
    infrastructureExposure: { hospitals: 2, schools: 9, powerStations: 1, bridges: 2, ports: 1 },
    shelterCount: 4,
    shelterCapacityPercent: 52,
    roadAccessibilityPercent: 74,
    evacuationPriority: 'VERY_HIGH',
    priorityScore: 81,
    cycloneDistanceKm: 148,
    floodRiskLevel: 'HIGH',
    stormSurgeHeightMeters: 2.9
  },
  {
    _id: '6a9fb637e3261447d0177eed',
    name: 'Inland Sector D - Tambaram & Chengalpattu',
    region: 'South Suburban Basin',
    riskLevel: 'HIGH',
    riskScore: 56,
    center: { type: 'Point', coordinates: [80.1200, 12.9200] },
    radiusKm: 14,
    population: 240000,
    vulnerablePopulation: 38000,
    infrastructureExposure: { hospitals: 8, schools: 28, powerStations: 4, bridges: 6, ports: 0 },
    shelterCount: 8,
    shelterCapacityPercent: 44,
    roadAccessibilityPercent: 88,
    evacuationPriority: 'HIGH',
    priorityScore: 62,
    cycloneDistanceKm: 170,
    floodRiskLevel: 'MODERATE',
    stormSurgeHeightMeters: 0.5
  },
  {
    _id: '6a9fb637e3261447d0177eee',
    name: 'Coastal Delta E - Cuddalore Lowlands',
    region: 'Cuddalore Coastal District',
    riskLevel: 'VERY_HIGH',
    riskScore: 74,
    center: { type: 'Point', coordinates: [79.7600, 11.7500] },
    radiusKm: 18,
    population: 135000,
    vulnerablePopulation: 32000,
    infrastructureExposure: { hospitals: 4, schools: 16, powerStations: 2, bridges: 5, ports: 1 },
    shelterCount: 6,
    shelterCapacityPercent: 70,
    roadAccessibilityPercent: 68,
    evacuationPriority: 'VERY_HIGH',
    priorityScore: 76,
    cycloneDistanceKm: 190,
    floodRiskLevel: 'HIGH',
    stormSurgeHeightMeters: 2.2
  },
  {
    _id: '6a9fb637e3261447d0177eef',
    name: 'Urban Sector F - Guindy & Adyar Basin',
    region: 'Chennai Urban Central',
    riskLevel: 'HIGH',
    riskScore: 64,
    center: { type: 'Point', coordinates: [80.2100, 13.0100] },
    radiusKm: 10,
    population: 310000,
    vulnerablePopulation: 45000,
    infrastructureExposure: { hospitals: 12, schools: 35, powerStations: 6, bridges: 8, ports: 0 },
    shelterCount: 9,
    shelterCapacityPercent: 58,
    roadAccessibilityPercent: 82,
    evacuationPriority: 'HIGH',
    priorityScore: 68,
    cycloneDistanceKm: 155,
    floodRiskLevel: 'HIGH',
    stormSurgeHeightMeters: 1.2
  }
];

const mockShelters = [
  { _id: '6a9fb638e3261447d0177ef0', name: 'Anna Nagar Multi-Purpose Cyclone Shelter', code: 'SHL-CHN-01', location: { type: 'Point', coordinates: [80.2180, 13.0850] }, address: '2nd Avenue, Anna Nagar West', district: 'Chennai', totalCapacity: 2200, occupied: 1540, available: 660, occupancyPercent: 70, status: 'AVAILABLE', contactPerson: 'Dr. S. Ramachandran', contactPhone: '+91 94440 12345' },
  { _id: '6a9fb638e3261447d0177ef1', name: 'Royapuram Govt Higher Secondary Shelter', code: 'SHL-CHN-02', location: { type: 'Point', coordinates: [80.2920, 13.1120] }, address: 'Kalmandapam Road, Royapuram', district: 'Chennai', totalCapacity: 1800, occupied: 1580, available: 220, occupancyPercent: 88, status: 'FILLING', contactPerson: 'V. Jayaraman', contactPhone: '+91 94440 23456' },
  { _id: '6a9fb638e3261447d0177ef2', name: 'Marina Coastal Community Safe Center', code: 'SHL-CHN-03', location: { type: 'Point', coordinates: [80.2800, 13.0600] }, address: 'Santhome High Road, Mylapore', district: 'Chennai', totalCapacity: 1500, occupied: 1420, available: 80, occupancyPercent: 95, status: 'FILLING', contactPerson: 'Rev. Fr. Augustine', contactPhone: '+91 94440 34567' },
  { _id: '6a9fb638e3261447d0177ef3', name: 'Tiruvottiyur Municipal Cyclone Refuge', code: 'SHL-THI-01', location: { type: 'Point', coordinates: [80.3010, 13.1650] }, address: 'High Road, Tiruvottiyur', district: 'Thiruvallur', totalCapacity: 2500, occupied: 1980, available: 520, occupancyPercent: 79, status: 'AVAILABLE', contactPerson: 'M. Selvamani', contactPhone: '+91 94440 45678' },
  { _id: '6a9fb638e3261447d0177ef4', name: 'Ennore Port Community Relief Base', code: 'SHL-THI-02', location: { type: 'Point', coordinates: [80.3150, 13.2100] }, address: 'Expressway Junction, Ennore', district: 'Thiruvallur', totalCapacity: 1600, occupied: 1490, available: 110, occupancyPercent: 93, status: 'FILLING', contactPerson: 'K. Balaji', contactPhone: '+91 94440 56789' },
  { _id: '6a9fb638e3261447d0177ef5', name: 'Guindy Race Course Emergency Camp', code: 'SHL-CHN-04', location: { type: 'Point', coordinates: [80.2100, 13.0080] }, address: 'Race View Colony, Guindy', district: 'Chennai', totalCapacity: 3500, occupied: 1920, available: 1580, occupancyPercent: 55, status: 'AVAILABLE', contactPerson: 'Col. N. Swaminathan', contactPhone: '+91 94440 67890' },
  { _id: '6a9fb638e3261447d0177ef6', name: 'Tambaram Indoor Sports Arena Shelter', code: 'SHL-CHE-01', location: { type: 'Point', coordinates: [80.1250, 12.9250] }, address: 'GST Road, West Tambaram', district: 'Chengalpattu', totalCapacity: 2800, occupied: 1250, available: 1550, occupancyPercent: 45, status: 'AVAILABLE', contactPerson: 'A. Joseph', contactPhone: '+91 94440 78901' },
  { _id: '6a9fb638e3261447d0177ef7', name: 'Kovalam Coastal Defense Shelter', code: 'SHL-CHE-02', location: { type: 'Point', coordinates: [80.2500, 12.7950] }, address: 'ECR, Kovalam', district: 'Chengalpattu', totalCapacity: 1400, occupied: 980, available: 420, occupancyPercent: 70, status: 'AVAILABLE', contactPerson: 'D. Elangovan', contactPhone: '+91 94440 89012' }
];

const mockTeams = [
  { _id: '6a9fb639e3261447d0177ef8', teamId: 'TEAM-NDRF-01', name: 'NDRF Special Search & Rescue Unit Alpha', type: 'Search & Rescue', membersCount: 14, leaderName: 'Inspector Amit Deshmukh', contactPhone: '+91 98401 10010', currentLocation: { type: 'Point', coordinates: [80.2800, 13.0800] }, status: 'AVAILABLE', vehicle: { type: 'Amphibious All-Terrain Rescue Craft', plateNumber: 'NDRF-TN-01', capacity: 12 }, equipment: ['Zodiac Boats', 'Hydraulic Spreaders'] },
  { _id: '6a9fb639e3261447d0177ef9', teamId: 'TEAM-NDRF-02', name: 'NDRF Swift Flood Response Bravo', type: 'Search & Rescue', membersCount: 12, leaderName: 'Sub-Inspector Mohan Rao', contactPhone: '+91 98401 20020', currentLocation: { type: 'Point', coordinates: [80.2500, 13.1200] }, status: 'AVAILABLE', vehicle: { type: 'High-Clearance 4x4 Rescue Truck', plateNumber: 'NDRF-TN-02', capacity: 8 }, equipment: ['Diving Gear', 'Outboard Motors'] },
  { _id: '6a9fb639e3261447d0177efa', teamId: 'TEAM-MED-01', name: 'State Trauma & Triage Mobile Unit 1', type: 'Medical Response', membersCount: 8, leaderName: 'Dr. Radhika Menon', contactPhone: '+91 98401 30030', currentLocation: { type: 'Point', coordinates: [80.2400, 13.0500] }, status: 'AVAILABLE', vehicle: { type: 'Mobile ICU Ambulance', plateNumber: 'TN-01-MD-4411', capacity: 4 }, equipment: ['Portable Ventilators', 'Defibrillators'] },
  { _id: '6a9fb639e3261447d0177efb', teamId: 'TEAM-FIRE-01', name: 'TN Fire & Rescue Hazardous Service 4', type: 'Fire & Rescue', membersCount: 10, leaderName: 'Station Officer S. Murugesan', contactPhone: '+91 98401 50050', currentLocation: { type: 'Point', coordinates: [80.2700, 13.1000] }, status: 'AVAILABLE', vehicle: { type: 'Heavy Rescue Tender', plateNumber: 'TN-01-FS-7711', capacity: 6 }, equipment: ['De-watering Pumps', 'Tree Cutters'] }
];

const mockIncidents = [
  {
    _id: '6a9fb63ae3261447d0177efc',
    incidentId: 'INC-201',
    title: 'Trapped Civilians: 18 Residents Stranded on Terrace in Vyasarpadi',
    emergencyType: 'Trapped Civilians',
    location: { type: 'Point', coordinates: [80.2550, 13.1150] },
    address: 'B-Block, Kalyanapuram Lowlands, Vyasarpadi',
    district: 'Chennai',
    severity: 'CRITICAL',
    priorityScore: 98,
    status: 'ASSIGNED',
    reporterName: 'Sathish Kumar',
    victimCount: 18,
    description: 'Runoff entered ground floor homes. 18 people stranded on roof.',
    assignedTeam: mockTeams[0]
  },
  {
    _id: '6a9fb63ae3261447d0177efd',
    incidentId: 'INC-202',
    title: 'Medical Crisis: Backup Generator Failure at Coastal Health Post',
    emergencyType: 'Medical Emergency',
    location: { type: 'Point', coordinates: [80.2920, 13.0950] },
    address: 'Govt Urban Health Center, Kasimedu Harbor',
    district: 'Chennai',
    severity: 'CRITICAL',
    priorityScore: 94,
    status: 'ASSIGNED',
    reporterName: 'Dr. Anita Selvaraj',
    victimCount: 8,
    description: 'Generator fuel contaminated by seawater. 8 oxygen patients in need of transport.',
    assignedTeam: mockTeams[2]
  },
  {
    _id: '6a9fb63ae3261447d0177efe',
    incidentId: 'INC-203',
    title: 'Road Blockage: 4 Century-Old Banyan Trees Blocked ECR Route',
    emergencyType: 'Road Blockage / Debris',
    location: { type: 'Point', coordinates: [80.2450, 12.8200] },
    address: 'Near Uthandi Tollgate, East Coast Road',
    district: 'Chengalpattu',
    severity: 'HIGH',
    priorityScore: 78,
    status: 'ASSIGNED',
    reporterName: 'Traffic Inspector Ramesh',
    victimCount: 0,
    description: 'Trees uprooted across both lanes of ECR.',
    assignedTeam: mockTeams[3]
  }
];

const mockEvacuations = [
  {
    _id: '6a9fb63be3261447d0177eff',
    title: 'Operation Suraksha: Coastal Sector A Evacuation Plan',
    zone: mockRiskZones[0],
    zoneName: mockRiskZones[0].name,
    targetShelters: [mockShelters[0], mockShelters[1]],
    populationRequiringEvacuation: 120000,
    evacuatedCount: 82000,
    priorityScore: 95,
    status: 'ACTIVE',
    routes: [
      {
        name: 'Primary Evac Route 1 - Poonamallee High Road Inland',
        startPoint: [80.2900, 13.0800],
        endPoint: [80.2180, 13.0850],
        waypoints: [[80.2900, 13.0800], [80.2650, 13.0810], [80.2400, 13.0830], [80.2180, 13.0850]],
        distanceKm: 8.5,
        estimatedDurationMin: 22,
        roadStatus: 'CLEAR',
        riskLevel: 'LOW'
      }
    ],
    assignedTeams: [mockTeams[0]]
  }
];

const mockKpis = {
  activeDisasters: { value: 2, delta: '+1 today' },
  activeCyclones: { value: 2, status: 'LIVE' },
  highRiskZones: { value: 6, delta: '+4' },
  peopleAtRisk: { value: '1.2M', delta: '+8.2%' },
  evacuationProgress: { value: '68.4%' },
  shelterCapacity: { value: '74%' },
  criticalIncidents: { value: 3, delta: '-12%' },
  reliefStockStatus: { value: '86%', status: 'Available' }
};

module.exports = {
  mockAgencies,
  mockCyclones,
  mockRiskZones,
  mockShelters,
  mockTeams,
  mockIncidents,
  mockEvacuations,
  mockKpis
};
