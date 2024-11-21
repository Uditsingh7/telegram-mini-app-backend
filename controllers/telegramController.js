const dotenv = require('dotenv');
const Settings = require('../models/Settings')
const User = require("../models/User");
const EarnOpportunity = require("../models/EarnOpportunity")

dotenv.config();
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_USERNAME = '@vectoroad';

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

const getEarnOpp = async (req, res) => {
    try {
        const response = await EarnOpportunity.find({})
        return res.json(response)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({ error: error.message });
    }
}




const saveWithdrawalDetails = async (req, res) => {
    const { userId, method, details } = req.body;

    // Validate method
    const validMethods = ["UPI", "CRYPTO"];
    if (!validMethods.includes(method)) {
        return res.json({
            success: false,
            message: "Invalid withdrawal method",
        });
    }

    try {
        const user = await User.findOne({ userId });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Find if the method already exists
        const existingMethod = user.withdrawalDetails.find(
            (withdrawal) => withdrawal.method === method
        );

        if (existingMethod) {
            // Update details for the existing method
            existingMethod.details = details;
        } else {
            // Add a new withdrawal method
            user.withdrawalDetails.push({ method, details });
        }

        await user.save();

        return res.json({
            success: true,
            message: "Withdrawal details saved successfully",
        });
    } catch (error) {
        console.error("Error saving withdrawal details:", error);
        return res.json({
            success: false,
            message: "Failed to save withdrawal details",
        });
    }
};







module.exports = { checkMembership, getSettingsConfig, getEarnOpp, saveWithdrawalDetails };
