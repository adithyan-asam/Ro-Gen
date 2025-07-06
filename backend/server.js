const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');


// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/roadmap', require('./routes/roadmapRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
