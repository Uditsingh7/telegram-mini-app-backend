const dotenv = require('dotenv');
const Settings = require('../models/Settings')

dotenv.config();
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // Replace with your actual bot token
const CHANNEL_USERNAME = '@vectoroad'; // Replace with your actual channel username

const checkMembership = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        console.log(`Checking membership for user ID: ${userId} in channel: ${CHANNEL_USERNAME}`);
        const response = await axios.get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`, {
            params: {
                chat_id: CHANNEL_USERNAME, // Use channel username or chat ID
                user_id: userId,
            },
        });
        console.log(response);


        const memberStatus = response.data.result.status;
        console.log("Member stats: ", memberStatus)

        const isMember = memberStatus === 'member' || memberStatus === 'administrator' || memberStatus === 'creator';
        console.log("isMember: ", isMember)
        return res.json({ isMember });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ error: error.message });
    }
};


const getSettingsConfig = async (req, res) => {
    try {
        const { config } = req.query;
        const response = await Settings.findOne({ key: config })
        return res.json(response)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { checkMembership, getSettingsConfig };
