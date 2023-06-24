import { Buffer } from 'buffer';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import tokenUtils from '../utils/token';

class AuthController {
  static async getConnect(req, res) {
    const { authorization } = req.headers;
    if (!authorization) return res.status(401).json({ error: 'Unauthorized' });
    const tokenValue = authorization.replace('Basic ', '');
    // decode base64
    const credentials = Buffer.from(tokenValue, 'base64').toString('utf-8');
    // split email and password
    const [email, password] = credentials.split(':');
    if (!email || !password) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.findUser({ email });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (sha1(password) !== user.password) return res.status(401).json({ error: 'Unauthorized' });
    const newToken = await tokenUtils.generateToken(user._id);
    return res.status(200).json({ token: newToken });
  }

  static async getDisconnect(req, res) {
    const tokenValue = await tokenUtils.retrieveToken(req);
    if (!tokenValue) return res.status(401).json({ error: 'Unauthorized' });
    await tokenUtils.revokeToken(req);
    return res.status(204).end();
  }
}
export default AuthController;
