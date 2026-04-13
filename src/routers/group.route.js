const express = require("express");
const router = express.Router();

const groupController = require("../controllers/group.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorizeRoles("ADMIN", "DOCENTE"), groupController.list);
router.post("/", authenticate, authorizeRoles("ADMIN"), groupController.create);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), groupController.update);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), groupController.remove);

module.exports = router;
