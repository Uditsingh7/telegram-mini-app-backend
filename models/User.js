const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 }, // General balance for referrals, tasks, etc.
    referBalance: { type: Number, default: 0 }, // General balance for referrals, tasks, etc.
    cryptoBalances: { // New field to store currency-specific balances
        type: Map,
        of: Number, // Each key-value pair stores a currency and its respective balance
        default: {} // Initialize as an empty object
    },
    referrals: { type: Number, default: 0 },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    withdrawalDetails: [
        {
            method: {
                type: String,
                enum: ["UPI", "CRYPTO"], // Allowed methods
            },
            details: {
                type: Map,
                of: String, // Dynamic key-value pairs for method-specific fields
                default: {}, // Empty by default
            },
        },
    ],
    completedTasks: [{ type: String, ref: 'Task' }],
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
});

userSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);
