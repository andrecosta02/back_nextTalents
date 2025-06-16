const registerService = require("./ieService")
const { validationResult } = require('express-validator');
const { body, param } = require('express-validator');
const clientEmail = require("../../clientEmail.js")
const htmlEmail = require("./htmlEmail.js")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const SECRET = "weexpedition"; // Use o mesmo que você usa para gerar os outros tokens
const table = "ie"

const date = new Date()
const fullDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`

module.exports = {

    listActive: async (req, res, next) => {
        try {
        const regs = await registerService.getActive(); 
        // já vêm no formato correto: nome, unit, email, cnpj
        return res.status(200).json(regs);
      } catch (err) {
        console.log("Error: ", err)
        next(err);
        return res.status(402).json();
        }
    },

    getOne: async (req, res, next) => {
        const userId = req.user.id; // Pegando o id do usuário autenticado via middleware
        try {
        const regs = await registerService.getOne(userId); 
        // já vêm no formato correto: id, nome, unit, email, pass, cnpj, notification_email, darkmode
        return res.status(200).json(regs);
      } catch (err) {
        console.log("Error: ", err)
        next(err);
        return res.status(402).json();
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

            const token = jwt.sign({ id: user.id, name: user.name, type: table }, SECRET, { expiresIn: "2h" });

            res.status(200).json({
                message: "Login realizado com sucesso!",
                token: token,
                nome: user.nome
            });
        } catch (error) {
            console.error("Erro no login:", error);
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    },

    register: async (req, res) => {
        const json = { statusCode: "", message: "", result: [] }

        let hash_psw = "";

        const nome = req.body.nome;
        const unit = req.body.unit;
        const email = req.body.email;
        const pass = req.body.pass;
        const cnpj = req.body.cnpj;

        json.result = [nome, unit, email, pass, cnpj];

        const registerValidation = [
          body('nome')
            .notEmpty().withMessage('O nome é obrigatório')
            .isString().withMessage('O nome deve ser uma string')
            .isLength({ min: 3, max: 100 }).withMessage('O nome deve ter entre 3 e 100 caracteres'),

          body('unit')
            .optional()
            .isString().withMessage('A unidade deve ser uma string'),

          body('email')
            .notEmpty().withMessage('O e-mail é obrigatório')
            .isEmail().withMessage('Formato de e-mail inválido'),

          body('pass')
            .notEmpty().withMessage('A senha é obrigatória')
            .isLength({ min: 8 }).withMessage('A senha deve ter pelo menos 8 caracteres'),

          body('cnpj')
            .notEmpty().withMessage('O CNPJ é obrigatório')
            .isLength({ min: 14, max: 14 }).withMessage('O cnpj deve conter 14 dígitos')
            .matches(/^[0-9]+$/).withMessage('O cnpj deve conter apenas números')
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

        const returnQry = await registerService.register(nome, unit, email, hash_psw, cnpj);
        const codeReturn = returnQry.code; // 1 = OK, 2 = User Not Found

        if (codeReturn == "1") {
            res.status(201);
            json.statusCode = 201;
            json.message = returnQry.message;  // <- agora pega o "message" certo
            json.result = returnQry.description;  // <- agora pega a descrição certa

            // Gerar token de ativação
            const token = jwt.sign({ id: returnQry.userId, type: table }, SECRET, { expiresIn: "24h" });
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        
            await registerService.saveActivationToken(returnQry.userId, token, expiresAt);
            
            const emailTitle = "Bem vindo à NextTalents!! Confirmação de cadastro";
            fullName = `${nome} - ( ${unit} )`
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
        const allowedFields = ["nome", "unit", "email", "fone", "notification_email", "darkmode", "country", "city", "uf"];
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
            const result = await registerService.updateById(userId, updates);
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
            { id: user.id, type: table },
            SECRET,
            { expiresIn: '1h' }
        );
    
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validade
        await registerService.saveResetToken(user.id, token, expiresAt);
    
        // const resetLink = `http://localhost:3000/reset-senha?token=${token}`;

        const emailTitle = "Recuperação de senha Next Talents";

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
            await registerService.activateById(tokenData.user_id);
            await registerService.markActivationTokenAsUsed(tokenData.id);
    
            res.status(200).json({ message: "Cadastro ativado com sucesso!" });
        } catch (error) {
            console.error("Erro na ativação de cadastro:", error);
            res.status(400).json({ message: "Token inválido ou expirado." });
        }
    },

}

function IpPublicQuery(req) {
    console.log(` - ${req.method}`)
    console.log(` - ${req.baseUrl}${req.url}`)
    console.log(` - ${req.connection.remoteAddress} } \n`)
}

function hashPassword(password) {
    return bcrypt.hash(password, saltRounds);
}