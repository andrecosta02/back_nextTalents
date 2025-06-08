const express = require("express")
const router = express.Router()
const authController = require("../auth/authController")
// const verifyJWT = require('../auth/authMiddleware')

router.post("/login", authController.login)     // Login de usuario
router.post("/logout", authController.logout)   // Logout de usuario
// router.post("/protected", verifyJWT, authController.protected)   // Logout de usuario

module.exports = router