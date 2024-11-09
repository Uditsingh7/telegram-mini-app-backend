// controllers/userController.js
const User = require('../models/User');

// Create or Update User
exports.createOrUpdateUser = async (req, res) => {
  const { userId, username, firstName, lastName } = req.body;

  try {
    // Check if the user already exists in the database
    let user = await User.findOne({ userId });

    if (!user) {
      // User not found - create a new user
      user = new User({
        userId,
        username,
        firstName,
        lastName,
      });
      await user.save();
    }

    // Respond with user data (existing or newly created)
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in user creation or retrieval:', error);
    res.status(500).json({ error: 'Failed to create or retrieve user.' });
  }
};


exports.savePaymentDetails = async (req, res) => {
  const { userId, exchangeId, cryptoAddress, bankDetails } = req.body;
  try {
    const withdrawData = {
      exchangeId,
      cryptoAddress,
      bankDetails
    }
    console.log("userId: ", userId);

    console.log("Withdraw data: ", withdrawData)
    let user = await User.findByIdAndUpdate(userId, {
      $set: {
        withdrawalDetails: withdrawData
      },
    },
      { new: true });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error in user creation or retrieval:', error);
    res.status(500).json({ error: 'Failed to create or retrieve user.' });
  }
}
