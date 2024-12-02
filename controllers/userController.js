// controllers/userController.js
const dotenv = require('dotenv');
const axios = require('axios');


dotenv.config();
const User = require('../models/User');


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = "6760070620";
// Function to send a message to Telegram
const sendTelegramMessage = async (message) => {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const params = {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown', 
    };
    await axios.post(url, params);
    console.log('Telegram message sent successfully.');
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
};


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
      // Send a Telegram message for the new user
      await sendTelegramMessage(`
        📥 *New User Created!*
        👤 *Username:* [${username || 'N/A'}](https://t.me/${username || ''})
        🆔 *User ID:* ${userId}
        🧑 *Name:* ${firstName || 'N/A'} ${lastName || 'N/A'}
              `);
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
    console.log("Type of userId from params:", typeof userId);
    const user = await User.findOne({ userId: userId.toString() });
    console.log("inside fetch yser details", userId, user)

    if (!user) {
      // User not found, send a 404 response
      console.log("User not found.")
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
