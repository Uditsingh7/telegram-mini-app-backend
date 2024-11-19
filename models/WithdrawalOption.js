const mongoose = require("mongoose");

const withdrawalDetailsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }, // General balance
  withdrawalDetails: {
    method: {
      type: String,
      enum: ["UPI", "CRYPTO"], // Allowed methods
      required: true,
    },
    details: {
      type: Map,
      of: String, // Dynamic key-value pairs for method-specific fields
      default: {}, // Empty by default
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update timestamps
withdrawalDetailsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("withdrawalDetais", withdrawalDetailsSchema);
