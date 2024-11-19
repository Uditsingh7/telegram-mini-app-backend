const express = require('express');
const { checkMembership, getSettingsConfig, getEarnOpp, saveWithdrawalDetails } = require('../controllers/telegramController');
const router = express.Router();

router.get('/isMember', checkMembership);
router.get('/settings', getSettingsConfig);
router.get('/earn-opp', getEarnOpp)
router.post('/withdraw-details', saveWithdrawalDetails)


module.exports = router;
