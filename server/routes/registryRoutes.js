const express = require('express');
const router = express.Router();
const SafeCheckin = require('../models/SafeCheckin');
const { emitEvent } = require('../sockets/socketManager');

/**
 * POST /api/registry/safe-checkin
 * Citizen or Shelter Admin submits "I Am Safe" registration
 */
router.post('/safe-checkin', async (req, res, next) => {
  try {
    const { 
      citizenName, 
      phone, 
      shelterId, 
      shelterName, 
      country,
      state,
      district, 
      familyMembersCount, 
      familyMembersNames, 
      medicalAssistanceRequired,
      status, 
      notes 
    } = req.body;

    if (!citizenName || !phone || !shelterName) {
      return res.status(400).json({ success: false, message: 'Citizen name, phone, and shelter name are required' });
    }

    const qrData = JSON.stringify({
      name: citizenName,
      phone: phone.slice(-4),
      shelter: shelterName,
      country: country || 'India',
      state: state || 'Tamil Nadu',
      district: district || 'Chennai',
      members: familyMembersCount || 1,
      time: new Date().toISOString()
    });

    const checkin = await SafeCheckin.create({
      citizenName,
      phone,
      shelterId,
      shelterName,
      country: country || 'India',
      state: state || 'Tamil Nadu',
      district: district || 'Chennai',
      familyMembersCount: familyMembersCount || 1,
      familyMembersNames: familyMembersNames || [],
      medicalAssistanceRequired: !!medicalAssistanceRequired,
      status: status || 'SAFE_IN_SHELTER',
      notes,
      qrCodeData: qrData
    });

    try {
      emitEvent('registry:safe_checkin', {
        id: checkin._id,
        citizenName: checkin.citizenName,
        shelterName: checkin.shelterName,
        country: checkin.country,
        state: checkin.state,
        district: checkin.district,
        familyMembersCount: checkin.familyMembersCount,
        time: checkin.createdAt
      });
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: `Safety check-in recorded for ${citizenName} and family. Relatives can now verify via the registry search.`,
      data: checkin
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/registry/search
 * Public search for relatives looking for family members across Country, State, District
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q, country, state, district } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, count: 0, data: [] });
    }

    const cleanQ = q.trim();
    const query = {
      $or: [
        { citizenName: { $regex: cleanQ, $options: 'i' } },
        { phone: { $regex: cleanQ, $options: 'i' } },
        { shelterName: { $regex: cleanQ, $options: 'i' } },
        { district: { $regex: cleanQ, $options: 'i' } },
        { state: { $regex: cleanQ, $options: 'i' } },
        { country: { $regex: cleanQ, $options: 'i' } }
      ]
    };

    if (country && country !== 'all') query.country = country;
    if (state && state !== 'all') query.state = state;
    if (district && district !== 'all') query.district = district;

    const results = await SafeCheckin.find(query).sort({ createdAt: -1 }).limit(50);

    // Mask phone numbers for privacy (e.g. +91 98400 ***45)
    const sanitized = results.map(r => ({
      _id: r._id,
      citizenName: r.citizenName,
      phoneMasked: r.phone ? r.phone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2') : 'Verified',
      shelterName: r.shelterName,
      country: r.country || 'India',
      state: r.state || 'Tamil Nadu',
      district: r.district,
      familyMembersCount: r.familyMembersCount,
      medicalAssistanceRequired: r.medicalAssistanceRequired,
      status: r.status,
      notes: r.notes,
      checkedInAt: r.createdAt
    }));

    res.json({
      success: true,
      count: sanitized.length,
      data: sanitized
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/registry/recent
 * Returns latest verified check-ins and statistics with global location
 */
router.get('/recent', async (req, res, next) => {
  try {
    const [recent, totalRecords, totalCitizens] = await Promise.all([
      SafeCheckin.find().sort({ createdAt: -1 }).limit(25),
      SafeCheckin.countDocuments(),
      SafeCheckin.aggregate([
        { $group: { _id: null, totalPeople: { $sum: '$familyMembersCount' } } }
      ])
    ]);

    const sanitized = recent.map(r => ({
      _id: r._id,
      citizenName: r.citizenName,
      phoneMasked: r.phone ? r.phone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2') : 'Verified',
      shelterName: r.shelterName,
      country: r.country || 'India',
      state: r.state || 'Tamil Nadu',
      district: r.district,
      familyMembersCount: r.familyMembersCount,
      status: r.status,
      checkedInAt: r.createdAt
    }));

    res.json({
      success: true,
      stats: {
        totalCheckins: totalRecords,
        totalPeopleSafe: totalCitizens[0]?.totalPeople || totalRecords
      },
      data: sanitized
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
