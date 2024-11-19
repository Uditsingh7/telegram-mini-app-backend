const axios = require('axios');
const Task = require('../models/Task');
const User = require("../models/User")

const { checkMembership } = require('./telegramController')

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  const { title, description, points } = req.body;
  try {
    const newTask = new Task({ title, description, points });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function verifyMembership(userId, channelId) {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`,
      {
        params: {
          chat_id: '@vectoroad',
          user_id: userId,
        },
      }
    );

    const status = response.data.result.status;
    return ["member", "administrator", "creator"].includes(status);
  } catch (error) {
    console.error("Error verifying membership:", error.response?.data || error);
    return false;
  }
}

// API endpoint for claiming a task
exports.claimTask = async (req, res) => {
  const { userId, taskId } = req.body;
  console.log("Claim task body: ", req.body);

  if (!userId || !taskId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Fetch task details
    const task = await Task.findById(taskId);
    if (!task) {
      console.log("Task not found")
      return res.status(404).json({ error: "Task not found" });
    }

    const { channelId, points, channelLink } = task;

    // Fetch user data
    const user = await User.findOne({ userId });
    if (!user) {
      console.log("User not found")
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the task is already completed
    if (user.completedTasks.includes(taskId)) {
      console.log("Task already completed!", user.completedTasks)
      return res.status(200).json({
        message: "Task already completed!",
        points: user.balance, // Return the user's current balance
      });
    }

    // Verify Telegram channel membership
    const isMember = await verifyMembership(userId, channelId); // Assuming this function exists
    console.log(isMember)
    if (!isMember) {
      return res.status(200).json({
        message: "Please join the channel to claim this task.",
        redirectUrl: channelLink,
      });
    }

    // Update user balance and mark task as completed
    user.balance += points; // Add task points to the user's balance
    user.completedTasks.push(taskId); // Mark task as completed
    await user.save(); // Save changes to the database
    console.log("Task completed successfully!")

    return res.status(200).json({
      message: "Task completed successfully!",
      points: user.balance,
    });
  } catch (error) {
    console.error("Error in claimTask:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



