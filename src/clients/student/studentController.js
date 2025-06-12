const registerService = require("./studentService")
const { validationResult } = require('express-validator');
const { body, param } = require('express-validator');
const clientEmail = require("../../clientEmail.js")
const htmlEmail = require("./htmlEmail.js")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const SECRET = "weexpedition"; // Use o mesmo que você usa para gerar os outros tokens

const date = new Date()
const fullDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`

module.exports = {

    listActiveStudents: async (req, res, next) => {
        try {
        const alunos = await registerService.getActiveStudents(); 
        // já vêm no formato correto: name, last_name, email, birth, cep, city, description
        return res.status(200).json(alunos);
        } catch (err) {
        next(err);
        }
    },

    login: async (req, res) => {
        const { email, pass } = req.body;
        const json = { statusCode: "", message: "", result: [] }

        if (!email || !pass) {
            res.status(400);
            json.statusCode = 400;
            json.message = "Email e senha são obrigatórios.";
            json.errors = [
                {
                    msg: "Email e senha são obrigatórios."
                }
            ];
            res.json(json);
            return;

            // return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }

        try {
            const user = await registerService.getUserByEmail(email);

            if (!user) {
                res.status(401);
                json.statusCode = 401;
                json.message = "E-mail ou senha inválidos.";
                json.errors = [
                    {
                        msg: "E-mail ou senha inválidos."
                    }
                ];
                res.json(json);
                return;

                // return res.status(401).json({ message: "E-mail ou senha inválidos." });
            }

            const passwordMatch = await bcrypt.compare(pass, user.pass);

            if (!passwordMatch) {
                res.status(401);
                json.statusCode = 401;
                json.message = "E-mail ou senha inválidos.";
                json.errors = [
                    {
                        msg: "E-mail ou senha inválidos."
                    }
                ];
                res.json(json);
                return;

                // return res.status(401).json({ message: "E-mail ou senha inválidos." });
            }

            if (!user.is_active) {
                res.status(403);
                json.statusCode = 403;
                json.message = "Conta não ativada. Verifique seu e-mail para confirmar o cadastro.";
                json.errors = [
                    {
                        msg: "Conta não ativada. Verifique seu e-mail para confirmar o cadastro."
                    }
                ];
                res.json(json);
                return;

                // return res.status(403).json({ message: "Conta não ativada. Verifique seu e-mail para confirmar o cadastro." });
            }

            const token = jwt.sign({ id: user.id, name: user.name, type: "student" }, SECRET, { expiresIn: "2h" });

            res.status(200).json({
                message: "Login realizado com sucesso!",
                token: token
            });
        } catch (error) {
            console.error("Erro no login:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    },

    register: async (req, res) => {
        const json = { statusCode: "", message: "", result: [] }
        // const htmlEnv = require("./htmlConfirmEmail.js")

        let hash_psw = ""

        const name = req.body.name
        const last_name = req.body.last_name
        const email = req.body.email
        const birth = req.body.birth
        // const pass = req.body.pass
        const pass = "1234"
        const cpf = req.body.cpf
        const cep = req.body.cep
        const city = req.body.city
        const description = req.body.description

        json.result = [name, last_name, email, birth, pass, cpf, cep, city, description]

        const registerValidation = [
            body('name')
                .notEmpty().withMessage('O nome não pode estar vazio')
                .isString().withMessage('O nome deve ser string')
                .isLength({ min: 3, max: 60 }).withMessage('O nome deve ter entre 3 e 60 caracteres'),
        
            body('last_name')
                .notEmpty().withMessage('O sobrenome não pode estar vazio')
                .isString().withMessage('O sobrenome deve ser string')
                .isLength({ min: 3, max: 60 }).withMessage('O sobrenome deve ter entre 3 e 60 caracteres'),
        
            body('email')
                .notEmpty().withMessage('O e-mail não pode estar vazio')
                .isString().withMessage('O e-mail deve ser string')
                .isEmail().withMessage('O e-mail deve ser um endereço de e-mail válido')
                .isLength({ min: 3, max: 60 }).withMessage('O e-mail deve ter entre 3 e 60 caracteres'),
        
            // body('birth')
            //     .notEmpty().withMessage('A data de nascimento não pode estar vazia')
            //     .isString().withMessage('A data de nascimento deve ser string')
            //     .matches(/^\d{8}$/).withMessage('A data de nascimento deve estar no formato AAAAMMDD')
            //     .custom((value) => {
            //         if (isAdult(value) < 18) {
            //             throw new Error('O usuário deve ter pelo menos 18 anos');
            //         }
            //         return true;
            //     }),
        
            // body('pass')
            //     .notEmpty().withMessage('A senha não pode estar vazia')
            //     .isString().withMessage('A senha deve ser string')
            //     .isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres')
            //     .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('A senha deve conter ao menos um caractere especial'),
        
            body('cpf')
                .notEmpty().withMessage('O CPF não pode estar vazio')
                .isString().withMessage('O CPF deve ser string')
                .isLength({ min: 11, max: 11 }).withMessage('O CPF deve conter 11 caracteres')
                .matches(/^\d+$/).withMessage('O CPF deve conter apenas números'),
        
            body('cep')
                .notEmpty().withMessage('O CEP não pode estar vazio')
                .isString().withMessage('O CEP deve ser string')
                .isLength({ min: 8, max: 8 }).withMessage('O CEP deve conter exatamente 8 caracteres')
                .matches(/^\d+$/).withMessage('O CEP deve conter apenas números'),
        
            body('city')
                .notEmpty().withMessage('A cidade é obrigatória')
                .isString().withMessage('O nome deve ser string')
                .isLength({ min: 2, max: 100 }).withMessage('A cidade deve ter entre 2 e 100 caracteres'),
                // .matches(/^[a-zA-Z\s]+$/).withMessage('A cidade deve conter apenas letras e espaços'),

            body('description')
                .notEmpty().withMessage('A descrição é obrigatória')
                .isString().withMessage('A descrição deve ser string')
                .isLength({ min: 2, max: 256 }).withMessage('A descrição deve ter entre 2 e 256 caracteres')
                // .matches(/^[a-zA-Z\s]+$/).withMessage('A descrição deve conter apenas letras e espaços')
        ];
        

        await Promise.all(registerValidation.map(validation => validation.run(req)))

        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            res.status(422).json({ statusCode: 422, message: 'Erro de validação', errors: errors.array() })
            return
        } else {
            hash_psw = await hashPassword(pass);
            // console.log(hash_psw)
        }

        const returnQry = await registerService.register(name, last_name, email, birth, hash_psw, cpf, cep, city, description);
        const codeReturn = returnQry.code; // 1 = OK, 2 = User Not Found

        if (codeReturn == "1") {
            res.status(201);
            json.statusCode = 201;
            json.message = returnQry.message;  // <- agora pega o "message" certo
            json.result = returnQry.description;  // <- agora pega a descrição certa

            // Gerar token de ativação
            const token = jwt.sign({ id: returnQry.userId, type: "student" }, SECRET, { expiresIn: "24h" });
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        
            await registerService.saveActivationToken(returnQry.userId, token, expiresAt);
            
            const emailTitle = "Recuperação de senha Next Talents";
            fullName = `${name} ${last_name}`
            htmlEnv = await htmlEmail.confirmEmail(fullName, token)

            clientEmail.envEmail(email, emailTitle, "", htmlEnv);
        } else {
            res.status(422);
            json.statusCode = 422;
            json.message = returnQry[1];  // ainda puxando do vetor antigo (como está seu service)
            json.result = "";
            json.errors = [
                {
                    msg: returnQry[1]
                }
            ];
        }

        res.json(json);
        IpPublicQuery(req);
    },

    update: async (req, res) => {
        const userId = req.user.id; // Pegando o id do usuário autenticado via middleware
        const allowedFields = ["name", "last_name", "email", "cep", "city", "description", "notification_email", "notification_vacancies", "notification_course", "darkmode"];
        const updates = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Nenhum campo válido para atualizar." });
        }

        try {
            const result = await registerService.updateStudentById(userId, updates);
            res.status(200).json({ message: "Dados atualizados com sucesso!", result });
        } catch (error) {
            console.error("Erro ao atualizar dados:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    },

    forgotPass: async (req, res) => {
        const { email } = req.body;
        const user = await registerService.getUserByEmail(email); // você pode criar essa função se ainda não existir
    
        if (!user) {
            return res.status(200).json({ message: "If this email exists, a reset link has been sent." });
        }
    
        const token = jwt.sign(
            { id: user.id, type: 'student' },
            SECRET,
            { expiresIn: '1h' }
        );
    
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validade
        await registerService.saveResetToken(user.id, token, expiresAt);
    
        // const resetLink = `http://localhost:3000/reset-senha?token=${token}`;

        const emailTitle = "Recuperação de senha Next Talents";
        // const emailText = `Olá, ${user.name},\n\nPara redefinir sua senha, clique no link abaixo:\n${resetLink}\n\nEsse link é válido por 1 hora.`;
    
        htmlEnv = await htmlEmail.resetPass(user.name, token)

        await clientEmail.envEmail(email, emailTitle, '', htmlEnv);
    
        res.status(200).json({ message: "If this email exists, a reset link has been sent." });
    },

    resetPass: async (req, res) => {
        const { token, newPassword } = req.body;
    
        try {
            const decoded = jwt.verify(token, SECRET);
            const tokenData = await registerService.findResetToken(token);
    
            if (!tokenData) {
                return res.status(400).json({ message: "Invalid or expired token." });
            }
    
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await registerService.updatePassword(tokenData.user_id, hashedPassword);
            await registerService.markTokenAsUsed(tokenData.id);
    
            res.status(200).json({ message: "Password updated successfully!" });
        } catch (error) {
            res.status(400).json({ message: "Invalid or expired token." });
        }
    },

    confirmEmail: async (req, res) => {
        const { token } = req.body;  // ou pode pegar via query: req.query.token, você escolhe
    
        if (!token) {
            return res.status(400).json({ message: "Token não fornecido." });
        }
    
        try {
            const decoded = jwt.verify(token, SECRET);
            const tokenData = await registerService.findActivationToken(token);
    
            if (!tokenData) {
                return res.status(400).json({ message: "Token inválido ou expirado." });
            }
    
            // Ativando o usuário
            await registerService.activateStudentById(tokenData.user_id);
            await registerService.markActivationTokenAsUsed(tokenData.id);
    
            res.status(200).json({ message: "Cadastro ativado com sucesso!" });
        } catch (error) {
            console.error("Erro na ativação de cadastro:", error);
            res.status(400).json({ message: "Token inválido ou expirado." });
        }
    },

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