import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (err) => console.log(`Redis client not connected to the server: ${err.message}`));
    // this.client.on('connect', () => console.log('Redis client connected to the server'));
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const asyncGet = promisify(this.client.get).bind(this.client);
    return asyncGet(key);
  }

  async set(key, value, duration) {
    const asyncSet = promisify(this.client.set).bind(this.client);
    await asyncSet(key, value);
    this.client.expire(key, duration);
  }

  async del(key) {
    const asyncDel = promisify(this.client.del).bind(this.client);
    await asyncDel(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
