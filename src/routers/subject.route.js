const express = require("express");
const router = express.Router();

const subjectController = require("../controllers/subject.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorizeRoles("ADMIN", "DOCENTE"), subjectController.list);
router.post("/", authenticate, authorizeRoles("ADMIN"), subjectController.create);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), subjectController.update);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), subjectController.remove);

module.exports = router;
