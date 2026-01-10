const express = require('express');
const router = express.Router();
const { getDirectorates, getComplexes, getRoles, getSurveyStatuses, getTargetStatuses, getFrequencies, getQuestionTypes } = require('../Controllers/AidControllers');

router.get('/roles', getRoles);
router.get('/directorates', getDirectorates);
router.get('/complexes/:dirId', getComplexes);
router.get('/survey-statuses', getSurveyStatuses);
router.get('/target-statuses', getTargetStatuses);
router.get('/frequencies', getFrequencies);
router.get('/question-types', getQuestionTypes);
module.exports = router;