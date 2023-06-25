import { ObjectId } from 'mongodb';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const writeFileAsync = promisify(fs.writeFile);

class FilesController {
  static async postUpload(req, res) {
    const tokenValue = req.headers['x-token'];
    if (!tokenValue) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${tokenValue}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await dbClient.findUser({ _id: ObjectId(userId) });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const {
      name, type, parentId, isPublic, data,
    } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

    if (parentId) {
      const parent = await dbClient.findFile({ _id: ObjectId(parentId) });
      if (!parent) return res.status(400).json({ error: 'Parent not found' });
      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    if (type === 'folder') {
      const newFolder = await dbClient.createFile({
        userId: ObjectId(userId),
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      });

      return res.status(201).json({
        id: newFolder.insertedId,
        userId: user._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      });
    }

    const buff = Buffer.from(data, 'base64');
    const path = process.env.FOLDER_PATH || '/tmp/files_manager';
    const filePath = `${path}/${uuidv4()}`;

    try {
      await writeFileAsync(filePath, buff);
      const newFile = await dbClient.createFile({
        userId: ObjectId(userId),
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
        localPath: filePath,
      });

      return res.status(201).json({
        id: newFile.insertedId,
        userId: user._id,
        name,
        type,
        isPublic: isPublic || false,
        parentId: parentId || 0,
      });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }
}

export default FilesController;
