const express = require("express")
const router = express.Router()

const ieController = require("../clients/ie/ieController.js")
const authMiddleware = require("../clients/auth/authMiddleware.js")  // Middleware de autenticação

router.post("/login", ieController.login)  // Login - Aluno
router.post("/register", ieController.register)  // Registro - Aluno
router.post("/confirm-email", ieController.confirmEmail); // Confirmação de e-mail - Aluno
router.put('/update', authMiddleware, ieController.update);  // Update - Aluno
router.post("/forgot-pass", ieController.forgotPass)  // Esqueci senha - Aluno
router.post("/reset-pass", ieController.resetPass)  // Resetar senha - Aluno


module.exports = router
