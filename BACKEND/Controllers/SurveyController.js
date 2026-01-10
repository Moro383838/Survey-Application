const asyncHandler = require("express-async-handler");
const { sequelize } = require("../Config/DB");
const { QueryTypes } = require("sequelize");
const {
  ValidateAddQuestion,
  ValidateCreateSurvey,
  ValidateSetTargets, ValidateUpdateSurvey
} = require("../Validator.js/Validators");

/**
 * @desc    get error from postgre
 * @route
 * @body
 */
const getDbError = (err) => {
  return err.original?.message || err.message || "Unknown Error";
};
/**
 * @desc   Create Survey
 * @route   POST /api/v1/surveys/
 * @body    { "title": string }
 */
module.exports.createSurveyCrlt = asyncHandler(async (req, res) => {
  console.log(req.user);
  const { error } = ValidateCreateSurvey(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { title, description, isPeriodic, startDate, endDate, frequencyId } = req.body;

  const createdBy = req.user?.id;

  try {
    const result = await sequelize.query(
      `SELECT fn_create_survey(
                $1, 
                $2, 
                $3::boolean, 
                $4::timestamp, 
                $5::timestamp, 
                $6::int, 
                $7::int
            ) as new_id`,
      {
        bind: [
          title,
          description || null,
          isPeriodic || false,
          startDate || null,
          endDate || null,
          frequencyId || null,
          createdBy
        ],
        type: QueryTypes.SELECT
      }
    );

    res.status(201).json({
      message: "Survey created successfully",
      surveyId: result[0].new_id
    });

  } catch (err) {
    const msg = getDbError(err)
    res.status(500).json({ error: msg });
  }
});
exports.updateSurveyCtrl = asyncHandler(async (req, res) => {
  const { error } = ValidateUpdateSurvey(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  console.log(req.body);
  const surveyId = req.params.id;
  const { title, description, isPeriodic, startDate, endDate, frequencyId } = req.body;

  try {
    await sequelize.query(
      `SELECT fn_update_survey($1::int, $2, $3,$4::boolean, $5::timestamp, $6::timestamp, $7::int)`,
      {
        bind: [
          surveyId,
          title || null, description || null, isPeriodic !== undefined ? isPeriodic : null,
          startDate || null, endDate || null, frequencyId !== undefined ? frequencyId : null
        ],
        type: QueryTypes.SELECT
      }
    );
    res.status(200).json({ message: "Survey updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.original?.message || err.message });
  }
});
// 2. Delete Survey
exports.deleteSurvey = asyncHandler(async (req, res) => {
  const surveyId = req.params.id;
  try {
    await sequelize.query(`SELECT fn_delete_survey($1::int)`, {
      bind: [surveyId], type: QueryTypes.SELECT
    });
    res.status(200).json({ message: "Survey deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.original?.message || err.message });
  }
});



/**
 * @desc    Get All Surveys (Admin)
 * @route   GET /api/v1/surveys/
 * @body    { "status": ENUM(DRAFT, ACTIVE, CLOSED) }
 */
// 3. Get All Surveys
exports.getAllSurveysAdmin = asyncHandler(async (req, res) => {
  const { statusId } = req.query; // الفلتر برقم الحالة
  try {
    const surveys = await sequelize.query(
      `SELECT * FROM fn_get_all_surveys_admin($1::int)`,
      { bind: [statusId || null], type: QueryTypes.SELECT }
    );
    res.status(200).json(surveys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.getSurveyDetails = asyncHandler(async (req, res) => {
  const surveyId = req.params.id;
  try {
    const result = await sequelize.query(
      `SELECT fn_get_survey_details($1::int) as details`,
      { bind: [surveyId], type: QueryTypes.SELECT }
    );
    if (!result[0].details) return res.status(404).json({ message: "Survey not found" });
    res.status(200).json(result[0].details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * @desc    Add Question to Survey
 * @route   POST /api/v1/surveys/:id/questions
 * @body   
    @access PRIVATE (Admin)
 */
module.exports.addQuestionCtrl = asyncHandler(async (req, res) => {
  const { error } = ValidateAddQuestion(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  console.log(req.body);
  const surveyId = req.params.id;
  const { text, typeId, isRequired, options, order, logic } = req.body;

  try {
    const result = await sequelize.query(
      `SELECT fn_add_question(
                $1::int, $2, $3::int, $4::boolean, $5::jsonb, $6::int, $7::jsonb
            ) as q_id`,
      {
        bind: [
          surveyId, text, typeId, isRequired,
          JSON.stringify(options || []), order, JSON.stringify(logic || null)
        ],
        type: QueryTypes.SELECT
      }
    );

    res.status(201).json({ message: "Question added", questionId: result[0].q_id });
  } catch (err) {
    const msg = getDbError(err);
    res.status(400).json({ error: msg });
  }
});

/**
 * @desc    Delete Question from Survey
 * @route   DELETE /api/v1/surveys/:id/questions/:id
 * @body    {}
 * @access PRIVATE (Admin)
 */
module.exports.deleteQuestion = asyncHandler(async (req, res) => {
  const questionId = req.params.id;
  try {
    await sequelize.query(`SELECT fn_delete_question($1::int)`, {
      bind: [questionId],
      type: QueryTypes.SELECT,
    });
    res.status(200).json({ message: "Question deleted" });
  } catch (err) {
    const msg = getDbError(err);
    return res.status(400).json({ error: msg });
  }
});

/**
 * @desc    Set Targets for Survey
 * @route   POST /api/v1/surveys/:id/targets
 * @body    { "schoolIds": int[] }
 * @access PRIVATE (Admin)
 */
module.exports.setTargetsCtrl = asyncHandler(async (req, res) => {
  const { error } = ValidateSetTargets(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const surveyId = req.params.id;
  const { schoolIds, directorateIds, complexIds } = req.body;

  try {
    const result = await sequelize.query(
      `SELECT fn_set_survey_targets(
            $1::int, 
            $2::int[], 
            $3::int[], 
            $4::int[]
        ) as count`,
      {
        bind: [
          surveyId,
          schoolIds || null,
          directorateIds || null,
          complexIds || null
        ],
        type: QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      message: "Target schools updated successfully",
      schoolsCount: result[0].count
    });

  } catch (err) {
    const msg = getDbError(err);
    return res.status(400).json({ error: msg });
  }
});

/**
 * @desc    Publish Survey
 * @route   POST /api/v1/surveys/:id/publish
 * @body    {}
 * @access PRIVATE (Admin)
 */
module.exports.publishSurveyCtrl = asyncHandler(async (req, res) => {
  const surveyId = req.params.id;
  try {
    await sequelize.query(`SELECT fn_publish_survey($1::int)`, {
      bind: [surveyId],
      type: QueryTypes.SELECT,
    });
    res.status(200).json({ message: "Survey is now ACTIVE" });
  } catch (err) {
    const msg = getDbError(err);
    return res.status(400).json({ error: msg });
  }
});

/**
 * @desc    Get Survey Details
 * @route   GET /api/v1/surveys/:id
 * @body    {}
 * @access PRIVATE (Admin)
 */
module.exports.getSurveyDetailsCtrl = asyncHandler(async (req, res) => {
  const surveyId = req.params.id;
  try {
    const result = await sequelize.query(
      `SELECT fn_get_survey_details($1::int) as details`,
      { bind: [surveyId], type: QueryTypes.SELECT }
    );
    res.status(200).json(result[0].details);
  } catch (err) {
    const msg = getDbError(err);
    return res.status(500).json({ error: msg });
  }
});

/**
 * @desc    Close Survey
 * @route   POST /api/v1/surveys/:id/close
 * @body    {}
 * @access PRIVATE (Admin)
 */
module.exports.CloseSurveyCtrl = asyncHandler(async (req, res) => {
  const surveyId = req.params.id;
  try {
    await sequelize.query(`SELECT fn_timeout_survey($1::int)`, {
      bind: [surveyId],
      type: QueryTypes.SELECT,
    });
    res.status(200).json({ message: "Survey is now CLOSED" });
  } catch (err) {
    const msg = getDbError(err);
    return res.status(500).json({ error: msg });
  }
});


/**
 * @desc    Unpublish Survey (With Option to reset answer)
 * @route   POST /api/surveys/:id/unpublish
 * @body    { "reset": boolean }
 */
module.exports.UnpublishSurveyCtrl = asyncHandler(async (req, res) => {
  console.log('Unpublish Body:', req.body);
  const surveyId = req.params.id;
  try {
    await sequelize.query(`SELECT fn_unpublish_survey($1::int,$2::boolean)`, {
      bind: [surveyId, req.body.reset],
      type: QueryTypes.SELECT,
    });
    res.status(200).json({ message: "Survey is now Draft" });
  } catch (err) {
    const msg = getDbError(err);
    return res.status(400).json({ error: msg });
  }
});
/**
 * @desc    Delete Question from Survey
 * @route   DELETE /api/v1/surveys/questions/:questionId
 * @access  Private (Admin)
 */
exports.deleteQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  try {
    await sequelize.query(
      `SELECT fn_delete_question($1::int)`,
      {
        bind: [questionId],
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json({ message: "Question deleted successfully" });

  } catch (err) {
    const msg = err.original?.message || err.message;
    res.status(500).json({ error: msg });
  }
});

/**
 * @desc    Edit Question (Draft Only)
 * @route   PUT /api/v1/surveys/questions/:questionId
 */
exports.editQuestion = asyncHandler(async (req, res) => {
  // 1. التحقق من المدخلات (نستخدم نفس Validator الإضافة)
  const { error } = ValidateAddQuestion(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { questionId } = req.params;
  const { text, typeId, isRequired, options, order, logic } = req.body;

  try {
    await sequelize.query(
      `SELECT fn_edit_question(
                $1::int, $2, $3::int, $4::boolean, $5::jsonb, $6::int, $7::jsonb
            )`,
      {
        bind: [
          questionId, text, typeId, isRequired,
          JSON.stringify(options || []), order, JSON.stringify(logic || null)
        ],
        type: QueryTypes.SELECT
      }
    );

    res.status(200).json({ message: "Question updated successfully" });

  } catch (err) {
    const msg = err.original?.message || err.message;

    // أخطاء المنطق (استبيان منشور)
    if (msg.includes('منشور') || msg.includes('مغلق')) {
      return res.status(400).json({ error: msg });
    }

    res.status(500).json({ error: msg });
  }
});