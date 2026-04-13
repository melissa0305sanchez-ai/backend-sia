const AppDataSource = require("../config/data-source");
const Grade = require("../models/grade.model");
const Group = require("../models/group.model");
const Subject = require("../models/subject.model");
const User = require("../models/user.model");

const gradeRepository = AppDataSource.getRepository(Grade);
const groupRepository = AppDataSource.getRepository(Group);
const subjectRepository = AppDataSource.getRepository(Subject);
const userRepository = AppDataSource.getRepository(User);

const canTeachGroup = async (requester, groupId) => {
  if (requester?.role === "ADMIN") return true;
  if (requester?.role !== "DOCENTE") return false;

  const group = await groupRepository.findOne({
    where: { id: Number(groupId) },
    relations: { teacher: true },
  });

  if (!group) return null;
  return group.teacher?.id === Number(requester.id);
};

const canTeachSubject = async (requester, subjectId) => {
  if (requester?.role === "ADMIN") return true;
  if (requester?.role !== "DOCENTE") return false;

  const subject = await subjectRepository.findOne({
    where: { id: Number(subjectId) },
    relations: { teacher: true },
  });

  if (!subject) return null;
  return subject.teacher?.id === Number(requester.id);
};

const listGrades = async ({ requester, groupId, subjectId }) => {
  if (!groupId || !subjectId) {
    return {
      code: 400,
      message: "groupId y subjectId son requeridos",
    };
  }

  const group = await groupRepository.findOne({
    where: { id: Number(groupId) },
    relations: { teacher: true, students: { student: true } },
  });

  if (!group) {
    return { code: 404, message: "Grupo no encontrado" };
  }

  const subject = await subjectRepository.findOne({
    where: { id: Number(subjectId) },
    relations: { teacher: true, group: true },
  });

  if (!subject) {
    return { code: 404, message: "Materia no encontrada" };
  }

  if (subject.group?.id !== group.id) {
    return { code: 400, message: "La materia no pertenece al grupo" };
  }

  const okGroup = await canTeachGroup(requester, group.id);
  if (okGroup === null) return { code: 404, message: "Grupo no encontrado" };
  if (!okGroup) return { code: 403, message: "No tienes permisos para calificar este grupo" };

  const okSubject = await canTeachSubject(requester, subject.id);
  if (okSubject === null) return { code: 404, message: "Materia no encontrada" };
  if (!okSubject) return { code: 403, message: "No tienes permisos para calificar esta materia" };

  const grades = await gradeRepository.find({
    where: {
      group: { id: group.id },
      subject: { id: subject.id },
    },
    relations: { student: true },
    order: { id: "DESC" },
  });

  const gradeByStudentId = new Map();
  for (const g of grades) {
    if (g.student?.id) gradeByStudentId.set(g.student.id, g);
  }

  const students = (group.students ?? []).map((gs) => gs.student).filter(Boolean);

  const rows = students.map((s) => {
    const g = gradeByStudentId.get(s.id);
    return {
      student: {
        id: s.id,
        name: s.name,
        lastname: s.lastname,
        document: s.document,
      },
      grade: g
        ? {
            id: g.id,
            value: g.value,
          }
        : null,
    };
  });

  return {
    code: 200,
    message: "Listado de calificaciones",
    group: { id: group.id, name: group.name },
    subject: { id: subject.id, name: subject.name },
    rows,
  };
};

const upsertGrades = async ({ requester, groupId, subjectId, grades }) => {
  if (!groupId || !subjectId) {
    return {
      code: 400,
      message: "groupId y subjectId son requeridos",
    };
  }

  if (!Array.isArray(grades)) {
    return {
      code: 400,
      message: "grades debe ser un array",
    };
  }

  const group = await groupRepository.findOne({
    where: { id: Number(groupId) },
    relations: { teacher: true, students: { student: true } },
  });

  if (!group) {
    return { code: 404, message: "Grupo no encontrado" };
  }

  const subject = await subjectRepository.findOne({
    where: { id: Number(subjectId) },
    relations: { teacher: true, group: true },
  });

  if (!subject) {
    return { code: 404, message: "Materia no encontrada" };
  }

  if (subject.group?.id !== group.id) {
    return { code: 400, message: "La materia no pertenece al grupo" };
  }

  const okGroup = await canTeachGroup(requester, group.id);
  if (!okGroup) return { code: 403, message: "No tienes permisos para calificar este grupo" };

  const okSubject = await canTeachSubject(requester, subject.id);
  if (!okSubject) return { code: 403, message: "No tienes permisos para calificar esta materia" };

  const studentIdsInGroup = new Set(
    (group.students ?? []).map((gs) => gs.student?.id).filter(Boolean)
  );

  const teacher = await userRepository.findOne({ where: { id: Number(requester.id) } });

  const saved = [];

  for (const item of grades) {
    const studentId = Number(item?.studentId);
    const value = Number(item?.value);

    if (!studentId || Number.isNaN(studentId)) {
      return { code: 400, message: "studentId inválido" };
    }

    if (!studentIdsInGroup.has(studentId)) {
      return { code: 400, message: "El estudiante no pertenece al grupo" };
    }

    if (Number.isNaN(value) || value < 0 || value > 5) {
      return { code: 400, message: "La nota debe estar entre 0 y 5" };
    }

    const student = await userRepository.findOne({ where: { id: studentId } });
    if (!student) {
      return { code: 404, message: "Estudiante no encontrado" };
    }

    const existing = await gradeRepository.findOne({
      where: {
        group: { id: group.id },
        subject: { id: subject.id },
        student: { id: studentId },
      },
    });

    const entity = existing
      ? {
          id: existing.id,
          value,
          group,
          subject,
          student,
          teacher,
        }
      : {
          value,
          group,
          subject,
          student,
          teacher,
        };

    const s = await gradeRepository.save(entity);
    saved.push({ id: s.id, studentId, value: s.value });
  }

  return {
    code: 200,
    message: "Calificaciones guardadas",
    saved,
  };
};

const listMyGrades = async ({ requester }) => {
  if (!requester?.id) {
    return {
      code: 401,
      message: "No autorizado",
    };
  }

  const grades = await gradeRepository.find({
    where: {
      student: { id: Number(requester.id) },
    },
    relations: {
      group: true,
      subject: true,
      teacher: true,
    },
    order: { id: "DESC" },
  });

  const items = grades.map((g) => ({
    id: g.id,
    value: g.value,
    group: g.group ? { id: g.group.id, name: g.group.name } : null,
    subject: g.subject ? { id: g.subject.id, name: g.subject.name } : null,
    teacher: g.teacher
      ? {
          id: g.teacher.id,
          name: g.teacher.name,
          lastname: g.teacher.lastname,
          document: g.teacher.document,
          role: g.teacher.role,
        }
      : null,
    createdAt: g.createdAt,
  }));

  return {
    code: 200,
    message: "Mis calificaciones",
    grades: items,
  };
};

module.exports = {
  listGrades,
  upsertGrades,
  listMyGrades,
};
