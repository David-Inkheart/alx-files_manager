import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });
    const user = await dbClient.findUser({ email });
    if (user) return res.status(400).json({ error: 'Already exist' });
    const hashPassword = sha1(password);
    const newUser = await dbClient.createUser({ email, password: hashPassword });
    return res.status(201).json({ id: newUser.insertedId, email });
  }
}

export default UsersController;
