const express = require('express');
const router = express.Router();
const Shelter = require('../models/Shelter');
const { findNearestShelters, updateOccupancy } = require('../services/shelterService');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const { mockShelters } = require('../config/mockData');

router.get('/', async (req, res, next) => {
  try {
    const { status, district } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (district) filter.district = district;
    const shelters = await Shelter.find(filter).sort({ occupancyPercent: -1 });
    res.json({ success: true, count: shelters.length, data: shelters });
  } catch (err) {
    res.json({ success: true, count: mockShelters.length, data: mockShelters });
  }
});

router.get('/nearby', async (req, res, next) => {
  try {
    const lng = parseFloat(req.query.lng || 80.27);
    const lat = parseFloat(req.query.lat || 13.08);
    const limit = parseInt(req.query.limit || 5);
    const nearby = await findNearestShelters(lng, lat, limit);
    res.json({ success: true, count: nearby.length, data: nearby });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ success: false, message: 'Shelter not found' });
    res.json({ success: true, data: shelter });
  } catch (err) { next(err); }
});

router.put('/:id', protect, authorize('admin', 'officer', 'coordinator'), async (req, res, next) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ success: false, message: 'Shelter not found' });

    if (req.body.occupied !== undefined) shelter.occupied = req.body.occupied;
    if (req.body.status) shelter.status = req.body.status;
    if (req.body.facilities) shelter.facilities = { ...shelter.facilities.toObject(), ...req.body.facilities };
    await shelter.save();

    res.json({ success: true, data: shelter });
  } catch (err) { next(err); }
});

router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { name, address, district, totalCapacity, coordinates, facilities, contactPerson, contactPhone } = req.body;
    const count = await Shelter.countDocuments();
    const code = 'SHL-' + (count + 101);

    const shelter = await Shelter.create({
      name,
      code,
      location: {
        type: 'Point',
        coordinates: coordinates || [80.27, 13.08]
      },
      address,
      district: district || 'Chennai',
      totalCapacity: Number(totalCapacity || 1000),
      facilities: facilities || {
        drinkingWater: true,
        foodSupplies: true,
        medicalSupport: true,
        electricity: true,
        toilets: true,
        womenChildrenSupport: true,
        accessibilityRamps: true,
        backupGenerators: true
      },
      contactPerson: contactPerson || 'Facility Commander',
      contactPhone: contactPhone || '+91 98765 43210'
    });

    const { emitEvent } = require('../sockets/socketManager');
    emitEvent('shelter:new', shelter);

    res.status(201).json({ success: true, message: 'Shelter registered successfully', data: shelter });
  } catch (err) { next(err); }
});

module.exports = router;
