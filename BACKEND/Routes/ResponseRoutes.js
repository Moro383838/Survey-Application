const express = require("express");
const router = express.Router();
const {
  getAvailableSurveysCtrl,
  submitResponseCtrl,
  getSurveyProfileCtrl,
  getSchoolResponse,
} = require("../Controllers/ResponseController");
const { verifyToken, verifyTokenAndAdminOrAnalyzer } = require("../middleware/verifyToken");
//get available survies for school/s
router.get("/available", verifyToken, getAvailableSurveysCtrl);
router.get("/profile/:surveyId", verifyToken, getSurveyProfileCtrl);
//submit response
router.post("/submit/:surveyId", verifyToken, submitResponseCtrl);


// رابط جديد لعرض إجابة مدرسة محددة
router.get('/survey/:id/school/:schoolId', verifyTokenAndAdminOrAnalyzer, getSchoolResponse);

module.exports = router;
