const mysql = require("mysql")

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

// connection.connect((error) => {
//     if (error) {
//         console.log(`Erro ao conectar com o Banco de Dados: ${process.env.DB_NAME}`)
//         console.log(`- ${error.code}`)
//         return
//     } else {
//         console.log(`Conectado com o Banco de Dados: ${process.env.DB_NAME}`)
//         connection.query("SET time_zone = 'America/Sao_Paulo'");
//     }
// })

connection.connect((error) => {
    if (error) {
        console.log(`Erro ao conectar com o Banco de Dados: ${process.env.DB_NAME}`)
        console.log(`- ${error.code}`)
        return
    } else {
        console.log(`Conectado com o Banco de Dados: ${process.env.DB_NAME}`)

        connection.query("SET time_zone = '-03:00'", (err) => {
            if (err) {
                console.error('Erro ao ajustar time_zone:', err);
            } else {
                console.log('Time zone ajustado para -03:00');
            }
        });
    }
});


module.exports = connection