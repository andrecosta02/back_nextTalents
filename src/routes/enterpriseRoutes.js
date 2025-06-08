const express = require("express")
const router = express.Router()

const enterpriseController = require("../clients/enterprise/enterpriseController.js")

router.post("/register", enterpriseController.register)  // Registro - Aluno

module.exports = router