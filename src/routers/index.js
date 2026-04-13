const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.route");
const userRoutes = require("./user.route");
const groupRoutes = require("./group.route");
const subjectRoutes = require("./subject.route");
const reportRoutes = require("./report.route");
const gradeRoutes = require("./grade.route");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/groups", groupRoutes);
router.use("/subjects", subjectRoutes);
router.use("/reports", reportRoutes);
router.use("/grades", gradeRoutes);

module.exports = router;