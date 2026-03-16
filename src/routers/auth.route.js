const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller")

router.post('/login',authController.login)

router.post('/add-user',authController.addUser)

module.exports = router;