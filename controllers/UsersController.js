import sha1 from 'sha1';
import Bull from 'bull';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import tokenUtils from '../utils/token';

// instantiate a new Bull queue named userQueue
const userQueue = new Bull('userQueue');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });
    const user = await dbClient.findUser({ email });
    if (user) return res.status(400).json({ error: 'Already exist' });
    const hashPassword = sha1(password);
    const newUser = await dbClient.createUser({ email, password: hashPassword });

    // Add a job to the userQueue for sending a welcome email
    userQueue.add({ userId: newUser.insertedId });

    return res.status(201).json({ id: newUser.insertedId, email });
  }

  static async getMe(req, res) {
    const tokenValue = req.headers['x-token'];
    // console.log(tokenValue);
    if (!tokenValue) return res.status(401).json({ error: 'Unauthorized' });
    // use token.js to retrieve the user ID from the token
    const userId = await tokenUtils.retrieveToken(req);
    // console.log(userId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.findUser({ _id: ObjectId(userId) });
    // console.log(user);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    // return the user information
    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
