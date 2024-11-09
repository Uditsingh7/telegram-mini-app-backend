const app = require('./app');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send("Cognitive Clarity - 40Hz Binaural Beats, Gamma Brain Waves for Enhanced Cognitive Performance")
})

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
