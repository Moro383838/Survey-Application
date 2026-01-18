const { sequelize } = require("../Config/DB");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { ValidateLogin } = require("../Validator.js/Validators");
const { QueryTypes } = require('sequelize');
/**
 * @access public
 * @route auth/login
 */
exports.loginCtrl = asyncHandler(async (req, res) => {
  const { error } = ValidateLogin(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  const { username, password } = req.body;

  // 1. استدعاء الدالة
  const result = await sequelize.query(
    `SELECT * FROM fn_get_user_for_login($1)`,
    { bind: [username], type: QueryTypes.SELECT }
  );

  if (result.length === 0) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

  const user = result[0];

  // 2. التحقق من الباسورد
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });


  const tokenPayload = {
    id: user.id,
    username: user.username,
    role: user.role_name,
    roleId: user.role_id,
    schools: user.schools
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1m' });
  res.json({
    message: "تم تسجيل الدخول بنجاح",
    token,
    user: tokenPayload
  });
});
