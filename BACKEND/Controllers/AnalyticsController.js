const asyncHandler = require("express-async-handler");
const { sequelize } = require("../Config/DB");
const { QueryTypes } = require("sequelize");
/**
 * @desc    Get Detailed Analysis (Supports JSONB & New Types)
 * @route   GET /api/analytics/survey/:id/analysis
*/
exports.getSurveyAnalysis = asyncHandler(async (req, res) => {
  const surveyId = req.params.id;
  try {
    const result = await sequelize.query(
      `SELECT fn_get_survey_analysis($1::int) as analysis`,
      {
        bind: [surveyId],
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json(result[0].analysis || []);

  } catch (err) {
    res.status(500).json({ error: err.original?.message || err.message });
  }
});
/**
 * @desc    Get Global System Analytics (Main Dashboard)
 * @route   GET /api/analytics/global
 * @access  Private (Admin)
 */
exports.getGlobalAnalytics = asyncHandler(async (req, res) => {
  try {
    const result = await sequelize.query(
      `SELECT fn_get_global_system_stats() as stats`,
      { type: QueryTypes.SELECT }
    );
    res.status(200).json(result[0].stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @description get survey summary
 * @route /analytics/getSurveySummary/{id}
 * @access private (admin and analayzer)
 */
exports.getSurveySummary = asyncHandler(async (req, res) => {
  const surveyId = req.params.id;
  try {
    const result = await sequelize.query(
      `SELECT fn_get_survey_stats_summary($1::int) as stats`,
      { bind: [surveyId], type: QueryTypes.SELECT }
    );
    res.status(200).json(result[0].stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 *@desc get survey tracking
 * @route survey/:id/tracking
 * @access private  (admin and analayzer)
 */
exports.getSurveyTracking = asyncHandler(async (req, res) => {
  const surveyId = req.params.id;
  try {
    const result = await sequelize.query(
      `SELECT * FROM fn_get_survey_schools_status($1::int)`,
      { bind: [surveyId], type: QueryTypes.SELECT }
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
