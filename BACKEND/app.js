const express = require("express");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middleware/ErrorHandler");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

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
