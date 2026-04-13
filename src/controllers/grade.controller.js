const gradeService = require("../services/grade.service");

const list = async (req, res) => {
  const { groupId, subjectId } = req.query;
  const result = await gradeService.listGrades({
    requester: req.user,
    groupId,
    subjectId,
  });
  res.status(result.code).json(result);
};

const upsert = async (req, res) => {
  const { groupId, subjectId, grades } = req.body;
  const result = await gradeService.upsertGrades({
    requester: req.user,
    groupId,
    subjectId,
    grades,
  });
  res.status(result.code).json(result);
};

const myGrades = async (req, res) => {
  const result = await gradeService.listMyGrades({ requester: req.user });
  res.status(result.code).json(result);
};

module.exports = {
  list,
  upsert,
  myGrades,
};
