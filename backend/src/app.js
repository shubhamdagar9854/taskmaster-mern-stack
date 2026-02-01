const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (optional for demo)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmaster')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.log('⚠️ MongoDB not connected, running in demo mode'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'TaskMaster API is running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
