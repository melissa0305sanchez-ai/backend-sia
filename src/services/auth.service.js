const AppDataSource = require("../config/data-source");
const User = require("../models/user.model");

const userRepository = AppDataSource.getRepository(User);

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

  return {
    code: 200,
    message: `Inicio sactisfactorio`,
    user: user,
  };
};

const addUser = async (name, lastname, document, password) => {
  let user;

  try {
    user = await userRepository.save({
      name: name,
      lastname: lastname,
      document: document,
      password: password,
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
    user: user,
  };
};

module.exports = {
  login,
  addUser,
};
