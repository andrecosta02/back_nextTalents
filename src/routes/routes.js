const express = require("express")
const router = express.Router()
const showdown = require("showdown");

const converter = new showdown.Converter();

const studentRoutes = require("./studentRoutes.js")
const ieRoutes = require("./ieRoutes.js")
const enterpriseRoutes = require("./enterpriseRoutes.js")

router.use("/student", studentRoutes)  // Registro - Aluno
router.use("/ie", ieRoutes)  // Registro - IE
router.use("/enterprise", enterpriseRoutes)  // Registro - Empesa

module.exports = router