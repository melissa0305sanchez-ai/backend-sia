const AppDataSource = require("../config/data-source");
const User = require("../models/user.model");

const userRepository = AppDataSource.getRepository(User);

const sanitizeUser = (user) => {
  if (!user) return user;

  const { password, ...safeUser } = user;
  return safeUser;
};

const listUsers = async () => {
  const users = await userRepository.find({ order: { id: "DESC" } });
  return {
    code: 200,
    message: "Listado de usuarios",
    users: users.map(sanitizeUser),
  };
};

const createUser = async (name, lastname, document, password, role) => {
  if (!name || !lastname || !document || !password) {
    return {
      code: 400,
      message: "Name, lastname, document y password son requeridos",
    };
  }

  const allowedRoles = ["ADMIN", "DOCENTE", "ESTUDIANTE"];
  const nextRole = role ?? "ESTUDIANTE";

  if (!allowedRoles.includes(nextRole)) {
    return {
      code: 400,
      message: "Rol inválido",
    };
  }

  try {
    const user = await userRepository.save({
      name,
      lastname,
      document,
      password,
      role: nextRole,
    });

    return {
      code: 201,
      message: "Usuario creado correctamente",
      user: sanitizeUser(user),
    };
  } catch (err) {
    const rawMessage = err?.message ?? "Error creando usuario";

    if (rawMessage.includes("UNIQUE") || rawMessage.includes("unique")) {
      return {
        code: 409,
        message: "Ya existe un usuario con ese documento",
      };
    }

    return {
      code: 400,
      message: rawMessage,
    };
  }
};

const deleteUser = async (id) => {
  if (!id) {
    return {
      code: 400,
      message: "Id requerido",
    };
  }

  const found = await userRepository.findOne({ where: { id: Number(id) } });

  if (!found) {
    return {
      code: 404,
      message: "Usuario no encontrado",
    };
  }

  await userRepository.delete({ id: Number(id) });

  return {
    code: 200,
    message: "Usuario eliminado correctamente",
  };
};

const updateUser = async (id, payload) => {
  if (!id) {
    return {
      code: 400,
      message: "Id requerido",
    };
  }

  const found = await userRepository.findOne({ where: { id: Number(id) } });

  if (!found) {
    return {
      code: 404,
      message: "Usuario no encontrado",
    };
  }

  const allowedRoles = ["ADMIN", "DOCENTE", "ESTUDIANTE"];
  const nextRole = payload?.role ?? found.role;

  if (payload?.role && !allowedRoles.includes(nextRole)) {
    return {
      code: 400,
      message: "Rol inválido",
    };
  }

  const next = {
    id: found.id,
    name: payload?.name ?? found.name,
    lastname: payload?.lastname ?? found.lastname,
    document: payload?.document ?? found.document,
    password: payload?.password ? payload.password : found.password,
    role: nextRole,
  };

  try {
    const saved = await userRepository.save(next);
    return {
      code: 200,
      message: "Usuario actualizado correctamente",
      user: sanitizeUser(saved),
    };
  } catch (err) {
    const rawMessage = err?.message ?? "Error actualizando usuario";

    if (rawMessage.includes("UNIQUE") || rawMessage.includes("unique")) {
      return {
        code: 409,
        message: "Ya existe un usuario con ese documento",
      };
    }

    return {
      code: 400,
      message: rawMessage,
    };
  }
};

module.exports = {
  listUsers,
  createUser,
  deleteUser,
  updateUser,
};
