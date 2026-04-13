const PDFDocument = require("pdfkit");

const AppDataSource = require("../config/data-source");
const Group = require("../models/group.model");
const Subject = require("../models/subject.model");
const Grade = require("../models/grade.model");

const groupRepository = AppDataSource.getRepository(Group);
const subjectRepository = AppDataSource.getRepository(Subject);
const gradeRepository = AppDataSource.getRepository(Grade);

const buildGroupGradesPdf = async ({ groupId, requester }) => {
  const group = await groupRepository.findOne({
    where: { id: Number(groupId) },
    relations: {
      teacher: true,
      students: { student: true },
    },
  });

  if (!group) {
    return {
      code: 404,
      message: "Grupo no encontrado",
    };
  }

  if (requester?.role === "DOCENTE" && requester?.id !== group.teacher?.id) {
    return {
      code: 403,
      message: "No tienes permisos para ver este reporte",
    };
  }

  const subjects = await subjectRepository.find({
    where: { group: { id: group.id } },
    relations: { teacher: true, group: true },
    order: { id: "ASC" },
  });

  const students = (group.students ?? []).map((gs) => gs.student).filter(Boolean);

  const grades = await gradeRepository.find({
    where: { group: { id: group.id } },
    relations: { student: true, subject: true },
    order: { id: "ASC" },
  });

  const subjectIds = subjects.map((s) => s.id);

  const gradeByStudentAndSubject = new Map();
  for (const g of grades) {
    const key = `${g.student?.id}::${g.subject?.id}`;
    gradeByStudentAndSubject.set(key, g.value);
  }

  const doc = new PDFDocument({ margin: 40, size: "A4" });

  doc.fontSize(16).text("Reporte de notas por grupo", { align: "center" });
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .text(`Grupo: ${group.name}`)
    .text(`Docente responsable: ${group.teacher?.name ?? ""} ${group.teacher?.lastname ?? ""}`)
    .text(`Fecha: ${new Date().toLocaleString()}`);

  doc.moveDown(1);

  if (subjects.length === 0) {
    doc.fontSize(12).text("No hay materias registradas para este grupo.");
    return { code: 200, doc };
  }

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const firstColWidth = 190;
  const colWidth = Math.max(60, (pageWidth - firstColWidth) / Math.max(1, subjectIds.length));

  const drawRow = ({ y, values, isHeader }) => {
    let x = doc.page.margins.left;

    doc.font(isHeader ? "Helvetica-Bold" : "Helvetica");

    for (let i = 0; i < values.length; i++) {
      const w = i === 0 ? firstColWidth : colWidth;
      doc.rect(x, y, w, 20).strokeColor("#CBD5E1").stroke();
      doc
        .fillColor("#111827")
        .fontSize(8.8)
        .text(String(values[i] ?? ""), x + 4, y + 6, { width: w - 8, ellipsis: true });
      x += w;
    }

    return y + 20;
  };

  let y = doc.y;

  const header = ["Estudiante", ...subjects.map((s) => s.name)];
  y = drawRow({ y, values: header, isHeader: true });

  for (const st of students) {
    if (y > doc.page.height - doc.page.margins.bottom - 60) {
      doc.addPage();
      y = doc.page.margins.top;
      y = drawRow({ y, values: header, isHeader: true });
    }

    const row = [
      `${st.name ?? ""} ${st.lastname ?? ""} (${st.document ?? ""})`,
      ...subjects.map((s) => {
        const key = `${st.id}::${s.id}`;
        const value = gradeByStudentAndSubject.get(key);
        return value === undefined ? "-" : value;
      }),
    ];

    y = drawRow({ y, values: row, isHeader: false });
  }

  doc.moveDown(1);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#6B7280")
    .text("Nota: si aparece '-', significa que aún no se ha registrado calificación.");

  return { code: 200, doc };
};

module.exports = {
  buildGroupGradesPdf,
};
