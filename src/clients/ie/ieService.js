const db = require("../../db.js");
let query = "";
let values = "";
let returnQry = [];
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const table = "ie"

module.exports = {
    getUserByEmail: (email) => {
        return new Promise((resolve, reject) => {
            query = `SELECT * FROM ${table} WHERE email = ?`;
            values = [email];

            db.query(query, values, (error, results) => {
                if (error) {
                    consoleResult();
                    reject(error);
                    return;
                }
                consoleResult();
                resolve(results.length > 0 ? results[0] : false);
            });
        });
    },

    getActive: () => {
        return new Promise((resolve, reject) => {
            query = `
                SELECT nome, unit, email, fone, cnpj, country, city, uf
                FROM ${table}
                WHERE is_active = 1
            `;
            values = [];
            db.query(query, values, (error, results) => {
                if (error) {
                return reject(error);
                }
                consoleResult();
                resolve(results);
            });
        });
    },

    getOne: (id) => {
        return new Promise((resolve, reject) => {
            query = `
                SELECT id, nome, unit, email, pass, cnpj, notification_email, darkmode
                FROM ${table}
                WHERE id = ?
            `;
            values = [id];
            db.query(query, values, (error, results) => {
                if (error) {
                return reject(error);
                }
                consoleResult();
                resolve(results);
            });
        });
    },

    register: (nome, unit, email, pass, cnpj) => {
        return new Promise((resolve, reject) => {
            let querySelect = `SELECT * FROM ${table} WHERE email = ? OR cnpj = ?`;
            let valueSelect = [email, cnpj];

            db.query(querySelect, valueSelect, (error, results) => {
                if (results.length == 0) {
                    query = `INSERT INTO ${table} (nome, unit, email, pass, cnpj) VALUES (?, ?, ?, ?, ?)`;
                    values = [nome, unit, email, pass, cnpj];

                    db.query(query, values, (error, results) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        returnQry = {
                            code: "1",
                            message: "OK",
                            userId: results.insertId, // ID do novo aluno
                            description: `Created: ${nome}`
                        };
                        consoleResult();
                        resolve(returnQry);
                    });
                } else {
                    returnQry = ["2", "Email ou CNPJ já cadastrado, se necessário, redefina a senha"];
                    consoleResult();
                    resolve(returnQry);
                }
            });
        });
    },

    updateById: (userId, updates) => {
        return new Promise((resolve, reject) => {
            const fields = Object.keys(updates);
            const setClause = fields.map(field => `${field} = ?`).join(", ");
            const values = fields.map(field => updates[field]);

            query = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
            values.push(userId);

            db.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                consoleResult(query, values);
                resolve(results);
            });
        });
    },

    saveResetToken: (userId, token, expiresAt) => {
        return new Promise((resolve, reject) => {
            query = `INSERT INTO password_resets (user_id, user_type, token, expires_at) VALUES (?, '${table}', ?, ?)`;
            values = [userId, token, expiresAt];

            db.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                consoleResult();
                resolve(results);
            });
        });
    },

    findResetToken: (token) => {
        return new Promise((resolve, reject) => {
            // query = `SELECT * FROM password_resets WHERE token = ? AND user_type = '${table}' AND used = FALSE AND expires_at > NOW()`;
            query = `SELECT * FROM password_resets WHERE token = ? AND user_type = '${table}' AND used = FALSE`;
            values = [token];

            db.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results.length > 0 ? results[0] : false);
            });
        });
    },

    markTokenAsUsed: (tokenId) => {
        return new Promise((resolve, reject) => {
            query = `UPDATE password_resets SET used = TRUE WHERE id = ?`;
            values = [tokenId];

            db.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                consoleResult();
                resolve(results);
            });
        });
    },

    updatePassword: (userId, newPasswordHash) => {
        return new Promise((resolve, reject) => {
            query = `UPDATE ${table} SET pass = ? WHERE id = ?`;
            values = [newPasswordHash, userId];

            db.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                consoleResult();
                resolve(results);
            });
        });
    },

    saveActivationToken: (userId, token, expiresAt) => {
        return new Promise((resolve, reject) => {
            query = `INSERT INTO activation_tokens (user_id, user_type, token, expires_at) VALUES (?, '${table}', ?, ?)`;
            values = [userId, token, expiresAt];
    
            db.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                consoleResult();
                resolve(results);
            });
        });
    },
    
    findActivationToken: (token) => {
        return new Promise((resolve, reject) => {
            // query = `SELECT * FROM activation_tokens WHERE token = ? AND user_type = '${table}' AND used = FALSE AND expires_at > NOW()`;
            query = `SELECT * FROM activation_tokens WHERE token = ? AND user_type = '${table}' AND used = FALSE`;
            values = [token];
    
            db.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results.length > 0 ? results[0] : false);
            });
        });
    },
    
    markActivationTokenAsUsed: (tokenId) => {
        return new Promise((resolve, reject) => {
            query = `UPDATE activation_tokens SET used = TRUE WHERE id = ?`;
            values = [tokenId];
    
            db.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                consoleResult();
                resolve(results);
            });
        });
    },
    
    activateById: (id) => {
        return new Promise((resolve, reject) => {
            query = `UPDATE ${table} SET is_active = TRUE WHERE id = ?`;
            values = [id];
    
            db.query(query, values, (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }
                consoleResult();
                resolve(results);
            });
        });
    },
};

function consoleResult() {
    let date = new Date();
    const brasilTime = date.toLocaleString("pt-BR", { timeZone: "America/Recife" });

    console.log(`Consult {`);
    console.log(` - ${brasilTime}`);
    console.log(" - " + query, values);
}
