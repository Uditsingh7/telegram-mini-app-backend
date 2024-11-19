const express = require('express');
const cors = require('cors'); // Import cors
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const telegramRoutes = require('./routes/telegramRoutes');

// const referralRoutes = require('./routes/referralRoutes');
// const withdrawalRoutes = require('./routes/withdrawalRoutes');
// const earnRoutes = require('./routes/earnRoutes');

const app = express();

// Replace 'your-amplify-domain' with your Amplify app's domain
const allowedOrigins = ['https://main.d1hk4bpdroppqg.amplifyapp.com/'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies or auth headers
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Route Handling
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', telegramRoutes);
// app.use('/api/referrals', referralRoutes);
// app.use('/api/withdrawals', withdrawalRoutes);
// app.use('/api/earn', earnRoutes);

module.exports = app;
