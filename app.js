const express = require('express');
const cors = require('cors'); // Import cors
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const telegramRoutes = require('./routes/telegramRoutes');

// const referralRoutes = require('./routes/referralRoutes');
// const withdrawalRoutes = require('./routes/withdrawalRoutes');
// const earnRoutes = require('./routes/earnRoutes');

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Route Handling
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', telegramRoutes);
// app.use('/api/referrals', referralRoutes);
// app.use('/api/withdrawals', withdrawalRoutes);
// app.use('/api/earn', earnRoutes);

module.exports = app;
