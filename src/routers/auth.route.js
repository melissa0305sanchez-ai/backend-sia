const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller")
const { authenticate, authorizeRoles } = require("../middlewares/auth.middleware");

router.post('/login',authController.login)

router.post('/setup-admin',authController.setupAdmin)

router.post('/add-user',authenticate, authorizeRoles('ADMIN'), authController.addUser)

module.exports = router;