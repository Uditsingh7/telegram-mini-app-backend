// routes/userRoutes.js
const express = require('express');
const { createOrUpdateUser, savePaymentDetails } = require('../controllers/userController');
const router = express.Router();

router.post('/create-or-update', createOrUpdateUser);
router.post('/payment-details', savePaymentDetails);

module.exports = router;
