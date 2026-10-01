require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Agency = require('../models/Agency');
const Disaster = require('../models/Disaster');
const Cyclone = require('../models/Cyclone');
const RiskZone = require('../models/RiskZone');
const Shelter = require('../models/Shelter');
const Incident = require('../models/Incident');
const ResponseTeam = require('../models/ResponseTeam');
const Inventory = require('../models/Inventory');
const ReliefDistribution = require('../models/ReliefDistribution');
const EmergencyAlert = require('../models/EmergencyAlert');
const EvacuationPlan = require('../models/EvacuationPlan');
const AssistanceRequest = require('../models/AssistanceRequest');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Purging existing demo records...');
    await Promise.all([
      User.deleteMany({}),
      Agency.deleteMany({}),
      Disaster.deleteMany({}),
      Cyclone.deleteMany({}),
      RiskZone.deleteMany({}),
      Shelter.deleteMany({}),
      Incident.deleteMany({}),
      ResponseTeam.deleteMany({}),
      Inventory.deleteMany({}),
      ReliefDistribution.deleteMany({}),
      EmergencyAlert.deleteMany({}),
      EvacuationPlan.deleteMany({}),
      AssistanceRequest.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('[Seed] Creating Agencies & Users...');
    const agencies = await Agency.create([
      { name: 'National Disaster Response Force (NDRF)', code: 'NDRF', type: 'RESCUE', contactPhone: '+91 11 2436 3260', coverageRegions: ['Tamil Nadu', 'Andhra Pradesh', 'Odisha'] },
      { name: 'India Meteorological Department (IMD)', code: 'IMD', type: 'GOVERNMENT', contactPhone: '+91 44 2256 1234', coverageRegions: ['Bay of Bengal', 'Arabian Sea'] },
      { name: 'Tamil Nadu State Disaster Management Authority (TNSDMA)', code: 'TNSDMA', type: 'GOVERNMENT', contactPhone: '+91 44 2853 8550', coverageRegions: ['All 38 Districts of Tamil Nadu'] },
      { name: 'Indian Coast Guard - Eastern Region', code: 'ICG', type: 'MILITARY', contactPhone: '+91 44 2346 0405', coverageRegions: ['Coromandel Coast'] },
      { name: 'Indian Red Cross Society', code: 'IRCS', type: 'NGO', contactPhone: '+91 44 2819 1234', coverageRegions: ['Coastal Tamil Nadu'] }
    ]);

    const ndrf = agencies[0];
    const tnsdma = agencies[2];

    const users = await User.create([
      { name: 'Chief Commander Rajesh Varma', email: 'admin@cycloneops.gov', password: 'password123', role: 'admin', agency: tnsdma._id, phone: '+91 98400 11001', location: { type: 'Point', coordinates: [80.2707, 13.0827] } },
      { name: 'Senior Officer Ananya Iyer', email: 'officer@cycloneops.gov', password: 'password123', role: 'officer', agency: tnsdma._id, phone: '+91 98400 22002', location: { type: 'Point', coordinates: [80.2750, 13.0850] } },
      { name: 'Commander Vikram Rathore (NDRF)', email: 'responder@cycloneops.gov', password: 'password123', role: 'responder', agency: ndrf._id, phone: '+91 98400 33003', location: { type: 'Point', coordinates: [80.2600, 13.0700] } },
      { name: 'Logistics Head Meera Krishnan', email: 'coordinator@cycloneops.gov', password: 'password123', role: 'coordinator', agency: tnsdma._id, phone: '+91 98400 44004', location: { type: 'Point', coordinates: [80.2100, 13.0100] } },
      { name: 'Karthik Subramanian (Volunteer)', email: 'volunteer@cycloneops.gov', password: 'password123', role: 'volunteer', phone: '+91 98400 55005', location: { type: 'Point', coordinates: [80.2500, 13.0400] } },
      { name: 'Suresh Kumar (Citizen)', email: 'citizen@cycloneops.gov', password: 'password123', role: 'citizen', phone: '+91 98400 66006', location: { type: 'Point', coordinates: [80.2780, 13.0500] } }
    ]);

    console.log('[Seed] Creating Active Cyclones & Disasters...');
    const cyclones = await Cyclone.create([
      {
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
    ]);

    await Disaster.create([
      {
        externalId: 'DIS-2026-001',
        source: 'IMD',
        type: 'CYCLONE',
        title: 'Very Severe Cyclonic Storm AMARA over Southwest Bay of Bengal',
        description: 'Sustained gale winds of 175 km/h moving towards North Tamil Nadu Coast.',
        severity: 'CRITICAL',
        alertLevel: 'RED ALERT',
        riskScore: 92,
        location: { type: 'Point', coordinates: [81.65, 12.75] },
        country: 'India',
        region: 'Bay of Bengal / Tamil Nadu Coast',
        magnitude: 175,
        magnitudeUnit: 'km/h',
        status: 'ACTIVE',
        affectedAreas: ['Chennai', 'Thiruvallur', 'Kancheepuram', 'Chengalpattu']
      },
      {
        externalId: 'DIS-2026-002',
        source: 'CWC',
        type: 'FLOOD',
        title: 'Severe Inundation & Flash Flood Alert in Adyar & Cooum Basins',
        description: 'Precipitation exceeding 240mm causing storm surge flooding.',
        severity: 'RED',
        alertLevel: 'WARNING',
        riskScore: 84,
        location: { type: 'Point', coordinates: [80.2500, 13.0050] },
        country: 'India',
        region: 'Chennai Metropolitan Basin',
        status: 'ESCALATING',
        affectedAreas: ['Saidapet', 'Velachery', 'Kotturpuram']
      }
    ]);

    console.log('[Seed] Creating 6 Detailed Risk Zones...');
    const riskZones = await RiskZone.create([
      {
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
    ]);

    console.log('[Seed] Creating Emergency Shelters...');
    const shelters = await Shelter.create([
      { name: 'Anna Nagar Multi-Purpose Cyclone Shelter', code: 'SHL-CHN-01', location: { type: 'Point', coordinates: [80.2180, 13.0850] }, address: '2nd Avenue, Anna Nagar West', district: 'Chennai', totalCapacity: 2200, occupied: 1540, contactPerson: 'Dr. S. Ramachandran', contactPhone: '+91 94440 12345' },
      { name: 'Royapuram Govt Higher Secondary Shelter', code: 'SHL-CHN-02', location: { type: 'Point', coordinates: [80.2920, 13.1120] }, address: 'Kalmandapam Road, Royapuram', district: 'Chennai', totalCapacity: 1800, occupied: 1580, contactPerson: 'V. Jayaraman', contactPhone: '+91 94440 23456' },
      { name: 'Marina Coastal Community Safe Center', code: 'SHL-CHN-03', location: { type: 'Point', coordinates: [80.2800, 13.0600] }, address: 'Santhome High Road, Mylapore', district: 'Chennai', totalCapacity: 1500, occupied: 1420, contactPerson: 'Rev. Fr. Augustine', contactPhone: '+91 94440 34567' },
      { name: 'Tiruvottiyur Municipal Cyclone Refuge', code: 'SHL-THI-01', location: { type: 'Point', coordinates: [80.3010, 13.1650] }, address: 'High Road, Tiruvottiyur', district: 'Thiruvallur', totalCapacity: 2500, occupied: 1980, contactPerson: 'M. Selvamani', contactPhone: '+91 94440 45678' },
      { name: 'Ennore Port Community Relief Base', code: 'SHL-THI-02', location: { type: 'Point', coordinates: [80.3150, 13.2100] }, address: 'Expressway Junction, Ennore', district: 'Thiruvallur', totalCapacity: 1600, occupied: 1490, contactPerson: 'K. Balaji', contactPhone: '+91 94440 56789' },
      { name: 'Guindy Race Course Emergency Camp', code: 'SHL-CHN-04', location: { type: 'Point', coordinates: [80.2100, 13.0080] }, address: 'Race View Colony, Guindy', district: 'Chennai', totalCapacity: 3500, occupied: 1920, contactPerson: 'Col. N. Swaminathan', contactPhone: '+91 94440 67890' },
      { name: 'Tambaram Indoor Sports Arena Shelter', code: 'SHL-CHE-01', location: { type: 'Point', coordinates: [80.1250, 12.9250] }, address: 'GST Road, West Tambaram', district: 'Chengalpattu', totalCapacity: 2800, occupied: 1250, contactPerson: 'A. Joseph', contactPhone: '+91 94440 78901' },
      { name: 'Kovalam Coastal Defense Shelter', code: 'SHL-CHE-02', location: { type: 'Point', coordinates: [80.2500, 12.7950] }, address: 'ECR, Kovalam', district: 'Chengalpattu', totalCapacity: 1400, occupied: 980, contactPerson: 'D. Elangovan', contactPhone: '+91 94440 89012' },
      { name: 'Mahabalipuram Heritage Hall Shelter', code: 'SHL-CHE-03', location: { type: 'Point', coordinates: [80.1900, 12.6200] }, address: 'Shore Temple Bypass', district: 'Chengalpattu', totalCapacity: 1200, occupied: 650, contactPerson: 'R. Baskaran', contactPhone: '+91 94440 90123' },
      { name: 'Cuddalore Port Cyclone Relief Center', code: 'SHL-CUD-01', location: { type: 'Point', coordinates: [79.7700, 11.7450] }, address: 'Sub-Jail Road, Cuddalore Old Town', district: 'Cuddalore', totalCapacity: 2400, occupied: 1890, contactPerson: 'T. Murugan', contactPhone: '+91 94441 01234' },
      { name: 'Chidambaram University Cyclone Refuge', code: 'SHL-CUD-02', location: { type: 'Point', coordinates: [79.6900, 11.3900] }, address: 'Annamalai Nagar, Chidambaram', district: 'Cuddalore', totalCapacity: 3000, occupied: 1620, contactPerson: 'Dr. G. Sivakumar', contactPhone: '+91 94441 12345' },
      { name: 'Velachery Government Higher Secondary Shelter', code: 'SHL-CHN-05', location: { type: 'Point', coordinates: [80.2210, 12.9810] }, address: 'Bypass Road, Velachery', district: 'Chennai', totalCapacity: 1500, occupied: 1100, contactPerson: 'P. Anand', contactPhone: '+91 94441 23456' },
      { name: 'Tondiarpet Community Hall Relief Base', code: 'SHL-CHN-06', location: { type: 'Point', coordinates: [80.2850, 13.1250] }, address: 'TH Road, Tondiarpet', district: 'Chennai', totalCapacity: 1600, occupied: 1350, contactPerson: 'M. Kasinathan', contactPhone: '+91 94441 34567' },
      { name: 'Madhavaram Botanical Garden Safe Camp', code: 'SHL-THI-03', location: { type: 'Point', coordinates: [80.2300, 13.1500] }, address: 'GNT Road, Madhavaram', district: 'Thiruvallur', totalCapacity: 2600, occupied: 1400, contactPerson: 'C. Venkatesh', contactPhone: '+91 94441 56789' },
      { name: 'Avadi Ordnance Factory Auditorium Shelter', code: 'SHL-THI-04', location: { type: 'Point', coordinates: [80.1000, 13.1200] }, address: 'HV Road, Avadi', district: 'Thiruvallur', totalCapacity: 2500, occupied: 950, contactPerson: 'Maj. S. Rawat', contactPhone: '+91 94441 67890' },
      { name: 'Pallavaram Cantonment School Shelter', code: 'SHL-CHE-04', location: { type: 'Point', coordinates: [80.1450, 12.9680] }, address: 'Cantonment Board, Pallavaram', district: 'Chengalpattu', totalCapacity: 1700, occupied: 890, contactPerson: 'B. Srinivasan', contactPhone: '+91 94441 78901' },
      { name: 'Ponneri Taluk Disaster Refuge Complex', code: 'SHL-THI-05', location: { type: 'Point', coordinates: [80.1950, 13.3250] }, address: 'Court Road, Ponneri', district: 'Thiruvallur', totalCapacity: 2000, occupied: 1120, contactPerson: 'K. Parthiban', contactPhone: '+91 94441 89012' }
    ]);

    console.log('[Seed] Creating 10 Response Teams...');
    const responseTeams = await ResponseTeam.create([
      { teamId: 'TEAM-NDRF-01', name: 'NDRF Special Search & Rescue Unit Alpha', type: 'Search & Rescue', agency: ndrf._id, membersCount: 14, leaderName: 'Inspector Amit Deshmukh', contactPhone: '+91 98401 10010', currentLocation: { type: 'Point', coordinates: [80.2800, 13.0800] }, status: 'AVAILABLE', vehicle: { type: 'Amphibious All-Terrain Rescue Craft', plateNumber: 'NDRF-TN-01', capacity: 12 }, equipment: ['Zodiac Boats', 'Hydraulic Spreaders', 'Thermal Search Drones'] },
      { teamId: 'TEAM-NDRF-02', name: 'NDRF Swift Flood Response Bravo', type: 'Search & Rescue', agency: ndrf._id, membersCount: 12, leaderName: 'Sub-Inspector Mohan Rao', contactPhone: '+91 98401 20020', currentLocation: { type: 'Point', coordinates: [80.2500, 13.1200] }, status: 'AVAILABLE', vehicle: { type: 'High-Clearance 4x4 Rescue Truck', plateNumber: 'NDRF-TN-02', capacity: 8 }, equipment: ['Diving Gear', 'Outboard Motors', 'Rope Rescue Kits'] },
      { teamId: 'TEAM-MED-01', name: 'State Trauma & Triage Mobile Unit 1', type: 'Medical Response', agency: tnsdma._id, membersCount: 8, leaderName: 'Dr. Radhika Menon', contactPhone: '+91 98401 30030', currentLocation: { type: 'Point', coordinates: [80.2400, 13.0500] }, status: 'AVAILABLE', vehicle: { type: 'Mobile ICU Ambulance', plateNumber: 'TN-01-MD-4411', capacity: 4 }, equipment: ['Portable Ventilators', 'Defibrillators', 'Oxygen Concentrators'] },
      { teamId: 'TEAM-MED-02', name: 'State Trauma & Triage Mobile Unit 2', type: 'Medical Response', agency: tnsdma._id, membersCount: 8, leaderName: 'Dr. Harish Sundaram', contactPhone: '+91 98401 40040', currentLocation: { type: 'Point', coordinates: [80.2100, 13.0100] }, status: 'AVAILABLE', vehicle: { type: 'Critical Care Transport Ambulance', plateNumber: 'TN-01-MD-4412', capacity: 4 }, equipment: ['Blood Transfusion Units', 'Trauma Kits'] },
      { teamId: 'TEAM-FIRE-01', name: 'TN Fire & Rescue Hazardous Service 4', type: 'Fire & Rescue', agency: tnsdma._id, membersCount: 10, leaderName: 'Station Officer S. Murugesan', contactPhone: '+91 98401 50050', currentLocation: { type: 'Point', coordinates: [80.2700, 13.1000] }, status: 'AVAILABLE', vehicle: { type: 'Heavy Rescue Tender & Water Bowser', plateNumber: 'TN-01-FS-7711', capacity: 6 }, equipment: ['De-watering Pumps', 'Tree Cutters', 'Gas Detectors'] },
      { teamId: 'TEAM-ENG-01', name: 'State Highway Debris Clearance Unit 1', type: 'Engineering & Debris', agency: tnsdma._id, membersCount: 12, leaderName: 'Eng. K. Natarajan', contactPhone: '+91 98401 60060', currentLocation: { type: 'Point', coordinates: [80.2200, 12.9500] }, status: 'AVAILABLE', vehicle: { type: 'Bulldozer & Winch Carrier', plateNumber: 'TN-01-HW-8822', capacity: 4 }, equipment: ['JCB Excavators', 'Chainsaws', 'Floodlights'] },
      { teamId: 'TEAM-POL-01', name: 'Coastal Tactical Enforcement & Evac Unit', type: 'Law Enforcement', agency: tnsdma._id, membersCount: 16, leaderName: 'Inspector P. Thirunavukarasu', contactPhone: '+91 98401 70070', currentLocation: { type: 'Point', coordinates: [80.2850, 13.0400] }, status: 'AVAILABLE', vehicle: { type: 'Evacuation Troop Carrier', plateNumber: 'TN-01-PL-1001', capacity: 16 }, equipment: ['Loudspeaker Arrays', 'Barriers', 'Night Vision'] },
      { teamId: 'TEAM-LOG-01', name: 'Central Logistics Supply Convoy Alpha', type: 'Logistics & Supply', agency: tnsdma._id, membersCount: 6, leaderName: 'Supply Officer G. Chandrasekhar', contactPhone: '+91 98401 80080', currentLocation: { type: 'Point', coordinates: [80.1900, 13.0400] }, status: 'AVAILABLE', vehicle: { type: '16-Ton Heavy Transporter', plateNumber: 'TN-01-LG-3301', capacity: 4 }, equipment: ['Pallet Jacks', 'Water Tankers', 'Tarpaulins'] },
      { teamId: 'TEAM-COM-01', name: 'Emergency Wireless & Satellite Comms Unit', type: 'Communication & Radio', agency: tnsdma._id, membersCount: 5, leaderName: 'Tech Lead M. Preethi', contactPhone: '+91 98401 90090', currentLocation: { type: 'Point', coordinates: [80.2600, 13.0800] }, status: 'AVAILABLE', vehicle: { type: 'Mobile Comms Van', plateNumber: 'TN-01-CM-0099', capacity: 4 }, equipment: ['Inmarsat Terminals', 'HAM Radio Repeaters', 'Starlink'] },
      { teamId: 'TEAM-NDRF-03', name: 'NDRF Coastal Search & Rescue Charlie', type: 'Search & Rescue', agency: ndrf._id, membersCount: 12, leaderName: 'Inspector Sunil Yadav', contactPhone: '+91 98401 10033', currentLocation: { type: 'Point', coordinates: [79.7700, 11.7500] }, status: 'AVAILABLE', vehicle: { type: 'Amphibious Carrier', plateNumber: 'NDRF-TN-03', capacity: 10 }, equipment: ['Deep Diver Gear', 'Sonar Buoys', 'Helicopter Harnesses'] }
    ]);

    console.log('[Seed] Creating Incidents, Evac Plans, Inventories, Distributions, Alerts...');
    await Incident.create([
      {
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
        assignedTeam: responseTeams[0]._id,
        assignedAt: new Date()
      },
      {
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
        assignedTeam: responseTeams[2]._id,
        assignedAt: new Date()
      },
      {
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
        assignedTeam: responseTeams[5]._id,
        assignedAt: new Date()
      },
      {
        incidentId: 'INC-204',
        title: 'Severe Flooding: Breach in Buckingham Canal Bund',
        emergencyType: 'Severe Flooding',
        location: { type: 'Point', coordinates: [80.2880, 13.1180] },
        address: 'Canal Bank Road, Royapuram',
        district: 'Chennai',
        severity: 'CRITICAL',
        priorityScore: 92,
        status: 'IN_PROGRESS',
        reporterName: 'PWD Sub-Divisional Officer',
        victimCount: 35,
        description: 'Bund breach causing flood ingress into 300 tenements.',
        assignedTeam: responseTeams[1]._id
      }
    ]);

    await EvacuationPlan.create([
      {
        title: 'Operation Suraksha: Coastal Sector A Evacuation Plan',
        zone: riskZones[0]._id,
        zoneName: riskZones[0].name,
        targetShelters: [shelters[0]._id, shelters[1]._id, shelters[5]._id],
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
        assignedTeams: [responseTeams[0]._id, responseTeams[6]._id]
      },
      {
        title: 'Operation Rakshak: Ennore Port & Basin Evacuation Plan',
        zone: riskZones[1]._id,
        zoneName: riskZones[1].name,
        targetShelters: [shelters[3]._id, shelters[14]._id],
        populationRequiringEvacuation: 95000,
        evacuatedCount: 61000,
        priorityScore: 91,
        status: 'ACTIVE',
        routes: [
          {
            name: 'Route 3 - Manali Expressway to Madhavaram Hub',
            startPoint: [80.3200, 13.2300],
            endPoint: [80.2300, 13.1500],
            waypoints: [[80.3200, 13.2300], [80.2850, 13.2000], [80.2500, 13.1700], [80.2300, 13.1500]],
            distanceKm: 14.2,
            estimatedDurationMin: 34,
            roadStatus: 'CLEAR',
            riskLevel: 'LOW'
          }
        ],
        assignedTeams: [responseTeams[1]._id]
      }
    ]);

    const inventories = await Inventory.create([
      { warehouseName: 'State Central Logistics Hub', warehouseLocation: { type: 'Point', coordinates: [80.1800, 13.0200] }, district: 'Chennai Central', itemType: 'Drinking Water', totalStock: 85000, availableStock: 72000, reservedStock: 13000, unit: 'Liters', minThreshold: 15000, status: 'NORMAL' },
      { warehouseName: 'State Central Logistics Hub', warehouseLocation: { type: 'Point', coordinates: [80.1800, 13.0200] }, district: 'Chennai Central', itemType: 'Food Kits', totalStock: 32000, availableStock: 26500, reservedStock: 5500, unit: 'Kits', minThreshold: 6000, status: 'NORMAL' },
      { warehouseName: 'State Central Logistics Hub', warehouseLocation: { type: 'Point', coordinates: [80.1800, 13.0200] }, district: 'Chennai Central', itemType: 'Medical Kits', totalStock: 8400, availableStock: 6800, reservedStock: 1600, unit: 'Kits', minThreshold: 1500, status: 'NORMAL' },
      { warehouseName: 'State Central Logistics Hub', warehouseLocation: { type: 'Point', coordinates: [80.1800, 13.0200] }, district: 'Chennai Central', itemType: 'Blankets', totalStock: 24000, availableStock: 19800, reservedStock: 4200, unit: 'Units', minThreshold: 4000, status: 'NORMAL' },
      { warehouseName: 'Chennai Port Trust Forward Warehouse', warehouseLocation: { type: 'Point', coordinates: [80.2950, 13.0900] }, district: 'Chennai North', itemType: 'Drinking Water', totalStock: 18000, availableStock: 4200, reservedStock: 13800, unit: 'Liters', minThreshold: 8000, status: 'LOW' },
      { warehouseName: 'Chennai Port Trust Forward Warehouse', warehouseLocation: { type: 'Point', coordinates: [80.2950, 13.0900] }, district: 'Chennai North', itemType: 'Emergency Tents', totalStock: 3500, availableStock: 2800, reservedStock: 700, unit: 'Units', minThreshold: 600, status: 'NORMAL' },
      { warehouseName: 'Tambaram South Staging Depot', warehouseLocation: { type: 'Point', coordinates: [80.1100, 12.9100] }, district: 'Chengalpattu', itemType: 'Fuel (Diesel/Petrol)', totalStock: 45000, availableStock: 38000, reservedStock: 7000, unit: 'Liters', minThreshold: 10000, status: 'NORMAL' },
      { warehouseName: 'Tambaram South Staging Depot', warehouseLocation: { type: 'Point', coordinates: [80.1100, 12.9100] }, district: 'Chengalpattu', itemType: 'Satellite Radios', totalStock: 150, availableStock: 110, reservedStock: 40, unit: 'Units', minThreshold: 30, status: 'NORMAL' }
    ]);

    await ReliefDistribution.create([
      { distributionId: 'DISP-1001', itemType: 'Drinking Water', quantity: 15000, unit: 'Liters', originWarehouse: inventories[0]._id, warehouseName: 'State Central Logistics Hub', destinationShelter: shelters[0]._id, destinationName: 'Anna Nagar Cyclone Shelter', priority: 'CRITICAL', assignedTeam: responseTeams[7]._id, deliveryStatus: 'IN_TRANSIT', dispatchedAt: new Date(Date.now() - 45 * 60 * 1000), notes: 'Police escorted convoy.' },
      { distributionId: 'DISP-1002', itemType: 'Food Kits', quantity: 5000, unit: 'Kits', originWarehouse: inventories[1]._id, warehouseName: 'State Central Logistics Hub', destinationShelter: shelters[1]._id, destinationName: 'Royapuram Govt Shelter', priority: 'CRITICAL', assignedTeam: responseTeams[7]._id, deliveryStatus: 'DELIVERED', dispatchedAt: new Date(Date.now() - 120 * 60 * 1000), deliveredAt: new Date(Date.now() - 30 * 60 * 1000), notes: 'Delivered and verified.' }
    ]);

    await EmergencyAlert.create([
      { alertId: 'ALT-101', title: 'RED ALERT: MANDATORY EVACUATION FOR COASTAL WARDS (0-5 KM)', type: 'EVACUATION ORDER', severity: 'CRITICAL', description: 'Cyclone AMARA landfall in 18 hours. Immediate evacuation ordered for temporary and low-lying dwellings.', affectedRegions: ['Chennai Coastal Zone', 'Thiruvallur', 'Chengalpattu'], issuerName: 'State Disaster Management Authority', targetAudience: 'ALL', broadcastChannels: ['SMS', 'APP', 'TV', 'RADIO', 'SIREN'], active: true },
      { alertId: 'ALT-102', title: 'STORM SURGE WARNING: TIDAL WAVES 3.5 TO 4.5 METERS', type: 'CYCLONE WARNING', severity: 'CRITICAL', description: 'Total suspension of fishing operations, port activities, and coastal traffic.', affectedRegions: ['Coromandel Coast', 'Palk Bay'], issuerName: 'IMD', targetAudience: 'RESIDENTS', broadcastChannels: ['SMS', 'APP', 'RADIO'], active: true },
      { alertId: 'ALT-103', title: 'SHELTER NOTICE: ANNA NAGAR & ROYAPURAM SHELTERS FILLING RAPIDLY', type: 'SHELTER UPDATE', severity: 'WARNING', description: 'North Chennai shelters at 80% capacity. Convoys redirected to Guindy and Madhavaram.', affectedRegions: ['Chennai Urban'], issuerName: 'EOC Logistics Command', targetAudience: 'ALL', active: true }
    ]);

    await AuditLog.create([
      { userName: 'Chief Commander Rajesh Varma', userRole: 'admin', action: 'SYSTEM_INITIALIZATION', module: 'EOC_CORE', details: { status: 'FULL_OPERATIONAL_READINESS' } },
      { userName: 'Senior Officer Ananya Iyer', userRole: 'officer', action: 'EVACUATION_PLAN_ACTIVATED', module: 'EVACUATION', details: { plan: 'Operation Suraksha' } },
      { userName: 'Senior Officer Ananya Iyer', userRole: 'officer', action: 'EMERGENCY_ALERT_BROADCAST', module: 'ALERT_CENTER', details: { alertId: 'ALT-101' } }
    ]);

    console.log('========================================================');
    console.log(' SEED DATA GENERATION COMPLETE!');
    console.log(' - 6 Users (1 per role, pass: password123)');
    console.log(' - 5 Agencies');
    console.log(' - 2 Cyclones (Amara Cat-3/4 & Varun Cat-1)');
    console.log(' - 6 Risk Zones');
    console.log(' - 18 Shelters');
    console.log(' - 10 Response Teams');
    console.log(' - 4 Incidents');
    console.log(' - 2 Evacuation Plans with GPS Routes');
    console.log(' - 8 Warehouses & Inventory Items');
    console.log(' - 2 Relief Distributions');
    console.log(' - 3 Alerts');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
