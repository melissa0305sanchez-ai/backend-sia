const subjectService = require("../services/subject.service");

const list = async (req, res) => {
  const result = await subjectService.listSubjects(req.user);
  res.status(result.code).json(result);
};

const create = async (req, res) => {
  const { name, groupId, teacherId } = req.body;
  const result = await subjectService.createSubject(name, groupId, teacherId);
  res.status(result.code).json(result);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, groupId, teacherId } = req.body;
  const result = await subjectService.updateSubject(id, { name, groupId, teacherId });
  res.status(result.code).json(result);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const result = await subjectService.deleteSubject(id);
  res.status(result.code).json(result);
};

module.exports = {
  list,
  create,
  update,
  remove,
};
