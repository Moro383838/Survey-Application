const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
// xss-clean removed due to Express 5 compatibility issues
const compression = require("compression");
const { notFound, errorHandler } = require("./middleware/ErrorHandler");

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://survey-frontend-ashen.vercel.app',
  'https://survey-frontend-onvidmt91-moro383838s-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV === 'production') {
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
    }
    return callback(null, true);
  },
  credentials: true
}));

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Compression
app.use(compression());

app.use(express.json({ limit: '10mb' }));
// XSS protection handled by helmet and manual sanitization

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan("dev"));
}

// Trust proxy for production
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

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
