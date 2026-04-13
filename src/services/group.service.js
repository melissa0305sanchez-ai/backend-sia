const AppDataSource = require("../config/data-source");
const Group = require("../models/group.model");
const GroupStudent = require("../models/group-student.model");
const User = require("../models/user.model");

const groupRepository = AppDataSource.getRepository(Group);
const groupStudentRepository = AppDataSource.getRepository(GroupStudent);
const userRepository = AppDataSource.getRepository(User);

const mapGroup = (g) => {
  return {
    id: g.id,
    name: g.name,
    teacher: g.teacher
      ? {
          id: g.teacher.id,
          name: g.teacher.name,
          lastname: g.teacher.lastname,
          document: g.teacher.document,
          role: g.teacher.role,
        }
      : null,
    students: Array.isArray(g.students)
      ? g.students
          .map((gs) => gs.student)
          .filter(Boolean)
          .map((s) => ({
            id: s.id,
            name: s.name,
            lastname: s.lastname,
            document: s.document,
            role: s.role,
          }))
      : [],
  };
};

const listGroups = async (requester) => {
  const where =
    requester?.role === "DOCENTE"
      ? {
          teacher: { id: Number(requester.id) },
        }
      : undefined;

  const groups = await groupRepository.find({
    where,
    order: { id: "DESC" },
    relations: {
      teacher: true,
      students: { student: true },
    },
  });

  return {
    code: 200,
    message: "Listado de grupos",
    groups: groups.map(mapGroup),
  };
};

const createGroup = async (name, teacherId, studentIds) => {
  if (!name || !teacherId) {
    return {
      code: 400,
      message: "Name y teacherId son requeridos",
    };
  }

  const teacher = await userRepository.findOne({ where: { id: Number(teacherId) } });

  if (!teacher) {
    return {
      code: 404,
      message: "Docente no encontrado",
    };
  }

  if (teacher.role !== "DOCENTE") {
    return {
      code: 400,
      message: "El usuario asignado como docente debe tener rol DOCENTE",
    };
  }

  const group = await groupRepository.save({
    name,
    teacher,
  });

  const ids = Array.isArray(studentIds) ? studentIds : [];

  for (const sid of ids) {
    const student = await userRepository.findOne({ where: { id: Number(sid) } });

    if (!student) {
      return {
        code: 404,
        message: `Estudiante no encontrado (id: ${sid})`,
      };
    }

    if (student.role !== "ESTUDIANTE") {
      return {
        code: 400,
        message: "Los estudiantes deben tener rol ESTUDIANTE",
      };
    }

    await groupStudentRepository.save({
      group,
      student,
    });
  }

  const full = await groupRepository.findOne({
    where: { id: group.id },
    relations: {
      teacher: true,
      students: { student: true },
    },
  });

  return {
    code: 201,
    message: "Grupo creado correctamente",
    group: mapGroup(full),
  };
};

const updateGroup = async (id, { name, teacherId, studentIds }) => {
  if (!id) {
    return {
      code: 400,
      message: "Id requerido",
    };
  }

  const found = await groupRepository.findOne({
    where: { id: Number(id) },
    relations: { teacher: true, students: { student: true } },
  });

  if (!found) {
    return {
      code: 404,
      message: "Grupo no encontrado",
    };
  }

  if (teacherId) {
    const teacher = await userRepository.findOne({ where: { id: Number(teacherId) } });

    if (!teacher) {
      return {
        code: 404,
        message: "Docente no encontrado",
      };
    }

    if (teacher.role !== "DOCENTE") {
      return {
        code: 400,
        message: "El usuario asignado como docente debe tener rol DOCENTE",
      };
    }

    found.teacher = teacher;
  }

  if (name) {
    found.name = name;
  }

  await groupRepository.save(found);

  if (Array.isArray(studentIds)) {
    await groupStudentRepository.delete({ group: { id: found.id } });

    for (const sid of studentIds) {
      const student = await userRepository.findOne({ where: { id: Number(sid) } });

      if (!student) {
        return {
          code: 404,
          message: `Estudiante no encontrado (id: ${sid})`,
        };
      }

      if (student.role !== "ESTUDIANTE") {
        return {
          code: 400,
          message: "Los estudiantes deben tener rol ESTUDIANTE",
        };
      }

      await groupStudentRepository.save({
        group: found,
        student,
      });
    }
  }

  const full = await groupRepository.findOne({
    where: { id: found.id },
    relations: {
      teacher: true,
      students: { student: true },
    },
  });

  return {
    code: 200,
    message: "Grupo actualizado correctamente",
    group: mapGroup(full),
  };
};

const deleteGroup = async (id) => {
  if (!id) {
    return {
      code: 400,
      message: "Id requerido",
    };
  }

  const found = await groupRepository.findOne({ where: { id: Number(id) } });

  if (!found) {
    return {
      code: 404,
      message: "Grupo no encontrado",
    };
  }

  await groupRepository.delete({ id: Number(id) });

  return {
    code: 200,
    message: "Grupo eliminado correctamente",
  };
};

module.exports = {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
};
