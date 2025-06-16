const express = require("express")
const router = express.Router()

const studentController = require("../clients/student/studentController.js")
const authMiddleware = require("../clients/auth/authMiddleware.js")  // Middleware de autenticação

router.post("/login", studentController.login)  // Login - Aluno
router.get("/listFoIe",  authMiddleware, studentController.listForIe)  // Listar alunos ativos
router.get("/listAll",  authMiddleware, studentController.listAll)  // Listar alunos ativos
router.post("/register", authMiddleware, studentController.register)  // Registro - Aluno
router.post("/confirm-email", studentController.confirmEmail); // Confirmação de e-mail - Aluno
router.put('/update/:id', authMiddleware, studentController.update);  // Update - Aluno
router.post("/forgot-pass", studentController.forgotPass)  // Esqueci senha - Aluno
router.post("/reset-pass", studentController.resetPass)  // Resetar senha - Aluno
router.delete("/delete/:id", authMiddleware, studentController.delete)  // Resetar senha - Aluno

module.exports = router