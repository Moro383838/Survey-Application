const express = require("express");
const router = express.Router();
const {
  createSurveyCrlt,
  addQuestionCtrl,
  deleteQuestion,
  setTargetsCtrl,
  publishSurveyCtrl,
  getAllSurveysAdmin,
  CloseSurveyCtrl,
  updateSurveyCtrl,
  deleteSurvey,
  getSurveyDetailsCtrl,
  UnpublishSurveyCtrl,
  editQuestion,
} = require("../Controllers/SurveyController");
const { verifyTokenAndAdmin, verifyTokenAndAdminOrAnalyzer } = require("../middleware/verifyToken");

// 1. العمليات الأساسية (CRUD)
router.route("/")
  .post(verifyTokenAndAdmin, createSurveyCrlt) // إنشاء
  .get(verifyTokenAndAdmin, getAllSurveysAdmin); // جلب الكل

router.route("/:id")
  .get(verifyTokenAndAdmin, getSurveyDetailsCtrl) // جلب تفاصيل واحد
  .put(verifyTokenAndAdmin, updateSurveyCtrl)     // تعديل
  .delete(verifyTokenAndAdmin, deleteSurvey);     // حذف

// 2. إدارة الأسئلة
router.post("/:id/questions", verifyTokenAndAdmin, addQuestionCtrl);
router.delete("/questions/:questionId", verifyTokenAndAdmin, deleteQuestion);
router.put("/questions/:questionId", verifyTokenAndAdmin, editQuestion);

// 3. الاستهداف والنشر والإغلاق
router.post("/:id/targets", verifyTokenAndAdmin, setTargetsCtrl);
router.post("/:id/publish", verifyTokenAndAdmin, publishSurveyCtrl);
router.post("/:id/unpublish", verifyTokenAndAdmin, UnpublishSurveyCtrl);
router.post("/:id/close", verifyTokenAndAdmin, CloseSurveyCtrl);

module.exports = router;