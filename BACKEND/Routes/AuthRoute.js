const router = require("express").Router();
const { loginCtrl } = require("../Controllers/AuthControllers");

router.route("/login").post(loginCtrl);

module.exports = router;
