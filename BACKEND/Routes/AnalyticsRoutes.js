const express = require("express");
const router = express.Router();
const {
    getSurveySummary,
    getSurveyTracking,
    getSurveyAnalysis,getGlobalAnalytics
} = require("../Controllers/AnalyticsController");
const { verifyTokenAndAdminOrAnalyzer } = require("../middleware/verifyToken");

router.get("/global", verifyTokenAndAdminOrAnalyzer, getGlobalAnalytics
);

//get summary of survey
router.get(
    "/survey/:id/summary",
    verifyTokenAndAdminOrAnalyzer,
    getSurveySummary
);

//get tracking of survey
router.get(
    "/survey/:id/tracking",
    verifyTokenAndAdminOrAnalyzer,
    getSurveyTracking
);

//get analysis of survey
router.get( 
    "/survey/:id/analysis",
    verifyTokenAndAdminOrAnalyzer,
    getSurveyAnalysis
);

module.exports = router;
