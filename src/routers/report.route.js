const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

router.get(
  "/groups/:groupId/pdf",
  authenticate,
  authorizeRoles("ADMIN", "DOCENTE"),
  reportController.groupGradesPdf
);

module.exports = router;
