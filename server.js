const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const TelegramBot = require('node-telegram-bot-api');
const Referral = require('./models/Referral')
const User = require('./models/User');
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
          console.log(referrer)
          if (referrer) {
            referrer.referrals += 1;
            const referralPoints = referPoints?.value || 5; // Points awarded for each referral
            referrer.balance += referralPoints;
            referrer.referBalance += referralPoints;
            await referrer.save();

            // Notify the referrer about the successful referral
            bot.sendMessage(referrerId, `🎉 You've earned ₹${referralPoints} for referring a new user! Your new balance is ₹${referrer.balance}.`);
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
          👋What can this bot do ? 

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


// Message states now includes media type
const messageStates = new Map();

bot.onText(/\/broadcast/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    // 1. Verify admin
    const user = await User.findOne({ userId: chatId });
    if (!user || user.role !== 'admin') {
      return bot.sendMessage(chatId, 'Unauthorized: Only admins can broadcast messages');
    }

    // 2. Set state to waiting for message
    messageStates.set(chatId, { state: 'WAITING_FOR_MESSAGE' });

    // 3. Ask for message or photo
    await bot.sendMessage(chatId, 'Please send your message or photo with caption for broadcasting');
  } catch (error) {
    console.error('Error in broadcast command:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong');
  }
});

// Message handler for broadcast flow

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userState = messageStates.get(chatId);

  if (!userState) return;

  try {
    switch (userState.state) {
      case 'WAITING_FOR_MESSAGE':
        let broadcastContent = {};

        // Handle photo with caption
        if (msg.photo) {
          broadcastContent = {
            type: 'photo',
            photoId: msg.photo[msg.photo.length - 1].file_id, // Get highest resolution
            caption: msg.caption || ''
          };
        }
        // Handle text message
        else if (msg.text) {
          broadcastContent = {
            type: 'text',
            text: msg.text
          };
        }
        else {
          await bot.sendMessage(chatId, 'Please send either a text message or photo with caption');
          return;
        }

        // Store content and ask for confirmation
        messageStates.set(chatId, {
          state: 'WAITING_FOR_CONFIRMATION',
          content: broadcastContent
        });

        const totalUsers = await User.countDocuments();

        // Show preview based on content type
        if (broadcastContent.type === 'photo') {
          await bot.sendPhoto(chatId, broadcastContent.photoId, {
            caption: `Preview of your broadcast:\n\nCaption: ${broadcastContent.caption}\n\nThis will be sent to ${totalUsers} users.\nSend "Yes" to confirm or "No" to cancel.`
          });
        } else {
          await bot.sendMessage(
            chatId,
            `Preview of your message:\n\n${broadcastContent.text}\n\nThis will be sent to ${totalUsers} users.\nSend "Yes" to confirm or "No" to cancel.`
          );
        }
        break;

      case 'WAITING_FOR_CONFIRMATION':
        const response = msg.text.toLowerCase();
        if (response === 'yes') {
          await bot.sendMessage(chatId, 'Broadcasting message...');

          const result = await broadcastMessage(
            chatId,
            messageStates.get(chatId).content
          );

          await bot.sendMessage(
            chatId,
            'Broadcast completed!\n' +
            `Total users: ${result.totalUsers}\n` +
            `Successfully sent: ${result.successCount}\n` +
            `Failed: ${result.failedCount}`
          );
        } else if (response === 'no') {
          await bot.sendMessage(chatId, 'Broadcast cancelled.');
        } else {
          await bot.sendMessage(chatId, 'Please send "Yes" to confirm or "No" to cancel.');
          return;
        }

        messageStates.delete(chatId);
        break;
    }
  } catch (error) {
    console.error('Error in message handler:', error);
    await bot.sendMessage(chatId, 'Sorry, something went wrong');
    messageStates.delete(chatId);
  }
});

// Modified broadcast function to handle both text and photos
const broadcastMessage = async (senderUserId, content) => {
  try {
    const allUsers = await User.find({}, { userId: 1 });
    const totalUsers = allUsers.length;

    const BATCH_SIZE = 50;
    const DELAY_BETWEEN_BATCHES = 2000;
    let successCount = 0;
    let failedCount = 0;
    const failedIds = [];

    for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
      const batch = allUsers.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            if (content.type === 'photo') {
              await bot.sendPhoto(user.userId, content.photoId, {
                caption: content.caption
              });
            } else {
              await bot.sendMessage(user.userId, content.text);
            }
            successCount++;
          } catch (error) {
            failedCount++;
            failedIds.push(user.userId);
            console.error(`Failed to send to ${user.userId}:`, error.message);
          }
        })
      );

      const progress = Math.min(100, Math.round(((i + BATCH_SIZE) / totalUsers) * 100));
      await bot.sendMessage(
        senderUserId,
        `Progress: ${progress}%\nSuccessful: ${successCount}\nFailed: ${failedCount}`
      );

      if (i + BATCH_SIZE < allUsers.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    return {
      totalUsers,
      successCount,
      failedCount,
      failedIds
    };

  } catch (error) {
    console.error('Broadcast error:', error);
    throw error;
  }
};