const Redis = require('ioredis');

const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
});

redis.on('connect', () => {
  console.log('Connected to redis server');
});

redis.on('error', (err) => {
  console.log('Redis error occured while connection: ', err);
});

redis.on('reconnecting', () => {
  console.log('Reconnecting to redis server');
});

module.exports = redis;
