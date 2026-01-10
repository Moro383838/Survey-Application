const {
  getAllSchools,
  createSchool,
  getSchoolById,
  updateSchool,
  deleteSchool,
  getSchoolStats,
} = require("../Controllers/SchoolController");
const { verifyTokenAndAdminOrAnalyzer,verifyTokenAndAdmin } = require("../middleware/verifyToken");

const router = require("express").Router();

//get all schools only admin
router
  .route("/")
  .get(verifyTokenAndAdminOrAnalyzer, getAllSchools)
  //create school only admin
  .post(verifyTokenAndAdmin, createSchool);

//get school by id only admin
router
  .route("/:id")
  .get(verifyTokenAndAdminOrAnalyzer, getSchoolById)
  //update school only admin
  .put(verifyTokenAndAdmin, updateSchool)
  //delete school only admin
  .delete(verifyTokenAndAdmin, deleteSchool);
//get school stats only admin
router.get("/analytics/stats", verifyTokenAndAdminOrAnalyzer, getSchoolStats);

module.exports = router;
