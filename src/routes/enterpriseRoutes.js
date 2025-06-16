const express = require("express")
const router = express.Router()

const enterpriseController = require("../clients/enterprise/enterpriseController.js")
const authMiddleware = require("../clients/auth/authMiddleware.js")  // Middleware de autenticação

router.post("/login", enterpriseController.login)  // Login - Aluno
// router.get("/list",  authMiddleware, enterpriseController.listActive)  // Listar alunos ativos
router.get("/listOne", authMiddleware,  enterpriseController.getOne)  // Listar alunos ativos
router.get("/list",   enterpriseController.listActive)  // Listar alunos ativos
router.post("/register", enterpriseController.register)  // Registro - Aluno
router.post("/confirm-email", enterpriseController.confirmEmail); // Confirmação de e-mail - Aluno
router.put('/update', authMiddleware, enterpriseController.update);  // Update - Aluno
router.post("/forgot-pass", enterpriseController.forgotPass)  // Esqueci senha - Aluno
router.post("/reset-pass", enterpriseController.resetPass)  // Resetar senha - Aluno

module.exports = router
