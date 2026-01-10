const { sequelize } = require("../Config/DB.js");
const { QueryTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const asynchandler = require("express-async-handler");
const {
  ValidateCreateUser,
  ValidateUpdateUser,

} = require("../Validator.js/Validators");
//create user

module.exports.createUser = asynchandler(async (req, res) => {
  const { error } = ValidateCreateUser(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { username, password, roleId, schoolIds } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await sequelize.query(
      `SELECT fn_create_user($1, $2, $3::int, $4::int[]) as new_user_id`,
      {
        bind: [username, hashedPassword, roleId, schoolIds || null],
        type: QueryTypes.SELECT
      }
    );
    res.status(201).json({ message: "User created", userId: result[0].new_user_id });
  } catch (err) {
    res.status(500).json({ error: err.original?.message || err.message });
  }
});
//update user by id
module.exports.updateUserCtrl = asynchandler(async (req, res) => {
  const { error } = ValidateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { id } = req.params;
  const { username, roleId, schoolIds } = req.body;
  try {
    await sequelize.query(
      `SELECT fn_update_user(
                $1::int, 
                $2, 
                $3, 
                $4::int[]
            )`,
      {
        bind: [
          id,
          username || null,
          roleId  || null,
          schoolIds !== undefined ? schoolIds : null,
        ],
        type: QueryTypes.SELECT,
      }
    );
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(400).json({ error: err.original?.message || err.message });
  }
});
// get all user only admin
module.exports.getAllUsersCtrl = asynchandler(async (req, res) => {
  const { role } = req.query;

  try {
    const users = await sequelize.query(`SELECT * FROM fn_get_all_users($1)`, {
      bind: [role || null],
      type: QueryTypes.SELECT,
    });

    res.status(200).json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//delete user only admin
exports.deleteUserCtrl = asynchandler(async (req, res) => {
  try {
    await sequelize.query(`SELECT fn_delete_user($1::int)`, {
      bind: [req.params.id],
      type: QueryTypes.SELECT,
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    if (error.original?.code === "23503") {
      return res
        .status(400)
        .json({ error: "User is belong to survey please remove it first" });
    } else return res.status(404).json({ error: "User not found", error });
  }
});

//get user stats only admin
/**
 * @desc    Get User Statistics (Dashboard)
 * @route   GET /api/users/analytics/stats
 * @access  Private (Admin)
 */
exports.getUserStatsCtrl = asynchandler(async (req, res) => {
  try {
    const result = await sequelize.query(
      `SELECT fn_get_user_statistics() as stats`,
      { type: QueryTypes.SELECT }
    );

      // النتيجة تكون داخل العمود stats أو مباشرة
      if (result && result[0]) {
        let stats = result[0];
        
        // إذا كان هناك عمود stats، استخدمه
        if (stats.stats) {
          stats = typeof stats.stats === 'string' 
            ? JSON.parse(stats.stats) 
            : stats.stats;
        }
        
        // إذا كان هناك عمود fn_get_user_statistics، استخدمه
        if (stats.fn_get_user_statistics) {
          stats = typeof stats.fn_get_user_statistics === 'string'
            ? JSON.parse(stats.fn_get_user_statistics)
            : stats.fn_get_user_statistics;
        }
        
        res.status(200).json(stats);
      } else {
        res.status(200).json({
          total_users: 0,
          roles_distribution: {},
          users_without_schools: 0,
          generated_at: new Date().toISOString()
        });
      }

  } catch (err) {
    console.error('Error in getUserStatsCtrl:', err);
    res.status(500).json({ error: err.original?.message || err.message });
  }
});
//get user datails (aurhorized iser)
module.exports.getUserDetails = asynchandler(async (req, res) => {
  const result = await sequelize.query(
    `SELECT * FROM fn_get_user_details($1::int)`,
    {
      bind: [req.user.id],
      type: QueryTypes.SELECT,
    }
  );

  if (result.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(result[0]);
});

module.exports.getUserByIdCtrl = asynchandler(async (req, res) => {
  const result = await sequelize.query(
    `SELECT * FROM fn_get_user_details($1::int)`,
    {
      bind: [req.params.id],
      type: QueryTypes.SELECT,
    }
  );

  if (result.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(result[0]);
});
