// Purpose: Token generation and retrieval
import { v4 as uuidv4 } from 'uuid';
import redisClient from './redis';

class token {
  static async generateToken(userId) {
    const token = uuidv4();
    await redisClient.set(`auth_${token}`, userId, 86400);
    return token;
  }

  static async retrieveToken(request) {
    const token = request.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    return userId;
  }

  static async revokeToken(request) {
    const token = request.headers['x-token'];
    await redisClient.del(`auth_${token}`);
  }
}

export default token;
