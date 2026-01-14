const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const compression = require("compression");
const { notFound, errorHandler } = require("./middleware/ErrorHandler");

const app = express();

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(xss());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan("dev"));
}

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Trust proxy for production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Add security headers
app.use((req, res, next) => {
  // Prevent XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent clicking attacks
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Force HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Prevent MIME-type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  next();
});

// Global request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.use("/api/v1/auth", require("./Routes/AuthRoute"));
app.use("/api/v1/user", require("./Routes/UserRoutes"));
app.use("/api/v1/school", require("./Routes/SchoolRoutes"));
app.use("/api/v1/survey", require("./Routes/SurveyRoutes"));
app.use("/api/v1/response", require("./Routes/ResponseRoutes"));
app.use("/api/v1/analytics", require("./Routes/AnalyticsRoutes"));
app.use('/api/v1/Aid', require('./Routes/AidRoutes'));

app.use(notFound);
app.use(errorHandler);
module.exports = app;
