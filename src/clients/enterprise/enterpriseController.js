const registerService = require("./enterpriseService")
const { validationResult } = require('express-validator');
const { body, param } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const date = new Date()
const fullDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`

module.exports = {

    // listAll: async (req, res) => {
    //     let amount = 0
    //     let json = {statusCode:"", message:"", amount:"", result:[]}
    //     let user = await registerService.listAll()

    //     for(let i in user) {
    //         res.statusCode = 200

    //         json.result.push({
    //             userId: user[i].id,
    //             userName: user[i].name,
    //             userEmail: user[i].last_name,
    //             userAddress: user[i].hash_psw,
    //             userCpf: user[i].gender,
    //             userCpf: user[i].birth,
    //             userCpf: user[i].cep,
    //             userCpf: user[i].city,
    //             userCpf: user[i].we_current,
    //             userDate: user[i].date_time
    //         })
    //         amount++
    //     }
    //     json.amount = amount

    //     res.json(json)
    //     IpPublicQuery(req)
    // },



    // listOne: async (req, res) => {
    //     let json = {statusCode:"", message:"", result:[]}

    //     let userId = req.params.userId
    //     let user = await registerService.listOne(userId)

    //     if(user) { 
    //         res.statusCode = 200

    //         json.result.push({
    //             userId: user.id,
    //             userName: user.name,
    //             userEmail: user.last_name,
    //             userAddress: user.hash_psw,
    //             userCpf: user.gender,
    //             userCpf: user.birth,
    //             userCpf: user.cep,
    //             userCpf: user.city,
    //             userCpf: user.we_current,
    //             userDate: user.date_time
    //         })
    //     }

    //     res.json(json)
    //     IpPublicQuery(req)
    // },



    register: async (req, res) => {
        const json = { statusCode: "", message: "", result: [] }

        let hash_psw = ""

        const name = req.body.name
        const last_name = req.body.last_name
        const email = req.body.email
        const birth = req.body.birth
        const pass = req.body.pass
        const cpf = req.body.cpf
        const cep = req.body.cep
        const city = req.body.city

        json.result = [name, last_name, email, birth, pass, cpf, cep, city]

        const registerValidation = [
            body('name')
                .notEmpty().withMessage('name cannot be empty')
                .isString().withMessage('name must be a string')
                .isLength({ min: 3, max: 60 }).withMessage('name must be between 3 and 60 characters'),

            body('last_name')
                .notEmpty().withMessage('last_name cannot be empty')
                .isString().withMessage('last_name must be a string')
                .isLength({ min: 3, max: 60 }).withMessage('last_name must be between 3 and 60 characters'),

            body('email')
                .notEmpty().withMessage('email cannot be empty')
                .isString().withMessage('email must be a string')
                .isEmail().withMessage('email must be a valid email address')
                .isLength({ min: 3, max: 60 }).withMessage('email must be between 3 and 60 characters'),

            body('birth')
                .notEmpty().withMessage('birth cannot be empty')
                .isString().withMessage('birth must be a string')
                .matches(/^\d{8}$/).withMessage('birth must be in the format AAAAMMDD')
                .custom((value) => {
                    if (isAdult(value) < 18) {
                        throw new Error('User must be at least 18 years old');
                    }
                    return true;
                }),

            body('pass')
                .notEmpty().withMessage('pass cannot be empty')
                .isString().withMessage('pass must be a string')
                .isLength({ min: 8 }).withMessage('pass must be at least 8 characters long')
                .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('pass must contain at least one special character'),

            body('cpf')
                .notEmpty().withMessage('cpf cannot be empty')
                .isString().withMessage('cpf must be a string')
                .isLength({ min: 11, max: 11 }).withMessage('cpf must be 11 characters')
                .matches(/^\d+$/).withMessage('CPF must contain only numbers'),

            body('cep')
                .notEmpty().withMessage('cep cannot be empty')
                .isString().withMessage('cep must be a string')
                .isLength({ min: 8, max: 8 }).withMessage('CEP must be exactly 8 characters long')
                .matches(/^\d+$/).withMessage('CEP must contain only numbers'),

            body('city')
                .notEmpty().withMessage('City is required')
                .isLength({ min: 2, max: 100 }).withMessage('City must be between 2 and 100 characters long')
                .matches(/^[a-zA-Z\s]+$/).withMessage('City must contain only letters and spaces')
        ];

        await Promise.all(registerValidation.map(validation => validation.run(req)))

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            res.status(422).json({ statusCode: 400, message: 'Erro de validação', errors: errors.array() })
            return
        } else {
            hash_psw = await hashPassword(pass);
            // console.log(hash_psw)
        }


        const returnQry = await registerService.register(name, last_name, email, birth, hash_psw, cpf, cep, city)
        codeReturn = returnQry[0] // 1 = OK, 2 = User Not Fount

        if (codeReturn == "1") {
            res.status(201)
            json.statusCode = 201
            json.message = returnQry
            json.result = ""
        } else {
            res.status(422)
            json.statusCode = 422
            json.message = returnQry
            json.result = ""
        }

        res.json(json);
        IpPublicQuery(req);
    },



    // update: async (req, res) => {
    //     let json = {statusCode:"", message:"", result:[]}

    //     let userId = req.params.userId
    //     const name = req.body.userName;
    //     const email = req.body.userEmail;
    //     const address = req.body.userAddress;

    //     const registerValidation = [
    //         body('userName').isString().optional().withMessage('userName cannot be empty').isLength({ min: 3, max: 60 }).withMessage('userName must be between 3 and 60 characters'),
    //         body('userEmail').isEmail().optional().withMessage('userEmail must be a valid email address').isLength({ min: 3, max: 60 }).withMessage('userEmail must be between 3 and 60 characters'),
    //         body('userAddress').isString().optional().withMessage('userAddress must be a string').isLength({ min: 3, max: 60 }).withMessage('userAddress must be between 3 and 60 characters'),
    //     ];

    //     await Promise.all(registerValidation.map(validation => validation.run(req)))

    //     const errors = validationResult(req)

    //     if (!errors.isEmpty()) {
    //         return res.status(422).json({ statusCode: 400, message: 'Erro de validação', errors: errors.array() })
    //     }

    //     if(userId && name || email || address){
    //         await registerService.update(userId, name, email, address);
    //         json.result = {
    //             userId: userId,
    //             userName: name,
    //             userEmail: email,
    //             userAddress: address,
    //         }
    //     } else {
    //         json.message = "Campos não enviados"
    //     }


    //     res.json(json)
    //     IpPublicQuery(req)
    // },



    // delete: async (req, res) => {
    //     let json = {statusCode:"", message:"", result:[]}
    //     let messageJson
    //     let userId = req.params.userId;
    //     await registerService.delete(userId);
    //     messageJson = messageJson


    //     json.message = messageJson

    //     res.json(json)
    //     IpPublicQuery(req)
    // },


}

const isAdult = (value) => {
    const today = new Date();
    const birthDate = new Date(value.slice(0, 4), value.slice(4, 6) - 1, value.slice(6, 8));
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
};

function IpPublicQuery(req) {
    console.log(` - ${req.method}`)
    console.log(` - ${req.baseUrl}${req.url}`)
    console.log(` - ${req.connection.remoteAddress} } \n`)
}



function hashPassword(password) {
    return bcrypt.hash(password, saltRounds);
}