const express = require('express');
const { checkMembership, getSettingsConfig } = require('../controllers/telegramController');
const router = express.Router();

router.get('/isMember', checkMembership);
router.get('/settings', getSettingsConfig);


module.exports = router;
