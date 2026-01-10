const asyncHandler = require('express-async-handler');
const { sequelize } = require('../Config/DB');
const { QueryTypes } = require('sequelize');
const Joi = require('joi');

const getDbError = (err) => err.original?.message || err.message || "Unknown Error";

exports.getAvailableSurveysCtrl = asyncHandler(async (req, res) => {
  const schools = req.user.schools;

  if (!schools || schools.length === 0) {
    return res.status(200).json([]);
  }

  try {
    const surveyPromises = schools.map(school =>
      sequelize.query(
        `SELECT *, $2::int as my_school_id, $3::text as my_school_name 
                 FROM fn_get_available_surveys_for_school($1::int)`,
        {
          bind: [school.id, school.id, school.name],
          type: QueryTypes.SELECT
        }
      )
    );

    const results = await Promise.all(surveyPromises);
    const surveys = results.flat();

    res.status(200).json(surveys);
  } catch (err) {
    res.status(500).json({ error: getDbError(err) });
  }
});



exports.getSurveyProfileCtrl = asyncHandler(async (req, res) => {
  const surveyId = req.params.surveyId;

  try {
    const result = await sequelize.query(
      `SELECT fn_get_survey_profile($1::int) as profile`,
      {
        bind: [surveyId],
        type: QueryTypes.SELECT
      }
    );

    if (!result[0] || !result[0].profile) {
      return res.status(404).json({ message: "الاستبيان غير موجود" });
    }

    res.status(200).json(result[0].profile);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
exports.submitResponseCtrl = asyncHandler(async (req, res) => {
  const surveyId = req.params.surveyId;
  const { schoolId, answers } = req.body;
  const submittedBy = req.user.id;

  try {
    const result = await sequelize.query(
      `SELECT fn_submit_response($1::int, $2::int, $3::int, $4::jsonb) as response_id`,
      {
        bind: [surveyId, schoolId, submittedBy, JSON.stringify(answers)],
        type: QueryTypes.SELECT
      }
    );

    res.status(201).json({ message: "Response submitted", responseId: result[0].response_id });

  } catch (err) {
    const msg = getDbError(err);
    res.status(500).json({ error: msg });
  }
});
/**
 * @desc    Get Specific School Response Details
 * @route   GET /api/analytics/survey/:id/school/:schoolId
 * @access  Private (Admin)
 */
exports.getSchoolResponse = asyncHandler(async (req, res) => {
  const surveyId = req.params.id;
  const schoolId = req.params.schoolId;

  try {
    const result = await sequelize.query(
      `SELECT fn_get_school_response_details($1::int, $2::int) as details`,
      {
        bind: [surveyId, schoolId],
        type: QueryTypes.SELECT
      }
    );

    // إذا لم يكن هناك نتيجة (يعني المدرسة لم تجاوب بعد)
    if (!result[0] || !result[0].details) {
      return res.status(404).json({ message: "لم يتم العثور على إجابة لهذه المدرسة" });
    }

    res.status(200).json(result[0].details);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});