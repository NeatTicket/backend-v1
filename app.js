const config = require('./config');
const logger = require('./utils/logger');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // Bypass local DNS restrictions
const express = require('express');
const connectDB = require('./database/mongodb');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const app = express();

connectDB();

// Middleware setup
// 1. Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Setup strict CORS
const allowedOrigins = config.env === 'production'
  ? ['https://yourproductiondomain.com']
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// 3. Rate limiting (limits requests from same IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/v1', apiLimiter);


// 4. Body parser
app.use(express.json({ limit: '10kb' })); // Limit body size to 10kb

// 5. Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// 6. Data sanitization against XSS
app.use(xss());
app.use("/uploads", express.static("uploads"));

// Routes
const usersRouter = require('./routes/usersRouter');
const authRouter = require('./routes/authRouter');
const placesRouter = require("./routes/placesRouter");
const eventsRouter = require('./routes/eventsRouter');
const profileRouter = require('./routes/profileRouter');
const ticketsRouter = require("./routes/ticketsRouter");
const statsRouter = require("./routes/statsRouter");
const notificationsRouter = require("./routes/notificationsRouter");

app.use("/api/v1/places", placesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/auth', authRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/tickets", ticketsRouter);
app.use("/api/v1/stats", statsRouter);
app.use("/api/v1/notifications", notificationsRouter);

// Health Check Route
app.get('/api/v1/health', (req, res) => {
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
app.listen(config.port, () => {
  logger.info(`Listening on port ${config.port}`);
});
