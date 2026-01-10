const joi = require("joi");
//validate create user only admin
function ValidateCreateUser(obj) {
  return joi.object({
    username: joi.string().min(3).required(),
    password: joi.string().min(6).required(),
    roleId: joi.number().integer().required(),
    schoolIds: joi.array().items(joi.number()).optional()
  }).validate(obj);
}
//validate login
function ValidateLogin(obj) {
  const schema = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
  });
  return schema.validate(obj);
}
//validate update user only admin
function ValidateUpdateUser(obj) {
  const schema = joi.object({
    username: joi.string().min(3).max(100),
    roleId: joi.number().min(1).max(3),
    schoolIds: joi.array().items(joi.number().integer()).allow(null),
  });
  return schema.validate(obj);
}
//validate create school
function ValidateCreateSchool(obj) {
  const schema = joi.object({
    name: joi.string().min(3).required(),
    code: joi.string().required(),
    region: joi.string().optional(),
    directorateId: joi.number().integer().required(),
    complexId: joi.number().integer()
  })
  return schema.validate(obj);
}
//validate update schools
function ValidateUpdateSchool(obj) {
  const schema = joi.object({
    name: joi.string().min(3),
    code: joi.string(),
    region: joi.string(),
  })
  return schema.validate(obj);
}

//validate create survey
function ValidateCreateSurvey(obj) {
  return joi.object({
    title: joi.string().min(5).required(),
    description: joi.string().optional().allow(''),
    isPeriodic: joi.boolean().default(false),
    startDate: joi.date().iso().allow(null),
    endDate: joi.date().iso().allow(null),
    frequencyId: joi.number().integer().allow(null)
  }).validate(obj);
}
// Validation Update
function ValidateUpdateSurvey(obj) {
  return joi.object({
    title: joi.string().min(5).optional(),
    description: joi.string().optional().allow(''),
    isPeriodic: joi.boolean().optional(),
    startDate: joi.date().iso().optional().allow(null),
    endDate: joi.date().iso().optional().allow(null),
    frequencyId: joi.number().integer().optional().allow(null)
  }).validate(obj);
}
// validate question
function ValidateAddQuestion(obj) {
  return joi.object({
    text: joi.string().required(),
    typeId: joi.number().integer().required(),
    isRequired: joi.boolean(),
    options: joi.array().items(joi.string()).optional(),
    order: joi.number().integer().default(0),
    logic: joi.object().optional().allow(null)
  }).validate(obj);
}
function ValidateSetTargets(obj) {
  return joi.object({
    schoolIds: joi.array().items(joi.number().integer()).optional(),
    directorateIds: joi.array().items(joi.number().integer()).optional(),
    complexIds: joi.array().items(joi.number().integer()).optional()
  })
    .min(1)
    .validate(obj);
}
function ValidateSubmitResponse(obj) {
  return joi
    .object({
      schoolId: joi.number().integer().required(),
      submittedBy: joi.number().integer().optional(),
      answers: joi
        .array()
        .items(
          joi.object({
            questionId: joi.number().integer().required(),
            value: joi.string().required().allow(""),
          })
        )
        .min(1)
        .required(),
    })
    .validate(obj);
}

module.exports = {
  ValidateCreateUser,
  ValidateSubmitResponse,
  ValidateSetTargets,
  ValidateUpdateUser,
  ValidateLogin,
  ValidateAddQuestion,
  ValidateCreateSchool,
  ValidateUpdateSchool,
  ValidateCreateSurvey,
  ValidateUpdateSurvey
};
