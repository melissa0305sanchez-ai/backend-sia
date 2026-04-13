const groupService = require("../services/group.service");

const list = async (req, res) => {
  const result = await groupService.listGroups(req.user);
  res.status(result.code).json(result);
};

const create = async (req, res) => {
  const { name, teacherId, studentIds } = req.body;
  const result = await groupService.createGroup(name, teacherId, studentIds);
  res.status(result.code).json(result);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, teacherId, studentIds } = req.body;
  const result = await groupService.updateGroup(id, { name, teacherId, studentIds });
  res.status(result.code).json(result);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const result = await groupService.deleteGroup(id);
  res.status(result.code).json(result);
};

module.exports = {
  list,
  create,
  update,
  remove,
};
