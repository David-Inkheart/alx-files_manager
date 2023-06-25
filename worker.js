import Bull from 'bull';
import thumbnailGenerator from 'image-thumbnail';
import { promisify } from 'util';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import dbClient from './utils/db';

const thumbnailQueue = new Bull('thumbnailQueue');

const writeFileAsync = promisify(fs.writeFile);

thumbnailQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const file = await dbClient.findFile({ _id: ObjectId(fileId), userId });

  if (!file) {
    throw new Error('File not found');
  }

  if (file.type === 'image') {
    const thumbnail500 = await thumbnailGenerator(file.localPath, { width: 500 });
    const thumbnail250 = await thumbnailGenerator(file.localPath, { width: 250 });
    const thumbnail100 = await thumbnailGenerator(file.localPath, { width: 100 });

    const thumbnailPath500 = `${file.localPath}_500`;
    const thumbnailPath250 = `${file.localPath}_250`;
    const thumbnailPath100 = `${file.localPath}_100`;

    await writeFileAsync(thumbnailPath500, thumbnail500);
    await writeFileAsync(thumbnailPath250, thumbnail250);
    await writeFileAsync(thumbnailPath100, thumbnail100);

    await dbClient.updateFile({ _id: ObjectId(fileId) }, {
      $set: {
        localThumbnailPath500: thumbnailPath500,
        localThumbnailPath250: thumbnailPath250,
        localThumbnailPath100: thumbnailPath100,
      },
    });
  }
});
