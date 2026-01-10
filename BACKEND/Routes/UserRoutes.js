const router = require("express").Router();
const {
  verifyToken,
  verifyTokenAndAdmin,verifyTokenAndAdminOrAnalyzer
} = require("../middleware/verifyToken");
const {
  UserStatsCtrl,
  createUser,
  updateUserCtrl,
  getUserDetails,
  deleteUserCtrl,
  getAllUsersCtrl,
  getUserByIdCtrl,
  getUserStatsCtrl,

} = require("../Controllers/UserController");
//create user only admin
router
  .route("/")
  .post(verifyTokenAndAdmin, createUser)
  .get(verifyTokenAndAdminOrAnalyzer, getAllUsersCtrl);
//get user details only authorized
router.get("/analytics/stats", verifyTokenAndAdminOrAnalyzer, getUserStatsCtrl);
router.get("/profile", verifyToken, getUserDetails);
//update user only admin
router
  .route("/:id")
  .put(verifyTokenAndAdmin, updateUserCtrl)
  .delete(verifyTokenAndAdmin, deleteUserCtrl)
  .get(verifyTokenAndAdminOrAnalyzer, getUserByIdCtrl);
//get user stats only admin
module.exports = router;
