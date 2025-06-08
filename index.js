// //index.js
const redis = require('redis');
const jwt = require('jsonwebtoken');

// Conectar ao Redis
const client = redis.createClient({
  host: 'localhost',
  port: 6379,
});

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.log('Redis error: ', err);
});

// Função para gerar e armazenar JWT
function generateToken(user) {
  const token = jwt.sign(user, 'your_secret_key', { expiresIn: '1h' });

  // Armazenar o token no Redis com um tempo de expiração
  client.setex(token, 3600, JSON.stringify(user));

  return token;
}

// Função para verificar o JWT
function verifyToken(token, callback) {
  client.get(token, (err, data) => {
    if (err) {
      return callback(err, null);
    }

    if (data) {
      jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
          return callback(err, null);
        }

        return callback(null, decoded);
      });
    } else {
      return callback(new Error('Token not found'), null);
    }
  });
}

module.exports = { generateToken, verifyToken };
