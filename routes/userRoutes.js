// routes/userRoutes.js
const express = require('express');
const { createOrUpdateUser, savePaymentDetails, fetchUserById } = require('../controllers/userController');
const router = express.Router();

router.post('/create-or-update', createOrUpdateUser);
router.post('/payment-details', savePaymentDetails);
router.get('/details/:userId', fetchUserById);

module.exports = router;
