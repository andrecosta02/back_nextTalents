const jwt = require('jsonwebtoken');
const SECRET = "weexpedition"; // Use a mesma secret usada no projeto

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado' });
        }
        req.user = decoded; // { id, type }
        next();
    });
};

module.exports = authenticateToken;
