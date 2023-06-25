import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const writeFileAsync = promisify(fs.writeFile);

class FilesController {
  // eslint-disable-next-line consistent-return
  static async postUpload(req, res) {
    const token = req.header('X-Token') || null;
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).send({ error: 'Unauthorized' });
    const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    if (!req.body.name) return res.status(400).send({ error: 'Missing name' });
    if (!req.body.type || !['folder', 'file', 'image'].includes(req.body.type)) {
      return res.status(400).send({ error: 'Missing type' });
    }

    const { name } = req.body;
    const { type } = req.body;
    const parentId = req.body.parentId ? ObjectId(req.body.parentId) : 0;
    const isPublic = req.body.isPublic || false;
    const data = req.body.data || null;
    const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';

    if (type === 'folder') {
      const folder = await dbClient.db.collection('files').insertOne({
        userId: ObjectId(userId),
        name,
        type,
        isPublic,
        parentId,
      });
      return res.status(201).send({
        id: folder.insertedId,
        userId: user._id,
        name,
        type,
        isPublic,
        parentId,
      });
      // eslint-disable-next-line no-else-return
    } else if (['file', 'image'].includes(type)) {
      if (!data) return res.status(400).send({ error: 'Missing data' });
      const buff = Buffer.from(data, 'base64');
      const fileName = uuidv4();
      const localPath = `${filePath}/${fileName}`;

      await writeFileAsync(localPath, buff);

      const file = await dbClient.db.collection('files').insertOne({
        userId: ObjectId(userId),
        name,
        type,
        isPublic,
        parentId,
        localPath,
      });
      return res.status(201).send({
        id: file.insertedId,
        userId: user._id,
        name,
        type,
        isPublic,
        parentId,
      });
    }
  }
}

export default FilesController;
