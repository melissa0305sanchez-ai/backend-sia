const express = require("express");
const router = express.Router();

const gradeController = require("../controllers/grade.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorizeRoles("ADMIN", "DOCENTE"), gradeController.list);
router.get("/my", authenticate, authorizeRoles("ESTUDIANTE"), gradeController.myGrades);
router.post("/upsert", authenticate, authorizeRoles("ADMIN", "DOCENTE"), gradeController.upsert);

module.exports = router;
