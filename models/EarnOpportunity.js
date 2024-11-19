const mongoose = require('mongoose');

const earningOpportunitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    depositLink: { type: String, required: true },
    withdrawLink: { type: String, required: true },
});

module.exports = mongoose.model('EarningOpportunity', earningOpportunitySchema);
