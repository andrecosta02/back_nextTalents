const db = require("../../db.js")
let query = ""
let values = ""
let returnQry = []

module.exports = {

    // listAll: () => {
    //     return new Promise((resolve, reject)=>{
    //         query = "SELECT * FROM users ORDER BY id"

    //         db.query(query, (error, results)=>{
    //             if(error) {reject(error); return}
    //             resolve(results)
    //         })

    //         consoleResult(query)
    //     })
    // },



    // listOne: (userId) => {
    //     return new Promise((resolve, reject) => {
    //         query = `SELECT * FROM users WHERE id = ?`
    //         values = [userId]

    //         db.query(query, values, (error, results)=>{
    //             if(error) { reject(error); return; }
    //             if(results.length > 0){
    //                 resolve(results[0]);
    //             }else {
    //                 resolve(false);
    //             }
    //         })

    //         consoleResult(query, values)
    //     })
    // },



    register: (name, last_name, email, birth, pass, cpf, cep, city) => {
        return new Promise((resolve, reject) => {
            // let querySelect = " SELECT * FROM users WHERE username = '?' OR email  = '?' OR cpf    = '?'"
            let querySelect = ""

            querySelect += ` SELECT * `
            querySelect += ` FROM student `
            querySelect += ` WHERE `
            querySelect += `    email    = ? `
            querySelect += `    OR cpf      = ? `
            let valueSelect = [email, cpf]

            db.query(querySelect, valueSelect, (error, results) => {

                if (results.length == 0) {
                    query = `INSERT INTO student (name,last_name,email,birth,pass,cpf,cep,city) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
                    values = [name, last_name, email, birth, pass, cpf, cep, city]

                    db.query(query, values, (error, results) => {
                        if (error) {
                            reject(error)
                            return
                        }
                        returnQry = ["1", "OK", `Created student: ${name}`]
                        returnCode = ""
                        consoleResult()
                        resolve(returnQry)
                        // resolve(results.insertId)
                    })
                } else {
                    // returnQry = `There is already a user with a name = ${username}`
                    returnQry = ["2", "Fail", "User not inserted"]
                    consoleResult()
                    resolve(returnQry)
                }

            })
        })
    },



    // update: (clientId, clientName, clientEmail, clientAddress) => {
    //     return new Promise((resolve, reject) => {
    //         let query = 'UPDATE client SET ';

    //         const updateFields = [];

    //         if (clientName) { updateFields.push(`name="${clientName}"`) }

    //         if (clientEmail) { updateFields.push(`email="${clientEmail}"`) }

    //         if (clientAddress) { updateFields.push(`address="${clientAddress}"`) }

    //         if (updateFields.length === 0) {
    //             reject(new Error('Nenhum campo válido para atualização fornecido.'));
    //             return;
    //         }

    //         query += updateFields.join(', ');
    //         query += ` WHERE client_id = "${clientId}"`;

    //         db.query(query, (error, results) => {
    //             if (error) {
    //                 reject(error);
    //                 return;
    //             }

    //             resolve(results);
    //         });
    //         consoleResult(query)
    //     });


    // },



    // delete: (clientId) =>{
    //     return new Promise((resolve, reject) => {
    //         let querySelect = `SELECT * FROM client WHERE client_id = ?`
    //         let values = [clientId]

    //         db.query(querySelect, values, (error, results) => {
    //             resolve(results)

    //             if(results != 0){
    //                 // query = `DELETE FROM client WHERE client_id = ${clientId}`
    //                 query = `DELETE FROM client WHERE client_id = ${clientId}`

    //                 db.query(query,(error, results) => {
    //                     if(error) { reject(error); return; }
    //                     resolve(results)
    //                 })

    //                 // returnQry = `Deleted client with client_id = ${clientId}`
    //                 // resolve(returnQry)
    //                 resolve(query)
    //                 consoleResult(query)
    //             } else {
    //                 returnQry = `No client found with client_id = ${clientId}`
    //                 reject(returnQry)
    //                 consoleResult(returnQry)
    //             }
    //         })

    //     })
    // },

}

function consoleResult() {
    let date = new Date()
    const brasilTime = date.toLocaleString('pt-BR', { timeZone: 'America/Recife' });

    console.log(`Consult {`)
    console.log(` - ${brasilTime}`)
    console.log(" - " + query, values)

}