const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: String,
    description: String,
    channelId: String,
    points: Number,
    channelLink: String,
    verifiedUsers: [{ type: String }], // Array of userIds who completed this task
});

module.exports = mongoose.model('Task', taskSchema);
