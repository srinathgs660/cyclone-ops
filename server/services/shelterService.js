const Shelter = require('../models/Shelter');
const { SHELTER_STATUS } = require('../config/constants');
const { emitEvent } = require('../sockets/socketManager');
const { calculateDistanceKm } = require('./riskService');

const findNearestShelters = async (lng, lat, limit = 5) => {
  const shelters = await Shelter.find({ status: { '$ne': SHELTER_STATUS.CLOSED } });

  const withDistances = shelters.map(s => {
    const dist = calculateDistanceKm([lng, lat], s.location.coordinates);
    return {
      shelter: s,
      distanceKm: Math.round(dist * 10) / 10,
      isAvailable: s.status === SHELTER_STATUS.OPEN || s.status === SHELTER_STATUS.FILLING,
      availableCapacity: s.available
    };
  });

  withDistances.sort((a, b) => {
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;
    return a.distanceKm - b.distanceKm;
  });

  return withDistances.slice(0, limit);
};

const updateOccupancy = async (shelterId, deltaOccupancy) => {
  const shelter = await Shelter.findById(shelterId);
  if (!shelter) throw new Error('Shelter not found');

  shelter.occupied = Math.max(0, shelter.occupied + deltaOccupancy);
  shelter.available = Math.max(0, shelter.totalCapacity - shelter.occupied);
  shelter.occupancyPercent = Math.min(100, Math.round((shelter.occupied / shelter.totalCapacity) * 100));

  if (shelter.occupancyPercent >= 100) {
    shelter.status = SHELTER_STATUS.FULL;
  } else if (shelter.occupancyPercent >= 75) {
    shelter.status = SHELTER_STATUS.FILLING;
  } else {
    shelter.status = SHELTER_STATUS.OPEN;
  }

  await shelter.save();

  emitEvent('shelter:update', {
    shelterId: shelter._id,
    name: shelter.name,
    occupied: shelter.occupied,
    available: shelter.available,
    occupancyPercent: shelter.occupancyPercent,
    status: shelter.status
  });

  return shelter;
};

module.exports = {
  findNearestShelters,
  updateOccupancy
};
