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
    // 1. Get base stats from the existing function
    const statsResult = await sequelize.query(
      `SELECT * From fn_get_school_statistics() as stats`,
      { type: QueryTypes.SELECT }
    );

    let baseStats = statsResult[0]?.stats || {};
    if (typeof baseStats === 'string') {
      try {
        baseStats = JSON.parse(baseStats);
      } catch (e) {
        baseStats = {};
      }
    }

    // 2. Fetch schools, directorates and complexes for more accurate and structured data
    const [schools, directorates] = await Promise.all([
      sequelize.query('SELECT * FROM fn_get_all_schools()', { type: QueryTypes.SELECT }),
      sequelize.query('SELECT * FROM fn_get_directorates()', { type: QueryTypes.SELECT })
    ]);

    // 3. Fetch all complexes by iterating through directorates
    let allComplexes = [];
    for (const dir of directorates) {
      try {
        const complexes = await sequelize.query('SELECT * FROM fn_get_complexes($1)', {
          bind: [dir.id], type: QueryTypes.SELECT
        });
        allComplexes = allComplexes.concat(complexes);
      } catch (e) {
        console.error(`Error fetching complexes for directorate ${dir.id}:`, e);
      }
    }

    const total_schools = schools.length || baseStats.total_schools || 0;
    const total_directorates = directorates.length || 0;
    const total_complexes = allComplexes.length || 0;
    const empty_schools_count = baseStats.empty_schools_count || 0;

    // 4. Calculate distributions
    // Directorates distribution
    const directorates_distribution = {};
    directorates.forEach(dir => {
      const count = schools.filter(s => s.directorate_id === dir.id || s.directorateId === dir.id).length;
      if (count > 0) {
        directorates_distribution[dir.name] = count;
      }
    });

    // Complexes distribution
    const complexes_distribution = allComplexes.map(comp => {
      const count = schools.filter(s => s.complex_id === comp.id || s.complexId === comp.id).length;
      return {
        name: comp.name,
        count: count
      };
    });

    // Add schools without a complex if any
    const schoolsWithoutComplex = schools.filter(s => !s.complex_id && !s.complexId).length;
    if (schoolsWithoutComplex > 0) {
      complexes_distribution.push({
        name: 'غير محدد',
        count: schoolsWithoutComplex
      });
    }

    // 5. Build final response structure as requested by the user
    const responseData = {
      cards: {
        total_schools: total_schools,
        total_directorates: total_directorates,
        total_complexes: total_complexes,
        empty_schools_count: empty_schools_count,
        avg_schools_per_complex: total_complexes > 0 ? parseFloat((total_schools / total_complexes).toFixed(1)) : 0
      },
      charts: {
        directorates_distribution: Object.keys(directorates_distribution).length > 0
          ? directorates_distribution
          : (baseStats.directorates_distribution || {}),
        complexes_distribution: complexes_distribution
      },
      generated_at: new Date().toISOString()
    };

    res.status(200).json(responseData);
  } catch (err) {
    console.error('❌ Error in getSchoolStats:', err);
    res.status(500).json({ error: err.message });
  }
});
