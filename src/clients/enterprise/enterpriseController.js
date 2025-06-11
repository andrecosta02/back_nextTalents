const ieService = require("./ieService");
const { validationResult, body } = require('express-validator');
const clientEmail = require("../../clientEmail.js");
const htmlEmail = require("./htmlEmail.js");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const SECRET = "weexpedition";

module.exports = {
  // LOGIN
  login: async (req, res) => {
    const { email, pass } = req.body;
    const json = { statusCode: "", message: "", result: [] };

    if (!email || !pass) {
      return res.status(400).json({
        statusCode: 400,
        message: "Email e senha são obrigatórios.",
        errors: [{ msg: "Email e senha são obrigatórios." }]
      });
    }

    try {
      const enterprise = await ieService.getUserByEmail(email);

      if (!enterprise) {
        return res.status(401).json({
          statusCode: 401,
          message: "E-mail ou senha inválidos.",
          errors: [{ msg: "E-mail ou senha inválidos." }]
        });
      }

      const passwordMatch = await bcrypt.compare(pass, enterprise.pass);
      if (!passwordMatch) {
        return res.status(401).json({
          statusCode: 401,
          message: "E-mail ou senha inválidos.",
          errors: [{ msg: "E-mail ou senha inválidos." }]
        });
      }

      if (!enterprise.is_active) {
        return res.status(403).json({
          statusCode: 403,
          message: "Conta não ativada. Verifique seu e-mail para confirmar o cadastro.",
          errors: [{ msg: "Conta não ativada. Verifique seu e-mail para confirmar o cadastro." }]
        });
      }

      const token = jwt.sign(
        { id: enterprise.id, name: enterprise.nome, type: "enterprise" },
        SECRET,
        { expiresIn: "2h" }
      );

      return res.status(200).json({
        message: "Login realizado com sucesso!",
        token
      });
    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  },

  // REGISTER
  register: async (req, res) => {
    const json = { statusCode: "", message: "", result: [] };
    let hash_psw = "";

    const nome = req.body.nome;
    const unit = req.body.unit;
    const email = req.body.email;
    const pass = req.body.pass;
    const cnpj = req.body.cnpj;

    json.result = [nome, unit, email, pass, cnpj];

    // Validação dos campos
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

    await Promise.all(registerValidation.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        statusCode: 422,
        message: 'Erro de validação',
        errors: errors.array()
      });
    }

    hash_psw = await bcrypt.hash(pass, saltRounds);
    const returnQry = await ieService.register(nome, unit, email, hash_psw, cnpj);
    const codeReturn = returnQry.code;

    if (codeReturn === "1") {
      json.statusCode = 201;
      json.message = returnQry.message;
      json.result = returnQry.description;

      const token = jwt.sign(
        { id: returnQry.userId, type: "enterprise" },
        SECRET,
        { expiresIn: "24h" }
      );
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await ieService.saveActivationToken(returnQry.userId, token, expiresAt);

      const emailTitle = "Confirmação de Cadastro - Next Talents";
      const htmlEnv = await htmlEmail.confirmEmail(nome, token);
      await clientEmail.envEmail(email, emailTitle, "", htmlEnv);

      return res.status(201).json(json);
    } else {
      return res.status(422).json({
        statusCode: 422,
        message: returnQry[1],
        result: "",
        errors: [{ msg: returnQry[1] }]
      });
    }
  },

  // UPDATE IE
  update: async (req, res) => {
    const ieId = req.user.id;
    const allowedFields = ["nome", "unit", "email", "cnpj", "notification_email", "darkmode", "is_active"];
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
      const result = await ieService.updateIeById(ieId, updates);
      return res.status(200).json({ message: "Dados atualizados com sucesso!", result });
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
      return res.status(500).json({ message: "Erro interno no servidor." });
    }
  },

  // FORGOT PASSWORD
  forgotPass: async (req, res) => {
    const { email } = req.body;
    const enterprise = await ieService.getUserByEmail(email);
    if (!enterprise) {
      return res.status(200).json({ message: "If this email exists, a reset link has been sent." });
    }
    const token = jwt.sign({ id: enterprise.id, type: 'enterprise' }, SECRET, { expiresIn: '1h' });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await ieService.saveResetToken(enterprise.id, token, expiresAt);
    const emailTitle = "Recuperação de senha Next Talents";
    const htmlEnv = await htmlEmail.resetPass(enterprise.nome, token);
    await clientEmail.envEmail(email, emailTitle, '', htmlEnv);
    return res.status(200).json({ message: "If this email exists, a reset link has been sent." });
  },

  // RESET PASSWORD
  resetPass: async (req, res) => {
    const { token, newPassword } = req.body;
    try {
      const decoded = jwt.verify(token, SECRET);
      const tokenData = await ieService.findResetToken(token);
      if (!tokenData) {
        return res.status(400).json({ message: "Invalid or expired token." });
      }
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await ieService.updatePassword(tokenData.user_id, hashedPassword);
      await ieService.markTokenAsUsed(tokenData.id);
      return res.status(200).json({ message: "Password updated successfully!" });
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }
  },

  // CONFIRM EMAIL
  confirmEmail: async (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token não fornecido." });
    }
    try {
      const decoded = jwt.verify(token, SECRET);
      const tokenData = await ieService.findActivationToken(token);
      if (!tokenData) {
        return res.status(400).json({ message: "Token inválido ou expirado." });
      }
      await ieService.activateIeById(tokenData.user_id);
      await ieService.markActivationTokenAsUsed(tokenData.id);
      return res.status(200).json({ message: "Cadastro ativado com sucesso!" });
    } catch (error) {
      console.error("Erro na ativação de cadastro:", error);
      return res.status(400).json({ message: "Token inválido ou expirado." });
    }
  }
};
