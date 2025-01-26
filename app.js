require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const url = process.env.MONGO_URL;
const port = process.env.PORT || 4000;

if (!url) {
  console.error("MONGO_URL is not defined in the environment variables.");
  process.exit(1);
}

mongoose.connect(url)
  .then(() => {
    console.log("MongoDB server started");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const usersRouter = require('./routes/usersRouter');
const authRouter = require('./routes/authRouter');
const placesRouter = require("./routes/placesRouter");
const eventsRouter = require('./routes/eventsRouter');
const profileRouter = require('./routes/profileRouter'); // Import profileRouter

app.use("/api/places", placesRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/profile", profileRouter); // Use profileRouter

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Global middleware for not found routes
app.all('*', (req, res) => {
  res.status(404).json({ status: 'ERROR', message: 'Resource not found' });
});

// Global error handler
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
