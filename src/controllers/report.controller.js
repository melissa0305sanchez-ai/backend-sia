const reportService = require("../services/report.service");

const groupGradesPdf = async (req, res) => {
  const { groupId } = req.params;

  const result = await reportService.buildGroupGradesPdf({
    groupId,
    requester: req.user,
  });

  if (result.code !== 200) {
    return res.status(result.code).json(result);
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=grupo-${groupId}-reporte.pdf`);

  result.doc.pipe(res);
  result.doc.end();
};

module.exports = {
  groupGradesPdf,
};
