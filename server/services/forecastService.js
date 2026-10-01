const Cyclone = require('../models/Cyclone');
const RiskZone = require('../models/RiskZone');
const Shelter = require('../models/Shelter');

const generateForecasts = async () => {
  const activeCyclone = await Cyclone.findOne({ status: 'ACTIVE' });
  const currentWind = activeCyclone ? activeCyclone.windSpeed : 145;
  const currentPressure = activeCyclone ? activeCyclone.pressure : 965;

  const totalCapacity = (await Shelter.aggregate([{ '$group': { _id: null, total: { '$sum': '$totalCapacity' }, occupied: { '$sum': '$occupied' } } }]))[0] || { total: 15000, occupied: 6500 };

  const timeframes = [
    {
      period: '24 Hours',
      windSpeedKmH: Math.round(currentWind * 1.12),
      pressureHpa: Math.round(currentPressure - 8),
      category: currentWind > 175 ? 'Category 4' : 'Category 3',
      evacuationDemandEst: 145000,
      shelterOccupancyEstPercent: 68,
      waterDemandLiters: 435000,
      foodKitsDemand: 72500,
      confidence: 'HIGH'
    },
    {
      period: '48 Hours',
      windSpeedKmH: Math.round(currentWind * 1.25),
      pressureHpa: Math.round(currentPressure - 18),
      category: 'Category 4 (Landfall Imminent)',
      evacuationDemandEst: 310000,
      shelterOccupancyEstPercent: 88,
      waterDemandLiters: 930000,
      foodKitsDemand: 155000,
      confidence: 'HIGH'
    },
    {
      period: '72 Hours',
      windSpeedKmH: Math.round(currentWind * 0.75),
      pressureHpa: Math.round(currentPressure + 14),
      category: 'Category 1 / Severe Depression (Inland Post-Landfall)',
      evacuationDemandEst: 420000,
      shelterOccupancyEstPercent: 94,
      waterDemandLiters: 1260000,
      foodKitsDemand: 210000,
      confidence: 'MEDIUM'
    },
    {
      period: '7 Days',
      windSpeedKmH: 45,
      pressureHpa: 1004,
      category: 'Dissipated / Recovery Phase',
      evacuationDemandEst: 95000,
      shelterOccupancyEstPercent: 42,
      waterDemandLiters: 285000,
      foodKitsDemand: 47500,
      confidence: 'MEDIUM'
    }
  ];

  return {
    generatedAt: new Date(),
    cycloneTrackForecast: activeCyclone ? activeCyclone.forecastTrack : [],
    timeframes
  };
};

module.exports = {
  generateForecasts
};
