const asyncHandler = require("express-async-handler");
const { sequelize } = require("../Config/DB");
const { QueryTypes } = require("sequelize");
const Joi = require("joi");
const {
  ValidateCreateSchool,
  ValidateUpdateSchool,
} = require("../Validator.js/Validators");

// create school function

module.exports.createSchool = asyncHandler(async (req, res) => {
  const { error } = ValidateCreateSchool(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name, code, region, directorateId, complexId } = req.body;

  try {
    const result = await sequelize.query(
      `SELECT fn_create_school($1, $2, $3, $4::int, $5::int) as new_id`,
      {
        bind: [name, code, region, directorateId, complexId || null],
        type: QueryTypes.SELECT
      }
    );
    res.status(201).json({ message: "School created", schoolId: result[0].new_id });
  } catch (err) {
    res.status(500).json({ error: err.original?.message || err.message });
  }
});

module.exports.getAllSchools = asyncHandler(async (req, res) => {
  const schools = await sequelize.query('SELECT * FROM fn_get_all_schools()', { type: QueryTypes.SELECT });
  res.status(200).json(schools);
});

// get school by id
exports.getSchoolById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await sequelize.query(
    `SELECT * FROM fn_get_school_by_id($1::int)`,
    {
      bind: [id],
      type: QueryTypes.SELECT,
    }
  );

  if (result.length === 0) {
    return res.status(404).json({ message: "School not found" });
  }
  res.status(200).json(result[0]);
});

// update school
module.exports.updateSchool = asyncHandler(async (req, res) => {
  const { error } = ValidateUpdateSchool(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { id } = req.params;
  const { name, code, region } = req.body;

  try {
    await sequelize.query(`SELECT fn_update_school($1::int, $2, $3, $4)`, {
      bind: [id, name || null, code || null, region || null],
      type: QueryTypes.SELECT,
    });
    res.status(200).json({ message: "School updated successfully" });
  } catch (err) {
    if (err.original?.message === "المدرسة غير موجودة") {
      return res.status(404).json({ error: "School not found" });
    }
    if (err.original?.code === "23505") {
      return res.status(400).json({ error: "School code already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// delete school
module.exports.deleteSchool = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await sequelize.query(`SELECT fn_delete_school($1::int)`, {
      bind: [id],
      type: QueryTypes.SELECT,
    });
    res.status(200).json({ message: "School deleted successfully" });
  } catch (err) {
    if (err.original?.message === "المدرسة غير موجودة") {
      return res.status(404).json({ error: "School not found" });
    }
    if (err.original?.code === "23503") {
      return res
        .status(400)
        .json({ error: "Cannot delete school because it has related data" });
    }
    res.status(500).json({ error: err.message });
  }
});

// get school stats
module.exports.getSchoolStats = asyncHandler(async (req, res) => {
  try {
    const result = await sequelize.query(`select (fn_get_school_statistics())`, {
      type: QueryTypes.SELECT,
    });
    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});
