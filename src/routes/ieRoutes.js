const express = require("express")
const router = express.Router()

const ieController = require("../clients/ie/ieController.js")
const authMiddleware = require("../clients/auth/authMiddleware.js")  // Middleware de autenticação

router.post("/login", ieController.login)  // Login - IE
router.get("/list", ieController.listActive)  // Listar IEs ativos
router.post("/register", ieController.register)  // Registro - IE
router.post("/confirm-email", ieController.confirmEmail); // Confirmação de e-mail - IE
router.put('/update/:id', authMiddleware, ieController.update);  // Update - IE
router.post("/forgot-pass", ieController.forgotPass)  // Esqueci senha - IE
router.post("/reset-pass", ieController.resetPass)  // Resetar senha - IE

module.exports = router
