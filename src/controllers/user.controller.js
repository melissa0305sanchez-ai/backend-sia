const userService = require("../services/user.service");

const list = async (req, res) => {
  const result = await userService.listUsers();
  res.status(result.code).json(result);
};

const create = async (req, res) => {
  const { name, lastname, document, password, role } = req.body;
  const result = await userService.createUser(name, lastname, document, password, role);
  res.status(result.code).json(result);
};

const remove = async (req, res) => {
  const { id } = req.params;
  const result = await userService.deleteUser(id);
  res.status(result.code).json(result);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { name, lastname, document, password, role } = req.body;
  const result = await userService.updateUser(id, { name, lastname, document, password, role });
  res.status(result.code).json(result);
};

module.exports = {
  list,
  create,
  remove,
  update,
};
