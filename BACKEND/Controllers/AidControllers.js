const asyncHandler = require('express-async-handler');
const { sequelize } = require('../Config/DB');
const { QueryTypes } = require('sequelize');
//get Roles
module.exports.getRoles = asyncHandler(async (req, res) => {
    const result = await sequelize.query('SELECT * FROM fn_get_roles()', { type: QueryTypes.SELECT });
    res.json(result);
});
//get directorates
module.exports.getDirectorates = asyncHandler(async (req, res) => {
    const result = await sequelize.query('SELECT * FROM fn_get_directorates()', { type: QueryTypes.SELECT });
    res.json(result);
});
//get complexes
module.exports.getComplexes = asyncHandler(async (req, res) => {
    const { dirId } = req.params;
    const result = await sequelize.query('SELECT * FROM fn_get_complexes($1)', {
        bind: [dirId], type: QueryTypes.SELECT
    });
    res.json(result);
});


exports.getSurveyStatuses = asyncHandler(async (req, res) => {
    const result = await sequelize.query('SELECT * FROM fn_get_survey_statuses()', { type: QueryTypes.SELECT });
    res.json(result);
});

exports.getTargetStatuses = asyncHandler(async (req, res) => {
    const result = await sequelize.query('SELECT * FROM fn_get_target_statuses()', { type: QueryTypes.SELECT });
    res.json(result);
});

exports.getFrequencies = asyncHandler(async (req, res) => {
    const result = await sequelize.query('SELECT * FROM fn_get_frequencies()', { type: QueryTypes.SELECT });
    res.json(result);
});

exports.getQuestionTypes = asyncHandler(async (req, res) => {
    const result = await sequelize.query('SELECT * FROM fn_get_question_types()', { type: QueryTypes.SELECT });
    res.json(result);
});
