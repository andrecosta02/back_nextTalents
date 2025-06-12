const db = require("../../db.js");

/**
 * Log de queries com timestamp em horário de Brasília
 */
function consoleResult(query, values) {
  const date = new Date();
  const brasilTime = date.toLocaleString("pt-BR", { timeZone: "America/Recife" });
  console.log("Consult {");
  console.log(` - ${brasilTime}`);
  console.log(" - " + query, values);
}

module.exports = {
  /**
   * Busca uma ENTERPRISE pelo e-mail
   */
  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      const query = "SELECT * FROM enterprise WHERE email = ?";
      const values = [email];

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);
        resolve(results && results.length > 0 ? results[0] : false);
      });
    });
  },

  /**
   * Registra uma nova ENTERPRISE
   */
  register: (nome, unit, email, pass, cnpj) => {
    return new Promise((resolve, reject) => {
      // Verifica existência prévia
      let query = "SELECT * FROM enterprise WHERE email = ? OR cnpj = ?";
      let values = [email, cnpj];

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);

        if (results && results.length > 0) {
          // Já existe ENTERPRISE com mesmo e-mail ou cnpj
          return resolve({
            code: "2",
            message: "Email ou cnpj já cadastrado, se necessário redefina a senha"
          });
        }

        // Insere nova ENTERPRISE
        query = "INSERT INTO enterprise (nome, unit, email, pass, cnpj) VALUES (?, ?, ?, ?, ?)";
        values = [nome, unit, email, pass, cnpj];

        db.query(query, values, (err2, insertResult) => {
          consoleResult(query, values);
          if (err2) return reject(err2);
          resolve({
            code: "1",
            message: "OK",
            userId: insertResult.insertId,
            description: `Created Enterprise: ${nome}`
          });
        });
      });
    });
  },

  /**
   * Atualiza campos permitidos de uma ENTERPRISE
   */
  updateEnterpriseById: (enterpriseId, updates) => {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates);
      const setClause = fields.map(f => `${f} = ?`).join(", ");
      const values = fields.map(f => updates[f]).concat(enterpriseId);
      const query = `UPDATE enterprise SET ${setClause} WHERE id = ?`;

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  /**
   * Gera e salva token de reset de senha
   */
  saveResetToken: (userId, token, expiresAt) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO password_resets (user_id, user_type, token, expires_at)
        VALUES (?, 'enterprise', ?, ?)`;
      const values = [userId, token, expiresAt];

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  /**
   * Busca token de reset válido
   */
  findResetToken: (token) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM password_resets
        WHERE token = ? AND user_type = 'enterprise' AND used = FALSE AND expires_at > NOW()`;
      const values = [token];

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);
        resolve(results && results.length > 0 ? results[0] : false);
      });
    });
  },

  /**
   * Marca token de reset como usado
   */
  markTokenAsUsed: (tokenId) => {
    return new Promise((resolve, reject) => {
      const query = "UPDATE password_resets SET used = TRUE WHERE id = ?";
      const values = [tokenId];

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  /**
   * Atualiza a senha da ENTERPRISE
   */
  updatePassword: (userId, newPasswordHash) => {
    return new Promise((resolve, reject) => {
      const query = "UPDATE enterprise SET pass = ? WHERE id = ?";
      const values = [newPasswordHash, userId];

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  /**
   * Gera e salva token de ativação
   */
  saveActivationToken: (userId, token, expiresAt) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO activation_tokens (user_id, user_type, token, expires_at)
        VALUES (?, 'enterprise', ?, ?)`;
      const values = [userId, token, expiresAt];

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  /**
   * Busca token de ativação válido
   */
  findActivationToken: (token) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM activation_tokens
        WHERE token = ? AND user_type = 'enterprise' AND used = FALSE AND expires_at > NOW()`;
      const values = [token];

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);
        resolve(results && results.length > 0 ? results[0] : false);
      });
    });
  },

  /**
   * Marca token de ativação como usado
   */
  markActivationTokenAsUsed: (tokenId) => {
    return new Promise((resolve, reject) => {
      const query = "UPDATE activation_tokens SET used = TRUE WHERE id = ?";
      const values = [tokenId];

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  /**
   * Ativa a ENTERPRISE após confirmação de e-mail
   */
  activateEnterpriseById: (id) => {
    return new Promise((resolve, reject) => {
      const query = "UPDATE enterprise SET is_active = TRUE WHERE id = ?";
      const values = [id];

      db.query(query, values, (err, results) => {
        consoleResult(query, values);
        if (err) return reject(err);
        resolve(results);
      });
    });
  }
};
