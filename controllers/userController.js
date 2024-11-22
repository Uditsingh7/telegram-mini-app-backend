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

exports.fetchUserById = async (req, res) => {
  const { userId } = req.params; // Assuming userId is provided as a route parameter


  try {
    // Look for the user in the database by userId
    const user = await User.findOne({ userId });
    console.log("inside fetch yser details", user)

    if (!user) {
      // User not found, send a 404 response
      return res.status(404).json({ error: 'User not found.' });
    }

    // Respond with the user data
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user data.' });
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
