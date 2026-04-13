const AppDataSource = require("../config/data-source");
const Subject = require("../models/subject.model");
const Group = require("../models/group.model");
const User = require("../models/user.model");

const subjectRepository = AppDataSource.getRepository(Subject);
const groupRepository = AppDataSource.getRepository(Group);
const userRepository = AppDataSource.getRepository(User);

const mapSubject = (s) => {
  return {
    id: s.id,
    name: s.name,
    group: s.group
      ? {
          id: s.group.id,
          name: s.group.name,
        }
      : null,
    teacher: s.teacher
      ? {
          id: s.teacher.id,
          name: s.teacher.name,
          lastname: s.teacher.lastname,
          document: s.teacher.document,
          role: s.teacher.role,
        }
      : null,
  };
};

const listSubjects = async (requester) => {
  const where =
    requester?.role === "DOCENTE"
      ? {
          teacher: { id: Number(requester.id) },
        }
      : undefined;

  const subjects = await subjectRepository.find({
    where,
    order: { id: "DESC" },
    relations: {
      group: true,
      teacher: true,
    },
  });

  return {
    code: 200,
    message: "Listado de materias",
    subjects: subjects.map(mapSubject),
  };
};

const createSubject = async (name, groupId, teacherId) => {
  if (!name || !groupId || !teacherId) {
    return {
      code: 400,
      message: "Name, groupId y teacherId son requeridos",
    };
  }

  const group = await groupRepository.findOne({ where: { id: Number(groupId) } });
  if (!group) {
    return {
      code: 404,
      message: "Grupo no encontrado",
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

  const saved = await subjectRepository.save({
    name,
    group,
    teacher,
  });

  const full = await subjectRepository.findOne({
    where: { id: saved.id },
    relations: { group: true, teacher: true },
  });

  return {
    code: 201,
    message: "Materia creada correctamente",
    subject: mapSubject(full),
  };
};

const updateSubject = async (id, { name, groupId, teacherId }) => {
  if (!id) {
    return {
      code: 400,
      message: "Id requerido",
    };
  }

  const found = await subjectRepository.findOne({
    where: { id: Number(id) },
    relations: { group: true, teacher: true },
  });

  if (!found) {
    return {
      code: 404,
      message: "Materia no encontrada",
    };
  }

  if (name) found.name = name;

  if (groupId) {
    const group = await groupRepository.findOne({ where: { id: Number(groupId) } });
    if (!group) {
      return {
        code: 404,
        message: "Grupo no encontrado",
      };
    }
    found.group = group;
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

  await subjectRepository.save(found);

  const full = await subjectRepository.findOne({
    where: { id: found.id },
    relations: { group: true, teacher: true },
  });

  return {
    code: 200,
    message: "Materia actualizada correctamente",
    subject: mapSubject(full),
  };
};

const deleteSubject = async (id) => {
  if (!id) {
    return {
      code: 400,
      message: "Id requerido",
    };
  }

  const found = await subjectRepository.findOne({ where: { id: Number(id) } });
  if (!found) {
    return {
      code: 404,
      message: "Materia no encontrada",
    };
  }

  await subjectRepository.delete({ id: Number(id) });

  return {
    code: 200,
    message: "Materia eliminada correctamente",
  };
};

module.exports = {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
