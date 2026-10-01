const express = require('express');
const router = express.Router();
const {
  runCycloneApproachingScenario,
  runEvacuationSurgeScenario,
  runShelterOvercapacityScenario,
  runCitizenSOSScenario,
  runReliefShortageScenario
} = require('../services/simulationService');

router.post('/scenario/:scenarioId', async (req, res, next) => {
  try {
    const id = parseInt(req.params.scenarioId);
    let result;

    switch (id) {
      case 1:
        result = await runCycloneApproachingScenario();
        break;
      case 2:
        result = await runEvacuationSurgeScenario();
        break;
      case 3:
        result = await runShelterOvercapacityScenario();
        break;
      case 4:
        result = await runCitizenSOSScenario();
        break;
      case 5:
        result = await runReliefShortageScenario();
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid scenario ID (1 to 5)' });
    }

    res.json({ success: true, message: 'Scenario executed successfully', data: result });
  } catch (err) { next(err); }
});

module.exports = router;
