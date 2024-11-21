const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');
const Referral = require('./models/Referral')
const Settings = require('./models/Settings')




dotenv.config();
const PORT = process.env.PORT || 5000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Cognitive Clarity - 40Hz Binaural Beats, Gamma Brain Waves for Enhanced Cognitive Performance")
})

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



bot.onText(/\/start(?: (.*))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const referralParam = match[1]; // Capture the referral parameter if present

  try {
    // Process referral if a referral parameter exists
    if (referralParam && referralParam.startsWith("referral_")) {
      const referrerId = referralParam.split("_")[1];
      const referPoints = await Settings.findOne({ key: "referral_points" })

      // Ensure the referral is valid and not self-referred
      if (referrerId && referrerId !== chatId.toString()) {
        // Check if this referral has already been processed
        const existingReferral = await Referral.findOne({ referredUserId: chatId });
        if (!existingReferral) {
          // Save referral record
          const referral = new Referral({ referrerId, referredUserId: chatId });
          await referral.save();

          // Update referrer data
          const referrer = await User.findOne({ userId: referrerId });
          if (referrer) {
            referrer.referrals += 1;
            const referralPoints = referPoints?.value || 5; // Points awarded for each referral
            referrer.balance += referralPoints;
            referrer.referBalance += referPoints;
            await referrer.save();

            // Notify the referrer about the successful referral
            bot.sendMessage(referrerId, `🎉 You've earned ${referralPoints} points for referring a new user! Your new balance is ${referrer.balance} points.`);
          }
        }
      }
    }


    // Fetch the official channel link from Settings
    const appSetting = await Settings.findOne({ key: 'officialMiniAppLink' });
    const miniAppLink = appSetting ? appSetting.value.appLink : 'https://t.me';
    // Show standard user welcome message and prompt to join the official channel

    const channelLogo = await Settings.findOne({ key: 'channelLogoImage' })
    const welcomeMessage = `
          👋 Hello! 

Welcome to TrueMoj 🐶 

Frustrated with fake tokens and bogus launches?  

Want to earn real money with 100% guarantee ?  

You're in the right place.  

TrueMoj 🐶 - Earn for real, no gimmicks, no tokens
—just direct earnings with solid backing
          `;
    // Send image first
    bot.sendPhoto(chatId, channelLogo.value, {
      caption: welcomeMessage,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Earn in One Click 🐶",
              web_app: { url: miniAppLink }
            }
          ]
        ]
      }
    });

  } catch (error) {
    console.error("Error in /start command:", error);
    bot.sendMessage(chatId, "⚠️ There was an error setting up your account. Please try again later.");
  }
});