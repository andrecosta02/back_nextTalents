// const redis = require('redis');

// const redisClient = redis.createClient({
//     url: 'redis://localhost:6379'
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));
// redisClient.connect().catch(console.error);

// redisClient.on('connect', () => {
//     console.log('Connected to Redis');
// });

// module.exports = redisClient;

const redis = require('redis');

const redisClient = redis.createClient({
    url: 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (error) {
        console.error('Redis Client Connection Error', error);
    }
})();

module.exports = redisClient;
