const AppDataSource = require("../config/data-source");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const userRepository = AppDataSource.getRepository(User);

const sanitizeUser = (user) => {
  if (!user) return user;

  const { password, ...safeUser } = user;
  return safeUser;
};

const login = async (document, password) => {
  if (document == undefined || password == undefined) {
    return {
      code: 400,
      message: `El documento y contraseña son requeridos`,
    };
  }

  const user = await userRepository.findOne({
    where: { document },
  });

  if (!user) {
    return {
      code: 404,
      message: `Usuario no encontrado`,
    };
  }

  if (user.password != password) {
    return {
      code: 404,
      message: `La contraseña no es correcta`,
    };
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );

  return {
    code: 200,
    message: `Inicio sactisfactorio`,
    token,
    user: sanitizeUser(user),
  };
};

const addUser = async (name, lastname, document, password, role) => {
  let user;

  const allowedRoles = ["ADMIN", "DOCENTE", "ESTUDIANTE"];
  const nextRole = role ?? "ESTUDIANTE";

  if (!allowedRoles.includes(nextRole)) {
    return {
      code: 400,
      message: "Rol inválido",
    };
  }

  try {
    user = await userRepository.save({
      name: name,
      lastname: lastname,
      document: document,
      password: password,
      role: nextRole,
    });
  } catch (err) {
    return {
      code: 400,
      message: err.message
    }
  }

  return {
    code: 200,
    message: `Usuario creado correctamente`,
    user: sanitizeUser(user),
  };
};

const setupAdmin = async (name, lastname, document, password) => {
  const count = await userRepository.count();

  if (count > 0) {
    return {
      code: 409,
      message: "El sistema ya fue inicializado",
    };
  }

  return addUser(name, lastname, document, password, "ADMIN");
};

module.exports = {
  login,
  addUser,
  setupAdmin,
};
