const db = require("../../db")
let query = ""
let values = ""
let returnQry = []

module.exports = {

    login: (username) => {
        return new Promise((resolve, reject) => {
            query = `SELECT * FROM users WHERE username = ?`
            values = [username]

            db.query(query, values, (error, results) => {
                if (error) { reject(error); return; }

                if (results.length > 0) {
                    returnQry = ["1", results[0].id, results[0].hash_psw]
                    consoleResult()
                    resolve(returnQry);
                } else {
                    returnQry = ["2", "", ""]
                    consoleResult()
                    resolve(returnQry);
                }
            })

        })
    },

}

function consoleResult() {
    let date = new Date()
    const brasilTime = date.toLocaleString('pt-BR', { timeZone: 'America/Recife' });

    console.log(`Consult {`)
    console.log(` - ${brasilTime}`)
    console.log(" - " + query, values)

}