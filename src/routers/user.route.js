const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

router.get("/", authenticate, authorizeRoles("ADMIN"), userController.list);
router.post("/", authenticate, authorizeRoles("ADMIN"), userController.create);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), userController.update);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), userController.remove);

module.exports = router;
