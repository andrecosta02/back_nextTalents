const express = require("express")
const router = express.Router()
const showdown = require("showdown");
const path = require('path')
const {uuid} = require("uuidv4")
const multer = require('multer');
const converter = new showdown.Converter();

const studentRoutes = require("./studentRoutes.js")
const ieRoutes = require("./ieRoutes.js")
const enterpriseRoutes = require("./enterpriseRoutes.js")
// const files = require("../utils/file.js")

const pathFile = path.resolve(__dirname, "./uploads")
console.log(pathFile)


const upload = multer({
    storage: multer.diskStorage({
        destination: pathFile,
        filename: (req, file, callback)=> callback(null, uuid() + path.extname(file.originalname) )
    })
})

router.use("/student", studentRoutes)  // Registro - Aluno
router.use("/ie", ieRoutes)  // Registro - IE
router.use("/enterprise",  enterpriseRoutes)  // Registro - Empesa

// router.post("/files", upload.single("imagem"), files.receiveFile)  // Rota para salvar imagens
router.post("/files", upload.single("imagem"), (req, res) =>{
    res.send("Arquivo recebido com sucesso.")
})  // Rota para salvar imagens

router.use("/arquivo", express.static(pathFile), (req, res) =>{
    res.send("Arquivo recebido com sucesso.")
})  // Rota para salvar imagens

module.exports = router