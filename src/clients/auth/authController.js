const authService = require("./authService");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../../redisClient');  // Importando o Redis Client
require("dotenv-safe").config();

const date = new Date()
const fullDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`

module.exports = {

    login: async (req, res) => {
        let json = { statusCode: "", message: "", jwt: "", auth: false, result: [] }
        let qryUsers = []
        let username = req.body.username
        let psw = req.body.psw

        qryUsers = await authService.login(username)
        returnQry = qryUsers[0]
        userId = qryUsers[1]
        hashDb = qryUsers[2]

        if (returnQry == "1") {
            const isMatch = await comparePassword(psw, hashDb)

            if (isMatch) {
                const token = jwt.sign({ userId }, process.env.SECRET, {
                    expiresIn: 300
                });

                redisClient.setex(token, 3600, JSON.stringify(userId));

                res.statusCode = 200
                json.statusCode = "200"
                json.jwt = token
                json.auth = true
                json.message = "Successful Login"

            } else {
                res.statusCode = 401
                json.statusCode = "401"
                json.message = "Incorrect Credentials"
            }
        } else {
            res.statusCode = 404
            json.statusCode = "404"
            json.message = "User not Found"
        }

        console.log(" - " + json.message)

        res.json(json)
        IpPublicQuery(req)
    },

    logout: async (req, res) => {
        let json = { statusCode: "", message: "", jwt: "", auth: false, result: [] }

        let tokenReq = req.headers["authorization"]
        if (!tokenReq) {
            res.statusCode = 400
            json.statusCode = "400"
            json.message = "Token não fornecido"
            res.json(json)
            return;
        }

        const decoded = jwt.decode(tokenReq);
        const exp = decoded.exp;
        const ttl = exp - Math.floor(Date.now() / 1000);

        redisClient.set(tokenReq, 'blacklisted', 'EX', ttl, (err, reply) => {
            if (err) throw err;
            res.statusCode = 200
            json.statusCode = "200"
            json.message = "User Logged Out"
            res.json(json)
        });

        IpPublicQuery(req)
    },

    protected: async (req, res) => {
        res.send('Você acessou uma rota protegida!');
    }
}

function IpPublicQuery(req) {
    console.log(` - ${req.method}`)
    console.log(` - ${req.baseUrl}${req.url}`)
    console.log(` - ${req.connection.remoteAddress} } \n`)
}

function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}
